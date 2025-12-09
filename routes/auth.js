const express = require('express');
const router = express.Router();

// Import controllers
const { register, login, getMe } = require('../controllers/auth');

// Import your middleware (adjust path if needed)
const { authenticateUser } = require('../middleware/authMiddleware.js'); // or wherever you saved authorizePermissions

// Map the routes
router.post('/register', register);
router.post('/login', login);

// NEW ROUTE: Protected by middleware
router.get('/me', authenticateUser, getMe);

module.exports = router;