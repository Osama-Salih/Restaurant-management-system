const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A category must have a name'],
      trim: true,
      minLength: [3, 'Too short category name'],
      maxLength: [32, 'Too long category name'],
    },

    slug: {
      type: String,
      lowercase: true,
    },

    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant',
      required: [true, 'category must belong to a restaurant'],
    },
  },
  { timestamps: true, strictQuery: true },
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
