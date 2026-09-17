import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    subjects: [{ type: String }],
    source: { type: String, default: 'website' },
    status: { type: String, enum: ['new', 'contacted', 'converted', 'not-interested'], default: 'new' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
