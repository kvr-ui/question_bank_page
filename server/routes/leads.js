import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import Lead from '../models/Lead.js';
import { validate } from '../middleware/validate.js';
import { phone, email } from '../utils/validators.js';

const router = Router();

const leadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

const leadInput = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  phone,
  email: email.optional().or(z.literal('')),
  subjects: z.array(z.string().max(60)).max(20).default([]),
  source: z.string().max(40).optional(),
});

router.post('/', leadLimiter, validate(leadInput), async (req, res) => {
  const { name, phone: ph, email: em, subjects, source } = req.body;
  // Re-submissions from the same number within a day update the existing lead instead of duplicating it.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await Lead.findOne({ phone: ph, createdAt: { $gte: since } });
  if (existing) {
    existing.name = name;
    if (em) existing.email = em;
    existing.subjects = [...new Set([...existing.subjects, ...subjects])];
    await existing.save();
  } else {
    await Lead.create({ name, phone: ph, email: em || undefined, subjects, source: source || 'website' });
  }
  res.status(201).json({ ok: true });
});

export default router;
