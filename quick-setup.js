const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Setup for Bus Booking System...\n');

// Create .env file with MongoDB Atlas connection
const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Configuration (Free Cloud Database)
MONGODB_URI=mongodb+srv://bususer:buspass123@cluster0.mongodb.net/bus_booking_system?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_in_production_bus_booking_2024

# Razorpay Configuration (Disabled for Sri Lanka)
RAZORPAY_KEY_ID=disabled_for_sri_lanka
RAZORPAY_KEY_SECRET=disabled_for_sri_lanka

# Admin Default Credentials
ADMIN_EMAIL=admin@busticket.com
ADMIN_PASSWORD=Admin@123
`;

const envPath = path.join(__dirname, 'backend', '.env');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with MongoDB Atlas configuration');
    console.log('📊 Database: MongoDB Atlas (Cloud)');
    console.log('🔒 Payment: Cash only (Sri Lanka configuration)');
    console.log('\n🎯 Next Steps:');
    console.log('1. cd backend');
    console.log('2. npm install');
    console.log('3. node seedData.js');
    console.log('4. npm start');
    console.log('\n💡 This uses a free MongoDB Atlas cluster - no local installation needed!');
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
}
