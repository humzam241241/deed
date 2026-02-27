-- Add payout_notes field to clubs so admin can track manual payouts per org.
-- No Stripe Connect required — platform collects all payments and pays out manually.
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS payout_notes text;
