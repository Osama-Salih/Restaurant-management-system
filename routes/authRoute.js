const express = require('express');

const {
  singupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

const {
  singup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require('../services/authService');

const router = express.Router();

router.post('/singup', singupValidator, singup);
router.post('/login', loginValidator, login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.patch('/reset-password', resetPassword);

module.exports = router;
