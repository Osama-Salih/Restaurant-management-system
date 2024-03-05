const slugify = require('slugify');
const Restaurant = require('../../models/restaurantModel');
const Category = require('../../models/categoryModel');
const Item = require('../../models/itemsModel');

const findByIdOrName = async (Model, val) => {
  const query = /^\d/.test(val) ? { _id: val } : { name: val };
  return Model.findOne(query);
};

const getModelDisplayName = (Model) => {
  switch (Model.modelName) {
    case 'Category':
      return 'category';
    case 'Restaurant':
      return 'restaurant';
    case 'Item':
      return 'item';
    case 'Menu':
      return 'Menu';
    default:
      return 'unknown';
  }
};

// @desc Function to check if a document with the given ID exists in the database
// and throw an error if not found
async function checkValueExists(Model, val) {
  // Check if a string starts with a number
  const document = await findByIdOrName(Model, val);
  if (!document) {
    throw new Error(`There is no ${getModelDisplayName(Model)} with this id`);
  }
  return document;
}

// @desc Function to authorize an action if the current user is the owner of the document
const authorizeActionIfOwner = (doc, req) => {
  if (doc.owner.toString() !== req.user._id.toString()) {
    throw new Error(`You only can modify document on your own restaurant`);
  }
};

// @desc Function to check owner permission for a category or item
// It uses the checkValueExists function to verify the existence of the category and its associated restaurant
// It then authorizes the action if the user is the owner
const checkOwnerActionPermission = async (val, { req }) => {
  const category = await checkValueExists(Category, val);

  if (req.user.role === 'owner') {
    const restaurant = await checkValueExists(Restaurant, category.restaurant);
    authorizeActionIfOwner(restaurant, req);
  }
  return true;
};

// @desc  Allow user with owner role to update or delete item belong to his restaurant
const checkOwnerItemPermission = async (itemId, { req }) => {
  const item = await checkValueExists(Item, itemId);
  await checkOwnerActionPermission(item.category, { req });
};

const checkDocumentDuplication =
  (Model) =>
  async (val, { req }) => {
    const name = await Model.findOne({ name: val });
    if (name) {
      throw new Error(
        `${Model === 'Item' ? 'Item' : 'Menu'} name already exists`,
      );
    }
    // add slug for the name field
    if (req.body.name) {
      req.body.slug = slugify(val);
    }
    return true;
  };

module.exports = {
  checkValueExists,
  authorizeActionIfOwner,
  checkOwnerActionPermission,
  checkOwnerItemPermission,
  findByIdOrName,
  checkDocumentDuplication,
};
