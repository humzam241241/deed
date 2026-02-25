import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn('[stripe] VITE_STRIPE_PUBLISHABLE_KEY not set.');
}

// Singleton promise — safe to call multiple times
const stripePromise = loadStripe(publishableKey ?? '');

export default stripePromise;
