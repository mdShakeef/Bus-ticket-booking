const fs = require('fs');
const path = require('path');

// Create .env file from .env.example if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from .env.example...');
    
    try {
        const envExample = fs.readFileSync(envExamplePath, 'utf8');
        
        // Replace placeholder values with working defaults
        const envContent = envExample
            .replace('your_jwt_secret_key_here_change_in_production', 'your_super_secret_jwt_key_for_development_only')
            .replace('your_razorpay_key_id', 'rzp_test_dummy_key_id')
            .replace('your_razorpay_key_secret', 'dummy_secret_key');
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created successfully!');
        console.log('📋 Configuration:');
        console.log('   - MongoDB: mongodb://localhost:27017/bus_booking_system');
        console.log('   - Port: 5000');
        console.log('   - Admin Email: admin@busticket.com');
        console.log('   - Admin Password: Admin@123');
        console.log('   - Payment: Cash only (suitable for Sri Lanka)');
        console.log('');
        console.log('✅ System configured for Sri Lankan market with cash payments');
        
    } catch (error) {
        console.error('❌ Error creating .env file:', error.message);
    }
} else {
    console.log('✅ .env file already exists');
}

console.log('');
console.log('🚀 Next steps:');
console.log('1. Make sure MongoDB is running');
console.log('2. Run: npm install');
console.log('3. Run: node seedData.js');
console.log('4. Run: npm start');
console.log('');
console.log('💡 Cash payment system is now ready for Sri Lankan users!');
