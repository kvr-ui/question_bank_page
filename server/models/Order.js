import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        // The LMS's own product id. The catalogue lives there, so quoting the id
        // back means a sale can never be matched to the wrong product if a slug
        // is ever renamed. `slug` is kept for display and for older orders.
        productId: String,
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

    // Push of this sale into the FOCAS LMS (Purchases / All Orders / sales
    // reports, and the buyer's LMS access). A paid order that never reaches the
    // LMS is money taken with nothing to show for it in the admin app, so the
    // state is recorded here and retried rather than fired and forgotten.
    //   pending — paid, not yet accepted by the LMS
    //   synced  — the LMS has a Purchase for it
    //   failed  — gave up after maxed attempts; needs a look
    lmsSync: {
      status:     { type: String, enum: ['pending', 'synced', 'failed'], default: 'pending', index: true },
      at:         { type: Date, default: null },
      attempts:   { type: Number, default: 0 },
      error:      { type: String, default: '' },
      purchaseId: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
