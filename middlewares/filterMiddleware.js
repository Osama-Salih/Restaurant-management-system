const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const Category = require('../models/categoryModel');
const Restaurant = require('../models/restaurantModel');

//@desc Middleware to filter categories and items based on owner's restaurant
exports.filterForOwner = asyncHandler(async (req, res, next) => {
  let categoryFilter = {};
  let paramsFilter = {};

  // Check if the user has the 'owner' role
  if (req.user.role === 'owner') {
    // Find the restaurant owned by the user
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    // If the user does not have a restaurant, return a 403 Forbidden status
    if (!restaurant) {
      return next(new ApiError('Owner does not have a restaurant', 403));
    }

    // Get category IDs for the restaurant
    const categories = await Category.find({
      restaurant: restaurant._id.toString(),
    });

    // Extract ids from categories documents
    const categoriesIds = categories.map((el) => el._id.toString());

    categoryFilter = { restaurant: restaurant._id.toString() }; // For categories
    paramsFilter = { category: { $exists: true, $in: categoriesIds } }; // For items
  }
  // @desc Filter for Nested route / filter all items for specific category
  if (req.params.categoryId) paramsFilter = { category: req.params.categoryId };
  // @desc Allow only user with user role  who created the orders can get it
  if (req.user.role === 'user') categoryFilter = { user: req.user._id };

  req.categoryFilter = categoryFilter;
  req.paramsFilter = paramsFilter;
  next();
});
