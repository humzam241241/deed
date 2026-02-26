import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2, XCircle, Package, Pencil, X } from 'lucide-react';
import supabase from '../../lib/supabase.js';
import PhotoUpload from '../PhotoUpload.jsx';

const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`;
const PRODUCT_TYPES = ['T-Shirt', 'Polo', 'Hoodie', 'Hat', 'Banner', 'Other'];
const STATUSES = ['pending', 'approved', 'closed'];

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  closed:   'bg-gray-100 text-gray-500',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export default function AdminListingsPanel() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [acting, setActing]     = useState(null);
  const [viewMode, setViewMode] = useState('pending'); // 'pending' | 'all'

  // Edit modal
  const [editListing, setEditListing] = useState(null);
  const [editForm, setEditForm]       = useState({});
  const [editSaving, setEditSaving]   = useState(false);
  const [editError, setEditError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    let query = supabase
      .from('listings')
      .select('id, title, price, quantity_available, order_deadline, product_type, status, created_at, clubs(name), image_urls, description, pickup_location, pickup_instructions, pickup_date, cost_per_unit, platform_fee_percent')
      .order('created_at', { ascending: false });

    if (viewMode === 'pending') {
      query = query.eq('status', 'pending');
    }

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setListings(data ?? []);
    setLoading(false);
  }, [viewMode]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, status) => {
    setActing(id);
    setError('');
    const { error: err } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id);
    if (err) setError(err.message);
    else setListings(prev => viewMode === 'pending' ? prev.filter(l => l.id !== id) : prev.map(l => l.id === id ? { ...l, status } : l));
    setActing(null);
  };

  const approve = (id) => act(id, 'approved');
  const reject  = (id) => act(id, 'closed');

  const openEdit = (listing) => {
    setEditListing(listing);
    setEditError('');
    setEditForm({
      title:                listing.title,
      description:          listing.description ?? '',
      product_type:         listing.product_type,
      price:                listing.price,
      quantity_available:   listing.quantity_available,
      cost_per_unit:        listing.cost_per_unit ?? 0,
      order_deadline:       listing.order_deadline ? listing.order_deadline.slice(0, 16) : '',
      pickup_location:      listing.pickup_location ?? '',
      pickup_instructions:  listing.pickup_instructions ?? '',
      pickup_date:          listing.pickup_date ?? '',
      platform_fee_percent: listing.platform_fee_percent ?? 10,
      status:               listing.status,
      image_urls:           listing.image_urls ?? [],
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError('');
    const { error: err } = await supabase
      .from('listings')
      .update({
        title:                editForm.title,
        description:          editForm.description || null,
        product_type:         editForm.product_type,
        price:                parseFloat(editForm.price),
        quantity_available:   parseInt(editForm.quantity_available),
        cost_per_unit:        parseFloat(editForm.cost_per_unit) || 0,
        order_deadline:       editForm.order_deadline ? new Date(editForm.order_deadline).toISOString() : null,
        pickup_location:      editForm.pickup_location || null,
        pickup_instructions:  editForm.pickup_instructions || null,
        pickup_date:          editForm.pickup_date || null,
        platform_fee_percent: parseFloat(editForm.platform_fee_percent),
        status:               editForm.status,
        image_urls:           editForm.image_urls ?? [],
      })
      .eq('id', editListing.id);

    if (err) {
      setEditError(err.message);
    } else {
      setListings(prev => prev.map(l => l.id === editListing.id ? { ...l, ...editForm, price: parseFloat(editForm.price), quantity_available: parseInt(editForm.quantity_available) } : l));
      setEditListing(null);
    }
    setEditSaving(false);
  };

  const pendingCount = listings.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { key: 'pending', label: 'Pending Review' },
            { key: 'all',     label: 'All Listings' },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === v.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v.label}
              {v.key === 'pending' && pendingCount > 0 && viewMode === 'all' && (
                <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
        <button onClick={load} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Title', 'Org', 'Product', 'Price', 'Qty', 'Status', 'Deadline', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">Loading…</td></tr>
              )}
              {!loading && listings.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <CheckCircle2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {viewMode === 'pending' ? 'All caught up — no listings pending review.' : 'No listings found.'}
                    </p>
                  </td>
                </tr>
              )}
              {listings.map(l => (
                <tr key={l.id} className={`hover:bg-gray-50/70 ${acting === l.id ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-800 max-w-[180px] truncate">{l.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{l.created_at?.slice(0, 10)}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{l.clubs?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{l.product_type}</td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums">{fmt(l.price)}</td>
                  <td className="px-5 py-3.5 tabular-nums">{l.quantity_available}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={l.status} /></td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs tabular-nums">
                    {l.order_deadline ? new Date(l.order_deadline).toLocaleDateString('en-CA', { dateStyle: 'medium' }) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      {l.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approve(l.id)}
                            disabled={acting === l.id}
                            className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md hover:bg-green-100 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => reject(l.id)}
                            disabled={acting === l.id}
                            className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEdit(l)}
                        className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editListing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Edit Listing</h2>
              <button onClick={() => setEditListing(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {editError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {editError}
                </div>
              )}

              <form onSubmit={handleEditSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                    <input type="text" required value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                    <textarea rows={2} value={editForm.description}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Product Type</label>
                    <select value={editForm.product_type} onChange={e => setEditForm(f => ({ ...f, product_type: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                      {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                      {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price (CAD)</label>
                    <input type="number" min="0" step="0.01" required value={editForm.price}
                      onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity Available</label>
                    <input type="number" min="0" required value={editForm.quantity_available}
                      onChange={e => setEditForm(f => ({ ...f, quantity_available: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Platform Fee %</label>
                    <input type="number" min="0" max="100" step="0.1" value={editForm.platform_fee_percent}
                      onChange={e => setEditForm(f => ({ ...f, platform_fee_percent: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Order Deadline</label>
                    <input type="datetime-local" value={editForm.order_deadline}
                      onChange={e => setEditForm(f => ({ ...f, order_deadline: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Location</label>
                    <input type="text" value={editForm.pickup_location}
                      onChange={e => setEditForm(f => ({ ...f, pickup_location: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Instructions</label>
                    <textarea rows={2} value={editForm.pickup_instructions}
                      onChange={e => setEditForm(f => ({ ...f, pickup_instructions: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Photos</label>
                    <PhotoUpload
                      urls={editForm.image_urls}
                      onChange={urls => setEditForm(f => ({ ...f, image_urls: urls }))}
                      disabled={editSaving}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setEditListing(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={editSaving}
                    className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-60 transition-colors">
                    {editSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
