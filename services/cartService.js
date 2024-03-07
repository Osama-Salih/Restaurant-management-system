const asyncHandler = require('express-async-handler');
const Item = require('../models/itemsModel');
const ApiError = require('../utils/ApiError');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((el) => {
    totalPrice += el.price * el.quantity;
  });
  cart.totalCartPrice = totalPrice;
};

const sendResponseWithCart = async (cart, message, res) => {
  // ) calc total cart price
  calcTotalCartPrice(cart);
  await cart.save();
  // ) send response to client with message
  res.status(200).json({
    status: 'success',
    numOfItems: cart.cartItems.length,
    data: cart,
    message,
  });
};

// @desc   Enable user to add item to cart
// @route  POST /api/v1/carts
// @access Private/user
exports.addItemToCart = asyncHandler(async (req, res) => {
  // 1) Get logged user carte
  let cart = await Cart.findOne({ user: req.user._id });
  const { itemId } = req.body;
  const item = await Item.findById(itemId);

  if (!cart) {
    // 2) If no cart create cart and push item to it
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ item: itemId, price: item.price }],
    });
  } else {
    // 3) if item exists update item quantity
    const itemIndex = cart.cartItems.findIndex(
      (el) => el.item.toString() === item._id.toString(),
    );

    if (itemIndex > -1) {
      const cartItem = cart.cartItems[itemIndex];
      cartItem.quantity += 1;
      cart.cartItems[itemIndex] = cartItem;
    } else {
      // 4) push item to cartItems array
      cart.cartItems.push({ item: itemId, price: item.price });
    }
  }
  // send response to client with message
  await sendResponseWithCart(cart, 'Item added to cart successfully', res);
});

// @desc   Enable user to get his cart
// @route  GET /api/v1/carts
// @access Private/user
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError(`You don't have cart yet`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// @desc   Enable user to remove item from cart
// @route  DELET /api/v1/carts/:itemId
// @access Private/user
exports.removeItemFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { item: req.params.itemId } },
    },
    { new: true },
  );

  //  send response to client with message
  await sendResponseWithCart(cart, 'Item remove from cart successfully', res);
});

// @desc   Enable user to clear his cart
// @route  DELET /api/v1/carts
// @access Private/user
exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// @desc   Enable user to update cart item quantity on his cart
// @route  PATCH /api/v1/carts/:itemId
// @access Private/user
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const { quantity } = req.body;

  if (!cart) {
    return next(new ApiError(`You don't have cart yet`, 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (el) => el.item.toString() === req.params.itemId,
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  }
  // send response to client with message
  await sendResponseWithCart(cart, 'Quantity updated successfully', res);
});

// @desc   Enable user to apply coupon on it's cart
// @route  PATCH /api/v1/carts/applyCoupon
// @access Private/user
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on it's name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError('Invalid coupon or expired'));
  }

  // 2) Get user cart based on user id
  const cart = await Cart.findOne({ user: req.user._id });
  const { totalCartPrice } = cart;

  // 3) Calc total price after discount
  const totalPriceAfterDiscount =
    totalCartPrice - (totalCartPrice * coupon.discount) / 100;

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  // send response to client with message
  await sendResponseWithCart(cart, 'Coupon applyed successfully', res);
});
