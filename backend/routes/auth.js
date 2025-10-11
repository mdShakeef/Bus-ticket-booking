const express = require('express');
const { body } = require('express-validator');
const { loginAdmin, getProfile, createAdmin } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], loginAdmin);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current admin profile
 * @access  Private (Admin)
 */
router.get('/profile', protect, adminOnly, getProfile);

/**
 * @route   POST /api/auth/create-admin
 * @desc    Create new admin (Super admin only)
 * @access  Private (Super Admin)
 */
router.post('/create-admin', [
    protect,
    adminOnly,
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .optional()
        .isIn(['admin', 'superadmin'])
        .withMessage('Role must be either admin or superadmin')
], createAdmin);

module.exports = router;
