import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { createClient } from '@supabase/supabase-js';

const router = Router();

/**
 * DELETE /admin/delete-user
 * Body: { user_id: string }
 * Deletes a user from auth.users (cascades to public.users).
 * Admin only.
 */
router.delete('/', requireAdmin, async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required.' });
  }

  // Create client lazily inside the handler so env vars are guaranteed loaded
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

  if (error) {
    console.error('[delete-user]', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

export default router;
