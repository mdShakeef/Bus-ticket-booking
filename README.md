# 🚌 Bus Ticket Booking System

A complete web application for bus ticket booking with modern UI, admin dashboard, and payment integration.

## 🌟 Features

### User Features
- **Route Search**: Search buses by departure/destination cities and travel date
- **Seat Selection**: Interactive seat map with real-time availability
- **Multiple Payment Options**: Online payment (Razorpay) and cash payment
- **Booking Confirmation**: Digital ticket with unique booking number
- **Responsive Design**: Mobile-first design that works on all devices

### Admin Features
- **Dashboard**: Overview of bookings, revenue, and statistics
- **Bus Management**: Add, edit, delete buses with seat configurations
- **Booking Management**: View and manage all bookings
- **Route Management**: Monitor popular routes and bus assignments
- **Reports**: Revenue and booking analytics

### Technical Features
- **RESTful API**: Clean API architecture with proper error handling
- **JWT Authentication**: Secure admin authentication
- **MongoDB Integration**: Robust data storage with Mongoose ODM
- **Payment Gateway**: Razorpay integration for secure payments
- **Responsive UI**: Modern CSS with Flexbox/Grid layouts

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Razorpay Integration
- **Styling**: Custom CSS with modern design patterns

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Razorpay Account** (for payment integration)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Bus-ticket-booking
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bus_booking_system

# JWT Secret (Change this in production)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin Default Credentials
ADMIN_EMAIL=admin@busticket.com
ADMIN_PASSWORD=Admin@123
```

### 4. Database Setup
Start MongoDB service and run the seed script:
```bash
# Make sure MongoDB is running
mongod

# Seed the database with sample data
npm run seed
```

### 5. Start the Application
```bash
# Start the server (from backend directory)
npm start

# For development with auto-restart
npm run dev
```

The application will be available at: `http://localhost:5000`

## 🔧 Configuration

### Razorpay Setup
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your API keys from the dashboard
3. Update the `.env` file with your keys
4. Update the Razorpay key in `frontend/js/app.js` (line 380)

### MongoDB Configuration
- **Local MongoDB**: Use `mongodb://localhost:27017/bus_booking_system`
- **MongoDB Atlas**: Get connection string from Atlas dashboard

## 📱 Usage

### For Users
1. **Search Buses**: Select departure/destination cities and travel date
2. **Select Seats**: Choose available seats from the interactive seat map
3. **Enter Details**: Provide passenger information
4. **Make Payment**: Choose online payment or cash option
5. **Get Ticket**: Download or print your booking confirmation

### For Admins
1. **Login**: Access admin panel at `/admin.html`
   - Default credentials: `admin@busticket.com` / `Admin@123`
2. **Manage Buses**: Add new buses, update routes and schedules
3. **View Bookings**: Monitor all bookings and payment status
4. **Analytics**: View revenue reports and booking statistics

## 🗂️ Project Structure

```
Bus-ticket-booking/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Admin authentication
│   │   ├── busController.js     # Bus management
│   │   └── bookingController.js # Booking & payment handling
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── errorHandler.js      # Global error handling
│   ├── models/
│   │   ├── Admin.js             # Admin schema
│   │   ├── Bus.js               # Bus schema
│   │   ├── Booking.js           # Booking schema
│   │   ├── Payment.js           # Payment schema
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── buses.js             # Bus management routes
│   │   └── bookings.js          # Booking routes
│   ├── .env.example             # Environment variables template
│   ├── package.json             # Dependencies and scripts
│   ├── seedData.js              # Sample data seeder
│   └── server.js                # Main server file
├── frontend/
│   ├── css/
│   │   ├── styles.css           # Main stylesheet
│   │   └── admin.css            # Admin dashboard styles
│   ├── js/
│   │   ├── app.js               # Main application logic
│   │   └── admin.js             # Admin dashboard logic
│   ├── admin.html               # Admin dashboard
│   └── index.html               # Main user interface
└── README.md                    # Project documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile

### Buses
- `GET /api/buses` - Get all buses (with filters)
- `GET /api/buses/:id` - Get single bus
- `GET /api/buses/:id/seats` - Get seat availability
- `POST /api/buses` - Create bus (Admin)
- `PUT /api/buses/:id` - Update bus (Admin)
- `DELETE /api/buses/:id` - Delete bus (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/verify-payment` - Verify payment
- `GET /api/bookings/ticket/:ticketNumber` - Get booking by ticket
- `GET /api/bookings` - Get all bookings (Admin)
- `GET /api/bookings/stats` - Get booking statistics (Admin)
- `PUT /api/bookings/:id/cancel` - Cancel booking

## 🎨 UI Features

### Modern Design
- **Gradient Backgrounds**: Beautiful color gradients
- **Card-based Layout**: Clean, organized information display
- **Smooth Animations**: Hover effects and transitions
- **Responsive Grid**: Adapts to all screen sizes

### Interactive Elements
- **Seat Map**: Visual seat selection with color coding
- **Modal Dialogs**: Smooth popup forms and confirmations
- **Loading States**: User feedback during API calls
- **Form Validation**: Real-time input validation

## 🔒 Security Features

- **JWT Authentication**: Secure admin sessions
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation with express-validator
- **CORS Configuration**: Controlled cross-origin requests
- **Error Handling**: Secure error messages

## 📊 Sample Data

The application includes sample data:
- **8 Sample Buses** with different routes and types
- **3 Sample Users** for testing
- **1 Admin Account** with full access
- **Multiple Routes** covering major Indian cities

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Payment Integration Issues**
   - Verify Razorpay keys in `.env`
   - Update frontend Razorpay key

3. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes on port 5000

### Development Tips

- Use `npm run dev` for auto-restart during development
- Check browser console for frontend errors
- Monitor server logs for backend issues
- Use MongoDB Compass for database inspection

## 🚀 Deployment

### Production Checklist
1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT secret
3. Configure production MongoDB URI
4. Set up proper CORS origins
5. Use HTTPS for production
6. Configure production Razorpay keys

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions:
- Email: support@busticket.com
- Phone: +91-1234567890

---

**Built with ❤️ using Node.js, Express, MongoDB, and modern web technologies**
