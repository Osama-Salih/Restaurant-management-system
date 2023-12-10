const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A restaurant name required'],
      trim: true,
      unique: true,
      maxLength: [
        40,
        'A restaurant name must have less or equal 40 characters',
      ],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: {
      type: String,
      required: [true, 'A restaurant description required'],
    },
    cuisineType: {
      type: String,
      required: [true, 'A restaurant cuisine type required'],
    },
    ratingsAverage: {
      type: Number,
      max: [5, 'Rating must be below or equal to 5.0'],
      min: [1, 'Rating must be above or equal to 1.0'],
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    phone: String,
    imageCover: {
      type: String,
      required: [true, 'A restaurant must have a cover image'],
    },
    openingHours: [
      {
        dayOfWeek: {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

restaurantSchema.index({ location: '2dsphere' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
