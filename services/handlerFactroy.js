const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');

//@desc Filter query documents for any model has filter object
const setFilterForModel = (Model, req) => {
  let filter = {};
  switch (Model.modelName) {
    case 'Category':
    case 'Menu':
    case 'Coupon':
    case 'Order':
      filter = req.categoryFilter;
      break;
    case 'Item':
      filter = req.paramsFilter;
      break;
    case 'Review':
      filter = req.filterId;
      break;
    default:
      filter = {};
  }
  return filter;
};

exports.getAll = (Model, modelName = '') =>
  asyncHandler(async (req, res) => {
    const filter = setFilterForModel(Model, req);
    // Build query
    const countDocuments = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .felidsLimit()
      .search(modelName)
      .paginate(countDocuments);

    const { mongooseQuery, paginationResults } = apiFeatures;
    // Execute query
    const documents = await mongooseQuery;
    // documents = sanitizeDataForModel(Model, documents);
    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        paginationResults,
        documents,
      },
    });
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(new ApiError('Document not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    if (req.body.location) {
      req.body.location.coordinates = JSON.parse(req.body.location.coordinates);
    }

    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(new ApiError('Document not found', 404));
    }

    await document.save();
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new ApiError('document not found', 404));
    }

    await document.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
