const express = require('express');
const authService = require('../services/authService');

const {
  getMenuValidator,
  createMenuValidator,
  updateMenuValidator,
  deleteMenuValidator,
} = require('../utils/validators/menuValidator');

const {
  getAllMenus,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu,
} = require('../services/menuService');

const router = express.Router();

router
  .route('/')
  .get(getAllMenus)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'owner'),
    createMenuValidator,
    createMenu,
  );

router
  .route('/:id')
  .get(getMenuValidator, getMenu)
  .patch(
    authService.protect,
    authService.allowedTo('admin', 'owner'),
    updateMenuValidator,
    updateMenu,
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin', 'owner'),
    deleteMenuValidator,
    deleteMenu,
  );

module.exports = router;
