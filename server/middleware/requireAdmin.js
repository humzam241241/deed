import { requireAuth } from './requireAuth.js';

/**
 * Middleware chain: verify JWT then assert role === 'admin'.
 * Usage: router.post('/admin/something', requireAdmin, handler)
 */
export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
  });
}
