const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minLenght: [3, 'Too short item name'],
      maxLenght: [30, 'Too long item name'],
      required: [true, 'Item must have a name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    price: {
      type: Number,
      max: [2000, 'The maximum item price is 2000'],
      required: [true, 'Item must have a price'],
    },
    quantity: {
      type: Number,
      default: 0,
    },
    calories: String,
    description: {
      type: String,
      trim: true,
      minLenght: [10, 'Too short item description'],
      maxLenght: [80, 'Too long item description'],
      required: [true, 'Item description required'],
    },
    imageCover: {
      type: String,
      required: [true, 'A restaurant must have a cover image'],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Each item must belong to specific category'],
    },
  },
  { timestamps: true, strictQuery: true },
);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
