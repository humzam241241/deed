import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, Package, ArrowRight, Tag, Zap } from 'lucide-react';
import supabase from '../lib/supabase.js';

function MiniListingCard({ listing }) {
  const daysLeft = Math.ceil(
    (new Date(listing.order_deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const urgent = daysLeft <= 3;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="h-1 bg-gradient-to-r from-primary to-blue-400" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full truncate max-w-[65%]">
            {listing.clubs?.name ?? 'Club'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Open
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 flex-1">
          {listing.title}
        </h3>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">${Number(listing.price).toFixed(2)}</span>
            <span className="text-xs text-gray-400 ml-1">/ unit</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${urgent ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
            <Clock className="w-3 h-3" />
            {urgent
              ? daysLeft === 0 ? 'Last day!' : `${daysLeft}d left`
              : `${daysLeft}d left`
            }
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
          <Tag className="w-3 h-3" />
          <span>{listing.product_type}</span>
          <span className="mx-1">·</span>
          <Package className="w-3 h-3" />
          <span>{listing.quantity_available} left</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonMiniCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-200" />
      <div className="p-5 space-y-2.5">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-100 rounded-full w-20" />
          <div className="h-4 bg-gray-100 rounded-full w-12" />
        </div>
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2 mt-3" />
      </div>
    </div>
  );
}

export default function MarketplaceSection() {
  const [listings, setListings] = useState([]);
  const [totalOpen, setTotalOpen] = useState(0);
  const [clubCount, setClubCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('listings')
        .select('id, title, price, product_type, quantity_available, order_deadline, clubs(name)')
        .eq('status', 'approved')
        .gt('order_deadline', now)
        .gt('quantity_available', 0)
        .order('created_at', { ascending: false });

      const open = data ?? [];
      setListings(open.slice(0, 3));
      setTotalOpen(open.length);
      setClubCount(new Set(open.map(l => l.clubs?.name).filter(Boolean)).size);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Club Marketplace</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Campus merch, <span className="text-primary">now open</span>
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Browse and order custom apparel from student clubs — all designed and fulfilled by Apparel Studio.
            </p>
          </div>

          <Link
            to="/listings"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            View all listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats strip */}
        {!loading && (totalOpen > 0 || clubCount > 0) && (
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{totalOpen}</span> open listing{totalOpen !== 1 ? 's' : ''}
              </span>
            </div>
            {clubCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span><span className="font-bold text-gray-900">{clubCount}</span> active club{clubCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Secure checkout via Stripe</span>
            </div>
          </div>
        )}

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <SkeletonMiniCard key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No open listings right now</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon — clubs post new drops regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(l => <MiniListingCard key={l.id} listing={l} />)}
          </div>
        )}

        {/* Browse all CTA */}
        {!loading && listings.length > 0 && (
          <div className="text-center mt-8">
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Browse all {totalOpen} listing{totalOpen !== 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
