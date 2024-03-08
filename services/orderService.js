const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const sittings = require('../config/sittings');
const factory = require('./handlerFactroy');
const Cart = require('../models/cartModel');
const Restaurant = require('../models/restaurantModel');
const Item = require('../models/itemsModel');
const Order = require('../models/orderModel');

const updateItemSales = async (cartItems, req) => {
  const bulkOptions = cartItems.map((id) => ({
    updateOne: {
      filter: {
        _id: id.item,
      },
      update: {
        $inc: {
          quantity: -id.quantity,
          sold: +id.quantity,
        },
      },
    },
  }));

  await Item.bulkWrite(bulkOptions, {});
  // Clear cart based on cartId
  await Cart.findByIdAndDelete(req.params.cartId);
};

// @desc   Create cash order
// @route  POST /api/v1/orders/:cartId
// @access Private/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const { restaurantId } = req.body;
  // 1) Get cart based on ID
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError('Cart not found', 404));
  }

  const restaurant = await Restaurant.findById(restaurantId);
  // 2) Calc order price depend on cart price and check if coupon applyed
  const totalPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  // 3) calc total order price with taxe price and deliveryPrice
  let totalOrderPrice = (
    totalPrice +
    (totalPrice * sittings.taxePrice) / 100
  ).toFixed(2);

  totalOrderPrice = +totalOrderPrice + +restaurant.deliveryPrice;
  // 4) Create order with default payment method cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    deliveryAddress: req.body.deliveryAddress,
    totalOrderPrice,
    restaurant: restaurantId,
  });
  // 5) If order created Update items from cartItems array incerment item sold and decrement item quantity
  if (order) {
    updateItemSales(cart.cartItems, req);
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// @desc   Get all orders
// @route  GET /api/v1/orders
// @access Private-user-admin-owner
exports.getAllOrders = factory.getAll(Order);

// @desc   Get specific order by id
// @route  GET /api/v1/orders/:id
// @access Private-user-admin-owner
exports.getOrder = factory.getOne(Order);

// @desc   Update Order status to pay
// @route  PATCH /api/v1/orders/:id/pay
// @access Private-owner
exports.updateOrderStatusToPay = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      isPaid: true,
      PaidAt: Date.now(),
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});
// @desc   Update Order status to deliverd
// @route  PATCH /api/v1/orders/:id/deliver
// @access Private-owner
exports.updateOrderStatusToDeliverd = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      isDelivered: true,
      deliveredAt: Date.now(),
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});
