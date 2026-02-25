-- ============================================================
-- 001_schema.sql — Core tables for the multi-tenant marketplace
-- ============================================================

-- Role enum
CREATE TYPE user_role AS ENUM ('admin', 'club_exec', 'student');

-- Listing status enum
CREATE TYPE listing_status AS ENUM ('pending', 'approved', 'closed');

-- Refund status enum
CREATE TYPE refund_status_type AS ENUM ('none', 'partial', 'full');

-- ─── clubs ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  stripe_account_id text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── users (extends auth.users) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id           uuid REFERENCES clubs(id) ON DELETE SET NULL,
  role              user_role NOT NULL DEFAULT 'student',
  is_exec_approved  boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── listings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id              uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title                text NOT NULL,
  description          text,
  product_type         text NOT NULL,
  price                numeric(10, 2) NOT NULL CHECK (price >= 0),
  quantity_available   integer NOT NULL CHECK (quantity_available >= 0),
  cost_per_unit        numeric(10, 2) NOT NULL DEFAULT 0 CHECK (cost_per_unit >= 0),
  platform_fee_percent numeric(5, 2) NOT NULL DEFAULT 5 CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 100),
  order_deadline       timestamptz NOT NULL,
  pickup_instructions  text,
  pickup_location      text,
  pickup_date          date,
  status               listing_status NOT NULL DEFAULT 'pending',
  auto_closed          boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ─── orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id             uuid NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  buyer_name             text NOT NULL,
  buyer_email            text NOT NULL,
  student_id             text,
  size                   text,
  quantity               integer NOT NULL CHECK (quantity > 0),
  total_paid             numeric(10, 2) NOT NULL,
  stripe_payment_intent  text UNIQUE,
  stripe_invoice_id      text,
  refund_status          refund_status_type NOT NULL DEFAULT 'none',
  refund_amount          numeric(10, 2) NOT NULL DEFAULT 0,
  refunded_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_listings_club_id ON listings(club_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent);
CREATE INDEX IF NOT EXISTS idx_users_club_id ON users(club_id);
