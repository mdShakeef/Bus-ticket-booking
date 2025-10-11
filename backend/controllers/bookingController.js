const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { validationResult } = require('express-validator');
const Razorpay = require('razorpay');
const localDB = require('../database/localDB');
const axios = require('axios'); // For PayHere API calls

// Initialize Razorpay
let razorpay = null;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } else {
        console.warn('Razorpay keys not configured. Online payments will be disabled.');
    }
} catch (error) {
    console.error('Razorpay initialization error:', error);
}

// PayHere configuration for Sri Lanka
const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
const PAYHERE_BASE_URL = 'https://sandbox.payhere.lk/pay/checkout'; // Use live URL for production

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Public
 */
const createBooking = async (req, res) => {
    try {
        console.log('📝 Creating booking with local database...');
        
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { busId, travelDate, seats, passengerDetails, paymentMethod } = req.body;

        console.log('Booking request data:', {
            busId,
            travelDate,
            seats,
            passengerDetails,
            paymentMethod
        });

        // Use local database if MongoDB is not available
        let useLocalDB = false;
        if (!mongoose.connection.readyState) {
            console.log('⚠️ MongoDB not available, using local database');
            useLocalDB = true;
        }

        let bus, user, booking, payment;

        if (useLocalDB) {
            // Use local database
            bus = localDB.findBusById(busId);
            if (!bus) {
                return res.status(404).json({
                    success: false,
                    message: 'Bus not found'
                });
            }

            // Check seat availability (simplified for local DB)
            const existingBookings = localDB.findBookings();
            const bookedSeats = existingBookings
                .filter(b => b.bus === busId && b.travelDate === travelDate && b.bookingStatus !== 'cancelled')
                .reduce((allSeats, booking) => {
                    return allSeats.concat(booking.seats.map(seat => seat.seatNumber));
                }, []);

            const requestedSeats = seats.map(seat => seat.seatNumber);
            const conflictingSeats = requestedSeats.filter(seat => bookedSeats.includes(seat));

            if (conflictingSeats.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Seats ${conflictingSeats.join(', ')} are already booked`
                });
            }

            // Create or find user
            user = localDB.findUserByEmail(passengerDetails.email);
            if (!user) {
                user = localDB.createUser({
                    name: passengerDetails.name,
                    email: passengerDetails.email,
                    phone: passengerDetails.phone
                });
            }

            // Calculate total fare
            const totalFare = bus.fare * seats.length;

            // Create booking
            booking = localDB.createBooking({
                user: user._id,
                bus: busId,
                travelDate,
                seats,
                totalSeats: seats.length,
                totalFare,
                paymentMethod,
                paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
                passengerDetails
            });

            // Create payment record
            payment = localDB.createPayment({
                booking: booking._id,
                amount: totalFare,
                paymentMethod,
                paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending'
            });

            // Add bus details to booking for response
            booking.bus = bus;
            booking.user = user;

        } else {
            // Use MongoDB (original code)
            bus = await Bus.findById(busId);
            if (!bus) {
                return res.status(404).json({
                    success: false,
                    message: 'Bus not found'
                });
            }

            // Check seat availability
            const existingBookings = await Booking.find({
                bus: busId,
                travelDate: {
                    $gte: new Date(travelDate),
                    $lt: new Date(new Date(travelDate).getTime() + 24 * 60 * 60 * 1000)
                },
                bookingStatus: { $ne: 'cancelled' }
            });

            const bookedSeats = existingBookings.reduce((allSeats, booking) => {
                return allSeats.concat(booking.seats.map(seat => seat.seatNumber));
            }, []);

            const requestedSeats = seats.map(seat => seat.seatNumber);
            const conflictingSeats = requestedSeats.filter(seat => bookedSeats.includes(seat));

            if (conflictingSeats.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Seats ${conflictingSeats.join(', ')} are already booked`
                });
            }

            // Create or find user
            user = await User.findOne({ email: passengerDetails.email });
            if (!user) {
                user = await User.create({
                    name: passengerDetails.name,
                    email: passengerDetails.email,
                    phone: passengerDetails.phone
                });
            }

            // Calculate total fare
            const totalFare = bus.fare * seats.length;

            // Create booking
            booking = await Booking.create({
                user: user._id,
                bus: busId,
                travelDate: new Date(travelDate),
                seats,
                totalSeats: seats.length,
                totalFare,
                paymentMethod,
                paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
                passengerDetails
            });

            // Create payment record
            payment = await Payment.create({
                booking: booking._id,
                amount: totalFare,
                paymentMethod,
                paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending'
            });

            // Populate booking data for response
            await booking.populate('bus', 'busNumber busName from to departureTime arrivalTime');
            await booking.populate('user', 'name email phone');
        }

        // Handle payment methods
        let payhereOrder = null;
        if (paymentMethod === 'online') {
            // Use PayHere for Sri Lanka
            if (!PAYHERE_MERCHANT_ID || !PAYHERE_MERCHANT_SECRET) {
                return res.status(400).json({
                    success: false,
                    message: 'Online payment is not configured. Please use cash payment.'
                });
            }

            // Create PayHere payment request
            const payhereData = {
                merchant_id: PAYHERE_MERCHANT_ID,
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-cancel`,
                notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bookings/payhere-notify`,
                first_name: passengerDetails.name.split(' ')[0],
                last_name: passengerDetails.name.split(' ').slice(1).join(' '),
                email: passengerDetails.email,
                phone: passengerDetails.phone,
                address: 'Sri Lanka',
                city: 'Colombo',
                country: 'Sri Lanka',
                order_id: booking.ticketNumber,
                items: `Bus Ticket - ${booking.bus.busName || selectedBus.busName}`,
                currency: 'LKR',
                amount: totalFare * 100, // PayHere expects amount in cents
                hash: generatePayHereHash(booking.ticketNumber, totalFare * 100, 'LKR', PAYHERE_MERCHANT_SECRET)
            };

            // Send request to PayHere
            try {
                const response = await axios.post(PAYHERE_BASE_URL, payhereData);
                payhereOrder = {
                    payment_url: response.data.data.payment_url,
                    order_id: booking.ticketNumber
                };
            } catch (error) {
                console.error('PayHere payment creation error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to initiate online payment. Please try cash payment.'
                });
            }
        }

        console.log('✅ Booking created successfully:', booking.ticketNumber);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                booking,
                payhereOrder
            }
        });

    } catch (error) {
        console.error('Create booking error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        res.status(500).json({
            success: false,
            message: 'Server error while creating booking',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

function generatePayHereHash(orderId, amount, currency, secret) {
    const hash = require('crypto').createHash('md5');
    hash.update(`${secret}${orderId}${amount}${currency}`);
    return hash.digest('hex');
}

/**
 * @desc    Handle PayHere notification
 * @route   POST /api/bookings/payhere-notify
 * @access  Public
 */
const handlePayHereNotification = async (req, res) => {
    try {
        const { order_id, payment_id, status_code, status_message } = req.body;

        if (status_code === '2') { // Payment successful
            // Find booking by ticket number
            const booking = await Booking.findOne({ ticketNumber: order_id });
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            // Update booking and payment status
            booking.paymentStatus = 'completed';
            booking.paymentDetails = {
                payherePaymentId: payment_id,
                paidAt: new Date()
            };
            await booking.save();

            await Payment.findOneAndUpdate(
                { booking: booking._id },
                {
                    paymentStatus: 'completed',
                    payherePaymentId: payment_id,
                    paidAt: new Date()
                }
            );

            res.status(200).json({ success: true, message: 'Payment verified' });
        } else {
            res.status(400).json({ success: false, message: status_message });
        }
    } catch (error) {
        console.error('PayHere notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Verify payment and update booking
 * @route   POST /api/bookings/verify-payment
 * @access  Public
 */
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        // Verify signature
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Update booking
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                paymentStatus: 'completed',
                'paymentDetails.razorpayPaymentId': razorpay_payment_id,
                'paymentDetails.razorpaySignature': razorpay_signature,
                'paymentDetails.paidAt': new Date()
            },
            { new: true }
        );

        // Update payment record
        await Payment.findOneAndUpdate(
            { booking: bookingId },
            {
                paymentStatus: 'completed',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                paidAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: booking
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during payment verification'
        });
    }
};

/**
 * @desc    Get booking by ticket number
 * @route   GET /api/bookings/ticket/:ticketNumber
 * @access  Public
 */
const getBookingByTicket = async (req, res) => {
    try {
        const booking = await Booking.findOne({ ticketNumber: req.params.ticketNumber })
            .populate('bus', 'busNumber busName from to departureTime arrivalTime busType')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching booking'
        });
    }
};

/**
 * @desc    Get all bookings (Admin)
 * @route   GET /api/bookings
 * @access  Private (Admin)
 */
const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, paymentStatus } = req.query;

        let query = {};
        if (status) query.bookingStatus = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        const bookings = await Booking.find(query)
            .populate('bus', 'busNumber busName from to departureTime')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: bookings
        });

    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bookings'
        });
    }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Public
 */
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be cancelled (e.g., not within 2 hours of departure)
        const travelDateTime = new Date(booking.travelDate);
        const bus = await Bus.findById(booking.bus);
        const [hours, minutes] = bus.departureTime.split(':');
        travelDateTime.setHours(parseInt(hours), parseInt(minutes));

        const now = new Date();
        const timeDiff = travelDateTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);

        if (hoursDiff < 2) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel booking within 2 hours of departure'
            });
        }

        // Update booking status
        booking.bookingStatus = 'cancelled';
        await booking.save();

        // If payment was completed, initiate refund process
        if (booking.paymentStatus === 'completed' && booking.paymentMethod === 'online') {
            // Here you would implement refund logic with Razorpay
            // For now, just update payment status
            await Payment.findOneAndUpdate(
                { booking: booking._id },
                { paymentStatus: 'refunded', refundedAt: new Date() }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling booking'
        });
    }
};

/**
 * @desc    Get booking statistics (Admin)
 * @route   GET /api/bookings/stats
 * @access  Private (Admin)
 */
const getBookingStats = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
        const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
        const completedPayments = await Booking.countDocuments({ paymentStatus: 'completed' });
        
        const totalRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalFare' } } }
        ]);

        const todayBookings = await Booking.countDocuments({
            createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalBookings,
                confirmedBookings,
                cancelledBookings,
                completedPayments,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
                todayBookings
            }
        });

    } catch (error) {
        console.error('Get booking stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching booking statistics'
        });
    }
};

module.exports = {
    createBooking,
    verifyPayment,
    getBookingByTicket,
    getAllBookings,
    cancelBooking,
    getBookingStats,
    handlePayHereNotification
};
