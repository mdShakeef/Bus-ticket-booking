const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

/**
 * @desc    Admin login
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if admin exists
        const admin = await Admin.findOne({ email }).select('+password');
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Validate password
        const isPasswordValid = await admin.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(admin._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

/**
 * @desc    Get current admin profile
 * @route   GET /api/auth/profile
 * @access  Private (Admin)
 */
const getProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id);
        
        res.status(200).json({
            success: true,
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    createdAt: admin.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Create new admin (Super admin only)
 * @route   POST /api/auth/create-admin
 * @access  Private (Super Admin)
 */
const createAdmin = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, role } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }

        // Create new admin
        const admin = await Admin.create({
            name,
            email,
            password,
            role: role || 'admin'
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            }
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin creation'
        });
    }
};

module.exports = {
    loginAdmin,
    getProfile,
    createAdmin
};
