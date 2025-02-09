const stripe = require('stripe')(process.env.STRIPE_KEY);
const asyncHandler = require('express-async-handler');

const sittings = require('../config/sittings');
const factory = require('./handlerFactroy');
const { checkValueExists } = require('../utils/validators/ownershipHelpers');

const Category = require('../models/categoryModel');
const Cart = require('../models/cartModel');
const Restaurant = require('../models/restaurantModel');
const Item = require('../models/itemsModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

const updateItemSales = async (cartItems, cartId) => {
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
  await Cart.findByIdAndDelete(cartId);
};

const calcTotalOrderPrice = (cart, deliveryPrice) => {
  //  Calc order price depend on cart price and check if coupon applyed
  const totalPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  // calc total order price with taxe price and deliveryPrice
  let totalOrderPrice = (
    totalPrice +
    (totalPrice * sittings.taxePrice) / 100
  ).toFixed(2);

  // return total order price
  totalOrderPrice = +totalOrderPrice + +deliveryPrice;
  return totalOrderPrice;
};

const checkoutHelper = async (req, cart, totalOrderPrice) =>
  await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          unit_amount: parseInt(totalOrderPrice, 10) * 100,
          currency: 'sar',
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/carts`,
    client_reference_id: cart._id.toString(),
    customer_email: req.user.email,
    metadata: {
      deliveryAddress: JSON.stringify(req.body.deliveryAddress),
      restaurant: req.restaurant,
    },
  });

// @desc   Create cash order
// @route  POST /api/v1/orders/:cartId
// @access Private/user
exports.createCashOrder = asyncHandler(async (req, res) => {
  const { restaurantId } = req.body;
  // 1) Get cart based on ID
  const cart = await checkValueExists(Cart, req.params.cartId);

  // 2) Get restaurant deliveryPrice
  const restaurant = await checkValueExists(Restaurant, restaurantId);

  // 3) Calc total order price + restaurant deliveryPrice + taxePrice
  const totalOrderPrice = calcTotalOrderPrice(cart, restaurant.deliveryPrice);
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

// @desc   Create checkout Session and send it to client
// @route  GET /api/v1/orders/cartId
// @access Private-user
exports.checkoutSession = asyncHandler(async (req, res) => {
  // 1) Get cart based on ID
  const cart = await checkValueExists(Cart, req.params.cartId);
  // 2) Get item from cart item array
  const item = await checkValueExists(Item, cart.cartItems[0].item.toString());
  // 3) Get category based on item ID that cames from cartItems to get his restaurant document
  const { restaurant } = await Category.findById(
    item.category.toString(),
  ).populate('restaurant');
  req.restaurant = restaurant._id.toString();

  // 4) Calc total order price + restaurant deliveryPrice + taxePrice
  const totalOrderPrice = calcTotalOrderPrice(cart, restaurant.deliveryPrice);
  const session = await checkoutHelper(req, cart, totalOrderPrice);
  // Send session
  res.status(200).json({
    status: 'success',
    data: session,
  });
});

// @desc   Create cart order
const createCardOrder = async (session) => {
  // Get data from session
  const totalOrderPrice = session.amount_total / 100;
  const cartId = session.client_reference_id;
  const { deliveryAddress } = session.metadata;
  const { restaurant } = session.metadata;

  const user = await User.findOne({ email: session.customer_email });
  const cart = await Cart.findById(cartId);

  // Create cart order
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    restaurant,
    deliveryAddress,
    totalOrderPrice,
    paymentMethodPrice: 'cart',
    isPaid: true,
    PaidAt: Date.now(),
  });
  // If order created Update items from cartItems array incerment item sold and decrement item quantity
  if (order) {
    updateItemSales(cart.cartItems, cartId);
  }
};

exports.checkout = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createCardOrder(event.data.object);
  }

  res.status(200).json({ status: 'received' });
};
