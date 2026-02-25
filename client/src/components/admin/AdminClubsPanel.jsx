import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Building2, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import supabase from '../../lib/supabase.js';
import { createConnectedAccount, getOnboardingLink } from '../../lib/api.js';

export default function AdminClubsPanel() {
  const [clubs, setClubs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [name, setName]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [connectingId, setConnectingId] = useState(null);

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

  const handleCreateStripe = async (club_id) => {
    setConnectingId(club_id);
    try {
      await createConnectedAccount(club_id);
      await load();
    } catch (err) { setError(err.message); }
    setConnectingId(null);
  };

  const handleOnboard = async (club_id) => {
    setConnectingId(club_id);
    try {
      const { url } = await getOnboardingLink(club_id);
      window.open(url, '_blank');
    } catch (err) { setError(err.message); }
    setConnectingId(null);
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
        <p className="text-sm text-gray-500">{clubs.length} club{clubs.length !== 1 ? 's' : ''} registered</p>
        <div className="flex gap-2">
          <button onClick={load} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setShowForm(s => !s); setName(''); setError(''); }}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create Club
          </button>
        </div>
      </div>

      {/* Create club form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-end gap-3"
        >
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Club Name *</label>
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
                {['Club Name', 'Stripe Account', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-sm">Loading clubs…</td></tr>
              )}
              {!loading && clubs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No clubs yet. Create the first one above.</p>
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
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">
                    {club.stripe_account_id || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      club.stripe_account_id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {club.stripe_account_id ? 'Stripe connected' : 'Stripe not set up'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      {!club.stripe_account_id ? (
                        <button
                          onClick={() => handleCreateStripe(club.id)}
                          disabled={connectingId === club.id}
                          className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors"
                        >
                          {connectingId === club.id ? 'Creating…' : 'Connect Stripe'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOnboard(club.id)}
                          disabled={connectingId === club.id}
                          className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {connectingId === club.id ? 'Loading…' : 'Onboarding Link'}
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
    </div>
  );
}
