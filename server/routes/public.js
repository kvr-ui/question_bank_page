import { Router } from 'express';
import Testimonial from '../models/Testimonial.js';
import Product from '../models/Product.js';
import PaymentLink from '../models/PaymentLink.js';
import Order from '../models/Order.js';

const router = Router();

router.get('/config', (req, res) => {
  res.json({ razorpayKeyId: process.env.RAZORPAY_KEY_ID || '' });
});

router.get('/testimonials', async (req, res) => {
  const items = await Testimonial.find({ active: true }).sort({ order: 1, createdAt: -1 }).lean();
  res.json(items.map(({ _id, studentName, caption, bunnyEmbedUrl, orientation }) => ({ _id, studentName, caption, bunnyEmbedUrl, orientation })));
});

// Landing page catalogue: prices are deliberately NOT exposed here.
router.get('/products', async (req, res) => {
  const items = await Product.find({ active: true }).sort({ sortOrder: 1 }).lean();
  res.json(items.map(({ slug, title, type, group, module, subjects, image, accent }) => ({ slug, title, type, group, module, subjects, image, accent })));
});

const priced = (p) => ({ slug: p.slug, title: p.title, type: p.type, group: p.group, module: p.module, subjects: p.subjects, image: p.image, accent: p.accent, price: p.price, mrp: p.mrp });

router.get('/checkout/product/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true }).lean();
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ items: [priced(product)], amount: product.price, mrp: product.mrp || 0 });
});

export async function resolvePaymentLink(token) {
  const link = await PaymentLink.findOne({ token });
  if (!link) return { error: 'This payment link is invalid', status: 404 };
  if (link.used) return { error: 'This payment link has already been used', status: 410 };
  if (link.expiresAt < new Date()) return { error: 'This payment link has expired. Please contact our team for a new one.', status: 410 };
  const products = await Product.find({ slug: { $in: link.productSlugs } }).lean();
  if (!products.length) return { error: 'Products for this link are no longer available', status: 404 };
  const total = products.reduce((s, p) => s + p.price, 0);
  const mrp = products.reduce((s, p) => s + (p.mrp || p.price), 0);
  return { link, products, amount: link.customPrice ?? total, mrp };
}

router.get('/checkout/link/:token', async (req, res) => {
  const r = await resolvePaymentLink(req.params.token);
  if (r.error) return res.status(r.status).json({ error: r.error });
  res.json({ items: r.products.map(priced), amount: r.amount, mrp: r.mrp, note: r.link.note });
});

router.get('/orders/:id/summary', async (req, res) => {
  const order = await Order.findById(req.params.id).lean().catch(() => null);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({
    id: order._id,
    status: order.status,
    amount: order.amount,
    items: order.items.map((i) => ({ title: i.title })),
    firstName: order.customer.name.split(' ')[0],
  });
});

export default router;
