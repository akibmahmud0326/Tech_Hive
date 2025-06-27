// Admin Dashboard Functionality
let currentAdmin = null;
let adminProducts = [];
let adminOrders = [];
let editingProductId = null;

// Admin credentials
const adminCredentials = {
    'Raduan': 'TechHive1',
    'Akib': 'TechHive2',
    'Azmira': 'TechHive3'
};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initializeAdminDashboard();
});

// Check admin authentication
function checkAdminAuth() {
    const loggedInAdmin = localStorage.getItem('adminLoggedIn');
    if (loggedInAdmin) {
        currentAdmin = loggedInAdmin;
        hideLoginModal();
        loadAdminData();
    } else {
        showLoginModal();
    }
}

// Show login modal
function showLoginModal() {
    const loginModal = document.getElementById('adminLoginModal');
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide login modal
function hideLoginModal() {
    const loginModal = document.getElementById('adminLoginModal');
    loginModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Update admin name in header
    const adminNameElement = document.getElementById('adminName');
    if (adminNameElement && currentAdmin) {
        adminNameElement.textContent = currentAdmin;
    }
}

// Initialize admin dashboard
function initializeAdminDashboard() {
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const loginError = document.getElementById('loginError');
    
    if (adminCredentials[username] && adminCredentials[username] === password) {
        currentAdmin = username;
        localStorage.setItem('adminLoggedIn', username);
        hideLoginModal();
        loadAdminData();
        showNotification(`Welcome back, ${username}!`, 'success');
    } else {
        loginError.style.display = 'block';
        showNotification('Invalid credentials', 'error');
    }
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    currentAdmin = null;
    window.location.href = 'index.html';
}

// Load admin data
function loadAdminData() {
    loadAdminProducts();
    loadAdminOrders();
    updateDashboardStats();
}

// Load products for admin
async function loadAdminProducts() {
    try {
        // Load from localStorage first (for added/modified products)
        const storedProducts = localStorage.getItem('adminProducts');
        if (storedProducts) {
            adminProducts = JSON.parse(storedProducts);
        } else {
            // Load from JSON file as fallback
            const response = await fetch('data/products.json');
            adminProducts = await response.json();
            // Add stock and other admin fields
            adminProducts = adminProducts.map(product => ({
                ...product,
                stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
                inStock: true
            }));
            saveAdminProducts();
        }
        displayAdminProducts();
    } catch (error) {
        console.error('Error loading admin products:', error);
        adminProducts = [];
        displayAdminProducts();
    }
}

// Save admin products to localStorage
function saveAdminProducts() {
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    // Also update the main products for the store
    localStorage.setItem('products', JSON.stringify(adminProducts));
}

// Display admin products
function displayAdminProducts() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = adminProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>
                <img src="${product.image}" alt="${product.title}" class="admin-product-image">
            </td>
            <td class="product-title-cell">${product.title}</td>
            <td><span class="category-badge">${product.category}</span></td>
            <td>৳${product.price}</td>
            <td>
                <span class="stock-badge ${product.stock > 10 ? 'in-stock' : 'low-stock'}">
                    ${product.stock}
                </span>
            </td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editProduct(${product.id})" title="Edit">
                    ✏️
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})" title="Delete">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

// Load admin orders
function loadAdminOrders() {
    // Generate sample orders for demo
    const sampleOrders = generateSampleOrders();
    const storedOrders = localStorage.getItem('adminOrders');
    
    if (storedOrders) {
        adminOrders = JSON.parse(storedOrders);
    } else {
        adminOrders = sampleOrders;
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
    }
    
    displayAdminOrders();
}

// Generate sample orders
function generateSampleOrders() {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const customers = ['Mahir Foysal', 'Ashik Mir', 'Mohima Sharmin', 'Hasibul Hasan', 'Rafiqur Rahman'];
    const orders = [];

    for (let i = 1; i <= 20; i++) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
        
        const numItems = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let total = 0;

        for (let j = 0; j < numItems; j++) {
            const randomProduct = adminProducts[Math.floor(Math.random() * adminProducts.length)];
            if (randomProduct) {
                const quantity = Math.floor(Math.random() * 3) + 1;
                orderItems.push({
                    productId: randomProduct.id,
                    title: randomProduct.title,
                    price: randomProduct.price,
                    quantity: quantity
                });
                total += randomProduct.price * quantity;
            }
        }

        orders.push({
            id: 1000 + i,
            customer: customers[Math.floor(Math.random() * customers.length)],
            date: orderDate.toISOString().split('T')[0],
            items: orderItems,
            total: total,
            status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }

    return orders;
}

// Display admin orders
function displayAdminOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = adminOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.date}</td>
            <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td class="actions-cell">
                <button class="btn-view" onclick="viewOrderDetails(${order.id})" title="View Details">
                    👁️
                </button>
                <button class="btn-delete" onclick="deleteOrder(${order.id})" title="Delete">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

// Update dashboard stats
function updateDashboardStats() {
    const totalProducts = adminProducts.length;
    const totalOrders = adminOrders.length;
    const totalRevenue = adminOrders.reduce((sum, order) => sum + order.total, 0);
    const totalCustomers = new Set(adminOrders.map(order => order.customer)).size;

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `৳${totalRevenue.toFixed(2)}`;
    document.getElementById('totalCustomers').textContent = totalCustomers;
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Open add product modal
function openAddProductModal() {
    editingProductId = null;
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productSubmitBtn').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('addProductModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close product modal
function closeProductModal() {
    document.getElementById('addProductModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    editingProductId = null;
}

// Handle product form submission
function handleProductSubmit(e) {
    e.preventDefault();

    const productData = {
        title: document.getElementById('productTitle').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        originalPrice: parseFloat(document.getElementById('productOriginalPrice').value) || parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        badge: document.getElementById('productBadge').value,
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        rating: 4.0 + Math.random(), // Random rating between 4.0-5.0
        reviews: Math.floor(Math.random() * 200) + 10, // Random reviews 10-210
        inStock: true
    };

    if (editingProductId) {
        // Update existing product
        const productIndex = adminProducts.findIndex(p => p.id === editingProductId);
        if (productIndex > -1) {
            adminProducts[productIndex] = { ...adminProducts[productIndex], ...productData };
            showNotification('Product updated successfully!', 'success');
        }
    } else {
        // Add new product
        const newId = Math.max(...adminProducts.map(p => p.id), 0) + 1;
        productData.id = newId;
        adminProducts.push(productData);
        showNotification('Product added successfully!', 'success');
    }

    saveAdminProducts();
    displayAdminProducts();
    updateDashboardStats();
    closeProductModal();
}

// Edit product
function editProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productSubmitBtn').textContent = 'Update Product';

    // Fill form with product data
    document.getElementById('productTitle').value = product.title;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productOriginalPrice').value = product.originalPrice;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;

    document.getElementById('addProductModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        adminProducts = adminProducts.filter(p => p.id !== productId);
        saveAdminProducts();
        displayAdminProducts();
        updateDashboardStats();
        showNotification('Product deleted successfully!', 'success');
    }
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredProducts = adminProducts;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product =>
            product.category === categoryFilter
        );
    }

    // Update table with filtered products
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>
                <img src="${product.image}" alt="${product.title}" class="admin-product-image">
            </td>
            <td class="product-title-cell">${product.title}</td>
            <td><span class="category-badge">${product.category}</span></td>
            <td>৳${product.price}</td>
            <td>
                <span class="stock-badge ${product.stock > 10 ? 'in-stock' : 'low-stock'}">
                    ${product.stock}
                </span>
            </td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editProduct(${product.id})" title="Edit">
                    ✏️
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})" title="Delete">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const orderIndex = adminOrders.findIndex(order => order.id === orderId);
    if (orderIndex > -1) {
        adminOrders[orderIndex].status = newStatus;
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
        showNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = adminOrders.find(o => o.id === orderId);
    if (!order) return;

    const orderDetailsContent = document.getElementById('orderDetailsContent');
    orderDetailsContent.innerHTML = `
        <div class="order-details">
            <div class="order-header">
                <h4>Order #${order.id}</h4>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            
            <div class="order-info">
                <div class="info-row">
                    <span>Customer:</span>
                    <span>${order.customer}</span>
                </div>
                <div class="info-row">
                    <span>Date:</span>
                    <span>${order.date}</span>
                </div>
                <div class="info-row">
                    <span>Total:</span>
                    <span>৳${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="order-items">
                <h5>Order Items:</h5>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.title}</span>
                        <span>Qty: ${item.quantity}</span>
                        <span>৳${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('orderDetailsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close order modal
function closeOrderModal() {
    document.getElementById('orderDetailsModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Filter orders
function filterOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    
    let filteredOrders = adminOrders;

    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    // Update table with filtered orders
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.date}</td>
            <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
            <td>${order.total.toFixed(2)}</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td class="actions-cell">
                <button class="btn-view" onclick="viewOrderDetails(${order.id})" title="View Details">
                    👁️
                </button>
                <button class="btn-delete" onclick="deleteOrder(${order.id})" title="Delete">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

// Delete order
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        adminOrders = adminOrders.filter(o => o.id !== orderId);
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
        displayAdminOrders();
        updateDashboardStats();
        showNotification('Order deleted successfully!', 'success');
    }
}