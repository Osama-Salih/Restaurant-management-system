const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const Review = require('../models/reviewModel');

exports.setRestaurantIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.restaurant) req.body.restaurant = req.params.restaurantId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc   Get all reviews
// @route  GET /api/v1/reviews
// @access Public
exports.getAllReviews = asyncHandler(async (req, res) => {
  let filterObj = {};
  if (req.params.restaurantId)
    filterObj = { restaurant: req.params.restaurantId };

  // Build query
  const countDocuments = await Review.countDocuments();
  const apiFeatures = new ApiFeatures(Review.find(filterObj), req.query)
    .filter()
    .sort()
    .felidsLimit()
    .search('Review')
    .paginate(countDocuments);

  const { mongooseQuery, paginationResults } = apiFeatures;
  // Execute query
  const reviews = await mongooseQuery;
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      paginationResults,
      reviews,
    },
  });
});

// @desc   Get specific review by id
// @route  GET /api/v1/reviews/:id
// @access Public
exports.getRreview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError('Review not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// @desc   Create review
// @route  POST /api/v1/reviews
// @access Private-User
exports.createReview = asyncHandler(async (req, res) => {
  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// @desc   Update specific review by id
// @route  PUT /api/v1/reviews/:id
// @access Private-user
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!review) {
    return next(new ApiError('Review not found', 404));
  }

  await review.save();
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// @desc   Delete specific review by id
// @route  DELETE /api/v1/reviews/:id
// @access Private-admin-user
exports.deleteRreview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new ApiError('Review not found', 404));
  }

  await review.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
