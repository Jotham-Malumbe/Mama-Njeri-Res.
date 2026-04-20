// script.js - Complete functionality for Mama Njeri Restaurant

let cart = [];
let deliveryMode = 'pickup';
let deliveryFee = 100;
let products = [];

// Load products from products.json
async function loadProducts() {
    try {
        const response = await fetch('products.json');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (!data.products || !Array.isArray(data.products)) {
            throw new Error('Invalid product format');
        }

        products = data.products;
        renderProducts();

    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-container').innerHTML = `
            <p style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 2rem;">
                Failed to load menu. Please refresh the page.
            </p>`;
    }
}

// Render all products
function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    let html = '';

    products.forEach(product => {
        html += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image"
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price">${config.currency} ${product.price}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    renderCart(); // ensures UI updates immediately
    showToast(`${product.name} added to cart`);
}

// Remove item
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartCount();
}

// Change quantity
function changeQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity < 1) {
        removeFromCart(productId);
    } else {
        saveCart();
        renderCart();
        updateCartCount();
    }
}

// Render cart
function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 3rem 1rem; color:#888;">
                <i class="fas fa-shopping-basket" style="font-size:3.5rem; opacity:0.3; margin-bottom:1rem;"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        updateTotals();
        return;
    }

    let html = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;

        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}"
                     onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p style="color:#00c853; font-weight:600;">${config.currency} ${item.price}</p>
                    
                    <div class="quantity-control">
                        <button onclick="changeQuantity(${item.id}, -1)">−</button>
                        <span style="font-weight:600; min-width:24px; text-align:center;">${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button onclick="removeFromCart(${item.id})"
                                style="margin-left:auto; color:#ef4444; background:none; border:none; font-size:1.2rem;">
                            ✕
                        </button>
                    </div>
                </div>
                <div style="text-align:right; font-weight:600; min-width:70px;">
                    ${config.currency} ${itemTotal}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    updateTotals();
}

// Update totals
function updateTotals() {
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const deliveryFeeAmount = (deliveryMode === 'delivery') ? deliveryFee : 0;
    const grandTotal = subtotal + deliveryFeeAmount;

    document.getElementById('subtotal').textContent = `${config.currency} ${subtotal}`;
    document.getElementById('delivery-fee-display').textContent = `${config.currency} ${deliveryFeeAmount}`;
    document.getElementById('grand-total').textContent = `${config.currency} ${grandTotal}`;
}

// Delivery handling
function updateDelivery() {
    const selected = document.querySelector('input[name="delivery"]:checked').value;
    deliveryMode = selected;

    const deliveryRow = document.getElementById('delivery-fee-row');

    if (selected === 'delivery') {
        deliveryRow.classList.remove('hidden');

        const inputVal = parseInt(document.getElementById('delivery-fee').value);
        deliveryFee = isNaN(inputVal) ? (config.defaultDeliveryFee || 100) : inputVal;

    } else {
        deliveryRow.classList.add('hidden');
        deliveryFee = 0;
    }

    updateTotals();
}

// Save cart
function saveCart() {
    localStorage.setItem('mamaNjeriCart', JSON.stringify(cart));
}

// Load cart safely
function loadCart() {
    try {
        const savedCart = localStorage.getItem('mamaNjeriCart');
        if (savedCart) {
            cart = JSON.parse(savedCart) || [];
        }
    } catch (e) {
        console.warn('Cart corrupted, resetting...');
        cart = [];
    }

    updateCartCount();
    renderCart();
}

// Update cart count
function updateCartCount() {
    let count = 0;
    cart.forEach(item => count += item.quantity);

    document.querySelectorAll('#cart-count, #floating-cart-count')
        .forEach(el => el.textContent = count);
}

// Toast
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

    document.body.appendChild(toast);
    toast.style.display = 'flex';

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}

// WhatsApp order
function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        alert("Your cart is empty. Please add some items first.");
        return;
    }

    let orderText = `*🍽️ NEW ORDER - ${config.shopName}*\n\n`;
    orderText += `📍 *Location:* ${config.location}\n`;
    orderText += `🕒 *Time:* ${new Date().toLocaleString('en-KE')}\n\n`;
    orderText += `──────────────────\n\n`;

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        orderText += `${index + 1}. *${item.name}*\n`;
        orderText += `   Qty: ${item.quantity} × ${config.currency} ${item.price} = ${config.currency} ${itemTotal}\n\n`;
    });

    const deliveryFeeAmount = (deliveryMode === 'delivery') ? deliveryFee : 0;
    const grandTotal = subtotal + deliveryFeeAmount;

    orderText += `──────────────────\n`;
    orderText += `💰 *Subtotal:* ${config.currency} ${subtotal}\n`;

    if (deliveryMode === 'delivery') {
        orderText += `🚚 *Delivery Fee:* ${config.currency} ${deliveryFeeAmount}\n`;
    } else {
        orderText += `🏪 *Pickup:* Free\n`;
    }

    orderText += `──────────────────\n`;
    orderText += `💵 *Grand Total:* ${config.currency} ${grandTotal}\n\n`;

    orderText += `📌 *Option:* ${deliveryMode === 'pickup' ? 'Pickup from Kitale Market' : 'Delivery'}\n`;

    if (deliveryMode === 'delivery') {
        orderText += `⚠️ Please send your exact delivery location when we reply.\n`;
    }

    orderText += `\nThank you for ordering with ${config.shopName}! 🙏`;

    const encodedMessage = encodeURIComponent(orderText);
    const whatsappURL = `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}

// Toggle cart
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}

// Mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}

// Init
document.addEventListener('DOMContentLoaded', async () => {

    if (typeof config === 'undefined') {
        console.error("config.js is not loaded!");
        return;
    }

    await loadProducts();
    loadCart();

    const deliveryInput = document.getElementById('delivery-fee');
    if (deliveryInput) {
        deliveryInput.value = config.defaultDeliveryFee || 100;
    }

    console.log(`%c✅ ${config.shopName} website loaded successfully!`, 'color:#00c853; font-weight:600;');
});