const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Coupon name required'],
      uppercase: true,
    },

    slug: {
      type: String,
      lowercase: true,
    },
    discount: {
      type: Number,
      required: [true, 'Coupon discount required'],
    },
    expire: {
      type: Date,
      required: [true, 'Coupon expire date required'],
    },
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Coupon must belong to a restaurant'],
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
