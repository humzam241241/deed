import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Package, DollarSign, Clock, CheckCircle2, TrendingUp,
  Search, Filter, ChevronDown, Download, RefreshCw, BarChart2,
  Shirt, Users, Calendar,
} from 'lucide-react';
import { isAdminAuthenticated, adminLogout } from './AdminLogin';
import { MOCK_ORDERS, getStats } from '../data/mockOrders';

// ─── Protected wrapper ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  if (!isAdminAuthenticated()) {
    navigate('/admin/login');
    return null;
  }

  return <DashboardContent navigate={navigate} />;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  completed:    'bg-green-100 text-green-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  pending:       'bg-amber-100 text-amber-700',
  cancelled:     'bg-red-100 text-red-700',
};
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
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
        <div className={`p-2.5 rounded-lg ${ring}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ─── Simple bar chart (CSS only, no library needed) ───────────────────────────
function ProductBar({ label, count, total, color }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-sm font-medium text-gray-700 w-14 text-right">{count} orders</span>
    </div>
  );
}

const PRODUCT_COLORS = {
  'T-Shirt': '#3b82f6',
  'Polo':    '#10b981',
  'Hoodie':  '#8b5cf6',
  'Hat':     '#f59e0b',
  'Banner':  '#ef4444',
};

// ─── Main dashboard ────────────────────────────────────────────────────────────
function DashboardContent({ navigate }) {
  const [orders, setOrders]       = useState(MOCK_ORDERS);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [productFilter, setProduct] = useState('all');
  const [sortBy, setSortBy]       = useState('date');
  const [showOrderId, setShowOrderId] = useState(null);

  const stats = useMemo(() => getStats(orders), [orders]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search)        list = list.filter(o =>
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.design.toLowerCase().includes(search.toLowerCase()),
    );
    if (statusFilter !== 'all')  list = list.filter(o => o.status === statusFilter);
    if (productFilter !== 'all') list = list.filter(o => o.product === productFilter);
    list.sort((a, b) => {
      if (sortBy === 'date')    return new Date(b.date) - new Date(a.date);
      if (sortBy === 'amount')  return b.amount - a.amount;
      if (sortBy === 'qty')     return b.qty - a.qty;
      return 0;
    });
    return list;
  }, [orders, search, statusFilter, productFilter, sortBy]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const exportCSV = () => {
    const header = 'Order ID,Customer,Email,Product,Qty,Amount,Status,Date,Design\n';
    const rows   = orders.map(o =>
      `${o.id},"${o.customer}",${o.email},${o.product},${o.qty},${o.amount.toFixed(2)},${o.status},${o.date},"${o.design}"`,
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

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
            <span className="text-xs text-gray-400">admin</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── KPI row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Package}       label="Total Orders"    value={stats.total}           sub={`${stats.completed} completed`}  color="blue"   />
          <KpiCard icon={DollarSign}    label="Total Revenue"   value={`$${stats.revenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`} sub={`avg $${stats.avgOrder.toFixed(0)}/order`} color="green"  />
          <KpiCard icon={Clock}         label="Pending"         value={stats.pending}         sub="awaiting approval"               color="amber"  />
          <KpiCard icon={TrendingUp}    label="In Progress"     value={stats.inProgress}      sub="in production"                   color="purple" />
        </div>

        {/* ── Two-column: product breakdown + top stats ─────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product breakdown */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-800">Orders by Product</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.productCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([product, count]) => (
                  <ProductBar
                    key={product}
                    label={product}
                    count={count}
                    total={stats.total}
                    color={PRODUCT_COLORS[product] || '#6b7280'}
                  />
                ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="font-semibold text-gray-800">Quick Stats</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg"><Shirt className="w-4 h-4 text-blue-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Top Product</p>
                  <p className="text-sm font-semibold text-gray-800">{stats.topProduct}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg"><Users className="w-4 h-4 text-green-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Unique Clients</p>
                  <p className="text-sm font-semibold text-gray-800">{new Set(MOCK_ORDERS.map(o => o.email)).size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg"><Calendar className="w-4 h-4 text-purple-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Total Units Ordered</p>
                  <p className="text-sm font-semibold text-gray-800">{orders.reduce((s, o) => s + o.qty, 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-amber-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Completion Rate</p>
                  <p className="text-sm font-semibold text-gray-800">{Math.round((stats.completed / stats.total) * 100)}%</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                💡 Connect Supabase to get live data
              </p>
            </div>
          </div>
        </div>

        {/* ── Orders table ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table header / filters */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <h2 className="font-semibold text-gray-800 mr-auto">All Orders</h2>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 w-40"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Product filter */}
            <select
              value={productFilter}
              onChange={e => setProduct(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">All products</option>
              {['T-Shirt','Polo','Hoodie','Hat','Banner'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Revenue</option>
              <option value="qty">Sort: Qty</option>
            </select>

            {/* Export */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order ID','Customer','Product','Qty','Amount','Status','Date','Design','Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">
                      No orders match your filters.
                    </td>
                  </tr>
                )}
                {filtered.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr
                      className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                      onClick={() => setShowOrderId(showOrderId === order.id ? null : order.id)}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{order.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-800">{order.customer}</div>
                        <div className="text-xs text-gray-400">{order.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{order.product}</td>
                      <td className="px-5 py-3.5 text-gray-700 tabular-nums">{order.qty}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800 tabular-nums">
                        ${order.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                      <td className="px-5 py-3.5 text-gray-500 tabular-nums">{order.date}</td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-[160px] truncate">{order.design}</td>
                      <td className="px-5 py-3.5">
                        <select
                          value={order.status}
                          onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                          onClick={e => e.stopPropagation()}
                          className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                    {/* Expanded row */}
                    {showOrderId === order.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="px-5 py-4">
                          <div className="flex flex-wrap gap-6 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs uppercase tracking-wide">Notes</span>
                              <p className="text-gray-800 mt-0.5">{order.notes || '—'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs uppercase tracking-wide">Unit Price</span>
                              <p className="text-gray-800 mt-0.5">${(order.amount / order.qty).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs uppercase tracking-wide">Design Name</span>
                              <p className="text-gray-800 mt-0.5">{order.design}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
            <span>Showing {filtered.length} of {orders.length} orders</span>
            <span className="flex items-center gap-1.5 text-gray-300 italic">
              <RefreshCw className="w-3 h-3" />
              Mock data — connect Supabase for live orders
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
