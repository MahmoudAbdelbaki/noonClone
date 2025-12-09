// client/js/global.js

// 1. FIXED: Use 'authToken' consistently (matches your login logic)
const getToken = () => {
    return localStorage.getItem('authToken');
};

// 2. Helper for authenticated API requests
// This automatically adds the "Authorization: Bearer <token>" header
const fetchData = async (url, options = {}) => {
    const token = getToken();

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }) 
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers 
        }
    };

    try {
        const response = await fetch(url, config);
        
        // Auto-logout if token is invalid (401 or 403)
        if (response.status === 401 || response.status === 403) {
            logoutUser();
            throw new Error('Session expired');
        }
        
        return response;
    } catch (error) {
        throw error;
    }
};

function updateHeaderState() {
    const token = getToken();
    const userBtn = document.querySelector('a[aria-label="Account"]');
    
    // If logged in, point icon to dashboard
    if (token && userBtn) {
        userBtn.setAttribute('href', 'account.html');
        // Optional: Solid icon to indicate active state
        userBtn.innerHTML = '<i class="fas fa-user"></i>'; 
    }
}

function logoutUser() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

// Function to update cart count globally
async function updateCartCount() {
    try {
        const token = getToken();
        if (!token) {
            // If no token, set cart count to 0
            document.querySelectorAll('.cart-count').forEach(element => {
                element.textContent = '0';
            });
            return;
        }
        
        const response = await fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const cart = await response.json();
            const totalItems = cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
            
            // Update all cart count elements on the page
            document.querySelectorAll('.cart-count').forEach(element => {
                element.textContent = totalItems;
            });
        }
    } catch (error) {
        // Silently fail - cart count is not critical
        console.log('Could not update cart count:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update header state based on auth
    updateHeaderState();
    
    // Update cart count on all pages
    updateCartCount();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.main-header');
    if (header) {
        // Check initial scroll position
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        }
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
});

// ============================================
// Global function exports
// ============================================

// Expose functions for cart.js and other modules
window.getToken = getToken;
window.fetchData = fetchData;
window.logoutUser = logoutUser;
window.updateCartCount = updateCartCount;
window.updateHeaderState = updateHeaderState;