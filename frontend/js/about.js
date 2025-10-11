// About page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAboutPage();
});

function initializeAboutPage() {
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize animations
    initializeScrollAnimations();
    initializeCounterAnimation();
}

function initializeScrollAnimations() {
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll('.feature-card, .team-card, .value-item, .story-content');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
}

function initializeCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.stats-section');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    if (statsSection) {
        counterObserver.observe(statsSection);
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = counter.textContent;
        const numericValue = parseInt(target.replace(/[^\d]/g, ''));
        const suffix = target.replace(/[\d,]/g, '');
        
        if (isNaN(numericValue)) return;
        
        let current = 0;
        const increment = numericValue / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            
            let displayValue = Math.floor(current);
            if (displayValue >= 1000) {
                displayValue = (displayValue / 1000).toFixed(1) + 'K';
            }
            
            counter.textContent = displayValue + suffix;
        }, 20);
    });
}

// Add hover effects to feature cards
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-10px) scale(1)';
        });
    });
});

// Add CSS animations and mobile styles
const style = document.createElement('style');
style.textContent = `
    /* Mobile Navigation Styles */
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            z-index: 999;
        }

        .nav-menu.active {
            left: 0;
        }

        .nav-menu .nav-link {
            padding: 15px;
            display: block;
            border-bottom: 1px solid #eee;
        }

        .nav-toggle {
            display: block;
            cursor: pointer;
        }

        .nav-toggle .bar {
            display: block;
            width: 25px;
            height: 3px;
            margin: 5px auto;
            transition: all 0.3s ease-in-out;
            background-color: #333;
        }

        .nav-toggle.active .bar:nth-child(2) {
            opacity: 0;
        }

        .nav-toggle.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }

        .nav-toggle.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    }

    @media (min-width: 769px) {
        .nav-toggle {
            display: none;
        }
    }

    /* Enhanced hover effects */
    .team-card {
        transition: all 0.3s ease;
    }

    .team-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .value-item {
        transition: all 0.3s ease;
    }

    .value-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    /* Smooth animations for stats */
    .stat-number {
        transition: all 0.3s ease;
    }

    /* Loading animation for counters */
    @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
    }

    .stat-number.loading {
        animation: pulse 1.5s infinite;
    }
`;
document.head.appendChild(style);
