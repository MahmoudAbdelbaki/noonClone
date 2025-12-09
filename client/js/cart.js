// Cart Management Script - Updated for your API structure
class CartManager {

    
    constructor() {
        this.cartItems = [];
        this.isLoading = false;
        this.API_BASE_URL = '/api/cart'; // Correct base URL
        
        this.initialize();
    }
    
    async initialize() {
        this.setupEventListeners();
        await this.loadCart();
    }
    
    setupEventListeners() {
        // Clear cart button
        const clearBtn = document.getElementById('clear-cart-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearCart();
            });
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.proceedToCheckout();
            });
        }
    }
    
    async loadCart() {
        console.log('🔄 loadCart() called');
        this.showLoading(true);
        
        try {
            // Use your existing fetchData helper from global.js
            const response = await window.fetchData(this.API_BASE_URL, {
                method: 'GET'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('📦 Full API response:', data);
                
                // EXTRACT CART ITEMS BASED ON YOUR ACTUAL API RESPONSE
                // Your API returns: { cart: { cartItems: [...] } }
                if (data.cart && data.cart.cartItems) {
                    this.cartItems = data.cart.cartItems;
                    console.log('✅ Found cartItems:', this.cartItems);
                } else if (data.cartItems) {
                    // Alternative: maybe sometimes it's just cartItems at root
                    this.cartItems = data.cartItems;
                    console.log('✅ Found cartItems at root:', this.cartItems);
                } else {
                    // Fallback to empty array
                    this.cartItems = [];
                    console.warn('⚠️ No cartItems found in response');
                }
                
                console.log('🛒 Final cart items:', this.cartItems);
                this.renderCart();
            } else {
                throw new Error('Failed to load cart');
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            
            if (error.message === 'Session expired') {
                this.showError('Please log in to view your cart');
            } else {
                this.showError('Failed to load cart. Please refresh the page.');
            }
        } finally {
            this.showLoading(false);
        }
    }
    
    async updateItemQuantity(itemId, newQuantity) {
        if (newQuantity < 1) {
            await this.removeItem(itemId);
            return;
        }
        
        const item = this.cartItems.find(item => item._id === itemId);
        if (!item) {
            console.error('Item not found:', itemId);
            return;
        }
        
        try {
            const response = await window.fetchData(this.API_BASE_URL, {
                method: 'POST',
                body: JSON.stringify({
                    productId: item.product,  // Your API expects productId
                    amount: newQuantity       // Your API uses "amount" not "quantity"
                })
            });
            
            if (response.ok) {
                item.amount = newQuantity;  // Update local amount
                this.renderCart();
                this.updateHeaderCartCount();
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }

    async clearCart() {
        if (!confirm('Are you sure you want to clear your cart?')) return;
        
        try {
            const response = await window.fetchData(`${this.API_BASE_URL}/clear`, {
                method: 'PATCH'
            });
            
            if (response.ok) {
                this.cartItems = [];
                this.renderCart();
                this.updateHeaderCartCount(); // Update header cart count
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }
    
    renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCartElement = document.getElementById('empty-cart');
        const checkoutBtn = document.getElementById('checkout-btn');
        const itemCountElement = document.getElementById('item-count');
        const cartSubtitleElement = document.getElementById('cart-subtitle');
        
        if (!cartItemsContainer) return;
        
        // Update item count in the header
        if (itemCountElement) {
            itemCountElement.textContent = this.cartItems.length;
        }
        
        if (this.cartItems.length === 0) {
            // Show empty cart state
            if (emptyCartElement) emptyCartElement.classList.add('show');
            cartItemsContainer.innerHTML = '';
            if (checkoutBtn) checkoutBtn.disabled = true;
            if (cartSubtitleElement) cartSubtitleElement.textContent = 'Items reserved for you';
            this.updateSummary(0);
            return;
        }
        
        // Hide empty cart state
        if (emptyCartElement) emptyCartElement.classList.remove('show');
        if (checkoutBtn) checkoutBtn.disabled = false;
        
        // Update cart subtitle
        if (cartSubtitleElement) {
            cartSubtitleElement.textContent = `${this.cartItems.length} item${this.cartItems.length !== 1 ? 's' : ''} in your cart`;
        }
        
        // Render cart items
        cartItemsContainer.innerHTML = this.cartItems.map(item => this.createCartItemHTML(item)).join('');
        
        // Add event listeners to rendered items
        this.addCartItemEventListeners();
        
        // Update summary
        const subtotal = this.calculateSubtotal();
        this.updateSummary(subtotal);
    }
    
    createCartItemHTML(item) {
        // Use your actual API field names
        const itemId = item._id;  // Your API uses _id
        const name = item.name || 'Product';
        const price = item.price || 0;
        const quantity = item.amount || 1;  // Your API uses "amount" not "quantity"
        const image = item.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop';
        const description = 'Luxury fragrance crafted with care';
        const productId = item.product;  // The actual product ID
        
        const totalPrice = (price * quantity).toFixed(2);
        const unitPrice = price.toFixed(2);
        
        return `
            <div class="cart-item" data-item-id="${itemId}" data-product-id="${productId}">
                <div class="cart-item-image">
                    <img src="${image}" alt="${name}">
                </div>
                
                <div class="cart-item-info">
                    <div>
                        <h3 class="cart-item-name">${name}</h3>
                        <p class="cart-item-description">${description}</p>
                    </div>
                    
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" data-action="decrease">-</button>
                            <input type="number" class="quantity-input" value="${quantity}" min="1" max="10" readonly>
                            <button class="quantity-btn plus" data-action="increase">+</button>
                        </div>
                        <span class="remove-item" data-action="remove">
                            <i class="fas fa-times"></i> Remove
                        </span>
                    </div>
                </div>
                
                <div class="cart-item-price">
                    <span class="item-total">$${totalPrice}</span>
                    <span class="item-price">$${unitPrice} each</span>
                </div>
            </div>
        `;
    }
    
    addCartItemEventListeners() {
        // Quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.closest('.quantity-btn').dataset.action;
                const itemElement = e.target.closest('.cart-item');
                const itemId = itemElement.dataset.itemId;
                const quantityInput = itemElement.querySelector('.quantity-input');
                let quantity = parseInt(quantityInput.value);
                
                if (action === 'increase') {
                    quantity = Math.min(10, quantity + 1);
                } else if (action === 'decrease') {
                    quantity = Math.max(1, quantity - 1);
                }
                
                quantityInput.value = quantity;
                this.updateItemQuantity(itemId, quantity);
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemElement = e.target.closest('.cart-item');
                const itemId = itemElement.dataset.itemId;
                this.removeItem(itemId);
            });
        });
    }
    
  calculateSubtotal() {
    return this.cartItems.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.amount || 1;  // Use "amount"
        return total + (price * quantity);
    }, 0);
}
    updateSummary(subtotal) {
        // Update subtotal
        const subtotalElement = document.getElementById('subtotal');
        if (subtotalElement) {
            subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        }
        
        // Update total
        const totalElement = document.getElementById('total');
        if (totalElement) {
            totalElement.textContent = `$${subtotal.toFixed(2)}`;
        }
    }
    
    // Update header cart count without causing recursion
    updateHeaderCartCount() {
        const totalItems = this.cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        
        // Update all cart count elements on the page
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
    }
    
    proceedToCheckout() {
        if (this.cartItems.length === 0) return;
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }
    
    showLoading(show) {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;
        
        if (show) {
            cartItemsContainer.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner"></i>
                    <p>Loading your cart...</p>
                </div>
            `;
        }
        this.isLoading = show;
    }
    
    showError(message) {
        const cartItemsContainer = document.getElementById('cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                    <button onclick="cartManager.loadCart()" class="btn btn-outline" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Initialize cart manager when DOM is loaded
let cartManager;
document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();
});

// Make cartManager globally available for debugging
window.cartManager = cartManager;