const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const localDB = require('../database/localDB');

/**
 * @desc    Get all buses
 * @route   GET /api/buses
 * @access  Public
 */
const getAllBuses = async (req, res) => {
    try {
        const { from, to, date } = req.query;
        
        // Use local database if MongoDB is not available
        if (!mongoose.connection.readyState) {
            console.log('⚠️ MongoDB not available, using local database for buses');
            
            let buses = localDB.findBuses({ from, to });
            
            // If date is provided, calculate available seats for that date
            if (date && buses.length > 0) {
                const busesWithAvailability = buses.map((bus) => {
                    const bookings = localDB.findBookings();
                    const busBookings = bookings.filter(booking => 
                        booking.bus === bus._id && 
                        booking.travelDate === date && 
                        booking.bookingStatus !== 'cancelled'
                    );

                    const bookedSeats = busBookings.reduce((total, booking) => {
                        return total + booking.totalSeats;
                    }, 0);

                    return {
                        ...bus,
                        availableSeats: bus.totalSeats - bookedSeats,
                        bookedSeats
                    };
                });

                return res.status(200).json({
                    success: true,
                    count: busesWithAvailability.length,
                    data: busesWithAvailability
                });
            }

            return res.status(200).json({
                success: true,
                count: buses.length,
                data: buses
            });
        }

        // Use MongoDB (original code)
        let query = { isActive: true };
        
        // Filter by route if provided
        if (from && to) {
            query.from = new RegExp(from, 'i');
            query.to = new RegExp(to, 'i');
        }

        const buses = await Bus.find(query).sort({ departureTime: 1 });

        // If date is provided, calculate available seats for that date
        if (date && buses.length > 0) {
            const busesWithAvailability = await Promise.all(
                buses.map(async (bus) => {
                    const bookings = await Booking.find({
                        bus: bus._id,
                        travelDate: {
                            $gte: new Date(date),
                            $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                        },
                        bookingStatus: { $ne: 'cancelled' }
                    });

                    const bookedSeats = bookings.reduce((total, booking) => {
                        return total + booking.totalSeats;
                    }, 0);

                    return {
                        ...bus.toObject(),
                        availableSeats: bus.totalSeats - bookedSeats,
                        bookedSeats
                    };
                })
            );

            return res.status(200).json({
                success: true,
                count: busesWithAvailability.length,
                data: busesWithAvailability
            });
        }

        res.status(200).json({
            success: true,
            count: buses.length,
            data: buses
        });

    } catch (error) {
        console.error('Get buses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching buses'
        });
    }
};

/**
 * @desc    Get single bus
 * @route   GET /api/buses/:id
 * @access  Public
 */
const getBus = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bus
        });

    } catch (error) {
        console.error('Get bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bus'
        });
    }
};

/**
 * @desc    Create new bus
 * @route   POST /api/buses
 * @access  Private (Admin)
 */
const createBus = async (req, res) => {
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

        const busData = req.body;
        busData.availableSeats = busData.totalSeats;

        const bus = await Bus.create(busData);

        res.status(201).json({
            success: true,
            message: 'Bus created successfully',
            data: bus
        });

    } catch (error) {
        console.error('Create bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating bus'
        });
    }
};

/**
 * @desc    Update bus
 * @route   PUT /api/buses/:id
 * @access  Private (Admin)
 */
const updateBus = async (req, res) => {
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

        const bus = await Bus.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bus updated successfully',
            data: bus
        });

    } catch (error) {
        console.error('Update bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating bus'
        });
    }
};

/**
 * @desc    Delete bus
 * @route   DELETE /api/buses/:id
 * @access  Private (Admin)
 */
const deleteBus = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        // Check if there are any active bookings
        const activeBookings = await Booking.find({
            bus: req.params.id,
            bookingStatus: { $ne: 'cancelled' },
            travelDate: { $gte: new Date() }
        });

        if (activeBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete bus with active bookings'
            });
        }

        await Bus.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Bus deleted successfully'
        });

    } catch (error) {
        console.error('Delete bus error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting bus'
        });
    }
};

/**
 * @desc    Get bus seat layout and availability
 * @route   GET /api/buses/:id/seats
 * @access  Public
 */
const getBusSeats = async (req, res) => {
    try {
        const { date } = req.query;
        
        // Use local database if MongoDB is not available
        if (!mongoose.connection.readyState) {
            console.log('⚠️ MongoDB not available, using local database for bus seats');
            
            const bus = localDB.findBusById(req.params.id);
            if (!bus) {
                return res.status(404).json({
                    success: false,
                    message: 'Bus not found'
                });
            }

            let bookedSeats = [];
            
            if (date) {
                const bookings = localDB.findBookings();
                const busBookings = bookings.filter(booking => 
                    booking.bus === req.params.id && 
                    booking.travelDate === date && 
                    booking.bookingStatus !== 'cancelled'
                );

                bookedSeats = busBookings.reduce((seats, booking) => {
                    return seats.concat(booking.seats.map(seat => seat.seatNumber));
                }, []);
            }

            return res.status(200).json({
                success: true,
                data: {
                    bus: {
                        id: bus._id,
                        busNumber: bus.busNumber,
                        busName: bus.busName,
                        totalSeats: bus.totalSeats,
                        seatLayout: bus.seatLayout || { rows: 10, seatsPerRow: 4 },
                        fare: bus.fare
                    },
                    bookedSeats,
                    availableSeats: bus.totalSeats - bookedSeats.length
                }
            });
        }

        // Use MongoDB (original code)
        const bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        let bookedSeats = [];
        
        if (date) {
            const bookings = await Booking.find({
                bus: req.params.id,
                travelDate: {
                    $gte: new Date(date),
                    $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                },
                bookingStatus: { $ne: 'cancelled' }
            });

            bookedSeats = bookings.reduce((seats, booking) => {
                return seats.concat(booking.seats.map(seat => seat.seatNumber));
            }, []);
        }

        res.status(200).json({
            success: true,
            data: {
                bus: {
                    id: bus._id,
                    busNumber: bus.busNumber,
                    busName: bus.busName,
                    totalSeats: bus.totalSeats,
                    seatLayout: bus.seatLayout,
                    fare: bus.fare
                },
                bookedSeats,
                availableSeats: bus.totalSeats - bookedSeats.length
            }
        });

    } catch (error) {
        console.error('Get bus seats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching seat information'
        });
    }
};

module.exports = {
    getAllBuses,
    getBus,
    createBus,
    updateBus,
    deleteBus,
    getBusSeats
};
