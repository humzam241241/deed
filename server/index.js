import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import checkoutRouter       from './routes/checkout.js';
import webhookRouter        from './routes/webhook.js';
import refundRouter         from './routes/refund.js';
import analyticsRouter      from './routes/analytics.js';
import connectRouter        from './routes/connect.js';
import deleteUserRouter     from './routes/deleteUser.js';
import discountCodesRouter  from './routes/discountCodes.js';
import sendEmailRouter      from './routes/sendEmail.js';
import { startAutoCloseJob } from './jobs/autoClose.js';

const app = express();
const PORT = process.env.PORT || 4242;

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = new Set([
  'https://deed-jet.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  // Also admit whatever CLIENT_URL is set to on the server (handles future domain changes)
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
]);

// Matches ANY Vercel deployment for this project (preview + branch deploys)
const vercelPattern = /^https:\/\/deed[a-z0-9-]*\.vercel\.app$/;

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server / Postman (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    if (vercelPattern.test(origin)) return cb(null, true);
    // Return false (403) instead of throwing — prevents Express 500/503
    console.warn(`[CORS] Rejected origin: ${origin}`);
    cb(null, false);
  },
  credentials: true,
}));

// ── Webhook route MUST use raw body before express.json() ────────────────────
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRouter);

// ── JSON body parser for all other routes ────────────────────────────────────
app.use(express.json());

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/checkout',              checkoutRouter);
app.use('/admin/refund',          refundRouter);
app.use('/admin/analytics',       analyticsRouter);
app.use('/admin/connect',         connectRouter);
app.use('/admin/delete-user',     deleteUserRouter);
app.use('/admin/discount-codes',  discountCodesRouter);
app.use('/discount',              discountCodesRouter);
app.use('/vendor/send-email',     sendEmailRouter);

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  startAutoCloseJob();
});
