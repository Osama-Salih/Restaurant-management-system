const factory = require('./handlerFactroy');
const Review = require('../models/reviewModel');

exports.setRestaurantIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.restaurant) req.body.restaurant = req.params.restaurantId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.filterRestaurantsById = (req, res, next) => {
  let filterObj = {};
  if (req.params.restaurantId)
    filterObj = { restaurant: req.params.restaurantId };
  req.filterId = filterObj;
  next();
};

// @desc   Get all reviews
// @route  GET /api/v1/reviews/
// @access Public
exports.getAllReviews = factory.getAll(Review, 'Review');

// @desc   Get specific review by id
// @route  GET /api/v1/reviews/:id
// @access Public
exports.getRreview = factory.getOne(Review);

// @desc   Create review
// @route  POST /api/v1/reviews
// @access Private-User
exports.createReview = factory.createOne(Review);

// @desc   Update specific review by id
// @route  PATCH /api/v1/reviews/:id
// @access Private-user
exports.updateReview = factory.updateOne(Review);

// @desc   Delete specific review by id
// @route  DELETE /api/v1/reviews/:id
// @access Private-admin-user
exports.deleteRreview = factory.deleteOne(Review);
