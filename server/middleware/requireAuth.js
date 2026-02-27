import { createClient } from '@supabase/supabase-js';

// Both clients are singletons — created once at module load, not per request.
const supabaseAnon = createClient(
  process.env.SUPABASE_URL    ?? 'http://localhost:54321',
  process.env.SUPABASE_ANON_KEY ?? 'placeholder',
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// Service-role client — used only to read the user's profile row (bypasses RLS).
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL             ?? 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder',
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/**
 * Verifies the Supabase JWT from Authorization: Bearer <token>.
 * Attaches req.user, req.userRole, req.userClubId, req.isExecApproved.
 * Role is always fetched from the DB — never trusted from the JWT payload.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.slice(7);
  if (!token) {
    return res.status(401).json({ error: 'Empty bearer token.' });
  }

  // Verify the JWT with Supabase
  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // Fetch role from the DB — never trust the JWT's app_metadata for roles
  const { data: userData, error: profileErr } = await supabaseAdmin
    .from('users')
    .select('role, club_id, is_exec_approved')
    .eq('id', user.id)
    .single();

  if (profileErr || !userData) {
    console.warn('[requireAuth] No profile found for user:', user.id);
    return res.status(403).json({ error: 'User profile not found.' });
  }

  req.user          = user;
  req.userRole      = userData.role;
  req.userClubId    = userData.club_id   ?? null;
  req.isExecApproved = userData.is_exec_approved ?? false;

  next();
}
