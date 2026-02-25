import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import stripe from '../lib/stripeClient.js';
import supabase from '../lib/supabase.js';

const router = Router();

/**
 * POST /admin/refund
 * Triggers a Stripe refund for an order. DB state is updated by the
 * charge.refunded webhook — not here — to keep a single source of truth.
 *
 * Body: { order_id, refund_type: 'full' | 'partial', amount_cents? }
 * Only accessible by admin role.
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { order_id, refund_type = 'full', amount_cents } = req.body ?? {};

    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required.' });
    }
    if (!['full', 'partial'].includes(refund_type)) {
      return res.status(400).json({ error: 'refund_type must be "full" or "partial".' });
    }
    if (refund_type === 'partial' && (!amount_cents || amount_cents <= 0)) {
      return res.status(400).json({ error: 'amount_cents is required for partial refunds.' });
    }

    // Fetch the order
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

    // Build refund params
    const refundParams = {
      payment_intent: order.stripe_payment_intent,
    };
    if (refund_type === 'partial') {
      refundParams.amount = amount_cents;
    }

    const refund = await stripe.refunds.create(refundParams);

    // Return immediately — DB update happens via charge.refunded webhook
    res.json({
      success: true,
      refund_id: refund.id,
      status: refund.status,
      message: 'Refund initiated. Order status will update via webhook.',
    });
  } catch (err) {
    console.error('[refund]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
