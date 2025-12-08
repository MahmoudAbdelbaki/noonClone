const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authMiddleware');

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require('../controllers/orderController');

router
  .route('/')
  .post(authenticateUser, createOrder) // Create Order  
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders); // Get All Orders (Admin only)

router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders); // Get Current User Orders

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder) // Get Single Order
  .patch(authenticateUser, updateOrder); // Update Order (e.g., Payment Status)

module.exports = router;