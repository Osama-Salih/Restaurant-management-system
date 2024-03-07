const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        item: {
          type: mongoose.Schema.ObjectId,
          ref: 'Item',
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: Number,
      },
    ],

    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
