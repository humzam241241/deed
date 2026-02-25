import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Plus, LogOut, Clock, CheckCircle2, AlertTriangle,
  Calendar, MapPin, DollarSign, RefreshCw, X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import supabase from '../lib/supabase.js';

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  closed:   'bg-gray-100 text-gray-500',
};

function Badge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

const PRODUCT_TYPES = ['T-Shirt', 'Polo', 'Hoodie', 'Hat', 'Banner', 'Other'];

const emptyForm = {
  title: '',
  description: '',
  product_type: 'T-Shirt',
  price: '',
  quantity_available: '',
  cost_per_unit: '',
  order_deadline: '',
  pickup_location: '',
  pickup_instructions: '',
  pickup_date: '',
};

export default function ClubDashboard() {
  const { user, userClubId, signOut } = useAuth();

  const [club, setClub]           = useState(null);
  const [listings, setListings]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [selectedListing, setSelectedListing] = useState(null);

  const loadData = useCallback(async () => {
    if (!userClubId) return;
    setLoading(true);
    setError('');
    try {
      const [clubRes, listingsRes] = await Promise.all([
        supabase.from('clubs').select('*').eq('id', userClubId).single(),
        supabase.from('listings').select('*').eq('club_id', userClubId).order('created_at', { ascending: false }),
      ]);
      if (clubRes.error) throw new Error(clubRes.error.message);
      if (listingsRes.error) throw new Error(listingsRes.error.message);
      setClub(clubRes.data);
      setListings(listingsRes.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userClubId]);

  const loadOrders = useCallback(async (listing_id) => {
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .eq('listing_id', listing_id)
      .order('created_at', { ascending: false });
    if (err) return setError(err.message);
    setOrders(data ?? []);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (selectedListing) loadOrders(selectedListing);
  }, [selectedListing, loadOrders]);

  const handleFieldChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title || !form.price || !form.quantity_available || !form.order_deadline) {
      return setFormError('Title, price, quantity, and deadline are required.');
    }

    setSubmitting(true);
    try {
      const { error: insertErr } = await supabase.from('listings').insert({
        club_id: userClubId,
        title: form.title,
        description: form.description || null,
        product_type: form.product_type,
        price: parseFloat(form.price),
        quantity_available: parseInt(form.quantity_available),
        cost_per_unit: parseFloat(form.cost_per_unit) || 0,
        order_deadline: new Date(form.order_deadline).toISOString(),
        pickup_location: form.pickup_location || null,
        pickup_instructions: form.pickup_instructions || null,
        pickup_date: form.pickup_date || null,
        status: 'pending',
      });

      if (insertErr) throw new Error(insertErr.message);

      setForm(emptyForm);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`;

  if (loading && !club) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading dashboard…</div>;
  }

  if (!userClubId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <h1 className="text-xl font-bold">No Club Assigned</h1>
        <p className="text-gray-500">Your account is not linked to a club. Please contact an admin.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm">{club?.name ?? 'Club Dashboard'}</span>
              <span className="text-gray-400 text-xs ml-2">Exec Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{user?.email}</span>
            <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto">✕</button>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Listings</h2>
          <div className="flex gap-2">
            <button onClick={loadData} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={() => { setShowForm(s => !s); setFormError(''); }}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" />
              New Listing
            </button>
          </div>
        </div>

        {/* ── Create listing form ─────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">New Listing</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" required value={form.title} onChange={e => handleFieldChange('title', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Engineering Hoodie 2026" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => handleFieldChange('description', e.target.value)} rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    placeholder="Describe the product, colours, print details…" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                  <select value={form.product_type} onChange={e => handleFieldChange('product_type', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per unit (CAD) *</label>
                  <input type="number" min="0" step="0.01" required value={form.price} onChange={e => handleFieldChange('price', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="25.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available *</label>
                  <input type="number" min="1" required value={form.quantity_available} onChange={e => handleFieldChange('quantity_available', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost per unit (your cost)</label>
                  <input type="number" min="0" step="0.01" value={form.cost_per_unit} onChange={e => handleFieldChange('cost_per_unit', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="12.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Deadline *</label>
                  <input type="datetime-local" required value={form.order_deadline} onChange={e => handleFieldChange('order_deadline', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                  <input type="date" value={form.pickup_date} onChange={e => handleFieldChange('pickup_date', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <input type="text" value={form.pickup_location} onChange={e => handleFieldChange('pickup_location', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="UC Building, Room 112" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Instructions</label>
                  <textarea value={form.pickup_instructions} onChange={e => handleFieldChange('pickup_instructions', e.target.value)} rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    placeholder="Bring your student ID and order confirmation email." />
                </div>
              </div>

              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                Your listing will be submitted for admin review. It will only go live after approval.
              </p>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-60">
                  {submitting ? 'Submitting…' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Listings list ───────────────────────────────────────────────── */}
        {listings.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-gray-100 px-8 py-12 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No listings yet. Create your first listing above.</p>
          </div>
        )}

        <div className="space-y-4">
          {listings.map(l => (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="px-6 py-4 cursor-pointer hover:bg-gray-50/60 flex items-start justify-between gap-4"
                onClick={() => setSelectedListing(selectedListing === l.id ? null : l.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{l.title}</h3>
                    <Badge status={l.status} />
                    {l.auto_closed && <span className="text-xs text-gray-400">(auto-closed)</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {fmt(l.price)}/unit</span>
                    <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {l.quantity_available} left</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Deadline: {l.order_deadline?.slice(0, 10)}</span>
                    {l.pickup_location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {l.pickup_location}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {l.status === 'approved' && (
                    <Link
                      to={`/listings/${l.id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-xs text-primary underline"
                    >
                      View public page
                    </Link>
                  )}
                  <span className="text-gray-400 text-xs">{selectedListing === l.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Orders for this listing */}
              {selectedListing === l.id && (
                <div className="border-t border-gray-100 px-6 py-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Orders for this listing</h4>
                  {orders.length === 0 ? (
                    <p className="text-sm text-gray-400">No orders yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-400 uppercase">
                            {['Buyer', 'Email', 'Size', 'Qty', 'Total', 'Refund', 'Date'].map(h => (
                              <th key={h} className="text-left pb-2 pr-4 font-semibold tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {orders.map(o => (
                            <tr key={o.id}>
                              <td className="py-2 pr-4 font-medium text-gray-800">{o.buyer_name}</td>
                              <td className="py-2 pr-4 text-gray-500">{o.buyer_email}</td>
                              <td className="py-2 pr-4 text-gray-600">{o.size || '—'}</td>
                              <td className="py-2 pr-4 tabular-nums">{o.quantity}</td>
                              <td className="py-2 pr-4 tabular-nums font-semibold">{fmt(o.total_paid)}</td>
                              <td className="py-2 pr-4"><Badge status={o.refund_status} /></td>
                              <td className="py-2 text-gray-400 text-xs tabular-nums">{o.created_at?.slice(0, 10)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
