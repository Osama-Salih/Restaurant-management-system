const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const cloudinary = require('../config/cloudinary');
const { uploadSingleFile } = require('../config/multer');
const ApiError = require('../utils/ApiError');
const { createToken } = require('../utils/createToken');
const factory = require('./handlerFactroy');
const User = require('../models/userModel');

// @desc Upload single file
exports.uploadUserImage = uploadSingleFile('users').single('profileImage');

// @desc  image processing and upload to cloudinary
exports.uploadFileToCloudinary = asyncHandler(async (req, res, next) => {
  // Check if a file is provided
  if (req.file) {
    const fileName = `users-${req.user._id}-${Date.now()}`;
    // console.log(req.file.path);
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: fileName,
      width: 600,
      height: 600,
      crop: 'fill',
      format: 'jpeg',
      quality: 95,
    });

    // save image to db
    req.body.profileImage = result.secure_url || result.public_id;
  }
  next();
});

// @desc   Get all users
// @route  GET /api/v1/users
// @access Private-admin
exports.getAllUsers = factory.getAll(User);

// @desc   Get specific user by id
// @route  GET /api/v1/users/:id
// @access Private-admin
exports.getUser = factory.getOne(User);

// @desc   Create user
// @route  POST /api/v1/users
// @access Private-admin
exports.createUser = factory.createOne(User);

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
exports.deleteUser = factory.deleteOne(User);

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
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
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
