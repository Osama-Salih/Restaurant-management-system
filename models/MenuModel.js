const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please provide the category name for the menu'],
    },
    slug: {
      type: String,
      lowercase: true,
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
      select: false,
    },
  },
  { strictQuery: true },
);

menuSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'items',
    select: '-category -quantity -createdAt -updatedAt -__v',
  });
  next();
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
