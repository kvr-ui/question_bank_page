import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        slug: String,
        title: String,
        price: Number, // paise
        _id: false,
      },
    ],
    amount: { type: Number, required: true }, // paise
    currency: { type: String, default: 'INR' },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      caLevel: { type: String, enum: ['Foundation', 'Intermediate', 'Final'] },
    },
    shipping: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentLink: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentLink', default: null },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    paidAt: { type: Date },
    shipStatus: { type: String, enum: ['pending', 'dispatched', 'delivered'], default: 'pending' },
    trackingInfo: { type: String, default: '' },
    appAccess: { type: String, enum: ['pending', 'activated'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
