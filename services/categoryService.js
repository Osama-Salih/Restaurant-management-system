const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const Category = require('../models/categoryModel');

// @desc   Get all categories
// @route  GET /api/v1/categories
// @access Private/admin/owner
exports.getAllCategories = asyncHandler(async (req, res) => {
  // Build query
  const countDocuments = await Category.countDocuments();
  const apiFeatures = new ApiFeatures(
    Category.find(req.categoryFilter),
    req.query,
  )
    .filter()
    .sort()
    .felidsLimit()
    .search()
    .paginate(countDocuments);

  const { mongooseQuery, paginationResults } = apiFeatures;
  // Execute query
  const categories = await mongooseQuery;
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      paginationResults,
      categories,
    },
  });
});

// @desc   Get specific category by id
// @route  GET /api/v1/categories/:id
// @access Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ApiError('category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

// @desc   Create category
// @route  POST /api/v1/categories
// @access Private/admin/owner
exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
});

// @desc   Update specific category by id
// @route  Patch /api/v1/categories/:id
// @access Private/admin/owner
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!category) {
    return next(new ApiError('category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

// @desc   Delete specific category by id
// @route  DELETE /api/v1/categories/:id
// @access Private-admin-owner
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new ApiError('Category not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
