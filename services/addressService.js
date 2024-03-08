const asynchandler = require('express-async-handler');
const User = require('../models/userModel');

// @dec    Add address
// @route  GET api/v1/addresses
// @access Private/user
exports.addAddress = asynchandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    message: 'address added successfully',
    data: {
      addresses: user.addresses,
    },
  });
});

// @dec    Remove address
// @route  DELETE api/v1/addresses/:addressId
// @access Private/user
exports.removeAddress = asynchandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true },
  );

  res.status(200).json({
    status: 'success',
    message: 'Address removed successfully',
    data: {
      addresses: user.addresses,
    },
  });
});

// @dec    Get logged user address
// @route  GET api/v1/addresses
// @access Private/user
exports.getLoggedUserAddress = asynchandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('addresses');
  res.status(200).json({
    status: 'success',
    results: user.addresses.length,
    data: {
      addresses: user.addresses,
    },
  });
});
