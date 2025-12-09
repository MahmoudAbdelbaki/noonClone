// Assume the API base URL is defined in client/js/global.js or hardcoded here
const API_BASE_URL = 'http://localhost:5000/api'; 
const productsContainer = document.getElementById('featured-products-container');

/**
 * Creates the HTML markup for a single product card.
 * @param {Object} product - The product data object from the API.
 */
const createProductCard = (product) => {
    return `
        <article class="product-card">
    <a href="product_detail.html?id=${product._id}">
        <div class="card-image">
            ${product.featured ? '<span class="badge">Featured</span>' : ''}
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="card-info">
            <h3>${product.name}</h3>
            <span class="price">$${product.price.toFixed(2)}</span>
        </div>
    </a>
</article>
    `;
};

/**
 * Fetches featured products and renders them on the page.
 */
const fetchAndRenderFeaturedProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`); 
        
        if (!response.ok) {
            // Log HTTP status error if the response wasn't 200 OK
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        const products = data.products; 

        if (!products || products.length === 0) {
            productsContainer.innerHTML = `<p>No products found in the database. Add some using the admin panel!</p>`;
            return;
        }

        // Display the first 3 products
        const featuredHtml = products
            .slice(0, 3) 
            .map(createProductCard)
            .join('');
            
        productsContainer.innerHTML = featuredHtml;

    } catch (error) {
        console.error('Frontend Fetch Error:', error);
        productsContainer.innerHTML = `<p class="error-message">Error loading products. Check the server console or network tab.</p>`;
    }
};

fetchAndRenderFeaturedProducts();