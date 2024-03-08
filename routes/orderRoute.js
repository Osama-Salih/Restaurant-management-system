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
} = require('../services/orderService');

const router = express.Router();

router.post(
  '/:cartId',
  authService.protect,
  authService.allowedTo('user'),
  createOrderValidator,
  createCashOrder,
);

router.get('/', authService.protect, filterForOwner, getAllOrders);

router.get('/:id', authService.protect, getOrderValidator, getOrder);
router.patch(
  '/:id/pay',
  authService.protect,
  authService.allowedTo('owner'),
  updateOrderStatusValidator,
  updateOrderStatusToPay,
);
router.patch(
  '/:id/deliver',
  authService.protect,
  authService.allowedTo('owner'),
  updateOrderStatusValidator,
  updateOrderStatusToDeliverd,
);

module.exports = router;
