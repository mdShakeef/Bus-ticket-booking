const fs = require('fs');
const path = require('path');

// Local JSON database for development
class LocalDB {
    constructor() {
        this.dbPath = path.join(__dirname, 'data.json');
        this.initDB();
    }

    initDB() {
        if (!fs.existsSync(this.dbPath)) {
            const initialData = {
                buses: [
                    {
                        _id: "bus1",
                        busNumber: "MH12AB1234",
                        busName: "Scania Luxury",
                        from: "Mumbai",
                        to: "Pune",
                        departureTime: "06:00",
                        arrivalTime: "09:30",
                        fare: 450,
                        totalSeats: 40,
                        busType: "AC Sleeper",
                        amenities: ["AC", "WiFi", "Charging Point", "Entertainment"]
                    },
                    {
                        _id: "bus2",
                        busNumber: "KA05CD5678",
                        busName: "Volvo Express",
                        from: "Bangalore",
                        to: "Chennai",
                        departureTime: "22:00",
                        arrivalTime: "06:00",
                        fare: 650,
                        totalSeats: 35,
                        busType: "AC Sleeper",
                        amenities: ["AC", "WiFi", "Blanket", "Pillow"]
                    }
                ],
                bookings: [],
                users: [],
                payments: []
            };
            fs.writeFileSync(this.dbPath, JSON.stringify(initialData, null, 2));
        }
    }

    readData() {
        return JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
    }

    writeData(data) {
        fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    }

    // Bus methods
    findBuses(query = {}) {
        const data = this.readData();
        let buses = data.buses;
        
        if (query.from && query.to) {
            buses = buses.filter(bus => 
                bus.from.toLowerCase() === query.from.toLowerCase() && 
                bus.to.toLowerCase() === query.to.toLowerCase()
            );
        }
        
        return buses;
    }

    findBusById(id) {
        const data = this.readData();
        return data.buses.find(bus => bus._id === id);
    }

    // Booking methods
    createBooking(bookingData) {
        const data = this.readData();
        const booking = {
            _id: 'booking_' + Date.now(),
            ticketNumber: 'TKT' + Date.now(),
            createdAt: new Date().toISOString(),
            bookingStatus: 'confirmed',
            ...bookingData
        };
        
        data.bookings.push(booking);
        this.writeData(data);
        return booking;
    }

    findBookings(query = {}) {
        const data = this.readData();
        return data.bookings;
    }

    // User methods
    createUser(userData) {
        const data = this.readData();
        const user = {
            _id: 'user_' + Date.now(),
            createdAt: new Date().toISOString(),
            ...userData
        };
        
        data.users.push(user);
        this.writeData(data);
        return user;
    }

    findUserByEmail(email) {
        const data = this.readData();
        return data.users.find(user => user.email === email);
    }

    // Payment methods
    createPayment(paymentData) {
        const data = this.readData();
        const payment = {
            _id: 'payment_' + Date.now(),
            createdAt: new Date().toISOString(),
            ...paymentData
        };
        
        data.payments.push(payment);
        this.writeData(data);
        return payment;
    }
}

module.exports = new LocalDB();
