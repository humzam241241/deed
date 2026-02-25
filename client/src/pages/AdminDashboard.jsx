import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Package, DollarSign, Clock, CheckCircle2, TrendingUp,
  Search, Download, RefreshCw, BarChart2, Shirt, Users, Calendar,
  ExternalLink, AlertTriangle, Plus, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import supabase from '../lib/supabase.js';
import { refundOrder, fetchAnalytics, createConnectedAccount, getOnboardingLink } from '../lib/api.js';

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  completed:    'bg-green-100 text-green-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  pending:       'bg-amber-100 text-amber-700',
  cancelled:     'bg-red-100 text-red-700',
  approved:      'bg-green-100 text-green-700',
  closed:        'bg-gray-100 text-gray-600',
  none:          'bg-gray-100 text-gray-500',
  partial:       'bg-amber-100 text-amber-700',
  full:          'bg-red-100 text-red-700',
};

function Badge({ value }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[value] || 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const ring = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600' }[color];
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${ring}`}><Icon className="w-5 h-5" /></div>
      </div>
    </div>
  );
}

const fmt = (n) => `$${Number(n ?? 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}`;

// ─── Main dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // ── Data state ────────────────────────────────────────────────────────────
  const [orders, setOrders]       = useState([]);
  const [listings, setListings]   = useState([]);
  const [clubs, setClubs]         = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError]         = useState('');

  // ── UI state ──────────────────────────────────────────────────────────────
  const [tab, setTab]                 = useState('orders'); // 'orders' | 'listings' | 'clubs' | 'analytics'
  const [search, setSearch]           = useState('');
  const [refundingId, setRefundingId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [connectingClub, setConnectingClub] = useState(null);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    setError('');
    try {
      const [ordersRes, listingsRes, clubsRes] = await Promise.all([
        supabase.from('orders').select('*, listings(title, club_id, price, clubs(name))').order('created_at', { ascending: false }),
        supabase.from('listings').select('*, clubs(name, stripe_account_id)').order('created_at', { ascending: false }),
        supabase.from('clubs').select('*').order('name'),
      ]);

      if (ordersRes.error) throw new Error(ordersRes.error.message);
      if (listingsRes.error) throw new Error(listingsRes.error.message);
      if (clubsRes.error) throw new Error(clubsRes.error.message);

      setOrders(ordersRes.data ?? []);
      setListings(listingsRes.data ?? []);
      setClubs(clubsRes.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (tab === 'analytics') loadAnalytics(); }, [tab, loadAnalytics]);

  const handleLogout = async () => { await signOut(); navigate('/admin/login'); };

  // ── Approve listing ───────────────────────────────────────────────────────
  const approveListing = async (id) => {
    const { error: err } = await supabase.from('listings').update({ status: 'approved' }).eq('id', id);
    if (err) return setError(err.message);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
  };

  const closeListing = async (id) => {
    const { error: err } = await supabase.from('listings').update({ status: 'closed' }).eq('id', id);
    if (err) return setError(err.message);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'closed' } : l));
  };

  // ── Refund order ──────────────────────────────────────────────────────────
  const handleRefund = async (order_id, type = 'full') => {
    if (!window.confirm(`Issue ${type} refund for this order?`)) return;
    setRefundingId(order_id);
    try {
      await refundOrder(order_id, type);
      alert('Refund initiated. Status will update via webhook shortly.');
    } catch (err) {
      setError(err.message);
    } finally {
      setRefundingId(null);
    }
  };

  // ── Stripe Connect ────────────────────────────────────────────────────────
  const handleCreateStripeAccount = async (club_id) => {
    setConnectingClub(club_id);
    try {
      await createConnectedAccount(club_id);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setConnectingClub(null);
    }
  };

  const handleOnboardingLink = async (club_id) => {
    setConnectingClub(club_id);
    try {
      const { url } = await getOnboardingLink(club_id);
      window.open(url, '_blank');
    } catch (err) {
      setError(err.message);
    } finally {
      setConnectingClub(null);
    }
  };

  // ── CSV export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = 'Order ID,Buyer,Email,Listing,Qty,Total Paid,Refund Status,Refund Amount,Created\n';
    const rows = orders.map(o =>
      `${o.id},"${o.buyer_name}",${o.buyer_email},"${o.listings?.title ?? ''}",${o.quantity},${o.total_paid},${o.refund_status},${o.refund_amount},${o.created_at}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() =>
    orders.filter(o =>
      !search ||
      o.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.listings?.title?.toLowerCase().includes(search.toLowerCase())
    ), [orders, search]);

  const filteredListings = useMemo(() =>
    listings.filter(l =>
      !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.clubs?.name?.toLowerCase().includes(search.toLowerCase())
    ), [listings, search]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total_paid ?? 0), 0);
  const pendingListings = listings.filter(l => l.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm">Apparel Studio</span>
              <span className="text-gray-400 text-xs ml-2">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{user?.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Package}    label="Total Orders"    value={orders.length}        sub={`${orders.filter(o => o.refund_status === 'none').length} active`} color="blue" />
          <KpiCard icon={DollarSign} label="Gross Revenue"   value={fmt(totalRevenue)}    sub="before refunds" color="green" />
          <KpiCard icon={Clock}      label="Pending Listings" value={pendingListings}      sub="awaiting approval" color="amber" />
          <KpiCard icon={TrendingUp} label="Active Clubs"    value={clubs.length}         sub="registered" color="purple" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: 'orders', label: 'Orders' },
            { key: 'listings', label: 'Listings' },
            { key: 'clubs', label: 'Clubs' },
            { key: 'analytics', label: 'Analytics' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
              {t.key === 'listings' && pendingListings > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingListings}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search + refresh */}
        {tab !== 'analytics' && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <button onClick={loadData} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            {tab === 'orders' && (
              <button onClick={exportCSV} className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ─────────────────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Buyer', 'Listing', 'Qty', 'Total Paid', 'Refund', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataLoading && (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading orders…</td></tr>
                  )}
                  {!dataLoading && filteredOrders.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">No orders found.</td></tr>
                  )}
                  {filteredOrders.map(order => (
                    <React.Fragment key={order.id}>
                      <tr
                        className="hover:bg-gray-50/70 cursor-pointer"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-gray-800">{order.buyer_name}</div>
                          <div className="text-xs text-gray-400">{order.buyer_email}</div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-700">{order.listings?.title ?? '—'}</td>
                        <td className="px-5 py-3.5 tabular-nums">{order.quantity}</td>
                        <td className="px-5 py-3.5 font-semibold tabular-nums">{fmt(order.total_paid)}</td>
                        <td className="px-5 py-3.5"><Badge value={order.refund_status} /></td>
                        <td className="px-5 py-3.5 text-gray-400 tabular-nums text-xs">{order.created_at?.slice(0, 10)}</td>
                        <td className="px-5 py-3.5">
                          {order.refund_status !== 'full' && order.stripe_payment_intent && (
                            <button
                              onClick={e => { e.stopPropagation(); handleRefund(order.id, 'full'); }}
                              disabled={refundingId === order.id}
                              className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md hover:bg-red-100 disabled:opacity-50"
                            >
                              {refundingId === order.id ? 'Refunding…' : 'Refund'}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedOrder === order.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-5 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div><span className="text-xs text-gray-400 uppercase">Student ID</span><p className="mt-0.5">{order.student_id || '—'}</p></div>
                              <div><span className="text-xs text-gray-400 uppercase">Size</span><p className="mt-0.5">{order.size || '—'}</p></div>
                              <div><span className="text-xs text-gray-400 uppercase">Refund Amount</span><p className="mt-0.5">{fmt(order.refund_amount)}</p></div>
                              <div><span className="text-xs text-gray-400 uppercase">Payment Intent</span><p className="mt-0.5 font-mono text-xs truncate">{order.stripe_payment_intent || '—'}</p></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        )}

        {/* ── LISTINGS TAB ───────────────────────────────────────────────────── */}
        {tab === 'listings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Title', 'Club', 'Price', 'Qty Left', 'Fee %', 'Deadline', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataLoading && (
                    <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading listings…</td></tr>
                  )}
                  {!dataLoading && filteredListings.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-10 text-gray-400">No listings found.</td></tr>
                  )}
                  {filteredListings.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-3.5 font-medium text-gray-800 max-w-[200px] truncate">{l.title}</td>
                      <td className="px-5 py-3.5 text-gray-600">{l.clubs?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 tabular-nums">{fmt(l.price)}</td>
                      <td className="px-5 py-3.5 tabular-nums">{l.quantity_available}</td>
                      <td className="px-5 py-3.5 tabular-nums">{l.platform_fee_percent}%</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs tabular-nums">{l.order_deadline?.slice(0, 10)}</td>
                      <td className="px-5 py-3.5"><Badge value={l.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          {l.status === 'pending' && (
                            <button
                              onClick={() => approveListing(l.id)}
                              className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md hover:bg-green-100"
                            >
                              Approve
                            </button>
                          )}
                          {l.status === 'approved' && (
                            <button
                              onClick={() => closeListing(l.id)}
                              className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-200"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CLUBS TAB ─────────────────────────────────────────────────────── */}
        {tab === 'clubs' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Club Name', 'Stripe Account', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataLoading && (
                    <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading clubs…</td></tr>
                  )}
                  {clubs.map(club => (
                    <tr key={club.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{club.name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{club.stripe_account_id || '—'}</td>
                      <td className="px-5 py-3.5">
                        <Badge value={club.stripe_account_id ? 'connected' : 'pending'} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          {!club.stripe_account_id ? (
                            <button
                              onClick={() => handleCreateStripeAccount(club.id)}
                              disabled={connectingClub === club.id}
                              className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-100 disabled:opacity-50"
                            >
                              {connectingClub === club.id ? 'Creating…' : 'Create Stripe Account'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOnboardingLink(club.id)}
                              disabled={connectingClub === club.id}
                              className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-200 disabled:opacity-50"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {connectingClub === club.id ? 'Loading…' : 'Onboarding Link'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ─────────────────────────────────────────────────── */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            {!analytics ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
                Loading analytics…
              </div>
            ) : (
              <>
                {/* Global totals */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard icon={Package}    label="Total Orders"       value={analytics.global.total_orders} color="blue" />
                  <KpiCard icon={DollarSign} label="Gross Revenue"       value={fmt(analytics.global.gross_revenue)} sub="after refunds" color="green" />
                  <KpiCard icon={TrendingUp} label="Platform Earnings"   value={fmt(analytics.global.platform_earnings)} color="purple" />
                  <KpiCard icon={RefreshCw}  label="Total Refunded"      value={fmt(analytics.global.total_refunded)} color="amber" />
                </div>

                {/* Per-club table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Per-Club Breakdown</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['Club', 'Orders', 'Units', 'Gross', 'Platform Fee', 'Club Net', 'Club Profit', 'Refunded'].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {analytics.clubs.map(c => (
                          <tr key={c.club_id} className="hover:bg-gray-50/70">
                            <td className="px-5 py-3.5 font-medium text-gray-800">{c.club_name}</td>
                            <td className="px-5 py-3.5 tabular-nums">{c.total_orders}</td>
                            <td className="px-5 py-3.5 tabular-nums">{c.units_sold}</td>
                            <td className="px-5 py-3.5 tabular-nums">{fmt(c.gross_revenue)}</td>
                            <td className="px-5 py-3.5 tabular-nums text-purple-700">{fmt(c.platform_earnings)}</td>
                            <td className="px-5 py-3.5 tabular-nums">{fmt(c.club_net)}</td>
                            <td className="px-5 py-3.5 tabular-nums text-green-700 font-semibold">{fmt(c.club_profit)}</td>
                            <td className="px-5 py-3.5 tabular-nums text-red-600">{fmt(c.total_refunded)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
