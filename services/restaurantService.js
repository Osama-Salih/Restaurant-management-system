const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../config/cloudinary');

const { uploadSingleFile } = require('../config/multer');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const Menu = require('../models/MenuModel');
const factory = require('./handlerFactroy');
const Restaurant = require('../models/restaurantModel');

// @desc Upload single file
exports.uploadRestaurantImage =
  uploadSingleFile('restaurants').single('imageCover');

// @desc  image processing and upload to cloudinary
exports.uploadFileToCloudinary = asyncHandler(async (req, res, next) => {
  // Check if a file is provided
  if (req.file) {
    const fileName = `restaurant-${uuidv4()}-${Date.now()}`;
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: fileName,
      width: 600,
      height: 600,
      crop: 'fill',
      format: 'jpeg',
      quality: 95,
    });

    // save image to db
    req.body.imageCover = result.secure_url || result.public_id;
  }
  next();
});

// @desc   Get all restaurant
// @route  GET /api/v1/restaurants
// @access Public
exports.getAllRestaurants = factory.getAll(Restaurant, 'Restaurant');

// @desc   Display restaurant menu
// @route  GET /api/v1/restaurants/:id
// @access Public
exports.displayRestaurantMenu = asyncHandler(async (req, res) => {
  // Build query
  const countDocuments = await Menu.countDocuments();
  const apiFeatures = new ApiFeatures(
    Menu.find({ restaurant: req.params.id }),
    req.query,
  )
    .filter()
    .sort()
    .felidsLimit()
    .search()
    .paginate(countDocuments);

  const { mongooseQuery, paginationResults } = apiFeatures;
  // Execute query
  const menus = await mongooseQuery;
  res.status(200).json({
    status: 'success',
    results: menus.length,
    data: {
      paginationResults,
      menus,
    },
  });
});

// @desc   Create restaurant
// @route  POST /api/v1/restaurants
// @access Private-admin
exports.createRestaurant = factory.createOne(Restaurant);

// @desc   Update specific restaurant by id
// @route  PUT /api/v1/restaurants/:id
// @access Private-admin
exports.updateRestaurant = factory.updateOne(Restaurant);

// @desc   Delete specific restaurant by id
// @route  DELETE /api/v1/restaurants/:id
// @access Private-admin
exports.deleteRestaurant = factory.deleteOne(Restaurant);

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
