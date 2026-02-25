import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2, XCircle, Package } from 'lucide-react';
import supabase from '../../lib/supabase.js';

const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`;

export default function AdminListingsPanel() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [acting, setActing]     = useState(null); // listing id being acted on

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('listings')
      .select('id, title, price, quantity_available, order_deadline, product_type, created_at, clubs(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }); // oldest first — review in order
    if (err) setError(err.message);
    else setListings(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id, status) => {
    setActing(id);
    setError('');
    const { error: err } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id);
    if (err) setError(err.message);
    else setListings(prev => prev.filter(l => l.id !== id));
    setActing(null);
  };

  const approve = (id) => act(id, 'approved');
  const reject  = (id) => act(id, 'closed');

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? '…' : listings.length} listing{listings.length !== 1 ? 's' : ''} pending review
        </p>
        <button onClick={load} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Title', 'Club', 'Product', 'Price', 'Qty', 'Deadline', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Loading…</td></tr>
              )}
              {!loading && listings.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <CheckCircle2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">All caught up — no listings pending review.</p>
                  </td>
                </tr>
              )}
              {listings.map(l => (
                <tr key={l.id} className={`hover:bg-gray-50/70 ${acting === l.id ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-800 max-w-[180px] truncate">{l.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Submitted {l.created_at?.slice(0, 10)}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{l.clubs?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{l.product_type}</td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums">{fmt(l.price)}</td>
                  <td className="px-5 py-3.5 tabular-nums">{l.quantity_available}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs tabular-nums">
                    {l.order_deadline ? new Date(l.order_deadline).toLocaleDateString('en-CA', { dateStyle: 'medium' }) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
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
                    </div>
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
