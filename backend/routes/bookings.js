const express = require('express');
const { body } = require('express-validator');
const {
    createBooking,
    verifyPayment,
    getBookingByTicket,
    getAllBookings,
    cancelBooking,
    getBookingStats,
    handlePayHereNotification
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Booking validation rules
const bookingValidation = [
    body('busId')
        .isMongoId()
        .withMessage('Invalid bus ID'),
    body('travelDate')
        .isISO8601()
        .withMessage('Invalid travel date'),
    body('seats')
        .isArray({ min: 1 })
        .withMessage('At least one seat must be selected'),
    body('seats.*.seatNumber')
        .notEmpty()
        .withMessage('Seat number is required'),
    body('passengerDetails.name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Passenger name must be at least 2 characters'),
    body('passengerDetails.email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('passengerDetails.phone')
        .matches(/^(\+94|0)?[1-9]\d{8}$/)
        .withMessage('Valid Sri Lankan phone number is required (e.g., +94771234567 or 0771234567)'),
    body('paymentMethod')
        .isIn(['online', 'cash'])
        .withMessage('Payment method must be online or cash')
];

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 * @access  Public
 */
router.post('/', bookingValidation, createBooking);

/**
 * @route   POST /api/bookings/verify-payment
 * @desc    Verify Razorpay payment
 * @access  Public
 */
router.post('/verify-payment', [
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature is required'),
    body('bookingId').isMongoId().withMessage('Valid booking ID is required')
], verifyPayment);

/**
 * @route   POST /api/bookings/payhere-notify
 * @desc    Handle PayHere payment notification
 * @access  Public
 */
router.post('/payhere-notify', handlePayHereNotification);

/**
 * @route   GET /api/bookings/ticket/:ticketNumber
 * @desc    Get booking by ticket number
 * @access  Public
 */
router.get('/ticket/:ticketNumber', getBookingByTicket);

/**
 * @route   GET /api/bookings/stats
 * @desc    Get booking statistics
 * @access  Private (Admin)
 */
router.get('/stats', protect, adminOnly, getBookingStats);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings with pagination
 * @access  Private (Admin)
 */
router.get('/', protect, adminOnly, getAllBookings);

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Public
 */
router.put('/:id/cancel', cancelBooking);

module.exports = router;
