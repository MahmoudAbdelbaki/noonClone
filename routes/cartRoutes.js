const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware'); // Adjust path as needed

// Import all cart controller functions
const {
    getCart,         // GET /api/v1/cart
    addOrUpdateItem, // POST /api/v1/cart
    removeItem,      // DELETE /api/v1/cart/:itemId
    clearCart,       // PATCH /api/v1/cart/clear
} = require('../controllers/cartController'); // Adjust path as needed


// --- Public Routes ---
// The base route handles both fetching the cart and adding/updating items.
router
    .route('/')
    .get(authenticateUser, getCart) // Fetch Cart
    .post(authenticateUser, addOrUpdateItem);

// --- Clear Cart Route ---
// Using PATCH here is conventional for an operation that modifies the state of the resource (clearing contents)
router
    .route('/clear')
    .patch(authenticateUser, clearCart);


// --- Specific Item Route ---
// Handles deleting a single item from the cart.
router
    .route('/:itemId')
    .delete(authenticateUser, removeItem);


module.exports = router;