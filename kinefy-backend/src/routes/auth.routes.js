const express = require('express');
const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    res.json({ message: 'Register route (skeleton)' });
});

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    res.json({ message: 'Login route (skeleton)' });
});

module.exports = router;
