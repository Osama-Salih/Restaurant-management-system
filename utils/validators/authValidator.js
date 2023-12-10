const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.singupValidator = [
  check('name')
    .notEmpty()
    .withMessage('name field is required')
    .isLength({ min: 3 })
    .withMessage('name field must be above 3 char')
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
      }
      return true;
    }),

  check('email')
    .notEmpty()
    .withMessage('email field is required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error('Email already in use, please try another email');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('password confirm is required'),

  check('password')
    .notEmpty()
    .withMessage('password field is required')
    .isLength({ min: 6 })
    .withMessage('password field must be at least 6 characters long')
    .custom((val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        throw new Error('Incorrect password confirm');
      }
      return true;
    }),
  check('phone')
    .notEmpty()
    .withMessage('phone field is required')
    .isMobilePhone('ar-SA')
    .withMessage('Only accept saudi arabian phone numbers'),
  validatorMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('email field is required')
    .isEmail()
    .withMessage('Invalid email address'),

  check('password')
    .notEmpty()
    .withMessage('password field is required')
    .isLength({ min: 6 })
    .withMessage('password field must be at least 6 characters long'),
  validatorMiddleware,
];
