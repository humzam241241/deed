import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import stripe from '../lib/stripeClient.js';
import supabase from '../lib/supabase.js';

const router = Router();

/**
 * POST /admin/connect/create
 * Creates a Stripe Standard connected account for a club and stores the
 * stripe_account_id in the clubs table.
 *
 * Body: { club_id, email? }
 */
router.post('/create', requireAdmin, async (req, res) => {
  try {
    const { club_id, email } = req.body ?? {};
    if (!club_id) return res.status(400).json({ error: 'club_id is required.' });

    // Fetch club
    const { data: club, error: clubErr } = await supabase
      .from('clubs')
      .select('id, name, stripe_account_id')
      .eq('id', club_id)
      .single();

    if (clubErr || !club) return res.status(404).json({ error: 'Club not found.' });
    if (club.stripe_account_id) {
      return res.status(400).json({ error: 'Club already has a Stripe account.', stripe_account_id: club.stripe_account_id });
    }

    // Create Stripe Standard account
    const account = await stripe.accounts.create({
      type: 'standard',
      email: email ?? undefined,
      metadata: { club_id, club_name: club.name },
    });

    // Store in clubs table
    const { error: updateErr } = await supabase
      .from('clubs')
      .update({ stripe_account_id: account.id })
      .eq('id', club_id);

    if (updateErr) throw new Error(updateErr.message);

    res.json({ success: true, stripe_account_id: account.id });
  } catch (err) {
    console.error('[connect/create]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/connect/onboard-link/:clubId
 * Generates a Stripe Connect onboarding URL for the club's exec to complete.
 * Admin triggers this; the link is shared with the club exec.
 */
router.get('/onboard-link/:clubId', requireAdmin, async (req, res) => {
  try {
    const { clubId } = req.params;

    const { data: club, error: clubErr } = await supabase
      .from('clubs')
      .select('id, stripe_account_id')
      .eq('id', clubId)
      .single();

    if (clubErr || !club) return res.status(404).json({ error: 'Club not found.' });
    if (!club.stripe_account_id) {
      return res.status(400).json({ error: 'Club does not have a Stripe account yet. Create one first.' });
    }

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';

    const accountLink = await stripe.accountLinks.create({
      account: club.stripe_account_id,
      refresh_url: `${clientUrl}/admin?stripe=refresh`,
      return_url: `${clientUrl}/admin?stripe=success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error('[connect/onboard-link]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
