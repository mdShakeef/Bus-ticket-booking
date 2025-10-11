# 🚀 Quick Setup Guide

## Step-by-Step Installation

### 1. Prerequisites Check
```bash
# Check Node.js version (should be 14+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed
mongod --version
```

### 2. Project Setup
```bash
# Navigate to the project directory
cd Bus-ticket-booking/backend

# Install dependencies
npm install
```

### 3. Environment Setup
Create `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bus_booking_system
JWT_SECRET=your_jwt_secret_key_here_change_in_production
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_EMAIL=admin@busticket.com
ADMIN_PASSWORD=Admin@123
```

### 4. Database Setup
```bash
# Start MongoDB (if not running)
mongod

# Seed the database with sample data
npm run seed
```

### 5. Start Application
```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### 6. Access the Application
- **User Interface**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5000/admin.html
- **API Health Check**: http://localhost:5000/api/health

## Default Login Credentials

### Admin Access
- **Email**: admin@busticket.com
- **Password**: Admin@123

## Razorpay Integration Setup

### 1. Create Razorpay Account
1. Go to https://dashboard.razorpay.com/
2. Sign up for a free account
3. Complete KYC verification (for live mode)

### 2. Get API Keys
1. Navigate to Settings → API Keys
2. Generate API keys for Test Mode
3. Copy Key ID and Key Secret

### 3. Update Configuration
1. Add keys to `.env` file
2. Update frontend key in `frontend/js/app.js` (line 380)

### 4. Test Payment
1. Use test card numbers provided by Razorpay
2. Test card: 4111 1111 1111 1111
3. Any future date and CVV

## MongoDB Setup Options

### Option 1: Local MongoDB
```bash
# Install MongoDB Community Edition
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Start MongoDB service
mongod
```

### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://cloud.mongodb.com/
2. Create a free cluster
3. Get connection string
4. Update MONGODB_URI in `.env`

## Troubleshooting

### Port 5000 Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
ps aux | grep mongod  # macOS/Linux
tasklist | findstr mongod  # Windows

# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Missing Dependencies
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Testing the Application

### 1. Test User Flow
1. Search for buses (Delhi → Mumbai)
2. Select seats
3. Fill passenger details
4. Test both payment methods

### 2. Test Admin Flow
1. Login to admin dashboard
2. Add a new bus
3. View bookings
4. Check statistics

### 3. API Testing
```bash
# Test API health
curl http://localhost:5000/api/health

# Test bus search
curl "http://localhost:5000/api/buses?from=Delhi&to=Mumbai"
```

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bus_booking_system
JWT_SECRET=very_strong_secret_key_for_production
RAZORPAY_KEY_ID=rzp_live_your_live_key
RAZORPAY_KEY_SECRET=your_live_secret
```

### Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up proper logging
- [ ] Configure rate limiting

## Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review server logs for errors
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly

Happy coding! 🎉
