const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Admin = require('./models/Admin');
const Bus = require('./models/Bus');
const User = require('./models/User');

// Connect to database
const connectDB = require('./config/database');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await Admin.deleteMany({});
        await Bus.deleteMany({});
        await User.deleteMany({});

        // Create default admin
        console.log('👤 Creating default admin...');
        const admin = await Admin.create({
            name: 'System Administrator',
            email: process.env.ADMIN_EMAIL || 'admin@busticket.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123',
            role: 'superadmin'
        });
        console.log(`✅ Admin created: ${admin.email}`);

        // Create sample buses
        console.log('🚌 Creating sample buses...');
        const buses = [
            {
                busNumber: 'DL01AB1234',
                busName: 'Volvo Multi-Axle',
                busType: 'AC',
                from: 'Delhi',
                to: 'Mumbai',
                departureTime: '22:00',
                arrivalTime: '14:00',
                duration: '16h 00m',
                totalSeats: 40,
                availableSeats: 40,
                fare: 1200,
                amenities: ['AC', 'WiFi', 'Charging Point', 'Water Bottle', 'Blanket'],
                seatLayout: {
                    rows: 10,
                    seatsPerRow: 4
                }
            },
            {
                busNumber: 'MH02CD5678',
                busName: 'Scania Luxury',
                busType: 'Luxury',
                from: 'Mumbai',
                to: 'Pune',
                departureTime: '06:30',
                arrivalTime: '09:30',
                duration: '3h 00m',
                totalSeats: 32,
                availableSeats: 32,
                fare: 450,
                amenities: ['AC', 'Recliner Seats', 'Entertainment', 'Snacks'],
                seatLayout: {
                    rows: 8,
                    seatsPerRow: 4
                }
            },
            {
                busNumber: 'KA03EF9012',
                busName: 'Ashok Leyland Sleeper',
                busType: 'Sleeper',
                from: 'Bangalore',
                to: 'Chennai',
                departureTime: '23:30',
                arrivalTime: '06:00',
                duration: '6h 30m',
                totalSeats: 36,
                availableSeats: 36,
                fare: 800,
                amenities: ['AC', 'Sleeper Berths', 'Reading Light', 'Curtains'],
                seatLayout: {
                    rows: 12,
                    seatsPerRow: 3
                }
            },
            {
                busNumber: 'UP04GH3456',
                busName: 'Tata Semi-Sleeper',
                busType: 'Semi-Sleeper',
                from: 'Delhi',
                to: 'Jaipur',
                departureTime: '14:00',
                arrivalTime: '19:00',
                duration: '5h 00m',
                totalSeats: 44,
                availableSeats: 44,
                fare: 350,
                amenities: ['AC', 'Push Back Seats', 'Water Bottle'],
                seatLayout: {
                    rows: 11,
                    seatsPerRow: 4
                }
            },
            {
                busNumber: 'TN05IJ7890',
                busName: 'Mahindra Non-AC',
                busType: 'Non-AC',
                from: 'Chennai',
                to: 'Coimbatore',
                departureTime: '08:00',
                arrivalTime: '15:30',
                duration: '7h 30m',
                totalSeats: 50,
                availableSeats: 50,
                fare: 280,
                amenities: ['Fan', 'Water Bottle', 'Music System'],
                seatLayout: {
                    rows: 13,
                    seatsPerRow: 4
                }
            },
            {
                busNumber: 'GJ06KL1234',
                busName: 'Mercedes Luxury Coach',
                busType: 'Luxury',
                from: 'Ahmedabad',
                to: 'Mumbai',
                departureTime: '20:00',
                arrivalTime: '06:00',
                duration: '10h 00m',
                totalSeats: 28,
                availableSeats: 28,
                fare: 950,
                amenities: ['AC', 'Luxury Seats', 'Entertainment', 'WiFi', 'Meals'],
                seatLayout: {
                    rows: 7,
                    seatsPerRow: 4
                }
            },
            {
                busNumber: 'RJ07MN5678',
                busName: 'Rajasthan Roadways',
                busType: 'AC',
                from: 'Jaipur',
                to: 'Udaipur',
                departureTime: '07:30',
                arrivalTime: '14:00',
                duration: '6h 30m',
                totalSeats: 42,
                availableSeats: 42,
                fare: 420,
                amenities: ['AC', 'Comfortable Seats', 'Water Bottle'],
                seatLayout: {
                    rows: 11,
                    seatsPerRow: 4
                }
            },
            {
                busNumber: 'WB08OP9012',
                busName: 'Bengal Express',
                busType: 'Semi-Sleeper',
                from: 'Kolkata',
                to: 'Bhubaneswar',
                departureTime: '21:00',
                arrivalTime: '06:30',
                duration: '9h 30m',
                totalSeats: 38,
                availableSeats: 38,
                fare: 650,
                amenities: ['AC', 'Semi-Sleeper', 'Blanket', 'Water'],
                seatLayout: {
                    rows: 10,
                    seatsPerRow: 4
                }
            }
        ];

        const createdBuses = await Bus.insertMany(buses);
        console.log(`✅ Created ${createdBuses.length} buses`);

        // Create sample users
        console.log('👥 Creating sample users...');
        const users = [
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+91-9876543210',
                age: 28,
                gender: 'Male'
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '+91-9876543211',
                age: 25,
                gender: 'Female'
            },
            {
                name: 'Rahul Kumar',
                email: 'rahul.kumar@example.com',
                phone: '+91-9876543212',
                age: 32,
                gender: 'Male'
            }
        ];

        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} users`);

        console.log('\n🎉 Sample data seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log(`Email: ${admin.email}`);
        console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
        
        console.log('\n🚌 Sample Routes Available:');
        buses.forEach(bus => {
            console.log(`${bus.from} → ${bus.to} (${bus.busType}) - LKR${bus.fare}`);
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

// Run seed data
seedData();
