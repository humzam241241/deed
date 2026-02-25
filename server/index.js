import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import checkoutRouter    from './routes/checkout.js';
import webhookRouter     from './routes/webhook.js';
import refundRouter      from './routes/refund.js';
import analyticsRouter   from './routes/analytics.js';
import connectRouter     from './routes/connect.js';
import deleteUserRouter  from './routes/deleteUser.js';
import { startAutoCloseJob } from './jobs/autoClose.js';

const app = express();
const PORT = process.env.PORT || 4242;

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL ?? 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
];

// Matches any Vercel preview deployment for this project
const vercelPreviewPattern = /^https:\/\/deed-[a-z0-9]+-humzam241-2402s-projects\.vercel\.app$/;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (vercelPreviewPattern.test(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
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
app.use('/checkout',           checkoutRouter);
app.use('/admin/refund',       refundRouter);
app.use('/admin/analytics',    analyticsRouter);
app.use('/admin/connect',      connectRouter);
app.use('/admin/delete-user',  deleteUserRouter);

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  startAutoCloseJob();
});
