const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../config/cloudinary');

const { uploadSingleFile } = require('../config/multer');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
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
exports.getAllItems = asyncHandler(async (req, res) => {
  // Build query
  const countDocuments = await Item.countDocuments();
  const apiFeatures = new ApiFeatures(Item.find(req.itemFilter), req.query)
    .filter()
    .search()
    .sort()
    .felidsLimit()
    .paginate(countDocuments);

  const { mongooseQuery, paginationResults } = apiFeatures;
  // Execute query
  const items = await mongooseQuery;
  res.status(200).json({
    status: 'success',
    results: items.length,
    data: {
      paginationResults,
      items,
    },
  });
});

// @desc   Get specific item by id
// @route  GET /api/v1/items/:id
// @access Public
exports.getItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new ApiError('Item not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      item,
    },
  });
});

// @desc   Create item
// @route  POST /api/v1/items
// @access Private/admin-owner
exports.createItem = asyncHandler(async (req, res) => {
  const item = await Item.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      item,
    },
  });
});

// @desc   Update specific item by id
// @route  PATCH /api/v1/items/:id
// @access Private/admin-owner
exports.updateItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!item) {
    return next(new ApiError('Item not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      item,
    },
  });
});

// @desc   Delete specific item by id
// @route  DELETE /api/v1/items/:id
// @access Private/admin-owner
exports.deleteItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findByIdAndDelete(req.params.id);

  if (!item) {
    return next(new ApiError('Item not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
