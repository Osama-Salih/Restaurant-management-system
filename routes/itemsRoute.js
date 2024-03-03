const express = require('express');
const authService = require('../services/authService');
const { filterForOwner } = require('../middlewares/filterMiddleware');

const {
  getItemValidator,
  createItemValidator,
  updateItemValidator,
  deleteItemValidator,
} = require('../utils/validators/itemsValidator');

const {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  setCategoryIdToBody,
  uploadItemImage,
  uploadFileToCloudinary,
} = require('../services/itemsService');

const router = express.Router({ mergeParams: true });

router.use(authService.protect, authService.allowedTo('admin', 'owner'));
router
  .route('/')
  .get(filterForOwner, getAllItems)
  .post(
    uploadItemImage,
    uploadFileToCloudinary,
    setCategoryIdToBody,
    createItemValidator,
    createItem,
  );

router
  .route('/:id')
  .get(getItemValidator, getItem)
  .patch(
    uploadItemImage,
    uploadFileToCloudinary,
    updateItemValidator,
    updateItem,
  )
  .delete(deleteItemValidator, deleteItem);

module.exports = router;
