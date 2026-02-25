import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Package, Clock, Tag, AlertTriangle,
  Search, SlidersHorizontal, ShoppingBag, X, ChevronDown,
} from 'lucide-react';
import supabase from '../lib/supabase.js';

const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`;

function StatusBadge({ isOpen, isSoldOut }) {
  if (isSoldOut) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Sold Out</span>;
  if (!isOpen)   return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Closed</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Open
    </span>
  );
}

function ListingCard({ listing }) {
  const isExpired = new Date() > new Date(listing.order_deadline);
  const isSoldOut = listing.quantity_available <= 0;
  const isOpen    = !isExpired && !isSoldOut;

  const daysLeft = isOpen
    ? Math.ceil((new Date(listing.order_deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
      isOpen ? 'border-gray-100 shadow-sm' : 'border-gray-100 shadow-sm opacity-70'
    }`}>
      {/* Top accent bar */}
      <div className={`h-1 w-full ${isOpen ? 'bg-gradient-to-r from-primary to-blue-400' : 'bg-gray-200'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Club + Status row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full truncate max-w-[60%]">
            {listing.clubs?.name ?? 'Unknown Club'}
          </span>
          <StatusBadge isOpen={isOpen} isSoldOut={isSoldOut} />
        </div>

        {/* Title + Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 leading-snug flex-1 min-w-0">{listing.title}</h3>
          <div className="flex-shrink-0 text-right">
            <p className="text-lg font-bold text-gray-900">{fmt(listing.price)}</p>
            <p className="text-xs text-gray-400 -mt-0.5">/ unit</p>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">{listing.description}</p>
        )}

        {/* Meta info */}
        <div className="space-y-1.5 mb-4 flex-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{listing.product_type}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {isSoldOut ? (
              <span className="text-red-500 font-medium">Sold out</span>
            ) : (
              <span><span className="font-medium text-gray-800">{listing.quantity_available}</span> remaining</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {isExpired ? (
              <span className="text-gray-400">Deadline passed</span>
            ) : daysLeft <= 3 ? (
              <span className="text-amber-600 font-medium">
                {daysLeft === 0 ? 'Last day!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
              </span>
            ) : (
              <span>Order by <span className="font-medium text-gray-700">{new Date(listing.order_deadline).toLocaleDateString('en-CA', { dateStyle: 'medium' })}</span></span>
            )}
          </div>
          {listing.pickup_location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{listing.pickup_location}</span>
            </div>
          )}
          {listing.pickup_date && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>Pickup {new Date(listing.pickup_date).toLocaleDateString('en-CA', { dateStyle: 'medium' })}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/listings/${listing.id}`}
          className={`block text-center text-sm font-medium px-4 py-2.5 rounded-xl transition-all ${
            isOpen
              ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
          }`}
          tabIndex={isOpen ? 0 : -1}
        >
          {isOpen ? 'View & Order →' : 'Unavailable'}
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-100 rounded-full w-24" />
          <div className="h-4 bg-gray-100 rounded-full w-16" />
        </div>
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="space-y-1.5 pt-2">
          {[1, 2, 3].map(i => <div key={i} className="h-3 bg-gray-100 rounded w-2/3" />)}
        </div>
        <div className="h-9 bg-gray-100 rounded-xl mt-2" />
      </div>
    </div>
  );
}

const PRODUCT_TYPES = ['All', 'T-Shirt', 'Hoodie', 'Hat', 'Jacket', 'Crewneck', 'Polo', 'Other'];

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [activeType, setActiveType] = useState('All');
  const [clubFilter, setClubFilter] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const [clubs, setClubs]       = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [listingsRes, clubsRes] = await Promise.all([
        supabase
          .from('listings')
          .select('*, clubs(name)')
          .eq('status', 'approved')
          .order('created_at', { ascending: false }),
        supabase.from('clubs').select('id, name').order('name'),
      ]);

      if (listingsRes.error) setError(listingsRes.error.message);
      else setListings(listingsRes.data ?? []);
      setClubs(clubsRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const { open, closed, totalOpen, uniqueClubs } = useMemo(() => {
    const filtered = listings.filter(l => {
      const matchSearch = !search ||
        l.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.clubs?.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.product_type?.toLowerCase().includes(search.toLowerCase());
      const matchType = activeType === 'All' || l.product_type === activeType;
      const matchClub = !clubFilter || l.clubs?.name === clubFilter;
      return matchSearch && matchType && matchClub;
    });

    const open   = filtered.filter(l => new Date() <= new Date(l.order_deadline) && l.quantity_available > 0);
    const closed = filtered.filter(l => new Date() > new Date(l.order_deadline) || l.quantity_available <= 0);
    const uniqueClubs = [...new Set(listings.map(l => l.clubs?.name).filter(Boolean))].length;

    return { open, closed, totalOpen: listings.filter(l => new Date() <= new Date(l.order_deadline) && l.quantity_available > 0).length, uniqueClubs };
  }, [listings, search, activeType, clubFilter]);

  const hasFilters = search || activeType !== 'All' || clubFilter;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero banner ── */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/20 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/70 text-sm font-medium uppercase tracking-wider">Club Marketplace</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Merch from your campus clubs
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Browse and order custom apparel from student clubs and organizations — all fulfilled by Apparel Studio.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: 'Open Listings', value: loading ? '–' : totalOpen },
              { label: 'Active Clubs', value: loading ? '–' : uniqueClubs },
              { label: 'Secure Checkout', value: 'Stripe' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col">
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-gray-400 text-xs uppercase tracking-wider mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[65px] z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Club filter */}
            {clubs.length > 0 && (
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={clubFilter}
                  onChange={e => setClubFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 appearance-none min-w-[160px]"
                >
                  <option value="">All Clubs</option>
                  {clubs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            )}

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setActiveType('All'); setClubFilter(''); }}
                className="text-sm text-gray-500 hover:text-gray-800 underline whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Product type chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {PRODUCT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeType === type
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && open.length === 0 && closed.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Package className="w-9 h-9 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              {hasFilters ? 'No matching listings' : 'No listings yet'}
            </h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              {hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Check back soon — clubs post new merch drops regularly.'}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setActiveType('All'); setClubFilter(''); }}
                className="mt-5 px-5 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Open listings */}
        {!loading && open.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <h2 className="text-base font-semibold text-gray-800">Open Now</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">{open.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {open.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        {/* Closed listings toggle */}
        {!loading && closed.length > 0 && (
          <section>
            <button
              onClick={() => setShowClosed(s => !s)}
              className="flex items-center gap-3 mb-5 group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <h2 className="text-base font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">
                Closed / Sold Out
              </h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-medium">{closed.length}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showClosed ? 'rotate-180' : ''}`} />
            </button>
            {showClosed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {closed.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
