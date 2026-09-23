import crypto from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import Lead from '../models/Lead.js';
import Testimonial from '../models/Testimonial.js';
import { findActive, LOW_STOCK_THRESHOLD } from '../services/catalog.js';
import PaymentLink from '../models/PaymentLink.js';
import Order from '../models/Order.js';
import { requireAdmin, COOKIE_NAME } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ---------- auth ----------
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

router.post('/login', loginLimiter, validate(z.object({ password: z.string() })), (req, res) => {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || '');
  const given = Buffer.from(req.body.password);
  if (!expected.length || expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

router.use(requireAdmin);
router.get('/me', (req, res) => res.json({ ok: true }));

const idOr404 = (Model) => async (req, res, next) => {
  const doc = await Model.findById(req.params.id).catch(() => null);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  req.doc = doc;
  next();
};

// ---------- stats ----------
router.get('/stats', async (req, res) => {
  // No 'awaiting dispatch' figure: dispatch is tracked in the FOCAS LMS now, so
  // shipStatus here would never move off 'pending' and the number would lie.
  const [newLeads, totalLeads, paidOrders, revenue, lowStock] = await Promise.all([
    Lead.countDocuments({ status: 'new' }),
    Lead.countDocuments(),
    Order.countDocuments({ status: 'paid' }),
    Order.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    findActive().then((items) => items
      .filter((p) => p.stock != null && p.stock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock - b.stock)
      .map(({ title, slug, stock, active }) => ({ title, slug, stock, active }))).catch(() => []),
  ]);
  res.json({ newLeads, totalLeads, paidOrders, revenue: revenue[0]?.total || 0, lowStock, lowStockThreshold: LOW_STOCK_THRESHOLD });
});

// ---------- leads ----------
const leadFilter = (q) => {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (q.search) {
    const rx = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }];
  }
  return filter;
};

router.get('/leads', async (req, res) => {
  const leads = await Lead.find(leadFilter(req.query)).sort({ createdAt: -1 }).limit(1000).lean();
  res.json(leads);
});

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // guard against spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

router.get('/leads/export.csv', async (req, res) => {
  const leads = await Lead.find(leadFilter(req.query)).sort({ createdAt: -1 }).lean();
  const header = ['Name', 'CountryCode', 'Phone', 'Email', 'Subjects', 'Status', 'Notes', 'CreatedAt'];
  const rows = leads.map((l) =>
    [l.name, '91', l.phone, l.email, (l.subjects || []).join('; '), l.status, l.notes, l.createdAt.toISOString()].map(csvCell).join(',')
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send([header.join(','), ...rows].join('\n'));
});

router.patch(
  '/leads/:id',
  validate(z.object({ status: z.enum(['new', 'contacted', 'converted', 'not-interested']).optional(), notes: z.string().max(2000).optional() })),
  idOr404(Lead),
  async (req, res) => {
    Object.assign(req.doc, req.body);
    await req.doc.save();
    res.json(req.doc);
  }
);

router.delete('/leads/:id', idOr404(Lead), async (req, res) => {
  await req.doc.deleteOne();
  res.json({ ok: true });
});

// ---------- testimonials ----------
// Accepts Bunny Stream "play" or "embed" URLs (or a pasted <iframe> snippet) and normalises to the embed URL.
export function normaliseBunnyUrl(input) {
  const src = input.match(/src=["']([^"']+)["']/)?.[1] || input.trim();
  let url;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (!/(^|\.)mediadelivery\.net$/.test(url.hostname)) return null;
  const m = url.pathname.match(/^\/(?:embed|play)\/(\d+)\/([0-9a-f-]{36})/i);
  if (!m) return null;
  return `https://iframe.mediadelivery.net/embed/${m[1]}/${m[2]}`;
}

const testimonialInput = z.object({
  studentName: z.string().trim().min(1).max(80),
  caption: z.string().max(200).default(''),
  bunnyEmbedUrl: z.string().transform((v, ctx) => {
    const url = normaliseBunnyUrl(v);
    if (!url) {
      ctx.addIssue({ code: 'custom', message: 'Paste a Bunny Stream link like https://iframe.mediadelivery.net/embed/<library>/<video-id>' });
      return z.NEVER;
    }
    return url;
  }),
  orientation: z.enum(['vertical', 'landscape']).default('vertical'),
  order: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

router.get('/testimonials', async (req, res) => {
  res.json(await Testimonial.find().sort({ order: 1, createdAt: -1 }).lean());
});
router.post('/testimonials', validate(testimonialInput), async (req, res) => {
  res.status(201).json(await Testimonial.create(req.body));
});
router.patch('/testimonials/:id', validate(testimonialInput.partial(), { partial: true }), idOr404(Testimonial), async (req, res) => {
  Object.assign(req.doc, req.body);
  await req.doc.save();
  res.json(req.doc);
});
router.delete('/testimonials/:id', idOr404(Testimonial), async (req, res) => {
  await req.doc.deleteOne();
  res.json({ ok: true });
});

// ---------- products ----------
// Products are READ-ONLY here. The catalogue — titles, prices, stock — lives in
// the FOCAS LMS so there is one place to change them; this endpoint just mirrors
// it so the payment-link picker and the low-stock panel keep working.
router.get('/products', async (req, res) => {
  try {
    res.json(await findActive());
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

const managedInLms = (req, res) =>
  res.status(410).json({
    error: 'Products are managed in admin-LMS now, not here. Open the product there and edit its Storefront panel.',
  });
router.post('/products', managedInLms);
router.patch('/products/:id', managedInLms);
router.delete('/products/:id', managedInLms);

// ---------- payment links ----------
const linkInput = z.object({
  productSlugs: z.array(z.string()).min(1, 'Pick at least one product'),
  customPrice: z.coerce.number().int().min(100).nullable().default(null),
  note: z.string().max(200).default(''),
  leadId: z.string().nullable().optional(),
  expiresInDays: z.coerce.number().int().min(1).max(60).default(7),
});

router.get('/payment-links', async (req, res) => {
  const links = await PaymentLink.find().sort({ createdAt: -1 }).limit(200).populate('lead', 'name phone').lean();
  res.json(links.map((l) => ({ ...l, url: `${process.env.PUBLIC_URL || ''}/pay/${l.token}` })));
});
router.post('/payment-links', validate(linkInput), async (req, res) => {
  const { productSlugs, customPrice, note, leadId, expiresInDays } = req.body;
  const catalogue = await findActive().catch(() => null);
  if (!catalogue) return res.status(503).json({ error: 'Cannot reach the product catalogue right now. Try again in a moment.' });
  const known = new Set(catalogue.map((p) => p.slug));
  if (!productSlugs.every((s) => known.has(s))) return res.status(400).json({ error: 'One or more products do not exist' });
  const link = await PaymentLink.create({
    token: crypto.randomBytes(12).toString('base64url'),
    productSlugs,
    customPrice,
    note,
    lead: leadId || null,
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
  });
  res.status(201).json({ ...link.toObject(), url: `${process.env.PUBLIC_URL || ''}/pay/${link.token}` });
});
router.delete('/payment-links/:id', idOr404(PaymentLink), async (req, res) => {
  await req.doc.deleteOne();
  res.json({ ok: true });
});

// ---------- orders ----------
router.get('/orders', async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.shipStatus) filter.shipStatus = req.query.shipStatus;
  res.json(await Order.find(filter).sort({ createdAt: -1 }).limit(1000).lean());
});
// Dispatch of the printed books moved to the FOCAS LMS — it creates the
// Delhivery shipment, holds the AWB and tracks delivery. shipStatus and
// trackingInfo are therefore no longer accepted here: two half-filled records
// of the same parcel is worse than one. appAccess (CA Guru.ai) stays, because
// that is this site's own concern.
router.patch(
  '/orders/:id',
  validate(
    z.object({
      appAccess: z.enum(['pending', 'activated']).optional(),
    })
  ),
  idOr404(Order),
  async (req, res) => {
    Object.assign(req.doc, req.body);
    await req.doc.save();
    res.json(req.doc);
  }
);

export default router;
