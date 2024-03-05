const factory = require('./handlerFactroy');
const Category = require('../models/categoryModel');

// @desc   Get all categories
// @route  GET /api/v1/categories
// @access Private/admin/owner
exports.getAllCategories = factory.getAll(Category);

// @desc   Get specific category by id
// @route  GET /api/v1/categories/:id
// @access Public
exports.getCategory = factory.getOne(Category);

// @desc   Create category
// @route  POST /api/v1/categories
// @access Private/admin/owner
exports.createCategory = factory.createOne(Category);

// @desc   Update specific category by id
// @route  PATCH /api/v1/categories/:id
// @access Private/admin/owner
exports.updateCategory = factory.updateOne(Category);

// @desc   Delete specific category by id
// @route  DELETE /api/v1/categories/:id
// @access Private-admin-owner
exports.deleteCategory = factory.deleteOne(Category);
