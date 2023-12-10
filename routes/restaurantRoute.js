const express = require('express');

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
    createRestaurantValidator,
    createRestaurant,
  );

router
  .route('/:id')
  .get(getRestaurantValidator, getRestaurant)
  .put(
    authService.protect,
    authService.allowedTo('admin'),
    updateRestaurantValidator,
    updateRestaurant,
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteRestaurantValidator,
    deleteRestaurant,
  );

module.exports = router;
