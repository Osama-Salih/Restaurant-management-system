const express = require('express');
const reviewRoute = require('./reviewRoute');

const {
  getRestaurantValidator,
  createRestaurantValidator,
  updateRestaurantValidator,
  deleteRestaurantValidator,
  getRestaurantWithinValidator,
  getDistancesValidator,
} = require('../utils/validators/restaurantValidator');

const {
  getAllRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantWithin,
  getDistances,
  uploadRestaurantImage,
  uploadFileToCloudinary,
} = require('../services/restaurantService');

const authService = require('../services/authService');

const router = express.Router();

router
  .route('/restaurants-within/:distance/center/:latlng/unit/:unit')
  .get(getRestaurantWithinValidator, getRestaurantWithin);

router
  .route('/distance/:latlng/unit/:unit')
  .get(getDistancesValidator, getDistances);

router.use(authService.protect);
router
  .route('/')
  .get(getAllRestaurants)
  .post(
    authService.allowedTo('admin'),
    uploadRestaurantImage,
    uploadFileToCloudinary,
    createRestaurantValidator,
    createRestaurant,
  );

router
  .route('/:id')
  .get(getRestaurantValidator, getRestaurant)
  .put(
    authService.allowedTo('admin', 'owner'),
    updateRestaurantValidator,
    updateRestaurant,
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin', 'owner'),
    deleteRestaurantValidator,
    deleteRestaurant,
  );

// Nested route
router.use('/:restaurantId/reviews', reviewRoute);

module.exports = router;
