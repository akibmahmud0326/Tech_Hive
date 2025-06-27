// Product page specific functionality
let currentProduct = null;
let selectedOptions = {};
let quantity = 1;

document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    initializeProductPage();
});

// Load product details from URL parameter
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Try to load from products.json first
        const response = await fetch('data/products.json');
        const products = await response.json();
        currentProduct = products.find(p => p.id === productId);
    } catch (error) {
        console.error('Error loading product:', error);
        // Fallback to generated products
        const products = generateFallbackProducts();
        currentProduct = products.find(p => p.id === productId);
    }

    if (!currentProduct) {
        window.location.href = 'index.html';
        return;
    }

    displayProductDetails();
    loadRelatedProducts();
}

// Display product details
function displayProductDetails() {
    if (!currentProduct) return;

    // Update page title and breadcrumb
    document.title = `${currentProduct.title} - TechHive`;
    document.getElementById('productCategory').textContent = capitalizeFirst(currentProduct.category);
    document.getElementById('productName').textContent = currentProduct.title;

    // Create product detail HTML
    const productContainer = document.getElementById('productContainer');
    productContainer.innerHTML = `
        <div class="product-images">
            <div class="main-image" onclick="openImageZoom('${currentProduct.image}')">
                <img src="${currentProduct.image}" alt="${currentProduct.title}" id="mainProductImage">
            </div>
            <div class="thumbnail-images">
                ${generateThumbnails()}
            </div>
        </div>
        
        <div class="product-details">
            <h1>${currentProduct.title}</h1>
            
            <div class="product-meta">
                <div class="product-rating">
                    <div class="stars">${generateStars(currentProduct.rating)}</div>
                    <span class="rating-text">(${currentProduct.reviews} reviews)</span>
                </div>
                <span class="stock-status ${currentProduct.inStock ? 'in-stock' : 'out-of-stock'}">
                    ${currentProduct.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                </span>
            </div>
            
            <div class="product-price-section">
                <div class="product-price">
                    <span class="current-price">৳${currentProduct.price}</span>
                    ${currentProduct.originalPrice !== currentProduct.price ? 
                        `<span class="original-price">৳${currentProduct.originalPrice}</span>
                         <span class="discount">-${Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)}%</span>` : ''}
                </div>
            </div>
            
            <div class="product-description">
                <h3>Description</h3>
                <p>${currentProduct.description || 'High-quality product with excellent features and reliability.'}</p>
            </div>
            
            <div class="product-options">
                ${generateProductOptions()}
            </div>
            
            <div class="quantity-selector">
                <label>Quantity:</label>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                    <input type="number" class="quantity-input" value="1" min="1" max="10" id="quantityInput" onchange="updateQuantity(this.value)">
                    <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                </div>
            </div>
            
            <div class="product-actions-section">
                <button class="btn-large btn-add-cart" onclick="addProductToCart()" ${!currentProduct.inStock ? 'disabled' : ''}>
                    Add to Cart - ৳${(currentProduct.price * quantity).toFixed(2)}
                </button>
                <button class="btn-large btn-buy-now" onclick="buyNow()" ${!currentProduct.inStock ? 'disabled' : ''}>
                    Buy Now
                </button>
            </div>
            
            <div class="product-specs">
                <h3>Specifications</h3>
                <table class="specs-table">
                    ${generateSpecifications()}
                </table>
            </div>
        </div>
    `;
}

// Generate thumbnails
function generateThumbnails() {
    // For demo purposes, we'll show the same image as thumbnails
    // In a real app, you'd have multiple product images
    const thumbnailImages = [
        currentProduct.image,
        currentProduct.image,
        currentProduct.image,
        currentProduct.image
    ];

    return thumbnailImages.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
            <img src="${img}" alt="Product view ${index + 1}">
        </div>
    `).join('');
}

// Generate product options (size, color, etc.)
function generateProductOptions() {
    let optionsHTML = '';
    
    // Size options for fashion items
    if (currentProduct.category === 'fashion') {
        optionsHTML += `
            <div class="option-group">
                <label>Size:</label>
                <div class="option-buttons">
                    <button class="option-btn" onclick="selectOption('size', 'S', this)">S</button>
                    <button class="option-btn" onclick="selectOption('size', 'M', this)">M</button>
                    <button class="option-btn selected" onclick="selectOption('size', 'L', this)">L</button>
                    <button class="option-btn" onclick="selectOption('size', 'XL', this)">XL</button>
                </div>
            </div>
        `;
        selectedOptions.size = 'L';
    }
    
    // Color options
    if (currentProduct.category === 'fashion' || currentProduct.category === 'electronics') {
        optionsHTML += `
            <div class="option-group">
                <label>Color:</label>
                <div class="option-buttons">
                    <button class="option-btn selected" onclick="selectOption('color', 'Black', this)">Black</button>
                    <button class="option-btn" onclick="selectOption('color', 'White', this)">White</button>
                    <button class="option-btn" onclick="selectOption('color', 'Blue', this)">Blue</button>
                </div>
            </div>
        `;
        selectedOptions.color = 'Black';
    }
    
    return optionsHTML;
}

// Generate specifications
function generateSpecifications() {
    // Default values
    let brand = '';
    let model = '';
    let writer = '';

    // Set Brand/Model/Writer based on product title and category
    switch (currentProduct.category) {
        case 'electronics':
            if (currentProduct.title.includes('Wireless Bluetooth')) {
                brand = 'Xtrike Me HD-214 Bluetooth Wireless Headset';
                model = 'HD-214';
            } else if (currentProduct.title.toLowerCase().includes('iphone')) {
                brand = 'Apple';
                model = 'iPhone X';
            } else if (currentProduct.title.includes('ONIKUMA')) {
                brand = 'ONIKUMA';
                model = 'ONIKUMA G58';
            } else if (currentProduct.title.toLowerCase().includes('apple watch')) {
                brand = 'Apple';
                model = 'SERIES 7';
            }
            break;
        case 'fashion':
            if (currentProduct.title.includes('Cotton Casual Shirt')) {
                brand = 'Richman';
                model = 'S5';
            } else if (currentProduct.title.includes('Running Shoes')) {
                brand = 'Nike';
                model = 'Airforce 1';
            } else if (currentProduct.title.includes('Leather Bag')) {
                brand = 'Easy';
                model = 'E45';
            }
            break;
        case 'home':
        case 'home & garden':
            if (currentProduct.title.includes('Table Lamp')) {
                brand = 'Mid-century';
                model = 'IQ7';
            } else if (currentProduct.title.includes('Coffee Maker')) {
                brand = 'Walton';
                model = 'RR';
            } else if (currentProduct.title.includes('Decorative Vase')) {
                brand = 'Mid-Century';
                model = 'U8';
            }
            break;
        case 'books':
            if (currentProduct.title.includes('Programming Fundamentals')) {
                writer = 'Raduan Ahamed';
            } else if (currentProduct.title.includes('Cookbook Collection')) {
                writer = 'Hatman Cook';
            }
            break;
        case 'sports':
            if (currentProduct.title.includes('Yoga Mat')) {
                brand = 'Nike';
                model = 'R7E';
            } else if (currentProduct.title.includes('Resistance Bands')) {
                brand = 'Adidas';
                model = 'TU8';
            }
            break;
        case 'beauty':
            if (currentProduct.title.includes('Face Cream')) {
                brand = 'Ponds';
                model = 'New 2025';
            } else if (currentProduct.title.includes('Serum')) {
                brand = 'Garnier';
                model = 'EFR2';
            }
            break;
    }

    // Build the specs table
    const commonSpecs = {
        ...(brand && { 'Brand': brand }),
        ...(model && { 'Model': model }),
        ...(writer && { 'Writer': writer }),
        'Category': capitalizeFirst(currentProduct.category),
        'Availability': currentProduct.inStock ? 'In Stock' : 'Out of Stock',
        'Rating': `${currentProduct.rating}/5 stars`,
        'Reviews': `${currentProduct.reviews} customer reviews`
    };

    // Category-specific specs
    let categorySpecs = {};
    switch(currentProduct.category) {
        case 'electronics':
            categorySpecs = {
                'Warranty': '1 Year',
                'Power': '110-240V',
                'Connectivity': 'Bluetooth, WiFi'
            };
            break;
        case 'fashion':
            categorySpecs = {
                'Material': '100% Cotton',
                'Care Instructions': 'Machine wash cold',
                'Origin': 'Made in Bangladesh'
            };
            break;
        case 'home':
        case 'home & garden':
            categorySpecs = {
                'Dimensions': '12" x 8" x 6"',
                'Weight': '2.5 kg',
                'Material': 'High-quality plastic'
            };
            break;
        case 'books':
            categorySpecs = {
                'Pages': '320',
                'Publisher': 'Tech Publications',
                'Language': 'English'
            };
            break;
        case 'sports':
            categorySpecs = {
                'Material': 'Premium rubber',
                'Dimensions': '72" x 24"',
                'Thickness': '6mm'
            };
            break;
        case 'beauty':
            categorySpecs = {
                'Volume': '50ml',
                'Skin Type': 'All skin types',
                'Ingredients': 'Natural extracts'
            };
            break;
    }

    const allSpecs = { ...commonSpecs, ...categorySpecs };

    return Object.entries(allSpecs).map(([key, value]) => `
        <tr>
            <td>${key}</td>
            <td>${value}</td>
        </tr>
    `).join('');
}

// Initialize product page functionality
function initializeProductPage() {
    // Any additional initialization for product page
}

// Change main image
function changeMainImage(imageSrc, thumbnailElement) {
    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = imageSrc;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    thumbnailElement.classList.add('active');
}

// Select product option
function selectOption(optionType, optionValue, buttonElement) {
    // Update selected options
    selectedOptions[optionType] = optionValue;
    
    // Update UI
    const optionGroup = buttonElement.parentElement;
    optionGroup.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    buttonElement.classList.add('selected');
    
    // Update price if needed
    updateProductPrice();
}

// Change quantity
function changeQuantity(change) {
    const quantityInput = document.getElementById('quantityInput');
    const newQuantity = Math.max(1, Math.min(10, quantity + change));
    quantity = newQuantity;
    quantityInput.value = quantity;
    updateProductPrice();
}

// Update quantity from input
function updateQuantity(value) {
    quantity = Math.max(1, Math.min(10, parseInt(value) || 1));
    document.getElementById('quantityInput').value = quantity;
    updateProductPrice();
}

// Update product price based on quantity and options
function updateProductPrice() {
    const addToCartBtn = document.querySelector('.btn-add-cart');
    if (addToCartBtn && currentProduct) {
        const totalPrice = (currentProduct.price * quantity).toFixed(2);
        addToCartBtn.textContent = `Add to Cart - ৳${totalPrice}`;
    }
}

// Add product to cart
function addProductToCart() {
    if (!currentProduct || !currentProduct.inStock) return;

    const cart = getCart();
    const cartItem = {
        id: currentProduct.id,
        title: currentProduct.title,
        price: currentProduct.price,
        image: currentProduct.image,
        quantity: quantity,
        options: { ...selectedOptions }
    };

    // Check if item with same options exists
    const existingItemIndex = cart.findIndex(item => 
        item.id === currentProduct.id && 
        JSON.stringify(item.options) === JSON.stringify(selectedOptions)
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    saveCart(cart);
    showNotification(`${currentProduct.title} added to cart!`, 'success');
}

// Buy now functionality
function buyNow() {
    addProductToCart();
    window.location.href = 'cart.html';
}

// Open image zoom
function openImageZoom(imageSrc) {
    const zoomModal = document.getElementById('zoomModal');
    const zoomedImage = document.getElementById('zoomedImage');
    
    zoomedImage.src = imageSrc;
    zoomModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close image zoom
function closeZoom() {
    const zoomModal = document.getElementById('zoomModal');
    zoomModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Load related products
async function loadRelatedProducts() {
    if (!currentProduct) return;

    try {
        const response = await fetch('data/products.json');
        const allProducts = await response.json();
        
        // Get related products from same category, excluding current product
        const relatedProducts = allProducts
            .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
            .slice(0, 4);

        displayRelatedProducts(relatedProducts);
    } catch (error) {
        console.error('Error loading related products:', error);
        // Fallback to generated products
        const allProducts = generateFallbackProducts();
        const relatedProducts = allProducts
            .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
            .slice(0, 4);
            
        displayRelatedProducts(relatedProducts);
    }
}

// Display related products
function displayRelatedProducts(relatedProducts) {
    const relatedContainer = document.getElementById('relatedProducts');
    if (!relatedContainer) return;

    relatedContainer.innerHTML = relatedProducts.map(product => {
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        
        return `
            <div class="product-card" onclick="goToProductPage(${product.id})">
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
            </div>
        `;
    }).join('');
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Close zoom modal when clicking outside
document.addEventListener('click', function(e) {
    const zoomModal = document.getElementById('zoomModal');
    if (e.target === zoomModal) {
        closeZoom();
    }
});