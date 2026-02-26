import React, { useState } from 'react';
import { Tag, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { validateDiscount } from '../lib/api.js';

/**
 * DiscountCodeInput
 * Props:
 *   listingId: string
 *   quantity: number
 *   onApply: ({ code, discount_amount, discount_type, discount_value }) => void
 *   onRemove: () => void
 *   applied: { code, discount_amount } | null
 */
export default function DiscountCodeInput({ listingId, quantity, onApply, onRemove, applied }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await validateDiscount(code.trim(), listingId, quantity);
      onApply(result);
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Code applied: <span className="font-mono">{applied.code}</span></p>
            <p className="text-xs text-green-600">−${Number(applied.discount_amount).toFixed(2)} discount</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-green-600 hover:text-green-800 transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">Discount Code</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            placeholder="Enter code"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 uppercase"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Apply
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
