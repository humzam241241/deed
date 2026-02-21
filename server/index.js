import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Make Stripe optional - don't crash if not configured
let Stripe;
let stripe = null;
try {
  const StripeModule = await import('stripe');
  Stripe = StripeModule.default;
} catch (error) {
  // Payment features disabled
}

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4242;

// Initialize Stripe only if module is available and key is provided
if (Stripe && process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
}

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Create a Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, quantity = 1, successUrl, cancelUrl } = req.body || {};
    const resolvedPriceId = process.env.PRICE_ID || priceId;
    if (!stripe || !(process.env.STRIPE_SECRET_KEY)) {
      return res.status(500).json({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY in server/.env' });
    }
    if (!resolvedPriceId) {
      return res.status(400).json({ error: 'Missing priceId (or set PRICE_ID in .env).' });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: resolvedPriceId, quantity }],
      success_url: successUrl || 'http://localhost:3000/store?status=success',
      cancel_url: cancelUrl || 'http://localhost:3000/store?status=cancelled',
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
