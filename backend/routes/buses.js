const express = require('express');
const { body } = require('express-validator');
const {
    getAllBuses,
    getBus,
    createBus,
    updateBus,
    deleteBus,
    getBusSeats
} = require('../controllers/busController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Bus validation rules
const busValidation = [
    body('busNumber')
        .trim()
        .notEmpty()
        .withMessage('Bus number is required'),
    body('busName')
        .trim()
        .notEmpty()
        .withMessage('Bus name is required'),
    body('busType')
        .isIn(['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper', 'Luxury'])
        .withMessage('Invalid bus type'),
    body('from')
        .trim()
        .notEmpty()
        .withMessage('Starting location is required'),
    body('to')
        .trim()
        .notEmpty()
        .withMessage('Destination is required'),
    body('departureTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid departure time format (HH:MM)'),
    body('arrivalTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid arrival time format (HH:MM)'),
    body('totalSeats')
        .isInt({ min: 1, max: 60 })
        .withMessage('Total seats must be between 1 and 60'),
    body('fare')
        .isFloat({ min: 0 })
        .withMessage('Fare must be a positive number'),
    body('seatLayout.rows')
        .isInt({ min: 1 })
        .withMessage('Rows must be at least 1'),
    body('seatLayout.seatsPerRow')
        .isInt({ min: 1 })
        .withMessage('Seats per row must be at least 1')
];

/**
 * @route   GET /api/buses
 * @desc    Get all buses with optional filtering
 * @access  Public
 */
router.get('/', getAllBuses);

/**
 * @route   GET /api/buses/:id
 * @desc    Get single bus
 * @access  Public
 */
router.get('/:id', getBus);

/**
 * @route   GET /api/buses/:id/seats
 * @desc    Get bus seat layout and availability
 * @access  Public
 */
router.get('/:id/seats', getBusSeats);

/**
 * @route   POST /api/buses
 * @desc    Create new bus
 * @access  Private (Admin)
 */
router.post('/', protect, adminOnly, busValidation, createBus);

/**
 * @route   PUT /api/buses/:id
 * @desc    Update bus
 * @access  Private (Admin)
 */
router.put('/:id', protect, adminOnly, busValidation, updateBus);

/**
 * @route   DELETE /api/buses/:id
 * @desc    Delete bus
 * @access  Private (Admin)
 */
router.delete('/:id', protect, adminOnly, deleteBus);

module.exports = router;
