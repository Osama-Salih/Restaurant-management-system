const mongoose = require('mongoose');
const Restaurant = require('./restaurantModel');

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },

    ratings: {
      type: Number,
      required: [true, 'Review ratings required'],
      min: [1, 'Rating value must be above or equal 1.0'],
      max: [5, 'Rating value must be below or equal 5.0'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to user'],
    },
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant',
      required: [true, 'A review must belong to restaurant'],
    },
  },
  {
    timestamps: true,
    strictQuery: true,
  },
);

reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcRatingAvgAndQuantity = async function (resId) {
  const results = await this.aggregate([
    {
      $match: { restaurant: resId },
    },
    {
      $group: {
        _id: 'restaurant',
        RatNum: { $sum: 1 },
        RetAvg: { $avg: '$ratings' },
      },
    },
  ]);

  if (results.length > 0) {
    await Restaurant.findByIdAndUpdate(
      resId,
      {
        ratingsAverage: results[0].RetAvg,
        ratingsQuantity: results[0].RatNum,
      },
      { new: true },
    );
  } else {
    await Restaurant.findByIdAndUpdate(
      resId,
      {
        ratingsAverage: 0,
        ratingsQuantity: 0,
      },
      { new: true },
    );
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcRatingAvgAndQuantity(this.restaurant);
});

reviewSchema.post(
  'deleteOne',
  { document: true, query: false },
  async function () {
    await this.constructor.calcRatingAvgAndQuantity(this.restaurant);
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name profileImage' });
  next();
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
