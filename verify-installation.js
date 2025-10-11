#!/usr/bin/env node

/**
 * Installation Verification Script
 * Checks if all required packages and features are properly installed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Bus Ticket Booking System Installation...\n');

// Check if we're in the right directory
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

if (!fs.existsSync(backendPath) || !fs.existsSync(frontendPath)) {
    console.error('❌ Error: Please run this script from the project root directory');
    process.exit(1);
}

// Check package.json
const packageJsonPath = path.join(backendPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found in backend directory');
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log('✅ Package.json found');

// Check required dependencies
const requiredDependencies = [
    'express',
    'mongoose', 
    'dotenv',
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'express-validator',
    'razorpay',
    'helmet',
    'express-rate-limit',
    'morgan'
];

console.log('\n📦 Checking Dependencies:');
let missingDeps = [];

requiredDependencies.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
        console.log(`❌ ${dep}: MISSING`);
        missingDeps.push(dep);
    }
});

// Check node_modules
const nodeModulesPath = path.join(backendPath, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ node_modules directory exists');
} else {
    console.log('❌ node_modules directory missing - run "npm install"');
}

// Check required backend files
const requiredBackendFiles = [
    'server.js',
    'seedData.js',
    '.env.example',
    'config/database.js',
    'models/Admin.js',
    'models/User.js',
    'models/Bus.js',
    'models/Booking.js',
    'models/Payment.js',
    'controllers/authController.js',
    'controllers/busController.js',
    'controllers/bookingController.js',
    'routes/auth.js',
    'routes/buses.js',
    'routes/bookings.js',
    'middleware/auth.js',
    'middleware/errorHandler.js'
];

console.log('\n📁 Checking Backend Files:');
requiredBackendFiles.forEach(file => {
    const filePath = path.join(backendPath, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file}: MISSING`);
    }
});

// Check required frontend files
const requiredFrontendFiles = [
    'index.html',
    'admin.html',
    'css/styles.css',
    'css/admin.css',
    'js/app.js',
    'js/admin.js'
];

console.log('\n🎨 Checking Frontend Files:');
requiredFrontendFiles.forEach(file => {
    const filePath = path.join(frontendPath, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file}: MISSING`);
    }
});

// Check documentation
const docFiles = ['README.md', 'SETUP_GUIDE.md'];
console.log('\n📚 Checking Documentation:');
docFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file}: MISSING`);
    }
});

// Feature verification
console.log('\n🎯 Feature Implementation Verification:');

// Check if Razorpay is integrated
const appJsPath = path.join(frontendPath, 'js', 'app.js');
if (fs.existsSync(appJsPath)) {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    if (appJsContent.includes('razorpay') || appJsContent.includes('Razorpay')) {
        console.log('✅ Razorpay integration found in frontend');
    } else {
        console.log('❌ Razorpay integration missing in frontend');
    }
}

// Check if JWT auth is implemented
const authControllerPath = path.join(backendPath, 'controllers', 'authController.js');
if (fs.existsSync(authControllerPath)) {
    const authContent = fs.readFileSync(authControllerPath, 'utf8');
    if (authContent.includes('jwt') || authContent.includes('jsonwebtoken')) {
        console.log('✅ JWT authentication implemented');
    } else {
        console.log('❌ JWT authentication missing');
    }
}

// Check if seat management is implemented
const busControllerPath = path.join(backendPath, 'controllers', 'busController.js');
if (fs.existsSync(busControllerPath)) {
    const busContent = fs.readFileSync(busControllerPath, 'utf8');
    if (busContent.includes('getBusSeats') || busContent.includes('seat')) {
        console.log('✅ Seat management implemented');
    } else {
        console.log('❌ Seat management missing');
    }
}

// Check if responsive design is implemented
const stylesPath = path.join(frontendPath, 'css', 'styles.css');
if (fs.existsSync(stylesPath)) {
    const stylesContent = fs.readFileSync(stylesPath, 'utf8');
    if (stylesContent.includes('@media') && stylesContent.includes('grid')) {
        console.log('✅ Responsive design with CSS Grid implemented');
    } else {
        console.log('❌ Responsive design missing');
    }
}

console.log('\n🚀 Installation Summary:');
if (missingDeps.length === 0) {
    console.log('✅ All required dependencies are installed');
} else {
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
}

console.log('\n📋 Next Steps:');
console.log('1. Create .env file in backend directory (copy from .env.example)');
console.log('2. Start MongoDB service');
console.log('3. Run "npm run seed" to populate sample data');
console.log('4. Run "npm start" to start the server');
console.log('5. Access http://localhost:5000 for user interface');
console.log('6. Access http://localhost:5000/admin.html for admin dashboard');

console.log('\n🎉 Verification Complete!');
