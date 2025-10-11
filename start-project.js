#!/usr/bin/env node

/**
 * Project Startup Script
 * Automated setup and startup for Bus Ticket Booking System
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Bus Ticket Booking System...\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'backend', '.env');
const envExamplePath = path.join(__dirname, 'backend', '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found. Creating from .env.example...');
    
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created. Please update with your actual values.');
        console.log('📝 Important: Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file\n');
    } else {
        console.log('❌ .env.example file not found. Creating basic .env file...');
        
        const basicEnv = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bus_booking_system

# JWT Secret (Change this in production)
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Razorpay Configuration (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin Default Credentials
ADMIN_EMAIL=admin@busticket.com
ADMIN_PASSWORD=Admin@123
`;
        
        fs.writeFileSync(envPath, basicEnv);
        console.log('✅ Basic .env file created. Please update with your actual values.\n');
    }
}

// Function to check if MongoDB is running
function checkMongoDB() {
    return new Promise((resolve) => {
        exec('mongod --version', (error) => {
            if (error) {
                console.log('❌ MongoDB not found. Please install MongoDB first.');
                console.log('📥 Download from: https://www.mongodb.com/try/download/community\n');
                resolve(false);
            } else {
                console.log('✅ MongoDB found');
                resolve(true);
            }
        });
    });
}

// Function to check if Node.js version is compatible
function checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion >= 14) {
        console.log(`✅ Node.js version ${version} is compatible`);
        return true;
    } else {
        console.log(`❌ Node.js version ${version} is too old. Please upgrade to v14 or higher.`);
        return false;
    }
}

// Function to install dependencies
function installDependencies() {
    return new Promise((resolve, reject) => {
        console.log('📦 Installing dependencies...');
        
        const npmInstall = spawn('npm', ['install'], {
            cwd: path.join(__dirname, 'backend'),
            stdio: 'inherit',
            shell: true
        });
        
        npmInstall.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Dependencies installed successfully\n');
                resolve();
            } else {
                console.log('❌ Failed to install dependencies');
                reject(new Error('npm install failed'));
            }
        });
    });
}

// Function to seed database
function seedDatabase() {
    return new Promise((resolve, reject) => {
        console.log('🌱 Seeding database with sample data...');
        
        const seedProcess = spawn('npm', ['run', 'seed'], {
            cwd: path.join(__dirname, 'backend'),
            stdio: 'inherit',
            shell: true
        });
        
        seedProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Database seeded successfully\n');
                resolve();
            } else {
                console.log('⚠️  Database seeding failed (MongoDB might not be running)');
                console.log('💡 You can run "npm run seed" manually later\n');
                resolve(); // Don't reject, continue with server start
            }
        });
    });
}

// Function to start server
function startServer() {
    console.log('🚀 Starting server...');
    console.log('📱 User Interface: http://localhost:5000');
    console.log('🔧 Admin Dashboard: http://localhost:5000/admin.html');
    console.log('🔑 Admin Login: admin@busticket.com / Admin@123\n');
    console.log('Press Ctrl+C to stop the server\n');
    
    const serverProcess = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'inherit',
        shell: true
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        serverProcess.kill('SIGINT');
        process.exit(0);
    });
}

// Main startup sequence
async function startProject() {
    try {
        // Check Node.js version
        if (!checkNodeVersion()) {
            process.exit(1);
        }
        
        // Check MongoDB
        await checkMongoDB();
        
        // Install dependencies
        await installDependencies();
        
        // Seed database
        await seedDatabase();
        
        // Start server
        startServer();
        
    } catch (error) {
        console.error('❌ Startup failed:', error.message);
        process.exit(1);
    }
}

// Run the startup sequence
startProject();
