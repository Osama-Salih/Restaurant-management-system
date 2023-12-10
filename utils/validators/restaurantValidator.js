const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getRestaurantValidator = [
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

  check('location.coordinates')
    .notEmpty()
    .withMessage('location field is required')
    .isArray()
    .withMessage('Location coordinates must be an array with two elements')
    .custom((val) => {
      // Check if both latitude and longitude are valid numbers
      const [latitude, longitude] = val;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
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

  check('openingHours')
    .notEmpty()
    .withMessage('opening hours field required')
    .isArray()
    .withMessage('opening hours must be an array with three elements'),

  check('openingHours')
    .notEmpty()
    .withMessage('opening hours field required')
    .isArray()
    .withMessage('opening hours must be an array with three elements')
    .custom((val) => {
      const daysOfWeek = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];

      const isValidDay = val.every((el) => daysOfWeek.includes(el.dayOfWeek));

      if (!isValidDay) {
        throw new Error('Please provide a valid day of week');
      }
      return true;
    }),
  validatorMiddleware,
];

exports.updateRestaurantValidator = [
  check('id').isMongoId().withMessage('Invalid restaurant id format'),
  validatorMiddleware,
];

exports.deleteRestaurantValidator = [
  check('id').isMongoId().withMessage('Invalid restaurant id format'),
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
