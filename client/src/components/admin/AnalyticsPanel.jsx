import React from 'react';
import { Package, DollarSign, TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';

const fmt = (n) => `$${Number(n ?? 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}`;

function KpiCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const ring = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color];
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

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-3 bg-gray-100 rounded w-16" />
        </td>
      ))}
    </tr>
  );
}

/**
 * AnalyticsPanel
 * Props:
 *   analytics  — response from GET /admin/analytics  ({ global, clubs })
 *   loading    — boolean
 *   error      — string | null
 */
export default function AnalyticsPanel({ analytics, loading, error }) {
  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="h-6 bg-gray-100 rounded w-16" />
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="h-4 bg-gray-100 rounded w-40" />
          </div>
          <table className="w-full text-sm">
            <tbody>
              {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
        {error}
      </div>
    );
  }

  const { global: g, clubs } = analytics;

  return (
    <div className="space-y-6">
      {/* Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Package}    label="Total Orders"       value={g.total_orders}              color="blue"   />
        <KpiCard icon={DollarSign} label="Gross Revenue"      value={fmt(g.gross_revenue)}  sub="after refunds" color="green"  />
        <KpiCard icon={TrendingUp} label="Platform Earnings"  value={fmt(g.platform_earnings)}    color="purple" />
        <KpiCard icon={RefreshCw}  label="Total Refunded"     value={fmt(g.total_refunded)}       color="amber"  />
      </div>

      {/* Per-club breakdown table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-800">Per-Club Breakdown</span>
        </div>

        {clubs.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No order data yet. Sales will appear here once clubs start receiving orders.
          </div>
        ) : (
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
                {clubs.map(c => (
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
        )}
      </div>
    </div>
  );
}
