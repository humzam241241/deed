import supabase from './supabase.js';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4242';

/**
 * Fetch wrapper that automatically attaches the current Supabase JWT.
 * Falls back to unauthenticated request if no session exists.
 */
async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.error ?? `API error ${res.status}`);
  }

  return json;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
export function createCheckoutSession(payload) {
  return apiFetch('/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Admin: refund ────────────────────────────────────────────────────────────
export function refundOrder(order_id, refund_type = 'full', amount_cents) {
  return apiFetch('/admin/refund', {
    method: 'POST',
    body: JSON.stringify({ order_id, refund_type, amount_cents }),
  });
}

// ─── Admin: analytics ─────────────────────────────────────────────────────────
export function fetchAnalytics() {
  return apiFetch('/admin/analytics');
}

// ─── Admin: Stripe Connect ────────────────────────────────────────────────────
export function createConnectedAccount(club_id, email) {
  return apiFetch('/admin/connect/create', {
    method: 'POST',
    body: JSON.stringify({ club_id, email }),
  });
}

export function getOnboardingLink(club_id) {
  return apiFetch(`/admin/connect/onboard-link/${club_id}`);
}
