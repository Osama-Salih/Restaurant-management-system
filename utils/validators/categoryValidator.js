const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Category = require('../../models/categoryModel');

const {
  checkValueExists,
  checkOwnerActionPermission,
  checkDocumentDuplication,
  restaurantCustom,
} = require('./ownershipHelpers');
const Restaurant = require('../../models/restaurantModel');

exports.getCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('name field is required')
    .isLength({ min: 3, max: 32 })
    .withMessage('must be between 3 and 32 charactres')
    .custom(checkDocumentDuplication(Category)),

  check('restaurant')
    .notEmpty()
    .withMessage('restaurant id field is required')
    .isMongoId()
    .withMessage('Invalid restaurant id format')
    .custom(restaurantCustom),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid category id format')
    .custom(checkOwnerActionPermission),

  check('name')
    .optional()
    .isLength({ min: 3, max: 32 })
    .withMessage('must be between 3 and 32 charactres')
    .custom((val, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(val);
      }
      return true;
    }),

  check('restaurant')
    .optional()
    .isMongoId()
    .withMessage('Invalid restaurant id format')
    .custom(async (val, { req }) => {
      if (req.user.role === 'admin') {
        await checkValueExists(Restaurant, val);
      } else {
        throw new Error(`You can't update restaurant category`);
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid category id format')
    .custom(checkOwnerActionPermission),
  validatorMiddleware,
];
