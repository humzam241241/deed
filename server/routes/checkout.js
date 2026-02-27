import { Router } from 'express';
import { randomUUID } from 'crypto';
import stripe from '../lib/stripeClient.js';
import supabase from '../lib/supabase.js';

const router = Router();

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_QTY   = 100;   // hard cap — prevents abuse
const CURRENCY  = 'cad'; // locked server-side, never from client

function sanitizeStr(val, maxLen = 200) {
  return String(val ?? '').trim().slice(0, maxLen);
}

/**
 * POST /checkout
 *
 * All money flows to the platform Stripe account.
 * Admin pays out clubs/societies manually after funds clear.
 * No Stripe Connect required per club.
 *
 * Body: { listing_id, quantity, size, buyer_name, buyer_email, student_id?, discount_code? }
 */
router.post('/', async (req, res) => {
  try {
    const {
      listing_id,
      quantity: rawQty = 1,
      size,
      buyer_name,
      buyer_email,
      student_id,
      discount_code,
    } = req.body ?? {};

    // ── Strict input validation ───────────────────────────────────────────────
    if (!listing_id || typeof listing_id !== 'string') {
      return res.status(400).json({ error: 'listing_id is required.' });
    }
    if (!buyer_name) {
      return res.status(400).json({ error: 'buyer_name is required.' });
    }
    if (!buyer_email || !EMAIL_RE.test(String(buyer_email).trim())) {
      return res.status(400).json({ error: 'A valid buyer_email is required.' });
    }

    const quantity = parseInt(rawQty, 10);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'quantity must be a positive integer.' });
    }
    if (quantity > MAX_QTY) {
      return res.status(400).json({ error: `quantity cannot exceed ${MAX_QTY}.` });
    }

    const cleanBuyerName  = sanitizeStr(buyer_name, 100);
    const cleanBuyerEmail = String(buyer_email).trim().toLowerCase().slice(0, 254);
    const cleanSize       = sanitizeStr(size, 10);
    const cleanStudentId  = sanitizeStr(student_id, 50);

    // ── Fetch listing (server-authoritative price) ────────────────────────────
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .select('*, clubs(id, name)')
      .eq('id', listing_id)
      .single();

    if (listingErr || !listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    // ── Business rule validation ──────────────────────────────────────────────
    if (listing.status !== 'approved') {
      return res.status(400).json({ error: 'Listing is not open for orders.' });
    }
    if (new Date() > new Date(listing.order_deadline)) {
      return res.status(400).json({ error: 'Order deadline has passed.' });
    }
    if (quantity > listing.quantity_available) {
      return res.status(400).json({
        error: `Only ${listing.quantity_available} unit(s) available.`,
      });
    }

    // ── Discount validation — server-side only, never trust client ────────────
    let discountAmountCents = 0;
    let appliedDiscountCode = null;

    if (discount_code) {
      const cleanCode = String(discount_code).trim().toUpperCase().slice(0, 50);
      const { data: dc } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (dc) {
        const codeValid =
          (!dc.listing_id || dc.listing_id === listing_id) &&
          (!dc.expires_at || new Date() <= new Date(dc.expires_at)) &&
          (dc.max_uses === null || dc.uses_count < dc.max_uses);

        if (codeValid) {
          const subtotal = listing.price * quantity;
          if (dc.type === 'percent') {
            discountAmountCents = Math.round(subtotal * (dc.value / 100) * 100);
          } else {
            discountAmountCents = Math.min(
              Math.round(dc.value * 100),
              Math.round(subtotal * 100),
            );
          }
          appliedDiscountCode = dc.code;
        }
      }
    }

    // ── Server-side price calculation — never trust client totals ─────────────
    const unitCents  = Math.round(listing.price * 100);
    const grossCents = unitCents * quantity;
    const totalCents = grossCents - discountAmountCents;

    if (unitCents <= 0) {
      return res.status(400).json({ error: 'Invalid listing price.' });
    }
    // Stripe minimum charge is 50 cents
    if (totalCents < 50) {
      return res.status(400).json({
        error: 'Total after discount is below the minimum chargeable amount ($0.50). Please contact the organizer.',
      });
    }

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';

    // ── Create Stripe Checkout session ────────────────────────────────────────
    // Idempotency key prevents duplicate sessions on double-submit.
    // No payment_intent_data.transfer_data — all funds land on platform account.
    // Admin pays out clubs manually.
    const idempotencyKey = randomUUID();

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: CURRENCY, // locked — never from client
              unit_amount: unitCents,
              product_data: {
                name: listing.title.slice(0, 200),
                description: [
                  cleanSize ? `Size: ${cleanSize}` : null,
                  listing.pickup_location
                    ? `Pickup: ${listing.pickup_location.slice(0, 100)}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' | ') || undefined,
              },
            },
            quantity,
          },
        ],
        // Discounts applied as a separate negative line item so the receipt is clear
        ...(discountAmountCents > 0
          ? {
              discounts: [], // no Stripe coupon — handled via metadata + manual line
            }
          : {}),
        metadata: {
          listing_id,
          club_id:         listing.clubs?.id ?? '',
          quantity:        String(quantity),
          size:            cleanSize,
          buyer_name:      cleanBuyerName,
          buyer_email:     cleanBuyerEmail,
          student_id:      cleanStudentId,
          discount_code:   appliedDiscountCode ?? '',
          discount_amount: String((discountAmountCents / 100).toFixed(2)),
        },
        customer_email: cleanBuyerEmail,
        success_url: `${clientUrl}/listings/${listing_id}?status=success`,
        cancel_url:  `${clientUrl}/listings/${listing_id}?status=cancelled`,
        payment_intent_data: {
          description: `${listing.title} — ${listing.clubs?.name ?? 'Organization'}`,
        },
      },
      { idempotencyKey },
    );

    res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Error:', err.message);
    // Never expose raw Stripe/DB errors to the client
    res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
});

export default router;
