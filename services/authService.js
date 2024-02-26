const crypto = require('node:crypto');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sendEmail = require('../utils/sendEmail');
const ApiError = require('../utils/ApiError');
const { createToken } = require('../utils/createToken');
const User = require('../models/userModel');

const createSendToken = (user, res, statusCode) => {
  const token = createToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('JWT', token, cookieOption);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
};

// @desc   singup
// @route  POST /api/v1/auth/singup
// @access Public
exports.singup = asyncHandler(async (req, res) => {
  // create new user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
  });
  // create unique token and send it with response
  createSendToken(user, res, 201);
});

// @desc   login
// @route  POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Invalid email or password', 401));
  }

  createSendToken(user, res, 200);
});

//@desc make sure the user is authenticated
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists, if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ApiError(
        'You are not login, please login to access this resource',
        401,
      ),
    );
  }
  // 2) Verify token no change happened (payload or expiration)
  const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) Check if user still exists
  const currentUser = await User.findById(decode.payload);
  if (!currentUser) {
    return next(
      new ApiError('User belong to this token no longer exists', 404),
    );
  }

  if (!currentUser.active && req.url !== '/reactive-me') {
    return next(new ApiError('User Account Inactive', 403));
  }

  // 4) Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10,
    );

    if (passwordChangedTimestamp > decode.iat) {
      return next(
        new ApiError(
          'User recently changed his password, please login again',
          401,
        ),
      );
    }
  }

  req.user = currentUser;
  next();
});

// @desc make sure only authorized user can access protected resources
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this resource.', 403),
      );
    }
    next();
  });

// @desc   Forgot password
// @route  POST /api/v1/auth/forgot-password
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Check if user exists
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ApiError('Please double-check your email and try again.', 404),
    );
  }
  // 2) Generate reset code random 6 digits hash and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  user.passwordResetcode = hashedResetCode;
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerify = false;

  await user.save();
  // 3) send reset code via email
  try {
    const message = `Hi ${user.name}, \nWe received a request to reset the password on your Restaurant app Account. ${resetCode} \n Thanks for helping us keep your account secure. \n The Restaurant Team`;

    await sendEmail({
      email: user.email,
      subject: `${user.name}, here's your PIN ${resetCode} (valid 10 minutes)`,
      message,
    });
  } catch (err) {
    user.passwordResetcode = undefined;
    user.passwordResetExpire = undefined;
    user.passwordResetVerify = undefined;
    await user.save();
    return next(new ApiError('Technical difficulties. Try again later.', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Reset code send to your email successfully',
  });
});

// @desc   Verify reset code
// @route  POST /api/v1/auth/verify-reset-code
// @access Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetcode: hashedResetCode,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError('Invalid reset code or expired', 400));
  }

  user.passwordResetVerify = true;
  await user.save();
  res.status(200).json({ status: 'success' });
});

// @desc   Reset password
// @route  PUT /api/v1/auth/reset-password
// @access Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { email: req.body.email },
    {
      password: await bcrypt.hash(req.body.newPassword, 12),
    },
    { new: true },
  );

  user.passwordResetcode = undefined;
  user.passwordResetExpire = undefined;
  user.passwordResetVerify = undefined;
  await user.save();

  createSendToken(user, res, 200);
});
