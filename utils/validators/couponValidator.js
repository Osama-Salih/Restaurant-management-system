const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Coupon = require('../../models/couponModel');
const {
  checkValueExists,
  authorizeActionIfOwner,
  checkDocumentDuplication,
  restaurantCustom,
} = require('./ownershipHelpers');

exports.getCouponValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid coupon id format')
    .custom(async (val, { req }) => {
      const coupon = await checkValueExists(Coupon, val);
      if (req.user.role === 'owner') {
        authorizeActionIfOwner(coupon.restaurant, req);
      }
      return true;
    }),

  validatorMiddleware,
];

exports.createCouponValidator = [
  check('name')
    .notEmpty()
    .withMessage('Name field is required')
    .custom(checkDocumentDuplication(Coupon)),

  check('discount')
    .notEmpty()
    .withMessage('Discount field is required')
    .isNumeric()
    .withMessage('Discount must be a number'),

  check('expire')
    .notEmpty()
    .withMessage('Expire field is required')
    .isDate()
    .withMessage('Expire must be a date'),

  check('restaurant')
    .notEmpty()
    .withMessage('Restaurant ID field is required')
    .isMongoId()
    .withMessage('Invalid restaurant id format')
    .custom(restaurantCustom),
  validatorMiddleware,
];

exports.updateCouponValidator = [
  check('name').optional().custom(checkDocumentDuplication(Coupon)),

  check('discount')
    .optional()
    .isNumeric()
    .withMessage('Discount must be a number'),

  check('expire').optional().isDate().withMessage('Expire must be a date'),

  check('restaurant')
    .optional()
    .isMongoId()
    .withMessage('Invalid restaurant id format')
    .custom(restaurantCustom),
  validatorMiddleware,
];

exports.deleteCouponValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid coupon id format')
    .custom(async (val, { req }) => {
      const coupon = await checkValueExists(Coupon, val);
      if (req.user.role === 'owner') {
        authorizeActionIfOwner(coupon.restaurant, req);
      }
      return true;
    }),
];
