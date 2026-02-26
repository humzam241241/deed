import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

function getAdminClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /discount/validate
 * Public — validates a discount code for a given listing + quantity.
 * Returns: { discount_amount, discount_type, discount_value, code }
 */
router.post('/validate', async (req, res) => {
  const { code, listing_id, quantity = 1 } = req.body ?? {};
  if (!code || !listing_id) {
    return res.status(400).json({ error: 'code and listing_id are required.' });
  }

  const sb = getAdminClient();

  const { data: dc, error } = await sb
    .from('discount_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .single();

  if (error || !dc) {
    return res.status(404).json({ error: 'Discount code not found.' });
  }

  // Scope check — code can be global (no listing_id) or scoped to a specific listing
  if (dc.listing_id && dc.listing_id !== listing_id) {
    return res.status(400).json({ error: 'This code is not valid for this listing.' });
  }

  // Expiry check
  if (dc.expires_at && new Date() > new Date(dc.expires_at)) {
    return res.status(400).json({ error: 'This discount code has expired.' });
  }

  // Usage check
  if (dc.max_uses !== null && dc.uses_count >= dc.max_uses) {
    return res.status(400).json({ error: 'This discount code has reached its usage limit.' });
  }

  // Fetch listing price to compute discount_amount
  const { data: listing } = await sb
    .from('listings')
    .select('price')
    .eq('id', listing_id)
    .single();

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  const subtotal = listing.price * quantity;
  let discount_amount = 0;
  if (dc.type === 'percent') {
    discount_amount = Math.round(subtotal * (dc.value / 100) * 100) / 100;
  } else {
    discount_amount = Math.min(dc.value, subtotal);
  }

  res.json({
    code: dc.code,
    discount_type: dc.type,
    discount_value: dc.value,
    discount_amount,
  });
});

// ── Admin CRUD ────────────────────────────────────────────────────────────────

/** GET /admin/discount-codes — list all codes */
router.get('/', requireAdmin, async (_req, res) => {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** POST /admin/discount-codes — create a code */
router.post('/', requireAdmin, async (req, res) => {
  const { code, type, value, max_uses, expires_at, listing_id } = req.body ?? {};
  if (!code || !type || value == null) {
    return res.status(400).json({ error: 'code, type, and value are required.' });
  }
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('discount_codes')
    .insert({ code: code.trim().toUpperCase(), type, value, max_uses: max_uses || null, expires_at: expires_at || null, listing_id: listing_id || null })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** DELETE /admin/discount-codes/:id — delete a code */
router.delete('/:id', requireAdmin, async (req, res) => {
  const sb = getAdminClient();
  const { error } = await sb.from('discount_codes').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
