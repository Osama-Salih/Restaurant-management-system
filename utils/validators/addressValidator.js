const { body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');

exports.createAddressValidator = [
  body('alias')
    .notEmpty()
    .withMessage('Alias field is required')
    .custom(async (val) => {
      const user = await User.findOne({ alias: val });
      if (user) {
        const hasAddressWithAlias = user.addresses.some(
          (el) => el.alias === val,
        );
        if (hasAddressWithAlias) {
          throw new Error(
            `You are already have an address with this name (${val})`,
          );
        }
      }
      return true;
    }),
  body('details').notEmpty().withMessage('Details field is required'),

  body('phone')
    .notEmpty()
    .withMessage('Phone field is required')
    .isMobilePhone('ar-SA')
    .withMessage('Invalid phone number only accept Saudi Arabian phone number'),

  body('city').notEmpty().withMessage('City field is required'),

  body('postalCode')
    .notEmpty()
    .withMessage('Postal code field is required')
    .isPostalCode('SA')
    .withMessage('Invalid postal code, only accept Saudi Arabian postal codes'),
  validatorMiddleware,
];
