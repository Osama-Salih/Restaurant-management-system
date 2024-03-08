const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to user'],
  },

  cartItems: [
    {
      item: {
        type: mongoose.Schema.ObjectId,
        ref: 'Item',
      },
      quantity: Number,
      price: Number,
    },
  ],

  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Order must belong to restaurant'],
  },

  deliveryAddress: {
    details: String,
    phone: String,
    city: String,
    postalCode: String,
  },

  paymentMethodPrice: {
    type: String,
    enum: ['cart', 'cash'],
    default: 'cash',
  },

  totalOrderPrice: {
    type: Number,
    required: [true, 'Total order price required'],
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  PaidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: Date,
});

OrderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email phone profileImage',
  }).populate({
    path: 'cartItems.item',
    select: 'name imageCover',
  });
  next();
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
