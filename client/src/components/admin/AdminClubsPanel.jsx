import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Building2, AlertTriangle, RefreshCw, DollarSign } from 'lucide-react';
import supabase from '../../lib/supabase.js';

export default function AdminClubsPanel() {
  const [clubs, setClubs]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [name, setName]               = useState('');
  const [submitting, setSubmitting]   = useState(false);

  // Payout notes — keyed by club.id
  const [payoutNote, setPayoutNote]   = useState({});
  const [savingNote, setSavingNote]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from('clubs').select('*').order('name');
    if (err) setError(err.message);
    else setClubs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.from('clubs').insert({ name: name.trim() });
    if (err) setError(err.message);
    else { setName(''); setShowForm(false); await load(); }
    setSubmitting(false);
  };

  const handleSaveNote = async (clubId) => {
    setSavingNote(clubId);
    const { error: err } = await supabase
      .from('clubs')
      .update({ payout_notes: payoutNote[clubId] ?? '' })
      .eq('id', clubId);
    if (err) setError(err.message);
    setSavingNote(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm">
        <DollarSign className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Payments are collected into the platform Stripe account. 
          Pay out each organization manually after funds clear. Use the notes field to track payout status.
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{clubs.length} organization{clubs.length !== 1 ? 's' : ''} registered</p>
        <div className="flex gap-2">
          <button onClick={load} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setShowForm(s => !s); setName(''); setError(''); }}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create Organization
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-end gap-3"
        >
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Organization Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              placeholder="e.g. Engineering Society"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Creating…' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Clubs table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Organization', 'Payout Notes / Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={3} className="text-center py-10 text-gray-400 text-sm">Loading…</td></tr>
              )}
              {!loading && clubs.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-12">
                    <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No organizations yet. Create the first one above.</p>
                  </td>
                </tr>
              )}
              {clubs.map(club => (
                <tr key={club.id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <span className="font-medium text-gray-800">{club.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">{club.id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-5 py-3.5 min-w-[260px]">
                    <input
                      type="text"
                      defaultValue={club.payout_notes ?? ''}
                      onChange={e => setPayoutNote(n => ({ ...n, [club.id]: e.target.value }))}
                      placeholder="e.g. Paid out $420 on 2026-03-01"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-600"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleSaveNote(club.id)}
                      disabled={savingNote === club.id}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {savingNote === club.id ? 'Saving…' : 'Save Note'}
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
