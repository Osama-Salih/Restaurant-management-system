const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const { checkValueExists, restaurantCustom } = require('./ownershipHelpers');
const Restaurant = require('../../models/restaurantModel');
const Order = require('../../models/orderModel');

// @desc Validate who can access the order by id if (user) Only can get his own order,
// (owner) can get only order on his restaurant
const validateOrderAccess = async (orderId, user) => {
  const order = await checkValueExists(Order, orderId);
  if (user.role === 'admin') {
    return true;
  }

  if (
    user.role === 'user' &&
    order.user._id.toString() !== user._id.toString()
  ) {
    throw new Error(`You don't have order with this id ${orderId}`);
  }
  await restaurantCustom(order.restaurant, { req: { user } });
  return true;
};

exports.createOrderValidator = [
  check('restaurantId')
    .notEmpty()
    .withMessage('Restaurant ID field is required')
    .isMongoId()
    .withMessage('Invalid restaurant id format')
    .custom(async (val) => await checkValueExists(Restaurant, val)),

  check('deliveryAddress.details')
    .notEmpty()
    .withMessage('Details field is required')
    .isString()
    .withMessage('Details required a string'),

  check('deliveryAddress.phone')
    .notEmpty()
    .withMessage('Phone field is required')
    .isMobilePhone('ar-SA')
    .withMessage('Invalid phone number only accept Saudi Arabian phone number'),

  check('deliveryAddress.city')
    .notEmpty()
    .withMessage('City field is required'),

  check('deliveryAddress.postalCode')
    .notEmpty()
    .withMessage('Postal code field is required')
    .isPostalCode('SA')
    .withMessage('Invalid postal code, only accept Saudi Arabian postal codes'),

  check('paymentMethodPrice')
    .optional()
    .isString()
    .withMessage('Payment method price field is required')
    .custom((val) => {
      if (val !== 'cart' || val !== 'cash') {
        throw new Error('Invalid payment method value, (cart | cash)');
      }
    }),
  validatorMiddleware,
];

exports.getOrderValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid order id format')
    .custom(async (orderId, { req }) => {
      await validateOrderAccess(orderId, req.user);
    }),

  validatorMiddleware,
];

exports.updateOrderStatusValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid order id format')
    .custom(async (orderId, { req }) => {
      const order = await checkValueExists(Order, orderId);
      await restaurantCustom(order.restaurant, { req });
    }),
  validatorMiddleware,
];
