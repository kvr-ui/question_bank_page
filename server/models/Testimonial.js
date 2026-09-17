import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    caption: { type: String, default: '' },
    bunnyEmbedUrl: { type: String, required: true },
    orientation: { type: String, enum: ['vertical', 'landscape'], default: 'vertical' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Testimonial', testimonialSchema);
