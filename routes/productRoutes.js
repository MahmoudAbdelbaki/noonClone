const express = require('express');
const router = express.Router();

const { authorizePermissions, authenticateUser } = require('../middleware/authMiddleware');

const { createProduct, getAllProducts } = require('../controllers/productController');

router
  .route('/')
  .post(authenticateUser, authorizePermissions('admin'), createProduct) 
  .get(getAllProducts); 

module.exports = router;