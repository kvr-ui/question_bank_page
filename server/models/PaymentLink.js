import mongoose from 'mongoose';

const paymentLinkSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    productSlugs: [{ type: String, required: true }],
    customPrice: { type: Number, default: null }, // paise; overrides product total
    note: { type: String, default: '' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('PaymentLink', paymentLinkSchema);
