const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', authController.register);

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', authController.login);

// @desc    Get current logged in user (Protected Route)
// @route   GET /api/auth/me
router.get('/me', authMiddleware, authController.getMe);

// @desc    Update current logged in user (Protected Route)
// @route   PUT /api/auth/me
router.put('/me', authMiddleware, authController.updateMe);

module.exports = router;
