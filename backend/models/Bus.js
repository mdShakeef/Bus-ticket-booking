const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: [true, 'Bus number is required'],
        unique: true,
        trim: true
    },
    busName: {
        type: String,
        required: [true, 'Bus name is required'],
        trim: true
    },
    busType: {
        type: String,
        required: true,
        enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper', 'Luxury']
    },
    from: {
        type: String,
        required: [true, 'Starting location is required'],
        trim: true
    },
    to: {
        type: String,
        required: [true, 'Destination is required'],
        trim: true
    },
    departureTime: {
        type: String,
        required: [true, 'Departure time is required']
    },
    arrivalTime: {
        type: String,
        required: [true, 'Arrival time is required']
    },
    duration: {
        type: String,
        required: true
    },
    totalSeats: {
        type: Number,
        required: [true, 'Total seats is required'],
        min: 1
    },
    availableSeats: {
        type: Number,
        required: true
    },
    fare: {
        type: Number,
        required: [true, 'Fare is required'],
        min: 0
    },
    amenities: [{
        type: String
    }],
    seatLayout: {
        rows: {
            type: Number,
            required: true
        },
        seatsPerRow: {
            type: Number,
            required: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
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

// Update timestamp on save
busSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Bus', busSchema);
