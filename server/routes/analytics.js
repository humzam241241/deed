import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import supabase from '../lib/supabase.js';

const router = Router();

/**
 * GET /admin/analytics
 * Returns computed revenue and profit stats per club and global totals.
 * All values are computed server-side — never stored.
 * Only accessible by admin role.
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    // Fetch all orders with their listing's cost_per_unit and platform_fee_percent
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select(`
        id,
        quantity,
        total_paid,
        refund_amount,
        listing_id,
        listings (
          id,
          club_id,
          title,
          cost_per_unit,
          platform_fee_percent,
          price,
          clubs (
            id,
            name
          )
        )
      `);

    if (ordersErr) throw new Error(ordersErr.message);

    // Fetch all clubs
    const { data: clubs, error: clubsErr } = await supabase
      .from('clubs')
      .select('id, name, stripe_account_id');

    if (clubsErr) throw new Error(clubsErr.message);

    // ── Per-club aggregation ─────────────────────────────────────────────────
    const clubStats = {};

    for (const club of clubs) {
      clubStats[club.id] = {
        club_id: club.id,
        club_name: club.name,
        stripe_account_id: club.stripe_account_id ?? null,
        total_orders: 0,
        units_sold: 0,
        gross_revenue: 0,
        platform_earnings: 0,
        club_net: 0,
        club_profit: 0,
        total_refunded: 0,
      };
    }

    let globalGross = 0;
    let globalPlatformEarnings = 0;
    let globalRefunded = 0;
    let globalOrders = 0;
    let globalUnits = 0;

    for (const order of orders) {
      const listing = order.listings;
      if (!listing) continue;

      const club_id = listing.club_id;
      if (!clubStats[club_id]) continue;

      const refundAmt = order.refund_amount ?? 0;
      const grossRevenue = order.total_paid - refundAmt;
      const platformFee = grossRevenue * ((listing.platform_fee_percent ?? 5) / 100);
      const clubNet = grossRevenue - platformFee;
      const clubProfit = clubNet - (order.quantity * (listing.cost_per_unit ?? 0));

      clubStats[club_id].total_orders += 1;
      clubStats[club_id].units_sold += order.quantity;
      clubStats[club_id].gross_revenue += grossRevenue;
      clubStats[club_id].platform_earnings += platformFee;
      clubStats[club_id].club_net += clubNet;
      clubStats[club_id].club_profit += clubProfit;
      clubStats[club_id].total_refunded += refundAmt;

      globalGross += grossRevenue;
      globalPlatformEarnings += platformFee;
      globalRefunded += refundAmt;
      globalOrders += 1;
      globalUnits += order.quantity;
    }

    // Round to 2 decimal places
    const round = (n) => Math.round(n * 100) / 100;
    const formattedClubs = Object.values(clubStats).map((s) => ({
      ...s,
      gross_revenue: round(s.gross_revenue),
      platform_earnings: round(s.platform_earnings),
      club_net: round(s.club_net),
      club_profit: round(s.club_profit),
      total_refunded: round(s.total_refunded),
    }));

    res.json({
      global: {
        total_orders: globalOrders,
        units_sold: globalUnits,
        gross_revenue: round(globalGross),
        platform_earnings: round(globalPlatformEarnings),
        total_refunded: round(globalRefunded),
      },
      clubs: formattedClubs,
    });
  } catch (err) {
    console.error('[analytics]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
