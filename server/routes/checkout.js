import { Router } from 'express';
import stripe from '../lib/stripeClient.js';
import supabase from '../lib/supabase.js';

const router = Router();

/**
 * POST /checkout
 * Creates a Stripe Checkout session for a single listing.
 *
 * Body: { listing_id, quantity, size, buyer_name, buyer_email, student_id? }
 */
router.post('/', async (req, res) => {
  try {
    const {
      listing_id,
      quantity = 1,
      size,
      buyer_name,
      buyer_email,
      student_id,
    } = req.body ?? {};

    if (!listing_id || !buyer_name || !buyer_email) {
      return res.status(400).json({ error: 'listing_id, buyer_name, and buyer_email are required.' });
    }

    // ── Fetch listing + club in one query ────────────────────────────────────
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .select('*, clubs(id, name, stripe_account_id)')
      .eq('id', listing_id)
      .single();

    if (listingErr || !listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    // ── Server-side validation ────────────────────────────────────────────────
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

    const club = listing.clubs;
    if (!club?.stripe_account_id) {
      return res.status(400).json({ error: 'This club has not completed Stripe onboarding.' });
    }

    // ── Verify connected account is charges-enabled ───────────────────────────
    const account = await stripe.accounts.retrieve(club.stripe_account_id);
    if (!account.charges_enabled || !account.payouts_enabled) {
      return res.status(400).json({ error: 'Club Stripe account is not fully activated.' });
    }

    // ── Fee calculation ───────────────────────────────────────────────────────
    const unitCents = Math.round(listing.price * 100);
    const totalCents = unitCents * quantity;
    const platformFeeCents = Math.round(totalCents * (listing.platform_fee_percent / 100));

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';

    // ── Create Stripe Checkout session ────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'cad',
            unit_amount: unitCents,
            product_data: {
              name: listing.title,
              description: [
                listing.description,
                size ? `Size: ${size}` : null,
                listing.pickup_location ? `Pickup: ${listing.pickup_location}` : null,
              ]
                .filter(Boolean)
                .join(' | '),
            },
          },
          quantity,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: club.stripe_account_id,
        },
      },
      metadata: {
        listing_id,
        club_id: club.id,
        quantity: String(quantity),
        size: size ?? '',
        buyer_name,
        buyer_email,
        student_id: student_id ?? '',
      },
      customer_email: buyer_email,
      success_url: `${clientUrl}/listings/${listing_id}?status=success`,
      cancel_url: `${clientUrl}/listings/${listing_id}?status=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
