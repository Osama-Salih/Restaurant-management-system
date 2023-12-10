const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const User = require('../models/userModel');
const { createToken } = require('../utils/createToken');

// @desc   Get all users
// @route  GET /api/v1/users
// @access Private-admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  // Build query
  const countDocuments = await User.countDocuments();
  const apiFeatures = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .felidsLimit()
    .search()
    .paginate(countDocuments);

  const { mongooseQuery, paginationResults } = apiFeatures;
  // Execute query
  const users = await mongooseQuery;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      paginationResults,
      users,
    },
  });
});

// @desc   Get specific user by id
// @route  GET /api/v1/users/:id
// @access Private-admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc   Create user
// @route  POST /api/v1/users
// @access Private-admin
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc   Update specific user by id
// @route  PUT /api/v1/users/:id
// @access Private-admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    {
      new: true,
    },
  );

  if (!user) {
    return next(new ApiError('user not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc   Delete specific user by id
// @route  DELETE /api/v1/users/:id
// @access Private-admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  res.status(204).send();
});

// @desc   Change user password
// @route  PUT /api/v1/users/change-password/:id
// @access Private-admin
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true },
  );

  if (!user) {
    return next(new ApiError('user not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc   Get logged user data
// @route  GET /api/v1/users/get-me
// @access Private-user
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc   Update logged user data
// @route  PUT /api/v1/users/update-me
// @access Private-user
exports.updateLoggedUserData = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc   Deactivate logged user
// @route  DELETE /api/v1/users/deactive-me
// @access Private-user
exports.deactivateLoggedUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).send();
});

// @desc   Reactivate logged user
// @route  GET /api/v1/users/reactive-me
// @access Private-user
exports.reactivateLoggedUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: true },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc   Update logged user password
// @route  PUT /api/v1/users/change-my-password
// @access Private-user
exports.updateLoggedUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true },
  );

  const token = createToken(user._id);
  res.status(200).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
});
