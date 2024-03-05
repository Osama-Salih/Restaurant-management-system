const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');
const Restaurant = require('../../models/restaurantModel');
const {
  checkDocumentDuplication,
  checkValueExists,
  authorizeActionIfOwner,
} = require('./ownershipHelpers');

const ckeckIfuserIsOwner = async (val) => {
  const owner = await User.findOne({ _id: val, role: 'owner' });
  if (!owner) {
    throw new Error('Invalid id or the user role is not owner');
  }
  return true;
};

exports.displayRestaurantMenuValidator = [
  check('id').isMongoId().withMessage('Invalid restaurant id format'),
  validatorMiddleware,
];

exports.createRestaurantValidator = [
  check('name')
    .notEmpty()
    .withMessage('Name field required')
    .isLength({ max: 40 })
    .withMessage('Name must be lower then 40 char')
    .custom(checkDocumentDuplication),

  check('location.type').notEmpty().withMessage('Location type field required'),
  check('location.coordinates')
    .notEmpty()
    .withMessage('Location coordinates field required')
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
    .withMessage('Description field required')
    .isString()
    .withMessage('Description field must be string')
    .isLength({ max: 200 })
    .withMessage('Description field must be lower then 200 char'),

  check('cuisineType')
    .notEmpty()
    .withMessage('Cuisine type field required')
    .isString()
    .withMessage('Cuisine type field must be string'),

  check('ratingsAverage')
    .optional()
    .isNumeric()
    .withMessage('Ratings average field must be number')
    .isLength({ max: 5.0, min: 1.0 })
    .withMessage('Ratings average must be between 1.0 to 5.0'),

  check('ratingsQuantity')
    .optional()
    .isNumeric()
    .withMessage('Ratings quantity field must be  number'),

  check('phone')
    .optional()
    .isMobilePhone('ar-SA')
    .withMessage('Only accept saudi arabian phone numbers'),

  check('imageCover').notEmpty().withMessage('image cover field required'),

  check('owner')
    .notEmpty()
    .withMessage('Owner field required')
    .isMongoId()
    .withMessage('Invalid owner id format')
    .custom(ckeckIfuserIsOwner),

  check('openingHours').optional(),
  validatorMiddleware,
];

exports.updateRestaurantValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid restaurant id format')
    .custom(async (resId, { req }) => {
      if (req.user.role === 'owner') {
        const restaurant = await checkValueExists(Restaurant, resId);
        authorizeActionIfOwner(restaurant, req);
      }
      return true;
    }),
  check('name')
    .optional()
    .isLength({ max: 40 })
    .withMessage('name must be lower then 40 char')
    .custom(checkDocumentDuplication),

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
    .custom(ckeckIfuserIsOwner),
  validatorMiddleware,
];

exports.deleteRestaurantValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid restaurant id format')
    .custom(async (resId, { req }) => {
      if (req.user.role === 'owner') {
        const restaurant = await checkValueExists(Restaurant, resId);
        authorizeActionIfOwner(restaurant, req);
      }
      return true;
    }),
  validatorMiddleware,
];

const unitValidate = (val) => {
  const unitFormat = ['mi', 'km'];
  if (!unitFormat.includes(val)) {
    throw new Error('Please provide unit of either mi or km');
  }
  return true;
};

exports.getRestaurantWithinValidator = [
  check('distance')
    .isNumeric()
    .withMessage('distance must be a type of number'),
  check('unit').custom(unitValidate),
  validatorMiddleware,
];

exports.getDistancesValidator = [
  check('unit').custom(unitValidate),
  validatorMiddleware,
];
