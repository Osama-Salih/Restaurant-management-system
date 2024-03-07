const factory = require('./handlerFactroy');
const Coupon = require('../models/couponModel');

// @desc   Get all coupons
// @route  GET /api/v1/coupons
// @access Private/admin-owner
exports.getAllCoupons = factory.getAll(Coupon);

// @desc   Get specific Coupon by id
// @route  GET /api/v1/coupons/:id
// @access Private/admin-owner
exports.getCoupon = factory.getOne(Coupon);

// @desc   Create Coupon
// @route  POST /api/v1/categories
// @access Private/admin-owner
exports.createCoupon = factory.createOne(Coupon);

// @desc   Update specific Coupon by id
// @route  PATCH /api/v1/categories/:id
// @access Private/admin-owner
exports.updateCoupon = factory.updateOne(Coupon);

// @desc   Delete specific Coupon by id
// @route  DELETE /api/v1/categories/:id
// @access Private-admin-owner
exports.deleteCoupon = factory.deleteOne(Coupon);
