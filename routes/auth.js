const express = require('express');
const router = express.Router();

// Import the controller functions we just created
const { register, login } = require('../controllers/auth');

// Map the routes
router.post('/register', register);
router.post('/login', login);

module.exports = router;