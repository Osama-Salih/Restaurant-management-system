const express = require('express');
// const authService = require('../services/authService');

// const {
//   getReviewValidator,
//   createReviewValidator,
//   updateReviewValidator,
//   deleteReviewValidator,
// } = require('../utils/validators/reviewValidator');

const {
  getAllMenus,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu,
} = require('../services/menuService');

const router = express.Router();

router.route('/').get(getAllMenus).post(
  // authService.protect,
  // authService.allowedTo('user'),
  createMenu,
);

router
  .route('/:id')
  .get(getMenu)
  .patch(
    // authService.protect,
    // authService.allowedTo('user'),
    updateMenu,
  )
  .delete(
    // authService.protect,
    // authService.allowedTo('user', 'admin'),
    deleteMenu,
  );

module.exports = router;
