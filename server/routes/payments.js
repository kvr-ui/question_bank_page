import { Router } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { findBySlug, LIVE } from '../services/catalog.js';
import Order from '../models/Order.js';
import PaymentLink from '../models/PaymentLink.js';
import Lead from '../models/Lead.js';
import { validate } from '../middleware/validate.js';
import { phone, email } from '../utils/validators.js';
import { razorpay, verifyPaymentSignature, verifyWebhookSignature } from '../utils/razorpay.js';
import { resolvePaymentLink, resolveCart, isOutOfStock, MAX_CART_ITEMS } from './public.js';
import { syncOrderToLms } from '../services/lmsSync.js';

const router = Router();
const payLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

const orderInput = z
  .object({
    slug: z.string().optional(),
    slugs: z.array(z.string().max(80)).min(1).max(MAX_CART_ITEMS).optional(),
    token: z.string().optional(),
    customer: z.object({
      name: z.string().trim().min(2, 'Enter your full name').max(80),
      phone,
      email,
      caLevel: z.enum(['Foundation', 'Intermediate', 'Final'], { error: 'Select your CA level' }),
    }),
    shipping: z.object({
      address: z.string().trim().min(8, 'Enter your full address').max(300),
      city: z.string().trim().min(2, 'Enter your city').max(60),
      state: z.string().trim().min(2, 'Select your state').max(60),
      pincode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode'),
    }),
  })
  .refine((v) => v.slug || v.slugs || v.token, 'slug, slugs or token is required');

async function markPaid(order, paymentId) {
  // Atomic transition so /verify and the webhook racing each other only count the sale once.
  const paid = await Order.findOneAndUpdate(
    { _id: order._id, status: { $ne: 'paid' } },
    { status: 'paid', razorpayPaymentId: paymentId, paidAt: new Date() },
    { new: true }
  );
  if (!paid) return order;
  order = paid;
  // Stock is NOT decremented here any more. The catalogue lives in the LMS, and
  // recordPurchase() there reduces it, writes an InventoryLog row and fires the
  // low-stock alert — all of which this side used to miss. Decrementing in both
  // places would double-count every sale.
  if (order.paymentLink) await PaymentLink.updateOne({ _id: order.paymentLink }, { used: true });
  await Lead.updateMany({ phone: order.customer.phone, status: { $ne: 'converted' } }, { status: 'converted' });

  // Push the sale into the FOCAS LMS (All Orders, sales reports, buyer access).
  // Deliberately not awaited: the customer's payment is already captured, so a
  // slow or down LMS must not delay or fail this response. Anything that misses
  // stays lmsSync.status 'pending' and the sweeper retries it.
  syncOrderToLms(order).catch((err) => console.error('[lms-sync] unexpected:', err.message));

  return order;
}

router.post('/order', payLimiter, validate(orderInput), async (req, res) => {
  const { slug, slugs, token, customer, shipping } = req.body;
  let items;
  let amount;
  let paymentLink = null;

  // Amount is always computed on the server; the client never sends a price.
  // LIVE forces a catalogue re-fetch: this figure becomes a charge, so it must
  // not come from a cached copy that an admin has already edited away from.
  if (token) {
    const r = await resolvePaymentLink(token, LIVE);
    if (r.error) return res.status(r.status).json({ error: r.error });
    items = r.products.map((p) => ({ productId: p.productId, slug: p.slug, title: p.title, price: p.price }));
    amount = r.amount;
    paymentLink = r.link._id;
  } else if (slugs) {
    const r = await resolveCart(slugs, LIVE);
    if (r.error) return res.status(r.status).json({ error: r.error });
    items = r.products.map((p) => ({ productId: p.productId, slug: p.slug, title: p.title, price: p.price }));
    amount = r.amount;
  } else {
    const product = await findBySlug(slug, LIVE);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (isOutOfStock(product)) return res.status(409).json({ error: `Sorry, ${product.title} is out of stock.` });
    items = [{ productId: product.productId, slug: product.slug, title: product.title, price: product.price }];
    amount = product.price;
  }

  const order = await Order.create({ items, amount, customer, shipping, paymentLink });
  try {
    const rzpOrder = await razorpay().orders.create({
      amount,
      currency: 'INR',
      receipt: String(order._id),
      notes: { orderId: String(order._id), phone: customer.phone },
    });
    order.razorpayOrderId = rzpOrder.id;
    await order.save();
    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: rzpOrder.id,
      amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay order create failed:', err?.error || err);
    order.status = 'failed';
    await order.save();
    res.status(502).json({ error: 'Could not start payment. Please try again in a moment.' });
  }
});

const verifyInput = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

router.post('/verify', payLimiter, validate(verifyInput), async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const valid = verifyPaymentSignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
  if (!valid) return res.status(400).json({ error: 'Payment verification failed' });
  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  await markPaid(order, razorpay_payment_id);
  res.json({ ok: true, orderId: order._id });
});

router.post('/failed', payLimiter, validate(z.object({ razorpay_order_id: z.string() })), async (req, res) => {
  await Order.updateOne({ razorpayOrderId: req.body.razorpay_order_id, status: 'created' }, { status: 'failed' });
  res.json({ ok: true });
});

// Mounted before express.json() so the raw body is available for signature checks.
export const webhookRouter = Router();
webhookRouter.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return res.status(503).end();
  if (!verifyWebhookSignature(req.body, req.get('x-razorpay-signature'))) return res.status(400).end();
  const event = JSON.parse(req.body.toString('utf8'));
  const payment = event?.payload?.payment?.entity;
  if (payment?.order_id) {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order) {
      if (event.event === 'payment.captured' || event.event === 'order.paid') await markPaid(order, payment.id);
      else if (event.event === 'payment.failed' && order.status === 'created') {
        order.status = 'failed';
        await order.save();
      }
    }
  }
  res.json({ ok: true });
});

export default router;
