document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // Change this to match where you mounted your router in app.js
    // e.g., app.use('/auth', authRoutes) -> URL is /auth/login
    const API_BASE_URL = 'http://localhost:5000/api/auth'; 

    // --- DOM Elements ---
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const authMessage = document.getElementById('auth-message');
    
    // Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');


    // --- UI Logic: Toggle Forms ---
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms();
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms();
    });

    function toggleForms() {
        // Simple fade out/in effect could be added here
        loginView.classList.toggle('hidden');
        registerView.classList.toggle('hidden');
        authMessage.textContent = ''; // Clear errors
        authMessage.classList.add('hidden');
    }

    function showMessage(msg, isError = true) {
        authMessage.textContent = msg;
        authMessage.classList.remove('hidden');
        authMessage.style.color = isError ? '#ff6b6b' : '#c5a059'; // Red for error, Copper for success
    }

    // --- Backend Integration: LOGIN ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
           
            const data = await response.json();

            if (response.ok) {
                // 1. SAVE THE DATA (Adjust 'data.token' based on your actual backend response)
                localStorage.setItem('authToken', data.token); 
                localStorage.setItem('userName', data.user ? data.user.name : 'Valued Client');
                
                // 2. Redirect to Home
                window.location.href = 'index.html'; 
            }
        } catch (err) {
            console.error(err);
            showMessage('Server connection error.');
        }
    });

    // --- Backend Integration: REGISTER ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Registration successful! Please sign in.', false);
                // Optional: Auto-switch to login view after 1.5 seconds
                setTimeout(() => {
                    toggleForms();
                }, 1500);
            } else {
                showMessage(data.message || 'Registration failed.');
            }
        } catch (err) {
            console.error(err);
            showMessage('Server connection error.');
        }
    });
});