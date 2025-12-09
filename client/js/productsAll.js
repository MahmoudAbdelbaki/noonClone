// Products Page with Filtering - Updated for your real API
class ProductsPage {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.filters = {
            categories: [],
            priceRange: { min: 0, max: 1000 }, // Adjust based on your product prices
            scents: [],
            intensities: [],
            inStockOnly: false,
            onSale: false
        };
        this.sortBy = 'featured';
        this.API_BASE_URL = '/api/products'; // Your actual API endpoint
        this.categories = []; // Will be fetched from API
        this.scents = []; // Will be fetched from API
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🛍️ Initializing Products Page');
        this.setupEventListeners();
        await this.loadProducts();
        this.extractFilterOptions();
        this.setupFilters();
        this.applyFilters();
    }
    
    setupEventListeners() {
        // Mobile filters toggle
        const mobileToggle = document.getElementById('mobile-filters-toggle');
        const filtersSidebar = document.getElementById('filters-sidebar');
        
        if (mobileToggle && filtersSidebar) {
            mobileToggle.addEventListener('click', () => {
                filtersSidebar.classList.toggle('active');
                mobileToggle.innerHTML = filtersSidebar.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-filter"></i>';
            });
        }
        
        // Clear all filters
        const clearBtn = document.getElementById('clear-all-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }
        
        // Sort select
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }
        
        // Price inputs
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        
        if (minPrice && maxPrice) {
            // Set initial values based on your product price range
            minPrice.value = this.filters.priceRange.min;
            maxPrice.value = this.filters.priceRange.max;
            
            minPrice.addEventListener('change', () => this.updatePriceFilter());
            maxPrice.addEventListener('change', () => this.updatePriceFilter());
        }
        
        // Close filters when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (filtersSidebar && filtersSidebar.classList.contains('active') && 
                !filtersSidebar.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                filtersSidebar.classList.remove('active');
                mobileToggle.innerHTML = '<i class="fas fa-filter"></i>';
            }
        });
    }
    
    async loadProducts() {
        try {
            console.log('📦 Loading products from API...');
            
            // Fetch products from your real API
            const response = await fetch(this.API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Handle different API response formats
            if (data.products && Array.isArray(data.products)) {
                this.products = data.products;
            } else if (Array.isArray(data)) {
                this.products = data;
            } else {
                console.error('Unexpected API response format:', data);
                this.products = [];
            }
            
            console.log(`✅ Loaded ${this.products.length} products from API`);
            
            // Extract price range from actual products
            this.updatePriceRangeFromProducts();
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            this.showError('Failed to load products. Please refresh the page.');
            
            // Fallback to mock data for demo
            this.products = await this.getMockProducts();
            console.log('🔄 Using mock data');
        }
    }
    
    extractFilterOptions() {
        // Extract unique categories from products
        this.categories = [...new Set(this.products.map(p => p.category).filter(Boolean))];
        
        // Extract unique scents from products
        this.scents = [...new Set(this.products.map(p => p.scent).filter(Boolean))];
        
        // Extract price range
        const prices = this.products.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
            const minPrice = Math.floor(Math.min(...prices));
            const maxPrice = Math.ceil(Math.max(...prices));
            
            // Update price filter range
            this.filters.priceRange = { min: minPrice, max: maxPrice };
            
            // Update price inputs
            const minInput = document.getElementById('min-price');
            const maxInput = document.getElementById('max-price');
            if (minInput) minInput.value = minPrice;
            if (maxInput) maxInput.value = maxPrice;
            if (minInput) minInput.placeholder = `$${minPrice}`;
            if (maxInput) maxInput.placeholder = `$${maxPrice}`;
        }
    }
    
    updatePriceRangeFromProducts() {
        const prices = this.products.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
            const minPrice = Math.floor(Math.min(...prices));
            const maxPrice = Math.ceil(Math.max(...prices));
            
            // Add some padding
            this.filters.priceRange = { 
                min: Math.max(0, minPrice - 10), 
                max: maxPrice + 10 
            };
        }
    }
    
    setupFilters() {
        this.setupCategoryFilters();
        this.setupScentFilters();
        this.setupIntensityFilters();
        this.setupCheckboxFilters();
        this.setupPriceSlider();
    }
    
    setupCategoryFilters() {
        const container = document.getElementById('category-filters');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.categories.forEach(category => {
            const count = this.products.filter(p => p.category === category).length;
            
            const option = document.createElement('div');
            option.className = 'filter-option';
            option.innerHTML = `
                <input type="checkbox" id="category-${category}" value="${category}" class="filter-checkbox">
                <label for="category-${category}" class="filter-label">
                    <span>${this.formatCategoryName(category)}</span>
                    <span class="filter-count">${count}</span>
                </label>
            `;
            
            const checkbox = option.querySelector('input');
            checkbox.addEventListener('change', () => {
                this.updateCategoryFilter(category, checkbox.checked);
            });
            
            container.appendChild(option);
        });
        
        // Update category count
        const categoryCount = document.getElementById('category-count');
        if (categoryCount) {
            categoryCount.textContent = this.categories.length;
        }
    }
    
    setupScentFilters() {
        const container = document.getElementById('scent-filters');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.scents.forEach(scent => {
            const count = this.products.filter(p => p.scent === scent).length;
            
            const option = document.createElement('div');
            option.className = 'filter-option';
            option.innerHTML = `
                <input type="checkbox" id="scent-${scent}" value="${scent}" class="filter-checkbox">
                <label for="scent-${scent}" class="filter-label">
                    <span>${this.formatScentName(scent)}</span>
                    <span class="filter-count">${count}</span>
                </label>
            `;
            
            const checkbox = option.querySelector('input');
            checkbox.addEventListener('change', () => {
                this.updateScentFilter(scent, checkbox.checked);
            });
            
            container.appendChild(option);
        });
        
        // Update scent count
        const scentCount = document.getElementById('scent-count');
        if (scentCount) {
            scentCount.textContent = this.scents.length;
        }
    }
    
    setupIntensityFilters() {
        const intensities = ['light', 'medium', 'strong'];
        const container = document.getElementById('intensity-filters');
        if (!container) return;
        
        intensities.forEach(intensity => {
            const count = this.products.filter(p => p.intensity === intensity).length;
            const countElement = container.querySelector(`#intensity-${intensity} ~ .filter-label .filter-count`);
            if (countElement) {
                countElement.textContent = count;
            }
            
            const checkbox = container.querySelector(`#intensity-${intensity}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updateIntensityFilter(intensity, checkbox.checked);
                });
            }
        });
        
        // Update intensity count
        const intensityCount = document.getElementById('intensity-count');
        if (intensityCount) {
            intensityCount.textContent = intensities.length;
        }
    }
    
    setupCheckboxFilters() {
        // In Stock Only
        const inStockCheckbox = document.getElementById('in-stock');
        if (inStockCheckbox) {
            inStockCheckbox.addEventListener('change', () => {
                this.filters.inStockOnly = inStockCheckbox.checked;
                this.applyFilters();
            });
        }
        
        // On Sale
        const onSaleCheckbox = document.getElementById('on-sale');
        if (onSaleCheckbox) {
            onSaleCheckbox.addEventListener('change', () => {
                this.filters.onSale = onSaleCheckbox.checked;
                this.applyFilters();
            });
        }
    }
    
    setupPriceSlider() {
        // Simple price range implementation - you can enhance this with a proper slider
        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');
        
        if (minInput && maxInput) {
            // Add debounce to prevent too many updates
            let timeout;
            const updateWithDebounce = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.updatePriceFilter(), 300);
            };
            
            minInput.addEventListener('input', updateWithDebounce);
            maxInput.addEventListener('input', updateWithDebounce);
        }
    }
    
    updateCategoryFilter(category, isChecked) {
        if (isChecked) {
            this.filters.categories.push(category);
        } else {
            this.filters.categories = this.filters.categories.filter(c => c !== category);
        }
        this.applyFilters();
    }
    
    updateScentFilter(scent, isChecked) {
        if (isChecked) {
            this.filters.scents.push(scent);
        } else {
            this.filters.scents = this.filters.scents.filter(s => s !== scent);
        }
        this.applyFilters();
    }
    
    updateIntensityFilter(intensity, isChecked) {
        if (isChecked) {
            this.filters.intensities.push(intensity);
        } else {
            this.filters.intensities = this.filters.intensities.filter(i => i !== intensity);
        }
        this.applyFilters();
    }
    
    updatePriceFilter() {
        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');
        
        if (minInput && maxInput) {
            const min = parseInt(minInput.value) || 0;
            const max = parseInt(maxInput.value) || 1000;
            
            // Validate min <= max
            if (min <= max) {
                this.filters.priceRange = { min, max };
                this.applyFilters();
            }
        }
    }
    
    clearAllFilters() {
        // Reset all filters
        this.filters = {
            categories: [],
            priceRange: { min: 0, max: 1000 },
            scents: [],
            intensities: [],
            inStockOnly: false,
            onSale: false
        };
        
        // Update UI
        document.querySelectorAll('.filter-checkbox').forEach(cb => {
            cb.checked = false;
        });
        
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        if (minPrice) minPrice.value = this.filters.priceRange.min;
        if (maxPrice) maxPrice.value = this.filters.priceRange.max;
        
        // Update checkboxes
        const inStockCheckbox = document.getElementById('in-stock');
        const onSaleCheckbox = document.getElementById('on-sale');
        if (inStockCheckbox) inStockCheckbox.checked = false;
        if (onSaleCheckbox) onSaleCheckbox.checked = false;
        
        this.applyFilters();
    }
    
    applyFilters() {
        console.log('🔍 Applying filters:', this.filters);
        
        // Start with all products
        let filtered = [...this.products];
        
        // Apply category filter
        if (this.filters.categories.length > 0) {
            filtered = filtered.filter(product => 
                this.filters.categories.includes(product.category)
            );
        }
        
        // Apply scent filter
        if (this.filters.scents.length > 0) {
            filtered = filtered.filter(product => 
                this.filters.scents.includes(product.scent)
            );
        }
        
        // Apply intensity filter
        if (this.filters.intensities.length > 0) {
            filtered = filtered.filter(product => 
                this.filters.intensities.includes(product.intensity)
            );
        }
        
        // Apply price filter
        filtered = filtered.filter(product => 
            product.price >= this.filters.priceRange.min && 
            product.price <= this.filters.priceRange.max
        );
        
        // Apply in stock filter
        if (this.filters.inStockOnly) {
            filtered = filtered.filter(product => product.inStock !== false);
        }
        
        // Apply on sale filter
        if (this.filters.onSale) {
            filtered = filtered.filter(product => product.onSale === true || product.originalPrice > product.price);
        }
        
        // Apply sorting
        filtered = this.sortProducts(filtered, this.sortBy);
        
        this.filteredProducts = filtered;
        this.currentPage = 1; // Reset to first page when filters change
        
        this.renderProducts();
        this.updateResultsCount();
        this.renderPagination();
    }
    
    sortProducts(products, sortBy) {
        const sorted = [...products];
        
        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-high':
                return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'name-asc':
                return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case 'name-desc':
                return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            case 'best-selling':
                return sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
            case 'featured':
            default:
                return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
        }
    }
    
    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button class="btn btn-outline" onclick="productsPage.clearAllFilters()" style="margin-top: 1rem;">
                        Clear All Filters
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        
        // Add event listeners to add-to-cart buttons
        this.setupAddToCartButtons();
    }
    
    createProductCard(product) {
        const isOnSale = product.onSale || (product.originalPrice && product.originalPrice > product.price);
        const badge = isOnSale ? '<span class="product-badge">Sale</span>' : 
                     product.featured ? '<span class="product-badge">Featured</span>' : '';
        
        const priceHTML = isOnSale && product.originalPrice ? 
            `<div class="product-price">
                $${product.price.toFixed(2)}
                <span class="original">$${product.originalPrice.toFixed(2)}</span>
            </div>` :
            `<div class="product-price">$${product.price.toFixed(2)}</div>`;
        
        const outOfStock = product.inStock === false ? 'disabled' : '';
        const buttonText = product.inStock === false ? 'Out of Stock' : 'Add to Cart';
        
        return `
            <div class="product-card" data-product-id="${product.id || product._id}">
                ${badge}
                <div class="product-image">
                    <img src="${product.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop'}" 
                         alt="${product.name}">
                </div>
                <div class="product-info">
                    <span class="product-category">${this.formatCategoryName(product.category || 'uncategorized')}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || 'Luxury fragrance crafted with care'}</p>
                    <div class="product-footer">
                        ${priceHTML}
                        <button class="add-to-cart-btn" ${outOfStock} data-product-id="${product.id || product._id}">
                            ${buttonText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupAddToCartButtons() {
        document.querySelectorAll('.add-to-cart-btn:not(:disabled)').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.dataset.productId;
                await this.addToCart(productId, e.target);
            });
        });
    }
    
    async addToCart(productId, button) {
        try {
            button.disabled = true;
            button.textContent = 'Adding...';
            
            const token = window.getToken ? window.getToken() : null;
            
            if (!token) {
                // Redirect to login if not authenticated
                window.location.href = 'login.html?redirect=shop-all.html';
                return;
            }
            
            const response = await window.fetchData('/api/cart', {
                method: 'POST',
                body: JSON.stringify({
                    productId: productId,
                    amount: 1
                })
            });
            
            if (response.ok) {
                button.textContent = 'Added!';
                button.classList.add('added');
                
                // Update cart count
                if (window.updateCartCount) {
                    window.updateCartCount();
                }
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    button.textContent = 'Add to Cart';
                    button.classList.remove('added');
                    button.disabled = false;
                }, 2000);
            } else {
                throw new Error('Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            button.textContent = 'Add to Cart';
            button.disabled = false;
            alert('Failed to add item to cart. Please try again.');
        }
    }
    
    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        const totalCount = document.getElementById('total-count');
        
        if (resultsCount) {
            resultsCount.textContent = this.filteredProducts.length;
        }
        if (totalCount) {
            totalCount.textContent = this.products.length;
        }
    }
    
    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;
        
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="productsPage.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${this.currentPage === i ? 'active' : ''}" 
                            onclick="productsPage.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Next button
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="productsPage.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        container.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        if (page < 1 || page > Math.ceil(this.filteredProducts.length / this.productsPerPage)) {
            return;
        }
        
        this.currentPage = page;
        this.renderProducts();
        this.renderPagination();
        
        // Scroll to top of products
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    showError(message) {
        const container = document.getElementById('products-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="grid-column: 1 / -1;">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                    <button onclick="productsPage.loadProducts()" class="btn btn-outline" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
    
    formatCategoryName(category) {
        if (!category) return 'Uncategorized';
        return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
    }
    
    formatScentName(scent) {
        if (!scent) return 'Unknown';
        return scent.charAt(0).toUpperCase() + scent.slice(1);
    }
    
    async getMockProducts() {
        // Fallback mock data if API fails
        return [
            {
                id: '1',
                name: 'Midnight Bloom',
                category: 'perfume',
                price: 89.99,
                originalPrice: 109.99,
                image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop',
                scent: 'floral',
                intensity: 'medium',
                inStock: true,
                onSale: true,
                description: 'A captivating floral fragrance with notes of jasmine and night-blooming cereus.'
            },
            // ... more mock products as needed
        ];
    }
}

// Initialize products page when DOM is loaded
let productsPage;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing ProductsPage');
    productsPage = new ProductsPage();
});

// Make it globally available
window.productsPage = productsPage;