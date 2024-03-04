const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');
const Restaurant = require('../../models/restaurantModel');

exports.displayRestaurantMenuValidator = [
  check('id').isMongoId().withMessage('Invalid restaurant id format'),
  validatorMiddleware,
];

exports.createRestaurantValidator = [
  check('name')
    .notEmpty()
    .withMessage('name field is required')
    .isLength({ max: 40 })
    .withMessage('name must be lower then 40 char')
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
      }
      return true;
    }),

  check('location.type')
    .notEmpty()
    .withMessage('location type field is required'),
  check('location.coordinates')
    .notEmpty()
    .withMessage('location coordinates field is required')
    .custom((val, { req }) => {
      // Check if both latitude and longitude are valid numbers
      const ConvertCoordinatesToObj = JSON.parse(val);
      const [latitude, longitude] = ConvertCoordinatesToObj.map((coord) =>
        parseFloat(coord),
      );
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throw new Error('Invalid coordinates');
      }
      return true;
    }),

  check('description')
    .notEmpty()
    .withMessage('description field is required')
    .isString()
    .withMessage('description field must be a type of string')
    .isLength({ max: 200 })
    .withMessage('description field must be lower then 200 char'),

  check('cuisineType')
    .notEmpty()
    .withMessage('cuisine type field is required')
    .isString()
    .withMessage('cuisine type field must be a type of string'),

  check('ratingsAverage')
    .optional()
    .isNumeric()
    .withMessage('ratings average field must be a type of number')
    .isLength({ max: 5.0, min: 1.0 })
    .withMessage('ratings average must be between 1.0 to 5.0'),

  check('ratingsQuantity')
    .optional()
    .isNumeric()
    .withMessage('ratings quantity field must be a type of number'),

  check('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Only accept saudi arabian phone numbers'),

  check('imageCover').notEmpty().withMessage('image cover field required'),

  check('owner')
    .notEmpty()
    .withMessage('owner field required')
    .isMongoId()
    .withMessage('Invalid owner id format')
    .custom(async (val) => {
      const owner = await User.findOne({ _id: val, role: 'owner' });
      if (!owner) {
        throw new Error('Invalid id or the user role is not owner');
      }
      return true;
    }),

  check('openingHours').optional(),
  validatorMiddleware,
];

exports.updateRestaurantValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid restaurant id format')
    .custom(async (resId, { req }) => {
      if (req.user.role !== 'admin') {
        const restaurant = await Restaurant.findById(resId);

        if (!restaurant) {
          throw new Error(`There is no restaurant with this id ${resId}`);
        }

        if (restaurant.owner.toString() !== req.user._id.toString()) {
          throw new Error('You are not allowed to perform this action');
        }
      }
      return true;
    }),
  check('name')
    .optional()
    .isLength({ max: 40 })
    .withMessage('name must be lower then 40 char')
    .custom(async (val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
      }

      const restaurant = await Restaurant.findOne({ name: val });
      if (restaurant) {
        throw new Error(
          'please provide a another name cus this name already exists',
        );
      }
      return true;
    }),

  check('location.type').optional(),

  check('location.coordinates')
    .optional()
    .custom((val, { req }) => {
      // Check if both latitude and longitude are valid numbers
      const [latitude, longitude] = val.map((coord) => parseFloat(coord));
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throw new Error('Invalid coordinates');
      }
      return true;
    }),

  check('description')
    .optional()
    .isString()
    .withMessage('description field must be a type of string')
    .isLength({ max: 200 })
    .withMessage('description field must be lower then 200 char'),

  check('cuisineType')
    .optional()
    .isString()
    .withMessage('cuisine type field must be a type of string'),
  check('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Only accept saudi arabian phone numbers'),

  check('owner')
    .optional()
    .isMongoId()
    .withMessage('Invalid owner id format')
    .custom(async (val) => {
      const owner = await User.findOne({ _id: val, role: 'owner' });
      if (!owner) {
        throw new Error('Invalid id or the user role is not owner');
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteRestaurantValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid restaurant id format')
    .custom(async (resId, { req }) => {
      if (req.user.role !== 'admin') {
        const restaurant = await Restaurant.findById(resId);

        if (!restaurant) {
          throw new Error(`There is no restaurant with this id ${resId}`);
        }

        if (restaurant.owner.toString() !== req.user._id.toString()) {
          throw new Error('You are not allowed to perform this action');
        }
      }
      return true;
    }),
  validatorMiddleware,
];

exports.getRestaurantWithinValidator = [
  check('distance')
    .isNumeric()
    .withMessage('distance must be a type of number'),
  check('unit').custom((val) => {
    const unitFormat = ['mi', 'km'];
    if (!unitFormat.includes(val)) {
      throw new Error('Please provide unit of either mi or km');
    }
    return true;
  }),
  validatorMiddleware,
];

exports.getDistancesValidator = [
  check('unit').custom((val) => {
    const unitFormat = ['mi', 'km'];
    if (!unitFormat.includes(val)) {
      throw new Error('Please provide unit of either mi or km');
    }
    return true;
  }),
  validatorMiddleware,
];
