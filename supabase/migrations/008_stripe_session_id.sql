-- Add stripe_session_id to orders for stronger webhook idempotency.
-- The webhook now deduplicates on session ID (primary) and payment_intent (secondary).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id text;

-- Unique index prevents duplicate rows even under concurrent webhook delivery
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_idx
  ON orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
