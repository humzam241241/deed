import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Package, Clock, Tag, AlertTriangle } from 'lucide-react';
import supabase from '../lib/supabase.js';

const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`;

function ListingCard({ listing }) {
  const isExpired  = new Date() > new Date(listing.order_deadline);
  const isSoldOut  = listing.quantity_available <= 0;
  const isOpen     = !isExpired && !isSoldOut;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Color band by status */}
      <div className={`h-1.5 w-full ${isOpen ? 'bg-green-400' : 'bg-gray-200'}`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">{listing.clubs?.name}</p>
            <h3 className="font-semibold text-gray-900 leading-snug">{listing.title}</h3>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xl font-bold text-gray-900">{fmt(listing.price)}</p>
            <p className="text-xs text-gray-400">per unit</p>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{listing.description}</p>
        )}

        {/* Info rows */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{listing.product_type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>
              {isSoldOut ? (
                <span className="text-red-500 font-medium">Sold out</span>
              ) : (
                <><span className="font-medium text-gray-800">{listing.quantity_available}</span> remaining</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>
              {isExpired ? (
                <span className="text-gray-400">Deadline passed</span>
              ) : (
                <>Order by <span className="font-medium">{new Date(listing.order_deadline).toLocaleDateString('en-CA', { dateStyle: 'medium' })}</span></>
              )}
            </span>
          </div>
          {listing.pickup_location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{listing.pickup_location}</span>
            </div>
          )}
          {listing.pickup_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>Pickup {new Date(listing.pickup_date).toLocaleDateString('en-CA', { dateStyle: 'medium' })}</span>
            </div>
          )}
        </div>

        {/* Status badge + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isOpen      ? 'bg-green-100 text-green-700' :
            isSoldOut   ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-500'
          }`}>
            {isOpen ? 'Open' : isSoldOut ? 'Sold Out' : 'Closed'}
          </span>

          {/* Purchase button disabled until Stripe is active */}
          <Link
            to={`/listings/${listing.id}`}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              isOpen
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            }`}
            tabIndex={isOpen ? 0 : -1}
          >
            {isOpen ? 'View & Order' : 'Unavailable'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('listings')
        .select('*, clubs(name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (err) setError(err.message);
      else setListings(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = listings.filter(l =>
    !search ||
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.clubs?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.product_type?.toLowerCase().includes(search.toLowerCase())
  );

  const open   = filtered.filter(l => new Date() <= new Date(l.order_deadline) && l.quantity_available > 0);
  const closed = filtered.filter(l => new Date() > new Date(l.order_deadline) || l.quantity_available <= 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-gray-900">Club Listings</h1>
          <p className="text-gray-500 mt-2">Browse available merch orders from campus clubs and organizations.</p>

          {/* Search */}
          <div className="mt-5 max-w-sm">
            <input
              type="text"
              placeholder="Search by name, club, or product…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700">No listings found</h2>
            <p className="text-gray-400 mt-1 text-sm">
              {search ? 'Try a different search term.' : 'No approved listings yet. Check back soon.'}
            </p>
          </div>
        )}

        {/* Open listings */}
        {!loading && open.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Open Now ({open.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {open.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        {/* Closed / sold-out listings */}
        {!loading && closed.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
              Closed / Sold Out ({closed.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {closed.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
