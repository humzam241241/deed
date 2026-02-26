import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Package, Clock, CheckCircle2, AlertTriangle, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import supabase from '../lib/supabase.js';
import { createCheckoutSession } from '../lib/api.js';
import DiscountCodeInput from '../components/DiscountCodeInput.jsx';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('status'); // 'success' | 'cancelled'

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [buyerName, setBuyerName]   = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [studentId, setStudentId]   = useState('');
  const [size, setSize]             = useState('');
  const [quantity, setQuantity]     = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [discount, setDiscount]     = useState(null); // { code, discount_amount }
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('listings')
        .select('*, clubs(name)')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (err || !data) {
        setError('This listing is not available.');
      } else {
        setListing(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const isExpired = listing && new Date() > new Date(listing.order_deadline);
  const isSoldOut = listing && listing.quantity_available <= 0;
  const canOrder  = listing && !isExpired && !isSoldOut;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!buyerName || !buyerEmail) return setFormError('Name and email are required.');
    if (quantity < 1 || quantity > listing.quantity_available) {
      return setFormError(`Quantity must be between 1 and ${listing.quantity_available}.`);
    }

    setSubmitting(true);
    try {
      const { url } = await createCheckoutSession({
        listing_id: listing.id,
        quantity,
        size: size || undefined,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        student_id: studentId || undefined,
        discount_code: discount?.code || undefined,
      });
      window.location.href = url;
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading listing…
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <h1 className="text-xl font-bold text-gray-800">Listing Unavailable</h1>
        <p className="text-gray-500">{error || 'This listing does not exist or is no longer open.'}</p>
        <Link to="/" className="text-primary underline text-sm">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Payment status banner */}
        {paymentStatus === 'success' && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Order confirmed!</p>
              <p className="text-sm">You'll receive a confirmation email shortly. Check your pickup details below.</p>
            </div>
          </div>
        )}
        {paymentStatus === 'cancelled' && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-5 py-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>Payment was cancelled. You can try again below.</p>
          </div>
        )}

        {/* Photo gallery */}
        {listing.image_urls?.length > 0 && (
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
            <img
              src={listing.image_urls[photoIndex]}
              alt={`${listing.title} photo ${photoIndex + 1}`}
              className="w-full h-full object-contain"
            />
            {listing.image_urls.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex(i => (i - 1 + listing.image_urls.length) % listing.image_urls.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPhotoIndex(i => (i + 1) % listing.image_urls.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {listing.image_urls.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Listing info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-900 px-8 py-6">
            <p className="text-gray-400 text-sm mb-1">{listing.clubs?.name}</p>
            <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-3xl font-bold text-white">${listing.price.toFixed(2)}</span>
              <span className="text-gray-400 text-sm">per unit</span>
              {isSoldOut && <span className="bg-red-500/20 text-red-300 text-xs px-2.5 py-1 rounded-full">Sold Out</span>}
              {isExpired && !isSoldOut && <span className="bg-gray-500/20 text-gray-300 text-xs px-2.5 py-1 rounded-full">Deadline Passed</span>}
              {canOrder && <span className="bg-green-500/20 text-green-300 text-xs px-2.5 py-1 rounded-full">Open</span>}
            </div>
          </div>

          <div className="px-8 py-6 space-y-4">
            {listing.description && (
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <InfoRow icon={Package}  label="Product Type"        value={listing.product_type} />
              <InfoRow icon={Clock}    label="Quantity Available"  value={`${listing.quantity_available} remaining`} />
              <InfoRow icon={Calendar} label="Order Deadline"      value={new Date(listing.order_deadline).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })} />
              <InfoRow icon={Calendar} label="Pickup Date"         value={listing.pickup_date ? new Date(listing.pickup_date).toLocaleDateString('en-CA', { dateStyle: 'medium' }) : null} />
              <InfoRow icon={MapPin}   label="Pickup Location"     value={listing.pickup_location} />
              <InfoRow icon={Package}  label="Pickup Instructions" value={listing.pickup_instructions} />
            </div>
          </div>
        </div>

        {/* Order form */}
        {canOrder && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Place Your Order
            </h2>

            {formError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="100XXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size <span className="text-gray-400 font-normal">(if applicable)</span></label>
                  <select
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="">— No size needed —</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min={1}
                  max={listing.quantity_available}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Discount code */}
              <DiscountCodeInput
                listingId={listing.id}
                quantity={quantity}
                applied={discount}
                onApply={setDiscount}
                onRemove={() => setDiscount(null)}
              />

              {/* Order summary */}
              {(() => {
                const subtotal = quantity * listing.price;
                const discountAmt = discount?.discount_amount ?? 0;
                const total = Math.max(0, subtotal - discountAmt);
                return (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                    <div className="flex justify-between text-gray-600">
                      <span>{quantity} × ${listing.price.toFixed(2)}</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmt > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount.code})</span>
                        <span>−${discountAmt.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>${total.toFixed(2)} CAD</span>
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const subtotal = quantity * listing.price;
                const discountAmt = discount?.discount_amount ?? 0;
                const total = Math.max(0, subtotal - discountAmt);
                return (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {submitting ? 'Redirecting to payment…' : `Pay $${total.toFixed(2)} CAD`}
                  </button>
                );
              })()}

              <p className="text-xs text-gray-400 text-center">
                You will be redirected to Stripe's secure checkout. Payment is processed by {listing.clubs?.name}.
              </p>
            </form>
          </div>
        )}

        {(isSoldOut || isExpired) && (
          <div className="bg-white rounded-2xl border border-gray-100 px-8 py-8 text-center">
            <p className="text-gray-500">
              {isSoldOut ? 'This listing has sold out.' : 'The order deadline for this listing has passed.'}
            </p>
            <Link to="/" className="inline-block mt-4 text-sm text-primary underline">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
