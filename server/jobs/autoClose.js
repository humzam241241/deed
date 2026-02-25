import cron from 'node-cron';
import supabase from '../lib/supabase.js';

/**
 * Runs every 5 minutes.
 * Closes any approved listings where order_deadline has passed.
 * Sets auto_closed = true to prevent manual reopening.
 */
export function startAutoCloseJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('listings')
        .update({ status: 'closed', auto_closed: true })
        .eq('status', 'approved')
        .lt('order_deadline', now)
        .select('id, title');

      if (error) {
        console.error('[autoClose] Error:', error.message);
        return;
      }

      if (data?.length) {
        console.log(`[autoClose] Closed ${data.length} expired listing(s):`, data.map((l) => l.id));
      }
    } catch (err) {
      console.error('[autoClose] Unexpected error:', err.message);
    }
  });

  console.log('[autoClose] Job scheduled — runs every 5 minutes.');
}
