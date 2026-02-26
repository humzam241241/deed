-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text NOT NULL UNIQUE,
  type         text NOT NULL CHECK (type IN ('percent', 'fixed')),
  value        numeric(10,2) NOT NULL,
  max_uses     integer,
  uses_count   integer NOT NULL DEFAULT 0,
  expires_at   timestamptz,
  listing_id   uuid REFERENCES listings(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Add discount tracking columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0;

-- RLS: admins can manage discount codes; anyone can read (validate uses service role)
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_discount_all" ON discount_codes
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );
