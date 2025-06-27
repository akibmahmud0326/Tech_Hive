// Cart page specific functionality
let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    updateCartDisplay();
});

// Load cart items from localStorage
function loadCartItems() {
    cart = getCart();
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartContent = document.getElementById('cartContent');
    const emptyCart = document.getElementById('emptyCart');
    const cartItemsCount = document.getElementById('cartItemsCount');

    if (cart.length === 0) {
        cartContent.style.display = 'none';
        emptyCart.style.display = 'block';
        cartItemsCount.textContent = '0 items';
        return;
    }

    cartContent.style.display = 'grid';
    emptyCart.style.display = 'none';
    cartItemsCount.textContent = `${cart.length} item${cart.length > 1 ? 's' : ''}`;

    cartContent.innerHTML = `
        <div class="cart-items">
            <h2>Shopping Cart</h2>
            ${cart.map(item => createCartItemHTML(item)).join('')}
        </div>
        <div class="cart-summary">
            ${createCartSummaryHTML()}
        </div>
    `;

    // Update cart count in header
    updateCartCount();
}

// Create cart item HTML
function createCartItemHTML(item) {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    const optionsText = item.options ? Object.entries(item.options)
        .map(([key, value]) => `${capitalizeFirst(key)}: ${value}`)
        .join(', ') : '';

    return `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="item-details">
                <h3 class="item-title">${item.title}</h3>
                ${optionsText ? `<div class="item-meta">${optionsText}</div>` : ''}
                <div class="item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" 
                               onchange="updateItemQuantity(${item.id}, this.value)">
                        <button class="quantity-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <div class="item-price">৳${itemTotal}</div>
                    <button class="remove-btn" onclick="removeCartItem(${item.id})">Remove</button>
                </div>
            </div>
        </div>
    `;
}

// Create cart summary HTML
function createCartSummaryHTML() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    return `
        <h3 class="summary-title">Order Summary</h3>
        <div class="summary-row">
            <span>Subtotal (${cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>৳${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping</span>
            <span>${shipping === 0 ? 'FREE' : '৳' + shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax</span>
            <span>৳${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>৳${total.toFixed(2)}</span>
        </div>
        <button class="checkout-btn" onclick="proceedToCheckout()">
            Proceed to Checkout
        </button>
        <a href="index.html" class="continue-shopping-btn">
            Continue Shopping
        </a>
        ${subtotal < 50 ? `
            <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 14px; color: #92400e;">
                💡 Add $${(50 - subtotal).toFixed(2)} more for FREE shipping!
            </div>
        ` : ''}
    `;
}

// Update item quantity
function updateItemQuantity(itemId, newQuantity) {
    newQuantity = Math.max(1, Math.min(10, parseInt(newQuantity) || 1));
    
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity = newQuantity;
        saveCart(cart);
        updateCartDisplay();
        showNotification('Cart updated', 'info');
    }
}

// Remove item from cart
function removeCartItem(itemId) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        saveCart(cart);
        updateCartDisplay();
        showNotification(`${removedItem.title} removed from cart`, 'info');
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    // In a real application, this would redirect to a checkout page
    // For demo purposes, we'll show a success message
    showNotification('Redirecting to checkout...', 'success');
    
    // Simulate checkout process
    setTimeout(() => {
        showNotification('Order placed successfully! Thank you for shopping with ShopMax!', 'success');
        // Clear cart after successful checkout
        cart = [];
        saveCart(cart);
        updateCartDisplay();
    }, 2000);
}

// Apply coupon code (demo functionality)
function applyCoupon() {
    const couponInput = document.getElementById('couponInput');
    const couponCode = couponInput?.value?.trim().toUpperCase();
    
    const validCoupons = {
        'SAVE10': 0.10,
        'WELCOME20': 0.20,
        'FREESHIP': 'free_shipping'
    };
    
    if (validCoupons[couponCode]) {
        if (couponCode === 'FREESHIP') {
            showNotification('Free shipping coupon applied!', 'success');
        } else {
            const discount = validCoupons[couponCode] * 100;
            showNotification(`${discount}% discount applied!`, 'success');
        }
        updateCartDisplay();
    } else {
        showNotification('Invalid coupon code', 'error');
    }
    
    if (couponInput) {
        couponInput.value = '';
    }
}

// Save for later functionality
function saveForLater(itemId) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        
        // Get saved items from localStorage
        const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');
        savedItems.push(item);
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
        
        // Remove from cart
        cart.splice(itemIndex, 1);
        saveCart(cart);
        updateCartDisplay();
        
        showNotification(`${item.title} saved for later`, 'info');
    }
}

// Move to cart from saved items
function moveToCart(itemId) {
    const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');
    const itemIndex = savedItems.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
        const item = savedItems[itemIndex];
        
        // Add to cart
        cart.push(item);
        saveCart(cart);
        
        // Remove from saved items
        savedItems.splice(itemIndex, 1);
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
        
        updateCartDisplay();
        showNotification(`${item.title} moved to cart`, 'success');
    }
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Quick add functionality for recommended products
function quickAddToCart(productId) {
    // This would typically fetch product details and add to cart
    // For demo purposes, we'll show a notification
    showNotification('Product added to cart!', 'success');
    updateCartCount();
}

// Estimate delivery date
function getEstimatedDelivery() {
    const today = new Date();
    const deliveryDate = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days from now
    return deliveryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Initialize cart page specific features
function initializeCartFeatures() {
    // Add estimated delivery info
    const deliveryInfo = document.createElement('div');
    deliveryInfo.className = 'delivery-info';
    deliveryInfo.innerHTML = `
        <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin-top: 16px;">
            <strong>📦 Estimated Delivery:</strong> ${getEstimatedDelivery()}
        </div>
    `;
    
    const cartSummary = document.querySelector('.cart-summary');
    if (cartSummary) {
        cartSummary.appendChild(deliveryInfo);
    }
}

// Call initialization when cart is loaded
setTimeout(initializeCartFeatures, 100);