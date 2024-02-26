const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid user id format'),
  validatorMiddleware,
];

exports.createUserValidator = [
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

  check('passwordConfirm')
    .notEmpty()
    .withMessage('password confirm is required'),

  check('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Only accept saudi arabian phone numbers'),

  check('profileImage').optional(),

  check('role').optional(),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid user id format'),

  check('currentPassword')
    .notEmpty()
    .withMessage('current password is required'),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('password confirm is required'),

  check('password')
    .notEmpty()
    .withMessage('password is required')
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error(`user not found`);
      }

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );

      if (!isCorrectPassword) {
        throw new Error('Incorrect current password');
      }

      if (val !== req.body.passwordConfirm) {
        throw new Error('Incorrect password confirm');
      }

      return true;
    }),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid user id format'),

  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('name field must be above 3 char')
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
      }
      return true;
    }),

  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error('Email already in use, please try another email');
      }
      return true;
    }),

  check('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Only accept saudi arabian phone numbers'),

  check('profileImage').optional(),

  check('role').optional(),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid user id format'),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  check('name')
    .optional()
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
        return true;
      }
    }),

  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error('email already in use');
      }
      return true;
    }),

  check('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Invalid phone number only accept SA phone number'),
  check('profileImage').optional(),
  validatorMiddleware,
];

exports.updateLoggedUserPasswordValidator = [
  check('currentPassword')
    .notEmpty()
    .withMessage('current password is required'),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('password confirm is required'),

  check('password')
    .notEmpty()
    .withMessage('password is required')
    .custom(async (val, { req }) => {
      const user = await User.findById(req.user._id);

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );

      if (!isCorrectPassword) {
        throw new Error('Incorrect current password');
      }

      if (val !== req.body.passwordConfirm) {
        throw new Error('Incorrect password confirm');
      }

      return true;
    }),
  validatorMiddleware,
];
