import { createClient } from '@supabase/supabase-js';

// Lightweight anon client used only to verify JWTs — no service-role needed.
const supabaseAnon = createClient(
  process.env.SUPABASE_URL ?? 'http://localhost:54321',
  process.env.SUPABASE_ANON_KEY ?? 'placeholder',
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/**
 * Verifies the Supabase JWT from Authorization: Bearer <token>.
 * On success, attaches req.user (auth user) and req.userRole to the request.
 * On failure, returns 401.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.slice(7);

  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // Fetch the user's role from the users table via service-role to bypass RLS
  const { createClient: create } = await import('@supabase/supabase-js');
  const adminClient = create(
    process.env.SUPABASE_URL ?? 'http://localhost:54321',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: userData } = await adminClient
    .from('users')
    .select('role, club_id, is_exec_approved')
    .eq('id', user.id)
    .single();

  req.user = user;
  req.userRole = userData?.role ?? null;
  req.userClubId = userData?.club_id ?? null;
  req.isExecApproved = userData?.is_exec_approved ?? false;

  next();
}
