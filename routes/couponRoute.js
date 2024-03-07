const express = require('express');
const authService = require('../services/authService');
const { filterForOwner } = require('../middlewares/filterMiddleware');

const {
  getCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
} = require('../utils/validators/couponValidator');

const {
  getAllCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../services/couponService');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('admin', 'owner'));
router
  .route('/')
  .get(filterForOwner, getAllCoupons)
  .post(createCouponValidator, createCoupon);

router
  .route('/:id')
  .get(getCouponValidator, getCoupon)
  .patch(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

module.exports = router;
