// ================= CLOUDINARY CONFIG =================
const CLOUD_NAME = 'druuivxrk';
const UPLOAD_PRESET = 'rivonstore_upload';
const UPI_ID = 'mohammedsaqibahmed@fam';

// ================= APP STATE =================
let products = JSON.parse(localStorage.getItem('rivonstore_products')) || [];
let cart = JSON.parse(localStorage.getItem('rivonstore_cart')) || [];
let currentCategory = '';
let currentProduct = null;
let currentPaymentMethod = '';
let currentPaymentTotal = 0;
let paymentProceedClicked = false;
let adminClickCount = 0;
let adminClickTimer = null;
let successTimerInterval = null;
let productSlider = null;
let sliderDots = [];
let sliderLineIndicator = null;

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    renderHome();
    setupSearchListeners();
});

// ================= NAVIGATION =================
const screens = [
    'screen-home', 'screen-category', 'screen-product', 'screen-cart', 
    'screen-payment-method', 'screen-payment-action', 'screen-verification', 
    'screen-success', 'screen-admin-login', 'screen-admin-dashboard'
];

function navigate(targetScreen) {
    screens.forEach(s => document.getElementById(s).classList.remove('active'));
    document.getElementById(`screen-${targetScreen}`).classList.add('active');
    
    // Manage bottom nav visibility
    const bottomNav = document.getElementById('bottom-nav');
    const noNavScreens = ['payment-action', 'verification', 'success', 'admin-login', 'admin-dashboard'];
    if (noNavScreens.includes(targetScreen)) {
        bottomNav.classList.add('hidden');
    } else {
        bottomNav.classList.remove('hidden');
    }

    // Active tab in bottom nav
    document.getElementById('nav-home').classList.remove('active');
    document.getElementById('nav-cart').classList.remove('active');
    if (targetScreen === 'home') {
        document.getElementById('nav-home').classList.add('active');
        renderHome();
    } else if (targetScreen === 'cart') {
        document.getElementById('nav-cart').classList.add('active');
        renderCart();
    }

    window.scrollTo(0, 0);
}

// ================= TOAST =================
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function showLoader(text) {
    document.getElementById('loader-text').innerText = text;
    document.getElementById('global-loader').classList.remove('hidden');
}

function hideLoader() {
    document.getElementById('global-loader').classList.add('hidden');
}

// ================= HOME SCREEN =================
function matchesSearch(product, term) {
    if (!term) return true;

    const searchableText = [
        product.title || '',
        product.desc || '',
        product.file || '',
        product.category || '',
        product.thumb || '',
        product.preview || ''
    ].join(' ').toLowerCase();

    const words = term.toLowerCase().split(/\s+/).filter(Boolean);

    return words.every(word => searchableText.includes(word));
}
function renderHome() {
    renderHomeCategory('stickers', 'home-stickers-container');
    renderHomeCategory('posters', 'home-posters-container');
}

function renderHomeCategory(category, containerId) {
    let filtered = products.filter(p => p.category === category);
    
    // Search filter
const term = document.getElementById('home-search').value.trim().toLowerCase();
if (term) {
    filtered = filtered.filter(p => matchesSearch(p, term));
}
    
    // Newest first
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Max 3 rows, chunk by 5
    for(let i=0; i<3; i++) {
        let chunk = filtered.slice(i*5, (i+1)*5);
        if(chunk.length === 0 && i !== 0) break; // Keep at least row 0

        let row = document.createElement('div');
        row.className = 'horizontal-row';

        chunk.forEach(p => {
            row.appendChild(createProductCard(p));
        });

        // Add View More card
        let viewMore = document.createElement('div');
        viewMore.className = 'product-card view-more-card';
        viewMore.onclick = () => openCategoryPage(category);
        viewMore.innerHTML = `<span>View More<br>➔</span>`;
        row.appendChild(viewMore);

        container.appendChild(row);
    }
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if(el) {
        const headerOffset = 130;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    
    // Update active tab style
    const tabs = document.querySelectorAll('.app-header .tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => openProductDetail(product.id);
    card.innerHTML = `
        <img src="${product.thumb}" alt="${product.title}">
        <div class="card-info">
            <div class="card-title">${product.title}</div>
            <div class="card-price">₹${product.price}</div>
        </div>
    `;
    return card;
}

// ================= SEARCH =================
function setupSearchListeners() {
    document.getElementById('home-search').addEventListener('input', renderHome);
    document.getElementById('category-search').addEventListener('input', renderCategoryGrid);
}

// ================= CATEGORY PAGE =================
function openCategoryPage(category) {
    currentCategory = category;
    document.getElementById('category-page-title').innerText = category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('category-search').value = '';
    renderCategoryGrid();
    navigate('category');
}

function renderCategoryGrid() {
    let filtered = products.filter(p => p.category === currentCategory);
    const term = document.getElementById('category-search').value.trim().toLowerCase();
if (term) {
    filtered = filtered.filter(p => matchesSearch(p, term));
}
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    const grid = document.getElementById('category-grid');
    grid.innerHTML = '';
    if(filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: span 2; text-align: center; margin-top: 20px;">No products found.</p>`;
    } else {
        filtered.forEach(p => {
            grid.appendChild(createProductCard(p));
        });
    }
}

// ================= PRODUCT DETAIL =================
function openProductDetail(id) {
    const product = products.find(p => p.id === id);
    if(!product) return;
    currentProduct = product;
    
    document.getElementById('detail-thumb').src = product.thumb;
    document.getElementById('detail-preview').src = product.preview;
    document.getElementById('detail-title').innerText = product.title;
    document.getElementById('detail-price').innerText = `₹${product.price}`;
    document.getElementById('detail-desc').innerText = product.desc;
    
    navigate('product');
    setupProductSlider();
}
function setupProductSlider() {
    productSlider = document.getElementById('product-slider');
    sliderLineIndicator = document.getElementById('slider-line-indicator');

    if (!productSlider || !sliderLineIndicator) return;

    productSlider.scrollLeft = 0;
    updateSliderLine(0);

    productSlider.onscroll = () => {
        const maxScroll = productSlider.scrollWidth - productSlider.clientWidth;
        const progress = maxScroll > 0 ? productSlider.scrollLeft / maxScroll : 0;
        updateSliderLine(progress);
    };
}

function updateSliderLine(progress) {
    if (!sliderLineIndicator) return;

    const maxMove = 35; 
    sliderLineIndicator.style.transform = `translateX(${maxMove * progress}px)`;
}

function goBackFromProduct() {
    if(currentCategory) { navigate('category'); } 
    else { navigate('home'); }
}

// ================= CART LOGIC =================
function addToCart() {
    if(!currentProduct) return;
    let existingItem = cart.find(item => item.product.id === currentProduct.id);
    if(existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ product: currentProduct, quantity: 1 });
    }
    saveCart();
    showToast('Added to cart');
}

function saveCart() {
    localStorage.setItem('rivonstore_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    badge.innerText = totalItems;
    if(totalItems > 0) { badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); }
}

function renderCart() {
    const cartContent = document.getElementById('cart-content');
    const emptyCart = document.getElementById('empty-cart');
    const cartList = document.getElementById('cart-list');
    
    if(cart.length === 0) {
        cartContent.classList.add('hidden');
        emptyCart.classList.remove('hidden');
        return;
    }
    
    cartContent.classList.remove('hidden');
    emptyCart.classList.add('hidden');
    cartList.innerHTML = '';
    
    let totalAmount = 0;

    cart.forEach((item, index) => {
        const subtotal = item.product.price * item.quantity;
        totalAmount += subtotal;

        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.product.thumb}" alt="${item.product.title}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.product.title}</div>
                <div class="cart-item-price">₹${subtotal}</div>
                <div class="cart-qty-controls">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span class="qty-count">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                </div>
            </div>
        `;
        cartList.appendChild(el);
    });

    currentPaymentTotal = totalAmount;
    document.getElementById('cart-items-total').innerText = `₹${totalAmount}`;
    document.getElementById('cart-final-total').innerText = `₹${totalAmount}`;
}

function updateQty(index, delta) {
    cart[index].quantity += delta;
    if(cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    renderCart();
}

// ================= PAYMENT FLOW =================
function selectPayment(method) {
    currentPaymentMethod = method;
    paymentProceedClicked = false;
    document.getElementById('pay-action-method').innerText = method;
    document.getElementById('pay-action-amount').innerText = `₹${currentPaymentTotal}`;
  document.getElementById('display-upi-id').innerText = UPI_ID;
    document.getElementById('btn-i-paid').classList.add('disabled');
    navigate('payment-action');
}

function proceedPayment() {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=Rivonstore&am=${currentPaymentTotal}&cu=INR`;
    window.location.href = upiLink; // Opens UPI app
    paymentProceedClicked = true;
    document.getElementById('btn-i-paid').classList.remove('disabled');
}

function confirmIPaid() {
    if(!paymentProceedClicked) {
        showToast('First complete the payment');
        return;
    }
    navigate('verification');
    setTimeout(() => {
        navigate('success');
        startSuccessProcess();
    }, 2500); // Fake verification delay
}

function startSuccessProcess() {
    // Generate Download Links
    const container = document.getElementById('download-links-container');
    container.innerHTML = '';
    
    cart.forEach(item => {
        const a = document.createElement('a');
        a.href = item.product.file;
        a.className = 'download-btn';
        a.target = '_blank';
        a.download = `${item.product.title}.zip`;
        a.innerText = `Download: ${item.product.title}`;
        container.appendChild(a);
    });

    // 60 seconds timer
    let timeLeft = 60;
    const timerEl = document.getElementById('success-timer');
    timerEl.innerText = timeLeft;
    
    if(successTimerInterval) clearInterval(successTimerInterval);
    
    successTimerInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(successTimerInterval);
            cart = [];
            saveCart();
            navigate('home');
        }
    }, 1000);
}

// ================= ADMIN PANEL =================
function handleLogoClick() {
    adminClickCount++;
    if(adminClickCount === 1) {
        adminClickTimer = setTimeout(() => { adminClickCount = 0; }, 2000);
    }
    if(adminClickCount >= 5) {
        clearTimeout(adminClickTimer);
        adminClickCount = 0;
        navigate('admin-login');
        document.getElementById('admin-pass').value = '';
    }
}

function verifyAdmin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === 'ruqhaiya_fathima') {
        navigate('admin-dashboard');
        switchAdminTab('add');
        renderAdminList();
    } else {
        showToast('Incorrect Password');
    }
}
function logoutAdmin() {
    navigate('home');
}

function switchAdminTab(tab) {
    const tabs = document.querySelectorAll('.admin-tab');
    const addSection = document.getElementById('admin-add-section');
    const manageSection = document.getElementById('admin-manage-section');

    tabs.forEach(t => t.classList.remove('active'));
    addSection.classList.remove('active');
    manageSection.classList.remove('active');
    addSection.classList.add('hidden');
    manageSection.classList.add('hidden');

    if (tab === 'add') {
        tabs[0].classList.add('active');
        addSection.classList.remove('hidden');
        addSection.classList.add('active');
    } else {
        tabs[1].classList.add('active');
        manageSection.classList.remove('hidden');
        manageSection.classList.add('active');
        renderAdminList();
    }
}
// ================= CLOUDINARY UPLOAD =================
async function uploadToCloudinary(file, resourceType = 'image') {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error?.message || `Upload failed for ${file.name}`);
        }

        if (!data.secure_url) {
            throw new Error(`No secure_url returned for ${file.name}`);
        }

        return data.secure_url;
    } catch (err) {
        console.error(`Cloudinary upload failed for ${file.name}:`, err);
        throw err;
    }
}
async function uploadProduct() {
    const title = document.getElementById('prod-title').value.trim();
    const price = document.getElementById('prod-price').value.trim();
    const desc = document.getElementById('prod-desc').value.trim();
    const category = document.getElementById('prod-category').value;
    const thumbFile = document.getElementById('prod-thumb').files[0];
    const previewFile = document.getElementById('prod-preview').files[0];
    const zipFile = document.getElementById('prod-file').files[0];

    if (!title || !price || !desc || !thumbFile || !previewFile || !zipFile) {
        showToast('Please fill all fields and select files');
        return;
    }

    showLoader('Uploading Images & Files... Please wait.');

    try {
        const thumbUrl = await uploadToCloudinary(thumbFile, 'image');
        const previewUrl = await uploadToCloudinary(previewFile, 'image');
        const fileUrl = await uploadToCloudinary(zipFile, 'raw');

        const newProduct = {
            id: 'prod_' + Date.now(),
            title,
            price: parseFloat(price),
            desc,
            category,
            thumb: thumbUrl,
            preview: previewUrl,
            file: fileUrl,
            createdAt: Date.now()
        };

        products.push(newProduct);
        localStorage.setItem('rivonstore_products', JSON.stringify(products));

        showToast('Product added successfully!');
        resetAdminForm();
        renderHome();
        renderAdminList();

    } catch (err) {
        console.error(err);
        showToast(err.message || 'Upload failed');
    } finally {
        hideLoader();
    }
}

function resetAdminForm() {
    document.getElementById('prod-title').value = '';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-desc').value = '';
    document.getElementById('prod-thumb').value = '';
    document.getElementById('prod-preview').value = '';
    document.getElementById('prod-file').value = '';
}

function renderAdminList() {
    const list = document.getElementById('admin-product-list');
    list.innerHTML = '';
    const sorted = [...products].sort((a,b) => b.createdAt - a.createdAt);
    
    sorted.forEach(p => {
        const el = document.createElement('div');
        el.className = 'admin-list-item';
        el.innerHTML = `
            <img src="${p.thumb}" alt="thumb">
            <div class="admin-list-info">
                <p>${p.title}</p>
                <span class="text-sm" style="color: var(--primary);">₹${p.price} | ${p.category}</span>
            </div>
            <button class="btn-delete" onclick="deleteProduct('${p.id}')">Delete</button>
        `;
        list.appendChild(el);
    });

    if(sorted.length === 0) {
        list.innerHTML = '<p style="text-align: center;">No products available.</p>';
    }
}

function deleteProduct(id) {
    if(confirm("Are you sure you want to delete this product?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('rivonstore_products', JSON.stringify(products));
        renderAdminList();
        renderHome();
        showToast('Product deleted');
        
        // Note: Existing cart items containing this product remain valid and can still be purchased/downloaded.
        // This prevents breaking a user's active session if an admin deletes an item while they are shopping.
    }
}