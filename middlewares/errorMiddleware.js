const ApiError = require('../utils/ApiError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
};
const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const handleJwtInvalidSignature = () =>
  new ApiError('Invalid token, please login again.', 401);
const handleJwtExpired = () =>
  new ApiError('Expired token, please login again.', 401);

const globalErrorHandler = (err, req, res, next) => {
  let error = Object.create(err);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    if (error.name === 'JsonWebTokenError') error = handleJwtInvalidSignature();
    if (error.name === 'TokenExpiredError') error = handleJwtExpired();

    sendErrorProd(error, res);
  }

  next();
};

module.exports = globalErrorHandler;
