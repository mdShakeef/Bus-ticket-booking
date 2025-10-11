const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    travelDate: {
        type: Date,
        required: [true, 'Travel date is required']
    },
    seats: [{
        seatNumber: {
            type: String,
            required: true
        }
    }],
    totalSeats: {
        type: Number,
        required: true
    },
    totalFare: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['online', 'cash'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        paidAt: Date
    },
    bookingStatus: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    passengerDetails: {
        name: String,
        email: String,
        phone: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique ticket number
bookingSchema.pre('save', async function(next) {
    if (!this.ticketNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.ticketNumber = `BKT${timestamp}${random}`;
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
