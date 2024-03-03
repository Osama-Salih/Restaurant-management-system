const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getMenuValidator = [
  check('id').isMongoId().withMessage('Invalid menu id format'),
  validatorMiddleware,
];

exports.createMenuValidator = [
  //   check('name').notEmpty().withMessage('name feild required'),
];
