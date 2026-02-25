import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { createConnectedAccount, getOnboardingLink } from '../../lib/api.js';

/**
 * StripeConnectCard
 * Displays Stripe Connect onboarding status for a single club
 * and lets admins create / access the onboarding link.
 *
 * Props:
 *   club        — { id, name, stripe_account_id }
 *   onRefresh   — () => void  called after a successful action
 */
export default function StripeConnectCard({ club, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const isConnected = !!club.stripe_account_id;

  const handleConnect = async () => {
    setError('');
    setLoading(true);
    try {
      await createConnectedAccount(club.id);
      onRefresh?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    setError('');
    setLoading(true);
    try {
      const { url } = await getOnboardingLink(club.id);
      window.open(url, '_blank');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 flex items-start justify-between gap-4 ${
      isConnected ? 'border-green-100' : 'border-amber-100'
    }`}>
      <div className="flex items-start gap-3 min-w-0">
        <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${
          isConnected ? 'bg-green-50' : 'bg-amber-50'
        }`}>
          <CreditCard className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-amber-500'}`} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{club.name}</p>
          {isConnected ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs text-green-700 font-medium">Stripe connected</span>
              <span className="text-xs text-gray-400 font-mono truncate ml-1">{club.stripe_account_id}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-xs text-amber-700 font-medium">Stripe not set up — listings cannot be approved</span>
            </div>
          )}
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      </div>

      <div className="flex-shrink-0">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
            {loading ? 'Creating…' : 'Connect Stripe'}
          </button>
        ) : (
          <button
            onClick={handleOnboard}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors"
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ExternalLink className="w-3.5 h-3.5" />
            }
            {loading ? 'Loading…' : 'Onboarding Link'}
          </button>
        )}
      </div>
    </div>
  );
}
