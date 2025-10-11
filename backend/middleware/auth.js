const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get admin from token
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized - admin not found'
                });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized - token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized - no token'
        });
    }
};

/**
 * Admin role check
 */
const adminOnly = (req, res, next) => {
    if (req.admin && (req.admin.role === 'admin' || req.admin.role === 'superadmin')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied - admin role required'
        });
    }
};

module.exports = {
    generateToken,
    protect,
    adminOnly
};
