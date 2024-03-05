const express = require('express');
const reviewRoute = require('./reviewRoute');

const {
  displayRestaurantMenuValidator,
  createRestaurantValidator,
  updateRestaurantValidator,
  deleteRestaurantValidator,
  getRestaurantWithinValidator,
  getDistancesValidator,
} = require('../utils/validators/restaurantValidator');

const {
  getAllRestaurants,
  displayRestaurantMenu,
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

router
  .route('/')
  .get(getAllRestaurants)
  .post(
    authService.protect,
    authService.allowedTo('admin'),
    uploadRestaurantImage,
    uploadFileToCloudinary,
    createRestaurantValidator,
    createRestaurant,
  );

router
  .route('/:id')
  .get(displayRestaurantMenuValidator, displayRestaurantMenu)
  .patch(
    authService.protect,
    authService.allowedTo('admin', 'owner'),
    uploadRestaurantImage,
    uploadFileToCloudinary,
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
