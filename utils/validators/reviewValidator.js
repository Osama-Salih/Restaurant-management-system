// const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewModel');

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid restaurant id format'),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check('title').optional(),
  check('ratings')
    .notEmpty()
    .withMessage('ratings field required')
    .isFloat({ min: 1.0, max: 5.0 })
    .withMessage('ratings must be between 1 to 5'),

  check('user')
    .notEmpty()
    .withMessage('review must be belong to user')
    .isMongoId()
    .withMessage('Invalid user id format')
    .custom(async (val, { req }) => {
      const review = await Review.findOne({
        user: val,
        restaurant: req.body.restaurant,
      });
      if (review) {
        throw new Error('You already have a review before');
      }
      return true;
    }),
  check('restaurant')
    .notEmpty()
    .withMessage('review must be belong to restaurant')
    .isMongoId()
    .withMessage('Invalid restaurant id format'),

  validatorMiddleware,
];

exports.updateReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid review id format')
    .custom(async (revId, { req }) => {
      const review = await Review.findById(revId);

      console.log(review.user._id.toString());
      console.log(req.user._id.toString());

      if (review.user._id.toString() !== req.user._id.toString()) {
        throw new Error('You are not allowed to perform this action');
      }
      return true;
    }),

  check('title').optional(),
  check('ratings')
    .optional()
    .isFloat({ min: 1.0, max: 5.0 })
    .withMessage('ratings must be between 1 to 5'),

  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid review id format')
    .custom(async (revId, { req }) => {
      const review = await Review.findById(revId);

      if (
        req.user.role !== 'admin' &&
        review.user._id.toString() !== req.user._id.toString()
      ) {
        throw new Error('You are not allowed to perform this action');
      }
      return true;
    }),

  validatorMiddleware,
];
