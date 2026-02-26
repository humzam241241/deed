-- Allow club execs to update their own pending OR approved listings.
-- Closed listings remain immutable.
-- Financial fields (price, platform_fee_percent) are enforced as
-- read-only for approved listings at the application layer; RLS here
-- just opens the door for the update.

DROP POLICY IF EXISTS "exec_listings_update" ON listings;

CREATE POLICY "exec_listings_update" ON listings
  FOR UPDATE
  TO authenticated
  USING (
    current_user_role() = 'club_exec'
    AND current_exec_approved() = true
    AND club_id = current_user_club_id()
    AND status IN ('pending', 'approved')
  )
  WITH CHECK (
    club_id = current_user_club_id()
    AND status IN ('pending', 'approved')
  );
