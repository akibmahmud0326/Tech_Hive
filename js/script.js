// Global Variables
let products = [];
let filteredProducts = [];
let currentFilter = 'all';
let displayedProductCount = 8;
let currentSlide = 0;
let slideInterval;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    initializeHeader();
    initializeHeroSlider();
    initializeBackToTop();
    initializeModals();
    initializeSearch();
    updateCartCount();
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
});

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        products = await response.json();
        filteredProducts = [...products];
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback products if JSON fails to load
        products = generateFallbackProducts();
        filteredProducts = [...products];
        displayProducts();
    }
}

// Generate fallback products
function generateFallbackProducts() {
    return [
        {
            id: 1,
            title: "Wireless Bluetooth Headphones",
            price: 690,
            originalPrice: 1000,
            rating: 4.5,
            reviews: 256,
            image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500",
            category: "electronics",
            description: "High-quality wireless headphones with noise cancellation",
            inStock: true,
            badge: "Best Seller"
        },
        {
            id: 2,
            title: "Men's Cotton Casual Shirt",
            price: 1200,
            originalPrice: 1500,
            rating: 4.2,
            reviews: 89,
            image: "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=500",
            category: "fashion",
            description: "Comfortable cotton shirt for casual wear",
            inStock: true,
            badge: "Sale"
        },
        {
            id: 3,
            title: "Modern Table Lamp",
            price: 3000,
            originalPrice: 3500,
            rating: 4.7,
            reviews: 134,
            image: "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=500",
            category: "home",
            description: "Stylish table lamp perfect for any room",
            inStock: true,
            badge: "New"
        },
        {
            id: 4,
            title: "Programming Fundamentals Book",
            price: 500,
            originalPrice: 1000,
            rating: 4.6,
            reviews: 78,
            image: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=500",
            category: "books",
            description: "Learn programming from the basics",
            inStock: true,
            badge: ""
        },
        {
            id: 5,
            title: "Yoga Mat Premium",
            price: 3000,
            originalPrice: 4000,
            rating: 4.4,
            reviews: 192,
            image: "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=500",
            category: "sports",
            description: "High-quality yoga mat for all exercises",
            inStock: true,
            badge: "Popular"
        },
        {
            id: 6,
            title: "Natural Face Cream",
            price: 1000,
            originalPrice: 1500,
            rating: 4.3,
            reviews: 167,
            image: "https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=500",
            category: "beauty",
            description: "Organic face cream for all skin types",
            inStock: true,
            badge: "Organic"
        },
        {
            id: 7,
            title: "iPhone X", // Change made here
            price: 25000,
            originalPrice: 30000,
            rating: 4.8,
            reviews: 445,
            image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=500",
            category: "electronics",
            description: "Latest smartphone with advanced features",
            inStock: true,
            badge: "Hot Deal"
        },
        {
            id: 8,
            title: "Women's Running Shoes",
            price: 5000,
            originalPrice: 8000,
            rating: 4.5,
            reviews: 234,
            image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=500",
            category: "fashion",
            description: "Comfortable running shoes for women",
            inStock: true,
            badge: "Comfort+"
        }
    ];
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';
    
    const productsToShow = filteredProducts.slice(0, displayedProductCount);
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });

    // Update load more button
    updateLoadMoreButton();
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => goToProductPage(product.id);

    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.title}" loading="lazy">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-rating">
                <div class="stars">${generateStars(product.rating)}</div>
                <span class="rating-text">(${product.reviews})</span>
            </div>
            <div class="product-price">
                <span class="current-price">৳${product.price}</span>
                ${product.originalPrice !== product.price ? 
                    `<span class="original-price">৳${product.originalPrice}</span>
                     <span class="discount">-${discount}%</span>` : ''}
            </div>
            <div class="product-actions">
                <button class="btn-primary" onclick="event.stopPropagation(); addToCart(${product.id})">
                    Add to Cart
                </button>
                <button class="btn-secondary" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
                    ♡
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    if (hasHalfStar) {
        stars += '☆';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

// Filter products
function filterProducts(category) {
    currentFilter = category;
    displayedProductCount = 8;
    
    if (category === 'all') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }
    
    displayProducts();
    updateFilterTabs();
}

// Filter by category from category cards
function filterByCategory(category) {
    filterProducts(category);
    // Scroll to products section
    document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
}

// Update filter tabs
function updateFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase() === currentFilter || 
            (currentFilter === 'all' && tab.textContent.toLowerCase() === 'all')) {
            tab.classList.add('active');
        }
    });
}

// Update load more button
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    if (displayedProductCount >= filteredProducts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.onclick = loadMoreProducts;
    }
}

// Load more products
function loadMoreProducts() {
    displayedProductCount += 8;
    displayProducts();
}

// Go to product page
function goToProductPage(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Initialize header functionality
function initializeHeader() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // User dropdown (handled by CSS hover)
    
    // Update cart count on all pages
    updateCartCount();
}

// Initialize hero slider
function initializeHeroSlider() {
    const heroSlider = document.getElementById('heroSlider');
    if (!heroSlider) return;

    const slides = heroSlider.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;

    // Auto-slide functionality
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000);

    // Pause on hover
    heroSlider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    heroSlider.addEventListener('mouseleave', () => {
        slideInterval = setInterval(() => {
            nextSlide();
        }, 5000);
    });
}

// Go to specific slide
function goToSlide(slideIndex) {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Add active class to current slide and indicator
    slides[slideIndex].classList.add('active');
    indicators[slideIndex].classList.add('active');
    
    currentSlide = slideIndex;
}

// Next slide
function nextSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
}

// Initialize back to top button
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Initialize modals
function initializeModals() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (!modalOverlay) return;

    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Handle form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Open modal
function openModal(modalId) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modals = document.querySelectorAll('.modal');
    
    // Hide all modals
    modals.forEach(modal => modal.style.display = 'none');
    
    // Show specific modal
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
        targetModal.style.display = 'block';
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Switch between modals
function switchModal(modalId) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
    
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
        targetModal.style.display = 'block';
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    // Simulate login process
    showNotification('Login successful!', 'success');
    closeModal();
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    // Simulate registration process
    showNotification('Account created successfully!', 'success');
    closeModal();
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (!searchInput || !searchBtn || !searchSuggestions) return;

    let searchTimeout;

    // Search input event
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length === 0) {
            hideSuggestions();
            return;
        }

        searchTimeout = setTimeout(() => {
            showSearchSuggestions(query);
        }, 300);
    });

    // Search button click
    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value.trim());
    });

    // Enter key search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value.trim());
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
}

// Show search suggestions
function showSearchSuggestions(query) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    const suggestions = products.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }

    searchSuggestions.innerHTML = suggestions.map(product => `
        <div class="suggestion-item" onclick="selectSuggestion('${product.title}')">
            ${product.title}
        </div>
    `).join('');

    searchSuggestions.style.display = 'block';
}

// Hide search suggestions
function hideSuggestions() {
    const searchSuggestions = document.getElementById('searchSuggestions');
    searchSuggestions.style.display = 'none';
}

// Select suggestion
function selectSuggestion(title) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = title;
    hideSuggestions();
    performSearch(title);
}

// Perform search
function performSearch(query) {
    if (!query) return;

    filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );

    currentFilter = 'search';
    displayedProductCount = filteredProducts.length;
    displayProducts();
    updateFilterTabs();
    hideSuggestions();

    // Scroll to products section
    const productsSection = document.querySelector('.featured-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Cart functionality
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);
    showNotification(`${product.title} added to cart!`, 'success');
}

function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
    showNotification('Item removed from cart', 'info');
}

function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function calculateCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Wishlist functionality
function toggleWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        showNotification('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Newsletter subscription
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    
    // Simulate newsletter subscription
    showNotification('Thank you for subscribing to our newsletter!', 'success');
    e.target.reset();
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-500)' : type === 'error' ? 'var(--error-500)' : 'var(--primary-600)'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);