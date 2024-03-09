const express = require('express');
const authService = require('../services/authService');
const { filterForOwner } = require('../middlewares/filterMiddleware');
const {
  createOrderValidator,
  getOrderValidator,
  updateOrderStatusValidator,
} = require('../utils/validators/orderValidator');
const {
  createCashOrder,
  getAllOrders,
  getOrder,
  updateOrderStatusToPay,
  updateOrderStatusToDeliverd,
  checkoutSession,
} = require('../services/orderService');

const router = express.Router();

router.post(
  '/:cartId',
  authService.protect,
  authService.allowedTo('user'),
  createOrderValidator,
  createCashOrder,
);

router.get(
  '/:cartId',
  authService.protect,
  authService.allowedTo('user'),
  checkoutSession,
);

router.use(authService.protect);
router.get('/', filterForOwner, getAllOrders);

router.get('/:id', getOrderValidator, getOrder);
router.patch(
  '/:id/pay',
  authService.allowedTo('owner'),
  updateOrderStatusValidator,
  updateOrderStatusToPay,
);
router.patch(
  '/:id/deliver',
  authService.allowedTo('owner'),
  updateOrderStatusValidator,
  updateOrderStatusToDeliverd,
);

module.exports = router;
