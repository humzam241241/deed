import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, RefreshCw, AlertTriangle, Tag } from 'lucide-react';
import { listDiscountCodes, createDiscountCode, deleteDiscountCode } from '../../lib/api.js';

const emptyForm = {
  code: '',
  type: 'percent',
  value: '',
  max_uses: '',
  expires_at: '',
  listing_id: '',
};

export default function DiscountCodesPanel() {
  const [codes, setCodes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listDiscountCodes();
      setCodes(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createDiscountCode({
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
        listing_id: form.listing_id || null,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete discount code "${code}"?`)) return;
    try {
      await deleteDiscountCode(id);
      setCodes(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{loading ? '…' : codes.length} discount code{codes.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <button onClick={load} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Code
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Create Discount Code</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Code *</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE10"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value="percent">% Percent</option>
                <option value="fixed">$ Fixed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Value *</label>
              <input
                type="number" min="0" step="0.01" required
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'percent' ? '10' : '5.00'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses</label>
              <input
                type="number" min="1"
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                placeholder="Unlimited"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expires At</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Listing ID (optional)</label>
              <input
                type="text"
                value={form.listing_id}
                onChange={e => setForm(f => ({ ...f, listing_id: e.target.value }))}
                placeholder="Leave blank for all"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="sm:col-span-3 flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-60 transition-colors">
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Codes table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Code', 'Type', 'Value', 'Uses', 'Expires', 'Scope', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">Loading…</td></tr>
              )}
              {!loading && codes.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Tag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No discount codes yet.</p>
                  </td>
                </tr>
              )}
              {codes.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3.5 font-mono font-semibold text-gray-800">{c.code}</td>
                  <td className="px-5 py-3.5 capitalize text-gray-600">{c.type}</td>
                  <td className="px-5 py-3.5 tabular-nums">
                    {c.type === 'percent' ? `${c.value}%` : `$${Number(c.value).toFixed(2)}`}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-gray-600">
                    {c.uses_count}{c.max_uses !== null ? `/${c.max_uses}` : ''}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-CA', { dateStyle: 'medium' }) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs font-mono">
                    {c.listing_id ? c.listing_id.slice(0, 8) + '…' : 'All listings'}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
