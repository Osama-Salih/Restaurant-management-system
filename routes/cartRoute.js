const express = require('express');
const authService = require('../services/authService');

const {
  addItemToCartValidator,
  removeItemFromCartValidator,
  updateCartItemQuantityValidator,
  applyCouponValidator,
} = require('../utils/validators/cartValidator');

const {
  addItemToCart,
  getLoggedUserCart,
  removeItemFromCart,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require('../services/cartService');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));
router.patch('/applyCoupon', applyCouponValidator, applyCoupon);

router
  .route('/')
  .post(addItemToCartValidator, addItemToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router
  .route('/:itemId')
  .delete(removeItemFromCartValidator, removeItemFromCart)
  .patch(updateCartItemQuantityValidator, updateCartItemQuantity);

module.exports = router;
