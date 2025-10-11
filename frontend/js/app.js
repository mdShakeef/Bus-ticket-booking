// Global variables
let currentBuses = [];
let selectedBus = null;
let selectedSeats = [];
let currentBooking = null;

// API Base URL
const API_BASE = 'http://localhost:5000/api';

// DOM Elements
const searchForm = document.getElementById('search-form');
const busResults = document.getElementById('bus-results');
const busesContainer = document.getElementById('buses-container');
const seatModal = document.getElementById('seat-modal');
const bookingModal = document.getElementById('booking-modal');
const ticketModal = document.getElementById('ticket-modal');
const loading = document.getElementById('loading');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set minimum date to today
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;

    // Event listeners
    searchForm.addEventListener('submit', handleSearch);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModals();
            }
        });
    });

    // Booking form
    document.getElementById('booking-form').addEventListener('submit', handleBooking);
    
    // Proceed to booking button
    document.getElementById('proceed-booking').addEventListener('click', showBookingForm);
    
    // Download ticket button
    document.getElementById('download-ticket').addEventListener('click', downloadTicket);
    
    // New booking button
    document.getElementById('new-booking').addEventListener('click', function() {
        closeModals();
        resetSearch();
    });

    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Search functionality
async function handleSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(searchForm);
    const searchParams = {
        from: formData.get('from'),
        to: formData.get('to'),
        date: formData.get('date')
    };

    // Validation
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
        showAlert('Please fill in all search fields', 'error');
        return;
    }

    if (searchParams.from === searchParams.to) {
        showAlert('Departure and destination cities cannot be the same', 'error');
        return;
    }

    try {
        showLoading(true);
        const buses = await searchBuses(searchParams);
        displayBuses(buses, searchParams);
        
        // Scroll to results
        busResults.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Search error:', error);
        showAlert('Failed to search buses. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function searchBuses(params) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/buses?${queryString}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch buses');
    }
    
    const data = await response.json();
    return data.data || [];
}

function displayBuses(buses, searchParams) {
    currentBuses = buses;
    
    // Update results info
    document.getElementById('results-count').textContent = `${buses.length} buses found`;
    document.getElementById('route-info').textContent = `${searchParams.from} → ${searchParams.to}`;
    
    // Clear previous results
    busesContainer.innerHTML = '';
    
    if (buses.length === 0) {
        busesContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-bus" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No buses found</h3>
                <p>Try searching for a different route or date.</p>
            </div>
        `;
        busResults.classList.remove('hidden');
        return;
    }
    
    // Display bus cards
    buses.forEach(bus => {
        const busCard = createBusCard(bus, searchParams.date);
        busesContainer.appendChild(busCard);
    });
    
    busResults.classList.remove('hidden');
}

function createBusCard(bus, travelDate) {
    const card = document.createElement('div');
    card.className = 'bus-card';
    
    const amenitiesHtml = bus.amenities.map(amenity => 
        `<span class="amenity">${amenity}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="bus-header">
            <div class="bus-info">
                <h3>${bus.busName}</h3>
                <span class="bus-type">${bus.busType}</span>
                <p style="margin-top: 8px; color: #666; font-size: 14px;">${bus.busNumber}</p>
            </div>
            <div class="bus-fare">
                <div class="fare-amount">LKR${bus.fare}</div>
                <div class="fare-per-seat">per seat</div>
            </div>
        </div>
        
        <div class="bus-details">
            <div class="route-info">
                <div class="location">
                    <div class="location-name">${bus.from}</div>
                    <div class="location-time">${bus.departureTime}</div>
                </div>
                <div class="route-line"></div>
                <div class="location">
                    <div class="location-name">${bus.to}</div>
                    <div class="location-time">${bus.arrivalTime}</div>
                </div>
            </div>
            <div class="duration">${bus.duration}</div>
        </div>
        
        <div class="bus-amenities">
            ${amenitiesHtml}
        </div>
        
        <div class="bus-footer">
            <div class="seat-info">
                <span class="available-seats">${bus.availableSeats || bus.totalSeats}</span> 
                seats available out of ${bus.totalSeats}
            </div>
            <button class="select-seats-btn" onclick="selectSeats('${bus._id}', '${travelDate}')">
                <i class="fas fa-chair"></i>
                Select Seats
            </button>
        </div>
    `;
    
    return card;
}

// Seat selection functionality
async function selectSeats(busId, travelDate) {
    try {
        showLoading(true);
        
        // Get bus details and seat availability
        const response = await fetch(`${API_BASE}/buses/${busId}/seats?date=${travelDate}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch seat information');
        }
        
        const data = await response.json();
        selectedBus = data.data.bus;
        selectedBus.travelDate = travelDate;
        
        // Display seat selection modal
        displaySeatSelection(data.data, travelDate);
        
    } catch (error) {
        console.error('Seat selection error:', error);
        showAlert('Failed to load seat information. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function displaySeatSelection(seatData, travelDate) {
    const { bus, bookedSeats } = seatData;
    
    // Update modal header
    document.getElementById('modal-bus-name').textContent = bus.busName;
    document.getElementById('modal-route').textContent = `${currentBuses.find(b => b._id === bus.id)?.from} → ${currentBuses.find(b => b._id === bus.id)?.to}`;
    document.getElementById('modal-time').textContent = `${new Date(travelDate).toLocaleDateString()} • Departure: ${currentBuses.find(b => b._id === bus.id)?.departureTime}`;
    
    // Generate seat map
    generateSeatMap(bus.seatLayout, bookedSeats);
    
    // Reset selection
    selectedSeats = [];
    updateBookingSummary();
    
    // Show modal
    seatModal.classList.remove('hidden');
}

function generateSeatMap(layout, bookedSeats) {
    const seatMap = document.getElementById('seat-map');
    seatMap.innerHTML = '';
    
    const { rows, seatsPerRow } = layout;
    
    for (let row = 1; row <= rows; row++) {
        const seatRow = document.createElement('div');
        seatRow.className = 'seat-row';
        
        for (let seat = 1; seat <= seatsPerRow; seat++) {
            const seatNumber = `${row}${String.fromCharCode(64 + seat)}`;
            const seatElement = document.createElement('div');
            seatElement.className = 'seat';
            seatElement.textContent = seatNumber;
            seatElement.dataset.seatNumber = seatNumber;
            
            // Determine seat status
            if (bookedSeats.includes(seatNumber)) {
                seatElement.classList.add('booked');
            } else {
                seatElement.classList.add('available');
                seatElement.addEventListener('click', () => toggleSeat(seatNumber));
            }
            
            // Add aisle space after 2nd seat (for 4-seat layout)
            if (seatsPerRow === 4 && seat === 2) {
                seatElement.classList.add('aisle');
            }
            
            seatRow.appendChild(seatElement);
        }
        
        seatMap.appendChild(seatRow);
    }
}

function toggleSeat(seatNumber) {
    const seatElement = document.querySelector(`[data-seat-number="${seatNumber}"]`);
    
    if (seatElement.classList.contains('selected')) {
        // Deselect seat
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
        selectedSeats = selectedSeats.filter(seat => seat !== seatNumber);
    } else {
        // Select seat (max 6 seats)
        if (selectedSeats.length >= 6) {
            showAlert('You can select maximum 6 seats at a time', 'warning');
            return;
        }
        
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
        selectedSeats.push(seatNumber);
    }
    
    updateBookingSummary();
}

function updateBookingSummary() {
    const selectedSeatsElement = document.getElementById('selected-seats');
    const totalFareElement = document.getElementById('total-fare');
    const proceedButton = document.getElementById('proceed-booking');
    
    if (selectedSeats.length === 0) {
        selectedSeatsElement.textContent = 'None';
        totalFareElement.textContent = 'LKR0';
        proceedButton.disabled = true;
    } else {
        selectedSeatsElement.textContent = selectedSeats.join(', ');
        const totalFare = selectedSeats.length * selectedBus.fare;
        totalFareElement.textContent = `LKR${totalFare}`;
        proceedButton.disabled = false;
    }
}

// Booking functionality
function showBookingForm() {
    if (selectedSeats.length === 0) {
        showAlert('Please select at least one seat', 'warning');
        return;
    }
    
    // Update booking summary
    const busInfo = currentBuses.find(b => b._id === selectedBus.id);
    document.getElementById('summary-bus').textContent = selectedBus.busName;
    document.getElementById('summary-route').textContent = `${busInfo.from} → ${busInfo.to}`;
    document.getElementById('summary-date').textContent = new Date(selectedBus.travelDate).toLocaleDateString();
    document.getElementById('summary-seats').textContent = selectedSeats.join(', ');
    document.getElementById('summary-total').textContent = `LKR${selectedSeats.length * selectedBus.fare}`;
    
    // Hide seat modal and show booking modal
    seatModal.classList.add('hidden');
    bookingModal.classList.remove('hidden');
}

async function handleBooking(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        busId: selectedBus.id,
        travelDate: selectedBus.travelDate,
        seats: selectedSeats.map(seat => ({ seatNumber: seat })),
        passengerDetails: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        },
        paymentMethod: formData.get('paymentMethod')
    };

    // Frontend validation
    if (!bookingData.passengerDetails.name || bookingData.passengerDetails.name.trim().length < 2) {
        showAlert('Please enter a valid name (at least 2 characters)', 'error');
        return;
    }

    if (!bookingData.passengerDetails.email || !isValidEmail(bookingData.passengerDetails.email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }

    if (!bookingData.passengerDetails.phone || !isValidPhone(bookingData.passengerDetails.phone)) {
        showAlert('Please enter a valid Sri Lankan phone number (e.g., +94771234567 or 0771234567)', 'error');
        return;
    }

    if (!bookingData.paymentMethod) {
        showAlert('Please select a payment method', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            
            // Handle validation errors specifically
            if (errorData.errors && Array.isArray(errorData.errors)) {
                const errorMessages = errorData.errors.map(err => err.msg).join(', ');
                throw new Error(`Validation Error: ${errorMessages}`);
            }
            
            throw new Error(errorData.message || 'Booking failed');
        }
        
        const result = await response.json();
        currentBooking = result.data.booking;
        
        // Show success alert
        showAlert('Booking successful!', 'success');
        
        // For cash payment, show ticket directly
        // For online payment, redirect to PayHere
        if (bookingData.paymentMethod === 'online' && result.data.payhereOrder) {
            // Redirect to PayHere payment page
            window.location.href = result.data.payhereOrder.payment_url;
        } else {
            showTicket(currentBooking);
        }
        
    } catch (error) {
        console.error('Booking error:', error);
        showAlert(error.message || 'Booking failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function processOnlinePayment(razorpayOrder, booking) {
    const options = {
        key: 'rzp_test_9WsLnHkruf61R2', // Replace with your Razorpay key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'BusBooking',
        description: `Bus ticket booking - ${booking.ticketNumber}`,
        order_id: razorpayOrder.id,
        handler: async function(response) {
            try {
                showLoading(true);
                
                // Verify payment
                const verifyResponse = await fetch(`${API_BASE}/bookings/verify-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        bookingId: booking._id
                    })
                });
                
                if (!verifyResponse.ok) {
                    throw new Error('Payment verification failed');
                }
                
                const verifyResult = await verifyResponse.json();
                showTicket(verifyResult.data);
                
            } catch (error) {
                console.error('Payment verification error:', error);
                showAlert('Payment verification failed. Please contact support.', 'error');
            } finally {
                showLoading(false);
            }
        },
        prefill: {
            name: booking.passengerDetails.name,
            email: booking.passengerDetails.email,
            contact: booking.passengerDetails.phone
        },
        theme: {
            color: '#667eea'
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
    
    rzp.on('payment.failed', function(response) {
        showAlert('Payment failed. Please try again.', 'error');
    });
}

function showTicket(booking) {
    // Hide other modals
    bookingModal.classList.add('hidden');
    
    // Populate ticket data
    document.getElementById('ticket-number').textContent = booking.ticketNumber;
    document.getElementById('ticket-passenger').textContent = booking.passengerDetails.name;
    document.getElementById('ticket-phone').textContent = booking.passengerDetails.phone;
    document.getElementById('ticket-bus').textContent = booking.bus.busName || selectedBus.busName;
    document.getElementById('ticket-seats').textContent = booking.seats.map(s => s.seatNumber).join(', ');
    document.getElementById('ticket-from').textContent = booking.bus.from || currentBuses.find(b => b._id === selectedBus.id)?.from;
    document.getElementById('ticket-to').textContent = booking.bus.to || currentBuses.find(b => b._id === selectedBus.id)?.to;
    document.getElementById('ticket-date').textContent = new Date(booking.travelDate).toLocaleDateString();
    document.getElementById('ticket-time').textContent = booking.bus.departureTime || currentBuses.find(b => b._id === selectedBus.id)?.departureTime;
    document.getElementById('ticket-payment-status').textContent = booking.paymentMethod === 'cash' ? 'Pay at Counter' : (booking.paymentStatus === 'completed' ? 'Paid' : 'Pending Payment');
    document.getElementById('ticket-total').textContent = `LKR${booking.totalFare}`;
    
    // Show ticket modal
    ticketModal.classList.remove('hidden');
}

function downloadTicket() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get ticket data
    const ticketNumber = document.getElementById('ticket-number').textContent;
    const passenger = document.getElementById('ticket-passenger').textContent;
    const phone = document.getElementById('ticket-phone').textContent;
    const bus = document.getElementById('ticket-bus').textContent;
    const seats = document.getElementById('ticket-seats').textContent;
    const from = document.getElementById('ticket-from').textContent;
    const to = document.getElementById('ticket-to').textContent;
    const date = document.getElementById('ticket-date').textContent;
    const time = document.getElementById('ticket-time').textContent;
    const paymentStatus = document.getElementById('ticket-payment-status').textContent;
    const total = document.getElementById('ticket-total').textContent;

    // Set font
    doc.setFont("helvetica");

    // Title
    doc.setFontSize(20);
    doc.text("Bus Ticket", 20, 20);

    // Ticket details
    doc.setFontSize(12);
    let yPosition = 40;

    doc.text(`Ticket Number: ${ticketNumber}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Passenger Name: ${passenger}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Phone: ${phone}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Bus: ${bus}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Seats: ${seats}`, 20, yPosition);
    yPosition += 10;
    doc.text(`From: ${from}`, 20, yPosition);
    yPosition += 10;
    doc.text(`To: ${to}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Date: ${date}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Time: ${time}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Payment Status: ${paymentStatus}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total Fare: ${total}`, 20, yPosition);

    // Save the PDF
    doc.save(`BusTicket_${ticketNumber}.pdf`);
}

// Utility functions
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    alert.textContent = message;
    
    // Add to DOM
    document.body.appendChild(alert);
    
    // Remove after 5 seconds
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
    seatModal.classList.add('hidden');
    bookingModal.classList.add('hidden');
    ticketModal.classList.add('hidden');
}

function resetSearch() {
    busResults.classList.add('hidden');
    selectedBus = null;
    selectedSeats = [];
    currentBooking = null;
    
    // Reset form
    searchForm.reset();
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

// Validation helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Accept Sri Lankan phone numbers only
    // Formats: +94771234567, 0771234567, 94771234567
    const phoneRegex = /^(\+94|0|94)?[1-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .no-results {
        text-align: center;
        padding: 60px 20px;
        color: #666;
    }
    
    .no-results h3 {
        margin-bottom: 12px;
        color: #333;
    }
`;
document.head.appendChild(style);
