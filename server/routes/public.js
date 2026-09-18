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

const priced = (p) => ({ slug: p.slug, title: p.title, type: p.type, group: p.group, module: p.module, subjects: p.subjects, image: p.image, accent: p.accent, price: p.price, mrp: p.mrp, stock: p.stock ?? null });

export const isOutOfStock = (p) => p.stock != null && p.stock <= 0;
const outOfStockError = (products) => {
  const out = products.filter(isOutOfStock);
  return out.length ? { error: `Sorry, ${out.map((p) => p.title).join(', ')} ${out.length > 1 ? 'are' : 'is'} out of stock.`, status: 409 } : null;
};

router.get('/products', async (req, res) => {
  const items = await Product.find({ active: true }).sort({ sortOrder: 1 }).lean();
  res.json(items.map(priced));
});

export const MAX_CART_ITEMS = 20;

// Resolves a cart (list of slugs) to active products; the total is always computed here.
export async function resolveCart(slugs) {
  const unique = [...new Set(slugs)];
  if (!unique.length) return { error: 'Your cart is empty', status: 400 };
  if (unique.length > MAX_CART_ITEMS) return { error: 'Too many items in cart', status: 400 };
  const found = await Product.find({ slug: { $in: unique }, active: true }).sort({ sortOrder: 1 }).lean();
  if (found.length !== unique.length) return { error: 'Some items in your cart are no longer available. Please review your cart.', status: 404 };
  const oos = outOfStockError(found);
  if (oos) return oos;
  const amount = found.reduce((s, p) => s + p.price, 0);
  const mrp = found.reduce((s, p) => s + (p.mrp || p.price), 0);
  return { products: found, amount, mrp };
}

router.get('/checkout/cart', async (req, res) => {
  const slugs = String(req.query.slugs || '').split(',').map((s) => s.trim()).filter(Boolean);
  const r = await resolveCart(slugs);
  if (r.error) return res.status(r.status).json({ error: r.error });
  res.json({ items: r.products.map(priced), amount: r.amount, mrp: r.mrp });
});

router.get('/checkout/product/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true }).lean();
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const oos = outOfStockError([product]);
  if (oos) return res.status(oos.status).json({ error: oos.error });
  res.json({ items: [priced(product)], amount: product.price, mrp: product.mrp || 0 });
});

export async function resolvePaymentLink(token) {
  const link = await PaymentLink.findOne({ token });
  if (!link) return { error: 'This payment link is invalid', status: 404 };
  if (link.used) return { error: 'This payment link has already been used', status: 410 };
  if (link.expiresAt < new Date()) return { error: 'This payment link has expired. Please contact our team for a new one.', status: 410 };
  const products = await Product.find({ slug: { $in: link.productSlugs } }).lean();
  if (!products.length) return { error: 'Products for this link are no longer available', status: 404 };
  const oos = outOfStockError(products);
  if (oos) return oos;
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
