const express = require('express');
const authService = require('../services/authService');
const itemRoute = require('./itemsRoute');
const { filterForOwner } = require('../middlewares/filterMiddleware');

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require('../utils/validators/categoryValidator');

const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../services/categoryService');

const router = express.Router();

// /api/categories/categoryId/items
// @desc Nested route / Get all items for specific category
router.use('/:categoryId/items', itemRoute);

router
  .route('/')
  .get(
    authService.protect,
    authService.allowedTo('admin', 'owner'),
    filterForOwner,
    getAllCategories,
  )
  .post(
    authService.protect,
    authService.allowedTo('admin', 'owner'),
    createCategoryValidator,
    createCategory,
  );

router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .patch(
    authService.protect,
    authService.allowedTo('admin', 'owner'),
    updateCategoryValidator,
    updateCategory,
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin', 'owner'),
    deleteCategoryValidator,
    deleteCategory,
  );

module.exports = router;
