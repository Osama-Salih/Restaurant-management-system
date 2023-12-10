const jwt = require('jsonwebtoken');

exports.createToken = (payload) =>
  jwt.sign({ payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
