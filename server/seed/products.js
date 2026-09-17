// Seeds the product catalogue. Existing products (matched by slug) are left untouched,
// so prices edited in the admin panel are never overwritten.
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';

const PLACEHOLDER_SINGLE = 99900; // ₹999 — change from the admin panel
const G1 = ['Advanced Accounting', 'Corporate & Other Laws', 'Direct Taxation', 'Indirect Taxation'];
const G2 = ['Cost & Management Accounting', 'Auditing & Ethics', 'Financial Management', 'Strategic Management'];

const singles = [
  ['advanced-accounting', 'Advanced Accounting', 1, '#2563a8'],
  ['corporate-laws', 'Corporate & Other Laws', 1, '#5b4fa8'],
  ['direct-tax', 'Direct Taxation', 1, '#1f6b50'],
  ['indirect-tax', 'Indirect Taxation', 1, '#2a9a7c'],
  ['cost-management-accounting', 'Cost & Management Accounting', 2, '#8e3f9e'],
  ['auditing-ethics', 'Auditing & Ethics', 2, '#b0302f'],
  ['financial-management', 'Financial Management', 2, '#8f2f55'],
  ['strategic-management', 'Strategic Management', 2, '#c05a86'],
].map(([slug, title, group, accent], i) => ({
  slug,
  title,
  type: 'single',
  group,
  module: '01',
  subjects: [title],
  price: PLACEHOLDER_SINGLE,
  mrp: 0,
  image: `/products/${slug}.webp`,
  accent,
  sortOrder: i + 1,
}));

const bundles = [
  { slug: 'group-1-set', title: 'Group 1 — Complete Set (4 books)', group: 1, subjects: G1, price: 349900, image: '/products/advanced-accounting.webp', accent: '#2563a8', sortOrder: 20 },
  { slug: 'group-2-set', title: 'Group 2 — Complete Set (4 books)', group: 2, subjects: G2, price: 349900, image: '/products/cost-management-accounting.webp', accent: '#8e3f9e', sortOrder: 21 },
  { slug: 'all-8-set', title: 'Both Groups — All 8 Books', group: null, subjects: [...G1, ...G2], price: 649900, image: '/products/all-8.webp', accent: '#d9a441', sortOrder: 22 },
].map((b) => ({ ...b, type: 'bundle', module: '01', mrp: 0 }));

await connectDB();
let created = 0;
for (const p of [...singles, ...bundles]) {
  const r = await Product.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true });
  created += r.upsertedCount;
}
console.log(`Seed complete: ${created} product(s) created, ${singles.length + bundles.length - created} already existed.`);
await mongoose.disconnect();
