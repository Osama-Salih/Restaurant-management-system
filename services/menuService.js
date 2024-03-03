const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const Menu = require('../models/MenuModel');

// @desc   Get all menus
// @route  GET /api/v1/menus
// @access Private/Admin
exports.getAllMenus = asyncHandler(async (req, res) => {
  // Build query
  const countDocuments = await Menu.countDocuments();
  const apiFeatures = new ApiFeatures(Menu.find({}), req.query)
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

// @desc   Get specific menu by id
// @route  GET /api/v1/menus/:id
// @access Public
exports.getMenu = asyncHandler(async (req, res, next) => {
  const menu = await Menu.findById(req.params.id);

  if (!menu) {
    return next(new ApiError('Menu not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      menu,
    },
  });
});

// @desc   Create menu
// @route  POST /api/v1/menus
// @access Private-?
exports.createMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      menu,
    },
  });
});

// @desc   Update specific menu by id
// @route  PUT /api/v1/menus/:id
// @access Private-?
exports.updateMenu = asyncHandler(async (req, res, next) => {
  const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!menu) {
    return next(new ApiError('Menu not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      menu,
    },
  });
});

// @desc   Delete specific menu by id
// @route  DELETE /api/v1/menus/:id
// @access Private-admin-owner
exports.deleteMenu = asyncHandler(async (req, res, next) => {
  const menu = await Menu.findByIdAndDelete(req.params.id);

  if (!menu) {
    return next(new ApiError('Menu not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
