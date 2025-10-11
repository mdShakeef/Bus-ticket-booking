// Admin Dashboard JavaScript
let currentAdmin = null;
let authToken = null;

// API Base URL
const API_BASE = 'http://localhost:5000/api';

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loading = document.getElementById('loading');

// Initialize admin app
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminApp();
});

function initializeAdminApp() {
    // Check if already logged in
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
        authToken = savedToken;
        verifyToken();
    }

    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Bus management
    document.getElementById('add-bus-btn').addEventListener('click', showAddBusModal);
    document.getElementById('bus-form').addEventListener('submit', handleBusForm);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Filters
    document.getElementById('booking-status-filter').addEventListener('change', loadBookings);
    document.getElementById('payment-status-filter').addEventListener('change', loadBookings);

    // Sidebar toggle for mobile
    document.querySelector('.sidebar-toggle').addEventListener('click', toggleSidebar);
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and admin data
        authToken = data.data.token;
        currentAdmin = data.data.admin;
        localStorage.setItem('adminToken', authToken);

        // Show dashboard
        showDashboard();
        loadDashboardData();

    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentAdmin = data.data.admin;
            showDashboard();
            loadDashboardData();
        } else {
            localStorage.removeItem('adminToken');
            authToken = null;
        }
    } catch (error) {
        localStorage.removeItem('adminToken');
        authToken = null;
    }
}

function handleLogout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    currentAdmin = null;
    
    loginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    
    // Reset form
    loginForm.reset();
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    
    // Update admin name
    document.getElementById('admin-name').textContent = currentAdmin.name;
}

// Navigation
function handleNavigation(e) {
    e.preventDefault();
    
    const section = e.currentTarget.dataset.section;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Show corresponding section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        buses: 'Manage Buses',
        bookings: 'Bookings',
        routes: 'Routes',
        reports: 'Reports'
    };
    document.getElementById('page-title').textContent = titles[section];
    
    // Load section data
    loadSectionData(section);
}

async function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'buses':
            loadBuses();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'routes':
            loadRoutes();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Dashboard
async function loadDashboardData() {
    try {
        showLoading(true);
        
        // Load statistics
        const statsResponse = await fetch(`${API_BASE}/bookings/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            updateDashboardStats(statsData.data);
        }
        
        // Load buses count
        const busesResponse = await fetch(`${API_BASE}/buses`);
        if (busesResponse.ok) {
            const busesData = await busesResponse.json();
            document.getElementById('total-buses').textContent = busesData.count || 0;
        }
        
        // Load recent bookings
        loadRecentBookings();
        
    } catch (error) {
        console.error('Dashboard load error:', error);
    } finally {
        showLoading(false);
    }
}

function updateDashboardStats(stats) {
    document.getElementById('total-bookings').textContent = stats.totalBookings || 0;
    document.getElementById('total-revenue').textContent = `(LKR)${stats.totalRevenue || 0}`;
    document.getElementById('today-bookings').textContent = stats.todayBookings || 0;
}

async function loadRecentBookings() {
    try {
        const response = await fetch(`${API_BASE}/bookings?limit=5`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayRecentBookings(data.data);
        }
    } catch (error) {
        console.error('Recent bookings load error:', error);
    }
}

function displayRecentBookings(bookings) {
    const container = document.getElementById('recent-bookings');
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p>No recent bookings</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="recent-booking-item">
            <div class="booking-info">
                <strong>${booking.ticketNumber}</strong>
                <span>${booking.passengerDetails.name}</span>
            </div>
            <div class="booking-details">
                <span>${booking.bus.busName}</span>
                <span class="status-badge status-${booking.bookingStatus}">${booking.bookingStatus}</span>
            </div>
        </div>
    `).join('');
}

// Bus Management
async function loadBuses() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/buses`);
        const data = await response.json();
        
        displayBuses(data.data || []);
        
    } catch (error) {
        console.error('Buses load error:', error);
        showAlert('Failed to load buses', 'error');
    } finally {
        showLoading(false);
    }
}

function displayBuses(buses) {
    const tbody = document.querySelector('#buses-table tbody');
    
    if (buses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No buses found</td></tr>';
        return;
    }
    
    tbody.innerHTML = buses.map(bus => `
        <tr>
            <td>${bus.busNumber}</td>
            <td>${bus.busName}</td>
            <td><span class="status-badge">${bus.busType}</span></td>
            <td>${bus.from} → ${bus.to}</td>
            <td>${bus.totalSeats}</td>
            <td>LKR${bus.fare}</td>
            <td><span class="status-badge ${bus.isActive ? 'status-confirmed' : 'status-cancelled'}">${bus.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editBus('${bus._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-delete" onclick="deleteBus('${bus._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showAddBusModal() {
    document.getElementById('bus-modal-title').textContent = 'Add New Bus';
    document.getElementById('bus-form').reset();
    document.getElementById('bus-form').dataset.mode = 'add';
    document.getElementById('bus-modal').classList.remove('hidden');
}

async function editBus(busId) {
    try {
        const response = await fetch(`${API_BASE}/buses/${busId}`);
        const data = await response.json();
        
        if (response.ok) {
            const bus = data.data;
            
            // Populate form
            document.getElementById('bus-number').value = bus.busNumber;
            document.getElementById('bus-name').value = bus.busName;
            document.getElementById('bus-type').value = bus.busType;
            document.getElementById('total-seats').value = bus.totalSeats;
            document.getElementById('from-city').value = bus.from;
            document.getElementById('to-city').value = bus.to;
            document.getElementById('departure-time').value = bus.departureTime;
            document.getElementById('arrival-time').value = bus.arrivalTime;
            document.getElementById('duration').value = bus.duration;
            document.getElementById('fare').value = bus.fare;
            document.getElementById('seat-rows').value = bus.seatLayout.rows;
            document.getElementById('seats-per-row').value = bus.seatLayout.seatsPerRow;
            document.getElementById('amenities').value = bus.amenities.join(', ');
            
            // Set modal for edit mode
            document.getElementById('bus-modal-title').textContent = 'Edit Bus';
            document.getElementById('bus-form').dataset.mode = 'edit';
            document.getElementById('bus-form').dataset.busId = busId;
            document.getElementById('bus-modal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Edit bus error:', error);
        showAlert('Failed to load bus details', 'error');
    }
}

async function handleBusForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const mode = e.target.dataset.mode;
    const busId = e.target.dataset.busId;
    
    const busData = {
        busNumber: formData.get('busNumber'),
        busName: formData.get('busName'),
        busType: formData.get('busType'),
        totalSeats: parseInt(formData.get('totalSeats')),
        from: formData.get('from'),
        to: formData.get('to'),
        departureTime: formData.get('departureTime'),
        arrivalTime: formData.get('arrivalTime'),
        duration: formData.get('duration'),
        fare: parseFloat(formData.get('fare')),
        seatLayout: {
            rows: parseInt(formData.get('seatRows')),
            seatsPerRow: parseInt(formData.get('seatsPerRow'))
        },
        amenities: formData.get('amenities').split(',').map(a => a.trim()).filter(a => a)
    };
    
    try {
        showLoading(true);
        
        const url = mode === 'edit' ? `${API_BASE}/buses/${busId}` : `${API_BASE}/buses`;
        const method = mode === 'edit' ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(busData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert(`Bus ${mode === 'edit' ? 'updated' : 'created'} successfully`, 'success');
            closeBusModal();
            loadBuses();
        } else {
            throw new Error(data.message || `Failed to ${mode} bus`);
        }
        
    } catch (error) {
        console.error('Bus form error:', error);
        showAlert(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteBus(busId) {
    if (!confirm('Are you sure you want to delete this bus?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/buses/${busId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Bus deleted successfully', 'success');
            loadBuses();
        } else {
            throw new Error(data.message || 'Failed to delete bus');
        }
        
    } catch (error) {
        console.error('Delete bus error:', error);
        showAlert(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function closeBusModal() {
    document.getElementById('bus-modal').classList.add('hidden');
}

// Bookings Management
async function loadBookings() {
    try {
        showLoading(true);
        
        const statusFilter = document.getElementById('booking-status-filter').value;
        const paymentFilter = document.getElementById('payment-status-filter').value;
        
        let url = `${API_BASE}/bookings?`;
        if (statusFilter) url += `status=${statusFilter}&`;
        if (paymentFilter) url += `paymentStatus=${paymentFilter}&`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        displayBookings(data.data || []);
        
    } catch (error) {
        console.error('Bookings load error:', error);
        showAlert('Failed to load bookings', 'error');
    } finally {
        showLoading(false);
    }
}

function displayBookings(bookings) {
    const tbody = document.querySelector('#bookings-table tbody');
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">No bookings found</td></tr>';
        return;
    }
    
    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.ticketNumber}</td>
            <td>${booking.passengerDetails.name}</td>
            <td>${booking.bus.busName}</td>
            <td>${booking.bus.from} → ${booking.bus.to}</td>
            <td>${new Date(booking.travelDate).toLocaleDateString()}</td>
            <td>${booking.seats.map(s => s.seatNumber).join(', ')}</td>
            <td>LKR${booking.totalFare}</td>
            <td><span class="status-badge status-${booking.paymentStatus}">${booking.paymentStatus}</span></td>
            <td><span class="status-badge status-${booking.bookingStatus}">${booking.bookingStatus}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="viewBooking('${booking._id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Routes Management
async function loadRoutes() {
    try {
        const response = await fetch(`${API_BASE}/buses`);
        const data = await response.json();
        
        // Extract unique routes
        const routes = {};
        data.data.forEach(bus => {
            const routeKey = `${bus.from}-${bus.to}`;
            if (!routes[routeKey]) {
                routes[routeKey] = {
                    from: bus.from,
                    to: bus.to,
                    buses: []
                };
            }
            routes[routeKey].buses.push(bus);
        });
        
        displayRoutes(Object.values(routes));
        
    } catch (error) {
        console.error('Routes load error:', error);
    }
}

function displayRoutes(routes) {
    const container = document.getElementById('routes-list');
    
    container.innerHTML = routes.map(route => `
        <div class="route-card">
            <h4>${route.from} → ${route.to}</h4>
            <p>${route.buses.length} buses available</p>
            <div class="route-buses">
                ${route.buses.map(bus => `
                    <span class="bus-tag">${bus.busName}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Reports
async function loadReports() {
    // This would typically load more detailed analytics
    // For now, we'll show the same stats as dashboard
    loadDashboardData();
}

// Utility Functions
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 5000);
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Add some additional CSS for new elements
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .recent-booking-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f1f5f9;
    }
    
    .recent-booking-item:last-child {
        border-bottom: none;
    }
    
    .booking-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .booking-details {
        display: flex;
        flex-direction: column;
        align-items: end;
        gap: 4px;
    }
    
    .bus-tag {
        display: inline-block;
        background: #e2e8f0;
        color: #475569;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin: 2px;
    }
    
    .route-buses {
        margin-top: 12px;
    }
`;
document.head.appendChild(additionalStyles);
