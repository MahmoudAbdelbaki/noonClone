// client/js/product_detail.js

const API_BASE_URL = 'http://localhost:5000/api'; 
const productContent = document.getElementById('product-content');
const pageTitle = document.getElementById('page-title');

// CRITICAL: Get the Product ID from the URL query string
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

/**
 * Renders the full detail page content.
 * @param {Object} product - The product object from the API.
 */
const renderProductDetail = (product) => {
    // Set the page title
    pageTitle.textContent = product.name;

    const html = `
        <div class="product-info-grid">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h2>${product.name}</h2>
                <div class="price">$${product.price.toFixed(2)}</div>
                
                <p><strong>Description:</strong> ${product.description}</p>
                
                <div class="info-item">Category: <strong>${product.category}</strong></div>
                <div class="info-item">Company: <strong>${product.company}</strong></div>
                <div class="info-item">Available Inventory: <strong>${product.inventory}</strong></div>
                <div class="info-item">Shipping: <strong>${product.freeShipping ? 'FREE' : 'Calculated at checkout'}</strong></div>
                
                <div class="quantity-cart-group">
                    <input type="number" id="quantity-input" value="1" min="1" max="${product.inventory}">
                    <button class="btn btn-primary add-to-cart-btn" id="add-to-cart-btn">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    productContent.innerHTML = html;

    // Attach event listener after the button is added to the DOM
    const cartButton = document.getElementById('add-to-cart-btn');
    cartButton.addEventListener('click', () => handleAddToCart(product));
};

/**
 * Handles the click event for adding the product to the cart.
 * @param {Object} product - The product being added.
 */
// client/js/product_detail.js

// ... (handleAddToCart function definition)

const handleAddToCart = async (product) => {
    // Get the desired quantity
    const quantityInput = document.getElementById('quantity-input');
    const amount = Number(quantityInput.value);

    if (amount <= 0 || amount > product.inventory) {
        alert(`Please select a valid quantity between 1 and ${product.inventory}.`);
        return;
    }

    // Use the fetchData helper (from global.js) for authenticated request
    try {
        // ✅ FIX 2: Change to POST request targeting the CART API
        // This request requires authentication (handled by fetchData)
        const response = await fetchData(`${API_BASE_URL}/cart`, {
            method: 'POST',
            body: JSON.stringify({ 
                productId: product._id, // Send the ID of the product
                amount: amount          // Send the selected quantity
            })
        });

        if (!response.ok) {
            const error = await response.json();
            // This is where you catch errors like "Not authenticated" or "Out of stock"
            throw new Error(error.msg || 'Could not add item to cart. Check authentication.');
        }

        // Success notification
        alert(`Added ${amount} x ${product.name} to the cart!`);
         // Optional: Redirect or update cart count element here
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        // The error message from fetchData (e.g., "User not authenticated") will be displayed here
        alert(`Failed to add to cart: ${error.message}`);
    }
};
// ...


/**
 * Main function to fetch product details.
 */
const fetchProductDetails = async () => {
    if (!productId) {
        productContent.innerHTML = '<p class="error-message">Error: No product ID provided in the URL.</p>';
        return;
    }

    try {
        // GET /api/products/:id
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        
        if (response.status === 404) {
             productContent.innerHTML = `<p class="error-message">Error: Product not found.</p>`;
             return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        const product = data.product; 

        if (!product) {
             productContent.innerHTML = `<p class="error-message">Error: Product data structure invalid.</p>`;
             return;
        }

        renderProductDetail(product);

    } catch (error) {
        console.error('Fetch Details Error:', error);
        productContent.innerHTML = `<p class="error-message">Failed to load details. API error.</p>`;
    }
};

fetchProductDetails();