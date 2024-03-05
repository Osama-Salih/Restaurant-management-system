const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../config/cloudinary');

const { uploadSingleFile } = require('../config/multer');
const factory = require('./handlerFactroy');
const Item = require('../models/itemsModel');

// @desc Upload single file
exports.uploadItemImage = uploadSingleFile('items').single('imageCover');

// @desc  image processing and upload to cloudinary
exports.uploadFileToCloudinary = asyncHandler(async (req, res, next) => {
  // Check if a file is provided
  if (req.file) {
    const fileName = `item-${uuidv4()}-${Date.now()}`;
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: fileName,
      width: 600,
      height: 600,
      crop: 'fill',
      format: 'jpeg',
      quality: 95,
    });

    // save image to db
    req.body.imageCover = result.secure_url || result.public_id;
  }
  next();
});

// @desc Nested route on create
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// @desc   Get all items
// @route  GET /api/v1/itmes
// @access Private/admin-owner
exports.getAllItems = factory.getAll(Item);

// @desc   Get specific item by id
// @route  GET /api/v1/items/:id
// @access Public
exports.getItem = factory.getOne(Item);

// @desc   Create item
// @route  POST /api/v1/items
// @access Private/admin-owner
exports.createItem = factory.createOne(Item);

// @desc   Update specific item by id
// @route  PATCH /api/v1/items/:id
// @access Private/admin-owner
exports.updateItem = factory.updateOne(Item);

// @desc   Delete specific item by id
// @route  DELETE /api/v1/items/:id
// @access Private/admin-owner
exports.deleteItem = factory.deleteOne(Item);
