import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import stripe from '../lib/stripeClient.js';
import supabase from '../lib/supabase.js';

const router = Router();

const MAX_REFUND_CENTS = 99_999_99; // $99,999.99 — sanity ceiling

/**
 * POST /admin/refund
 * Triggers a Stripe refund for an order. DB state is updated by the
 * charge.refunded webhook — not here — to keep a single source of truth.
 *
 * Body: { order_id, refund_type: 'full' | 'partial', amount_cents? }
 * Admin only.
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { order_id, refund_type = 'full', amount_cents } = req.body ?? {};

    // ── Input validation ──────────────────────────────────────────────────────
    if (!order_id || typeof order_id !== 'string') {
      return res.status(400).json({ error: 'order_id is required.' });
    }
    if (!['full', 'partial'].includes(refund_type)) {
      return res.status(400).json({ error: 'refund_type must be "full" or "partial".' });
    }
    if (refund_type === 'partial') {
      const cents = parseInt(amount_cents, 10);
      if (!Number.isInteger(cents) || cents <= 0) {
        return res.status(400).json({ error: 'amount_cents must be a positive integer for partial refunds.' });
      }
      if (cents > MAX_REFUND_CENTS) {
        return res.status(400).json({ error: 'Refund amount exceeds maximum allowed.' });
      }
    }

    // ── Fetch the order ───────────────────────────────────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, stripe_payment_intent, total_paid, refund_status, refund_amount')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (order.refund_status === 'full') {
      return res.status(400).json({ error: 'Order has already been fully refunded.' });
    }
    if (!order.stripe_payment_intent) {
      return res.status(400).json({ error: 'No payment intent found for this order.' });
    }

    // Guard: partial refund cannot exceed what was actually paid
    if (refund_type === 'partial') {
      const maxRefundable = Math.round((order.total_paid - (order.refund_amount ?? 0)) * 100);
      const requestedCents = parseInt(amount_cents, 10);
      if (requestedCents > maxRefundable) {
        return res.status(400).json({
          error: `Refund amount ($${(requestedCents / 100).toFixed(2)}) exceeds remaining refundable amount ($${(maxRefundable / 100).toFixed(2)}).`,
        });
      }
    }

    // ── Create Stripe refund ──────────────────────────────────────────────────
    const refundParams = { payment_intent: order.stripe_payment_intent };
    if (refund_type === 'partial') {
      refundParams.amount = parseInt(amount_cents, 10);
    }

    const refund = await stripe.refunds.create(refundParams);

    // DB state updated via charge.refunded webhook — single source of truth
    res.json({
      success:    true,
      refund_id:  refund.id,
      status:     refund.status,
      message:    'Refund initiated. Order status will update via webhook.',
    });
  } catch (err) {
    console.error('[refund] Error:', err.message);
    // Never expose raw Stripe error details to the client
    res.status(500).json({ error: 'Failed to process refund. Please try again or contact support.' });
  }
});

export default router;
