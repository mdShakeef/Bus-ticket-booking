const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        trim: true
    },
    age: {
        type: Number,
        min: 1
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
