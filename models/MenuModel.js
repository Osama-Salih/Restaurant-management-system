const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please provide the category name for the menu'],
    },
    items: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Item',
        required: [true, 'A category must have an item'],
      },
    ],
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant',
      required: [true, 'menu must belong to a restaurant'],
    },
  },
  { timestamps: true, strictQuery: true },
);

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
