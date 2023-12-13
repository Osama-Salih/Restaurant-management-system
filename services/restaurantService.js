const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const Restaurant = require('../models/restaurantModel');

// @desc   Get all restaurant
// @route  GET /api/v1/restaurants
// @access Public
exports.getAllRestaurants = asyncHandler(async (req, res) => {
  // Build query
  const countDocuments = await Restaurant.countDocuments();
  const apiFeatures = new ApiFeatures(Restaurant.find(), req.query)
    .filter()
    .sort()
    .felidsLimit()
    .search()
    .paginate(countDocuments);

  const { mongooseQuery, paginationResults } = apiFeatures;
  // Execute query
  const restaurants = await mongooseQuery;
  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: {
      paginationResults,
      restaurants,
    },
  });
});

// @desc   Get specific restaurant by id
// @route  GET /api/v1/restaurants/:id
// @access Public
exports.getRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id).populate(
    'reviews',
  );

  if (!restaurant) {
    return next(new ApiError('Restaurant not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      restaurant,
    },
  });
});

// @desc   Create restaurant
// @route  POST /api/v1/restaurants
// @access Private-admin
exports.createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      restaurant,
    },
  });
});

// @desc   Update specific restaurant by id
// @route  PUT /api/v1/restaurants/:id
// @access Private-admin
exports.updateRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );

  if (!restaurant) {
    return next(new ApiError('Restaurant not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      restaurant,
    },
  });
});

// @desc   Delete specific restaurant by id
// @route  DELETE /api/v1/restaurants/:id
// @access Private-admin
exports.deleteRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

  if (!restaurant) {
    return next(new ApiError('Restaurant not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// @desc   Get the closest restaurants to a specific location
// @route  GET /api/v1/restaurants/restaurants-within/:distance/center/:latlng/unit/:unit
// @access Public
exports.getRestaurantWithin = asyncHandler(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Calculate the radius based on the unit (mi or km)
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  // Validate if latitude and longitude are provided
  if (!lat || !lng) {
    return next(
      new ApiError(
        'Please provide latitur and longitude in the format of lat and lng',
        400,
      ),
    );
  }

  // Perform the query to get nearby restaurants
  const restaurants = await Restaurant.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: {
      restaurants,
    },
  });
});

// @desc   Get the distances of all restaurants to a specific point
// @route  GET /api/v1/restaurants/distance/:latlng/unit/:unit
// @access Public
exports.getDistances = asyncHandler(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

  // Validate if latitude and longitude are provided
  if (!lat || !lng) {
    return next(
      new ApiError(
        'Please provide latitur and longitude in the format of lat and lng',
        400,
      ),
    );
  }

  const distances = await Restaurant.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});
