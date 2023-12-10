const express = require('express');

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
  updateLoggedUserPasswordValidator,
} = require('../utils/validators/userValidator');

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserData,
  deactivateLoggedUser,
  reactivateLoggedUser,
  updateLoggedUserPassword,
} = require('../services/userService');

const authService = require('../services/authService');

const router = express.Router();

// USER
router.get(
  '/get-me',
  authService.protect,
  authService.allowedTo('user'),
  getLoggedUserData,
  getUser,
);
router.put(
  '/update-me',
  authService.protect,
  authService.allowedTo('user'),
  updateLoggedUserValidator,
  updateLoggedUserData,
);

router.delete(
  '/deactive-me',
  authService.protect,
  authService.allowedTo('user'),
  deactivateLoggedUser,
);
router.get(
  '/reactive-me',
  authService.protect,
  authService.allowedTo('user'),
  reactivateLoggedUser,
);

router.put(
  '/change-my-password',
  authService.protect,
  authService.allowedTo('user'),
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword,
);

// ADMIN
router
  .route('/')
  .get(authService.protect, authService.allowedTo('admin'), getAllUsers)
  .post(
    authService.protect,
    authService.allowedTo('admin'),
    createUserValidator,
    createUser,
  );

router
  .route('/:id')
  .get(
    authService.protect,
    authService.allowedTo('admin'),
    getUserValidator,
    getUser,
  )
  .put(
    authService.protect,
    authService.allowedTo('admin'),
    updateUserValidator,
    updateUser,
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteUserValidator,
    deleteUser,
  );

router.put(
  '/change-password/:id',
  changeUserPasswordValidator,
  changeUserPassword,
);

module.exports = router;
