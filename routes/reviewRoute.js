const express = require('express');
const authService = require('../services/authService');

const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require('../utils/validators/reviewValidator');

const {
  getAllReviews,
  getRreview,
  createReview,
  updateReview,
  deleteRreview,
  setRestaurantIdAndUserIdToBody,
  filterRestaurantsById,
} = require('../services/reviewService');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(filterRestaurantsById, getAllReviews)
  .post(
    authService.protect,
    authService.allowedTo('user'),
    setRestaurantIdAndUserIdToBody,
    createReviewValidator,
    createReview,
  );

router
  .route('/:id')
  .get(getReviewValidator, getRreview)
  .patch(
    authService.protect,
    authService.allowedTo('user'),
    updateReviewValidator,
    updateReview,
  )
  .delete(
    authService.protect,
    authService.allowedTo('user', 'admin'),
    deleteReviewValidator,
    deleteRreview,
  );

module.exports = router;
