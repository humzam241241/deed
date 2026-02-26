import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
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
 * POST /vendor/send-email
 * Requires auth (club_exec or admin).
 * Body: { listing_id, subject, message }
 * Fetches all buyer emails for the listing and sends via SendGrid.
 */
router.post('/', requireAuth, async (req, res) => {
  const { listing_id, subject, message } = req.body ?? {};
  if (!listing_id || !subject || !message) {
    return res.status(400).json({ error: 'listing_id, subject, and message are required.' });
  }

  const { user } = req;
  if (user.role !== 'club_exec' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const sb = getAdminClient();

  // Fetch the listing to verify ownership (execs can only email their own listing buyers)
  const { data: listing, error: listingErr } = await sb
    .from('listings')
    .select('id, title, club_id')
    .eq('id', listing_id)
    .single();

  if (listingErr || !listing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  if (user.role === 'club_exec' && listing.club_id !== user.club_id) {
    return res.status(403).json({ error: 'You do not own this listing.' });
  }

  // Fetch all orders for this listing
  const { data: orders, error: ordersErr } = await sb
    .from('orders')
    .select('buyer_email, buyer_name')
    .eq('listing_id', listing_id);

  if (ordersErr) return res.status(500).json({ error: ordersErr.message });

  if (!orders || orders.length === 0) {
    return res.json({ ok: true, sent: 0, message: 'No buyers to email.' });
  }

  if (!process.env.SENDGRID_API_KEY) {
    return res.status(503).json({ error: 'Email service not configured. Add SENDGRID_API_KEY to your server environment.' });
  }

  // Dynamically import SendGrid (only when key is present)
  const sgMail = (await import('@sendgrid/mail')).default;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const from = process.env.SENDGRID_FROM_EMAIL;
  if (!from) {
    return res.status(503).json({ error: 'SENDGRID_FROM_EMAIL not configured.' });
  }

  const emails = [...new Set(orders.map(o => o.buyer_email).filter(Boolean))];

  try {
    await sgMail.send({
      to: emails,
      from,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br />')}</p>
             <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
             <p style="font-size:12px;color:#888">This message was sent by ${listing.title} on behalf of your marketplace vendor.</p>`,
      isMultiple: true,
    });
    res.json({ ok: true, sent: emails.length });
  } catch (err) {
    console.error('[send-email]', err.response?.body ?? err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
