-- ============================================================
-- 002_rls.sql — Row Level Security policies
-- ============================================================
-- All RLS checks read the role from the users table joined on
-- auth.uid(). The service role key (used only server-side)
-- bypasses RLS entirely — orders are always inserted/updated
-- via the service role, never via a user JWT.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE clubs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;

-- ─── Helper: get current user's role ──────────────────────────────────────────
-- Used inside policy USING clauses to avoid repeated subqueries.
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

-- ─── Helper: get current user's club_id ───────────────────────────────────────
CREATE OR REPLACE FUNCTION current_user_club_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT club_id FROM users WHERE id = auth.uid();
$$;

-- ─── Helper: is current exec approved? ────────────────────────────────────────
CREATE OR REPLACE FUNCTION current_exec_approved()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(is_exec_approved, false) FROM users WHERE id = auth.uid();
$$;

-- ============================================================
-- CLUBS
-- ============================================================

-- Admin: full access
CREATE POLICY "admin_clubs_all" ON clubs
  FOR ALL
  TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- Club exec (approved): read own club
CREATE POLICY "exec_clubs_read" ON clubs
  FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'club_exec'
    AND current_exec_approved() = true
    AND id = current_user_club_id()
  );

-- Students: read all clubs (needed for listing pages)
CREATE POLICY "student_clubs_read" ON clubs
  FOR SELECT
  TO authenticated
  USING (current_user_role() = 'student');

-- ============================================================
-- USERS
-- ============================================================

-- Admin: full access
CREATE POLICY "admin_users_all" ON users
  FOR ALL
  TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- Any authenticated user: read and update their own row
CREATE POLICY "users_read_own" ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================
-- LISTINGS
-- ============================================================

-- Admin: full access
CREATE POLICY "admin_listings_all" ON listings
  FOR ALL
  TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- Club exec (approved): insert listings for their club
CREATE POLICY "exec_listings_insert" ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    current_user_role() = 'club_exec'
    AND current_exec_approved() = true
    AND club_id = current_user_club_id()
  );

-- Club exec (approved): read their club's listings
CREATE POLICY "exec_listings_read" ON listings
  FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'club_exec'
    AND current_exec_approved() = true
    AND club_id = current_user_club_id()
  );

-- Club exec (approved): update their club's PENDING listings only
-- (cannot touch approved/closed listings — admin controls those)
CREATE POLICY "exec_listings_update" ON listings
  FOR UPDATE
  TO authenticated
  USING (
    current_user_role() = 'club_exec'
    AND current_exec_approved() = true
    AND club_id = current_user_club_id()
    AND status = 'pending'
  )
  WITH CHECK (
    club_id = current_user_club_id()
    AND status = 'pending'
  );

-- Students: read approved listings only
CREATE POLICY "student_listings_read" ON listings
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- Public (anonymous): read approved listings for storefront
CREATE POLICY "anon_listings_read" ON listings
  FOR SELECT
  TO anon
  USING (status = 'approved');

-- ============================================================
-- ORDERS
-- ============================================================
-- Orders are ONLY written via the service role (Express webhook).
-- No JWT-based insert or update is permitted.
-- ============================================================

-- Admin: full access via JWT
CREATE POLICY "admin_orders_all" ON orders
  FOR ALL
  TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- Club exec: read orders belonging to their listings
CREATE POLICY "exec_orders_read" ON orders
  FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'club_exec'
    AND current_exec_approved() = true
    AND listing_id IN (
      SELECT id FROM listings WHERE club_id = current_user_club_id()
    )
  );
