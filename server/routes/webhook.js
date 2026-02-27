import { Router } from 'express';
import stripe from '../lib/stripeClient.js';
import supabase from '../lib/supabase.js';

const router = Router();

// NOTE: This route must receive the raw body.
// Mounted in index.js BEFORE express.json() via express.raw().

router.post('/', async (req, res) => {
  const sig           = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set — rejecting all events.');
    return res.status(500).send('Webhook secret not configured.');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Acknowledge immediately — Stripe requires < 30 s response
  res.status(200).json({ received: true });

  // Process asynchronously to avoid Stripe timeout
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        handlePaymentFailed(event.data.object);
        break;
      case 'payment_intent.succeeded':
        console.log('[webhook] payment_intent.succeeded:', event.data.object.id);
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
  const sessionId     = session.id;
  const meta          = session.metadata ?? {};

  const {
    listing_id,
    quantity,
    size,
    buyer_name,
    buyer_email,
    student_id,
    discount_code,
    discount_amount,
  } = meta;

  if (!listing_id || !paymentIntent) {
    console.warn('[webhook] checkout.session.completed — missing metadata, skipping.', { sessionId });
    return;
  }

  // ── Idempotency: deduplicate on Stripe session ID (not just payment intent) ─
  // Using session ID is safer than payment_intent because a single payment intent
  // can theoretically be linked to multiple sessions in edge cases.
  const { data: existingBySession } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  if (existingBySession) {
    console.log('[webhook] Order already recorded for session:', sessionId);
    return;
  }

  // Secondary guard on payment_intent
  const { data: existingByIntent } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent', paymentIntent)
    .maybeSingle();

  if (existingByIntent) {
    console.log('[webhook] Order already recorded for payment_intent:', paymentIntent);
    return;
  }

  const qty       = Math.max(1, parseInt(quantity ?? '1', 10));
  const totalPaid = (session.amount_total ?? 0) / 100;

  // ── Insert order ──────────────────────────────────────────────────────────
  const { error: insertErr } = await supabase.from('orders').insert({
    listing_id,
    buyer_name:            buyer_name ?? '',
    buyer_email:           buyer_email ?? '',
    student_id:            student_id || null,
    size:                  size || null,
    quantity:              qty,
    total_paid:            totalPaid,
    stripe_payment_intent: paymentIntent,
    stripe_session_id:     sessionId,
    stripe_invoice_id:     session.invoice ?? null,
    refund_status:         'none',
    refund_amount:         0,
    discount_code:         discount_code || null,
    discount_amount:       parseFloat(discount_amount ?? '0') || 0,
  });

  if (insertErr) {
    console.error('[webhook] Failed to insert order:', insertErr.message, { sessionId, listing_id });
    return;
  }

  // ── Decrement quantity and auto-close if sold out ─────────────────────────
  const { data: listing } = await supabase
    .from('listings')
    .select('quantity_available')
    .eq('id', listing_id)
    .single();

  if (listing) {
    const newQty        = Math.max(0, listing.quantity_available - qty);
    const updatePayload = { quantity_available: newQty };
    if (newQty <= 0) {
      updatePayload.status     = 'closed';
      updatePayload.auto_closed = true;
    }
    await supabase.from('listings').update(updatePayload).eq('id', listing_id);
  }

  console.log('[webhook] Order created:', { sessionId, listing_id, qty, totalPaid });
}

// ─── charge.refunded ──────────────────────────────────────────────────────────
async function handleChargeRefunded(charge) {
  const paymentIntent = charge.payment_intent;
  if (!paymentIntent) {
    console.warn('[webhook] charge.refunded — no payment_intent, skipping.');
    return;
  }

  const totalCharged  = charge.amount / 100;
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
      refunded_at:   new Date().toISOString(),
    })
    .eq('stripe_payment_intent', paymentIntent);

  if (error) {
    console.error('[webhook] Failed to update refund status:', error.message, { paymentIntent });
  } else {
    console.log('[webhook] Refund recorded:', { paymentIntent, refundStatus, totalRefunded });
  }
}

// ─── payment_intent.payment_failed ────────────────────────────────────────────
function handlePaymentFailed(paymentIntent) {
  const failureMsg  = paymentIntent.last_payment_error?.message ?? 'unknown';
  const failureCode = paymentIntent.last_payment_error?.code    ?? 'unknown';
  // Log only — no DB write needed since no order was created
  console.warn('[webhook] Payment failed:', {
    id:      paymentIntent.id,
    code:    failureCode,
    message: failureMsg,
  });
}

export default router;
