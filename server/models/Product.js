import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['single', 'bundle'], default: 'single' },
    group: { type: Number, enum: [1, 2, null], default: null },
    module: { type: String, default: '01' },
    subjects: [{ type: String }],
    price: { type: Number, required: true, min: 100 }, // paise
    mrp: { type: Number, default: 0 }, // paise
    image: { type: String, default: '' },
    accent: { type: String, default: '#2563a8' },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    stock: { type: Number, default: null, min: 0 }, // null = not tracked (always available)
  },
  { timestamps: true }
);

export const LOW_STOCK_THRESHOLD = 10;

export default mongoose.model('Product', productSchema);
