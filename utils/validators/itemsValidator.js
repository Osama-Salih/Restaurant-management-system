const { check } = require('express-validator');
const Item = require('../../models/itemsModel');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const {
  checkOwnerActionPermission,
  checkOwnerItemPermission,
  checkDocumentDuplication,
} = require('./ownershipHelpers');

exports.getItemValidator = [
  check('id').isMongoId().withMessage('Invalid item id format'),
  validatorMiddleware,
];

exports.createItemValidator = [
  check('name')
    .notEmpty()
    .withMessage('Name field is required')
    .isLength({ min: 3, max: 40 })
    .withMessage('Name field must be between 3 and 30 characters')
    .custom(checkDocumentDuplication(Item)),

  check('price')
    .notEmpty()
    .withMessage('Price field is required')
    .isNumeric()
    .withMessage('Price must be a number')
    .isLength({ max: 2000 })
    .withMessage('The maximum item price is 2000'),

  check('quantity')
    .optional()
    .isNumeric()
    .withMessage('Quantity must be a number'),

  check('sold').optional().isNumeric().withMessage('Sold must be a number'),

  check('calories').optional(),

  check('description')
    .notEmpty()
    .withMessage('Description field is required')
    .isLength({ max: 80, min: 10 })
    .withMessage('Description must be between 10 and 80 characters long'),

  check('imageCover').notEmpty().withMessage('Item image cover is required'),

  check('category')
    .notEmpty()
    .withMessage('Item category field is required')
    .isMongoId()
    .withMessage('Invalid category id format')
    // @desc allowe owner to only create item with category belongs to his restaurant
    .custom(checkOwnerActionPermission),
  validatorMiddleware,
];

exports.updateItemValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid item id format')
    .custom(async (val, { req }) => {
      // Allow user with owner role to update item belong to his restaurant
      await checkOwnerItemPermission(val, { req });
      return true;
    }),

  check('name')
    .optional()
    .isLength({ min: 3, max: 40 })
    .withMessage('Name field must be between 3 and 30 characters')
    .custom(checkDocumentDuplication(Item)),

  check('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .isLength({ max: 2000 })
    .withMessage('The maximum item price is 2000'),

  check('quantity')
    .optional()
    .isNumeric()
    .withMessage('Quantity must be a number'),

  check('sold').optional().isNumeric().withMessage('Sold must be a number'),

  check('calories').optional(),

  check('description')
    .optional()
    .isLength({ max: 80, min: 10 })
    .withMessage('Description must be between 10 and 80 characters long'),

  check('imageCover').optional(),

  check('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category id format')
    // @desc allowe owner to only update item with category belongs to his restaurant
    .custom(checkOwnerActionPermission),
  validatorMiddleware,
];

exports.deleteItemValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid item id format')
    .custom(async (val, { req }) => {
      // Allow user with owner role to delete item belong to his restaurant
      await checkOwnerItemPermission(val, { req });
      return true;
    }),
  validatorMiddleware,
];
