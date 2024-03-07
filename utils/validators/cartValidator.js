const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Coupon = require('../../models/couponModel');
const Item = require('../../models/itemsModel');
const { checkValueExists } = require('./ownershipHelpers');

const validateItemId = async (val) => await checkValueExists(Item, val);

exports.addItemToCartValidator = [
  check('itemId')
    .notEmpty()
    .withMessage('Item ID required')
    .custom(validateItemId),
  validatorMiddleware,
];

exports.removeItemFromCartValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid item ID format')
    .custom(validateItemId),
  validatorMiddleware,
];

exports.updateCartItemQuantityValidator = [
  check('itemId')
    .isMongoId()
    .withMessage('Invalid item ID format')
    .custom(validateItemId),
  validatorMiddleware,
];

exports.applyCouponValidator = [
  check('coupon')
    .notEmpty()
    .withMessage('Coupon is required')
    .custom(async (val) => {
      await checkValueExists(Coupon, val);
    }),
  validatorMiddleware,
];
