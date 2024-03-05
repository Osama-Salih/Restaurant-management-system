const factory = require('./handlerFactroy');
const Menu = require('../models/MenuModel');

// @desc   Get all menus
// @route  GET /api/v1/menus
// @access Private/Admin-owner
exports.getAllMenus = factory.getAll(Menu);

// @desc   Get specific menu by id
// @route  GET /api/v1/menus/:id
// @access Public
exports.getMenu = factory.getOne(Menu);

// @desc   Create menu
// @route  POST /api/v1/menus
// @access Private-admin-owner
exports.createMenu = factory.createOne(Menu);

// @desc   Update specific menu by id
// @route  PUT /api/v1/menus/:id
// @access Private-admin-owner
exports.updateMenu = factory.updateOne(Menu);

// @desc   Delete specific menu by id
// @route  DELETE /api/v1/menus/:id
// @access Private-admin-owner
exports.deleteMenu = factory.deleteOne(Menu);
