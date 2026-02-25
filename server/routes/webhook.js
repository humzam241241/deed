import { Router } from 'express';
import stripe from '../lib/stripeClient.js';
import supabase from '../lib/supabase.js';

const router = Router();

// NOTE: This route must receive the raw body.
// In index.js, mount BEFORE express.json() or use express.raw() for this path.

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Return 200 immediately; process async to avoid Stripe timeout
  res.status(200).json({ received: true });

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      default:
        // Silently ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err.message);
  }
});

// ─── checkout.session.completed ───────────────────────────────────────────────
async function handleCheckoutCompleted(session) {
  const paymentIntent = session.payment_intent;
  const meta = session.metadata ?? {};

  const {
    listing_id,
    quantity,
    size,
    buyer_name,
    buyer_email,
    student_id,
  } = meta;

  if (!listing_id || !paymentIntent) {
    console.warn('[webhook] checkout.session.completed missing metadata — skipping.');
    return;
  }

  // ── Idempotency: skip if order already exists for this payment intent ──────
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent', paymentIntent)
    .maybeSingle();

  if (existing) {
    console.log('[webhook] Order already recorded for payment intent:', paymentIntent);
    return;
  }

  const qty = parseInt(quantity ?? '1', 10);
  const totalPaid = (session.amount_total ?? 0) / 100;

  // ── Insert order ──────────────────────────────────────────────────────────
  const { error: insertErr } = await supabase.from('orders').insert({
    listing_id,
    buyer_name: buyer_name ?? '',
    buyer_email: buyer_email ?? '',
    student_id: student_id || null,
    size: size || null,
    quantity: qty,
    total_paid: totalPaid,
    stripe_payment_intent: paymentIntent,
    stripe_invoice_id: session.invoice ?? null,
    refund_status: 'none',
    refund_amount: 0,
  });

  if (insertErr) {
    console.error('[webhook] Failed to insert order:', insertErr.message);
    return;
  }

  // ── Decrement quantity and auto-close if exhausted ────────────────────────
  const { data: listing } = await supabase
    .from('listings')
    .select('quantity_available')
    .eq('id', listing_id)
    .single();

  if (listing) {
    const newQty = Math.max(0, listing.quantity_available - qty);
    const updatePayload = { quantity_available: newQty };
    if (newQty <= 0) {
      updatePayload.status = 'closed';
      updatePayload.auto_closed = true;
    }
    await supabase.from('listings').update(updatePayload).eq('id', listing_id);
  }

  console.log('[webhook] Order created for listing:', listing_id);
}

// ─── charge.refunded ──────────────────────────────────────────────────────────
async function handleChargeRefunded(charge) {
  const paymentIntent = charge.payment_intent;
  if (!paymentIntent) return;

  const totalCharged = charge.amount / 100;
  const totalRefunded = charge.amount_refunded / 100;

  let refundStatus = 'none';
  if (totalRefunded >= totalCharged) {
    refundStatus = 'full';
  } else if (totalRefunded > 0) {
    refundStatus = 'partial';
  }

  const { error } = await supabase
    .from('orders')
    .update({
      refund_status: refundStatus,
      refund_amount: totalRefunded,
      refunded_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent', paymentIntent);

  if (error) {
    console.error('[webhook] Failed to update refund status:', error.message);
  } else {
    console.log('[webhook] Refund recorded for payment intent:', paymentIntent);
  }
}

export default router;
