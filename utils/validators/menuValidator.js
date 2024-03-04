const { check } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Category = require('../../models/categoryModel');
const Item = require('../../models/itemsModel');
const Menu = require('../../models/MenuModel');
const Restaurant = require('../../models/restaurantModel');
const {
  checkValueExists,
  authorizeActionIfOwner,
} = require('./ownershipHelpers');

const validateId = async (val, { req }) => {
  if (req.user.role === 'owner') {
    const menu = await checkValueExists(Menu, val);
    const restaurant = await checkValueExists(
      Restaurant,
      menu.restaurant.toString(),
    );
    authorizeActionIfOwner(restaurant, req);
  }
  return true;
};

const validateName = async (val, { req }) => {
  await checkValueExists(Category, val);
  req.body.slug = slugify(val);
};

const validateItems = async (itemsArr, { req }) => {
  // Check if all provided items exist in db
  const results = await Item.find({
    _id: { $exists: true, $in: itemsArr },
  });
  // Throw error if no items are found in db or not all itemsIds valid
  if (!results.length || results.length !== itemsArr.length) {
    throw new Error('Invalid items ids');
  }

  // Get category based on it's name
  const category = await checkValueExists(Category, req.body.name);

  // Get all items belong to the provided category
  const categoryItemsIds = await Item.find({
    category: category._id.toString(),
  });

  // Convert items ids from ObjectId to String
  const itemsIds = categoryItemsIds.map((el) => el._id.toString());

  // Check if all items belong to the provided category
  if (!itemsArr.every((el) => itemsIds.includes(el))) {
    throw new Error('Items IDs do not belong to the provided category');
  }

  return true;
};

const validateRestaurant = async (val, { req }) => {
  // Get restaurant based on ID
  const restaurant = await checkValueExists(Restaurant, val);

  // Get category based on its name
  const category = await checkValueExists(Category, req.body.name);
  // Check if restaurant has the specified category
  if (category.restaurant.toString() !== restaurant.id) {
    throw new Error(
      'The provided restaurant does not have any category with this name',
    );
  }

  if (
    req.user.role === 'owner' &&
    req.user._id.toString() !== restaurant.owner._id.toString()
  ) {
    throw new Error('Please provide your won restaurant id');
  }

  return true;
};

exports.getMenuValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware,
];

exports.createMenuValidator = [
  check('name')
    .notEmpty()
    .withMessage('Name field is required')
    .custom(validateName),

  check('items')
    .notEmpty()
    .withMessage('Items IDs are required')
    .isArray()
    .withMessage('Items IDs must be provided in an array')
    .custom(validateItems),

  check('restaurant')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isMongoId()
    .withMessage('Invalid restaurant ID format')
    .custom(validateRestaurant),
  validatorMiddleware,
];

exports.updateMenuValidator = [
  check('id').isMongoId().withMessage('Invalid ID format').custom(validateId),

  check('name')
    .notEmpty()
    .withMessage('Name field is required with update')
    .custom(validateName),

  check('items')
    .optional()
    .isArray()
    .withMessage('Items IDs must be provided in an array')
    .custom(validateItems),

  check('restaurant')
    .optional()
    .isMongoId()
    .withMessage('Invalid restaurant ID format')
    .custom(validateRestaurant),

  validatorMiddleware,
];

exports.deleteMenuValidator = [
  check('id').isMongoId().withMessage('Invalid ID format').custom(validateId),
  validatorMiddleware,
];
