const express = require('express');
const router = express.Router();

const { authorizePermissions, authenticateUser } = require('../middleware/authMiddleware');

const { createProduct, getAllProducts ,getProduct, updateProduct, deleteProduct} = require('../controllers/productController');

router
  .route('/')
  .post(authenticateUser, authorizePermissions('admin'), createProduct) 
  .get(getAllProducts); 

router
.route('/:id')
.get(getProduct)
.patch(authenticateUser, authorizePermissions('admin'), updateProduct)
.delete(authenticateUser, authorizePermissions('admin'), deleteProduct);

module.exports = router;