// Initial Seed Data with Cloudinary URLs (Unsplash via Cloudinary Fetch)  
const seedProducts = [  
    {  
        id: 1,  
        title: "Aesthetic Pastel Wallpapers Pack",  
        price: "99",  
        thumbnail: "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",  
        fileURL: "#",  
        description: "A gorgeous collection of 10 high-resolution pastel wallpapers optimized for both mobile and desktop screens."  
    },  
    {  
        id: 2,  
        title: "Pro Developer Vector Stickers",  
        price: "149",  
        thumbnail: "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=500",  
        fileURL: "#",  
        description: "Cool and minimalist developer stickers to print or use digitally. Includes 20 unique high-quality transparent PNG designs."  
    },  
    {  
        id: 3,  
        title: "Moody Nature Photo Presets & Pack",  
        price: "199",  
        thumbnail: "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500",  
        fileURL: "#",  
        description: "Professional raw and edited photos from moody misty forests. Great for content creators and editors."  
    },  
    {  
        id: 4,  
        title: "Minimalist Modern UI Kit",  
        price: "299",  
        thumbnail: "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500",  
        fileURL: "#",  
        description: "A clean, modern, and highly responsive UI kit for web design. Includes complete Figma design files."  
    }  
];  
  
// Load Products from LocalStorage  
let products = JSON.parse(localStorage.getItem('rivonStoreProducts'));  
if (!products || products.length === 0) {  
    products = seedProducts;  
    localStorage.setItem('rivonStoreProducts', JSON.stringify(products));  
}  
  
// DOM Elements  
const gridContainer = document.getElementById('product-grid');  
const searchInput = document.getElementById('search-input');  
const exploreBtn = document.getElementById('explore-btn');  
const adminBtn = document.getElementById('admin-btn');  
const loader = document.getElementById('loader');  
  
// Modal Logic  
function openModal(modalId) {  
    document.getElementById(modalId).classList.add('active');  
    document.body.style.overflow = 'hidden'; // Prevent background scroll  
}  
  
function closeModal(modalId) {  
    document.getElementById(modalId).classList.remove('active');  
    document.body.style.overflow = 'auto';  
}  
  
// Toast Notification System  
function showToast(message) {  
    const container = document.getElementById('toast-container');  
    const toast = document.createElement('div');  
    toast.className = 'toast';  
    toast.innerText = message;  
    container.appendChild(toast);  
      
    setTimeout(() => {  
        toast.style.animation = 'slideOut 0.3s forwards';  
        setTimeout(() => toast.remove(), 300);  
    }, 3000);  
}  
  
// Render Products to Grid  
function renderProducts(productArray) {  
    gridContainer.innerHTML = '';  
      
    if (productArray.length === 0) {  
        gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No products found.</p>`;  
        return;  
    }  
  
    productArray.forEach(product => {  
        const card = document.createElement('div');  
        card.className = 'card';  
        card.onclick = () => openProductModal(product);  
          
        card.innerHTML = `  
            <div class="card-img-wrapper">  
                <img src="${product.thumbnail}" alt="${product.title}">  
            </div>  
            <div class="card-body">  
                <h3 class="card-title">${product.title}</h3>  
                <div class="card-price">₹${product.price}</div>  
                <button class="btn-primary card-btn">Buy Now</button>  
            </div>  
        `;  
        gridContainer.appendChild(card);  
    });  
}  
  
// Open Product Buy Modal  
function openProductModal(product) {  
    document.getElementById('modal-img').src = product.thumbnail;  
    document.getElementById('modal-title').innerText = product.title;  
    document.getElementById('modal-price').innerText = `₹${product.price}`;  
    document.getElementById('modal-desc').innerText = product.description;  
    document.getElementById('modal-pay-amount').innerText = `₹${product.price}`;  
    document.getElementById('form-product-name').value = product.title; // Auto-fill form  
      
    openModal('buy-modal');  
}  
  
// Search Filter functionality  
searchInput.addEventListener('input', (e) => {  
    const term = e.target.value.toLowerCase();  
    const filtered = products.filter(p => p.title.toLowerCase().includes(term));  
    renderProducts(filtered);  
});  
  
// Explore Button functionality  
exploreBtn.addEventListener('click', () => {  
    document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });  
});  
  
// Admin Panel Logic  
adminBtn.addEventListener('click', () => {  
    renderAdminList();  
    openModal('admin-modal');  
});  
  
// Render Admin Product List (for deletion)  
function renderAdminList() {  
    const listContainer = document.getElementById('admin-product-list');  
    listContainer.innerHTML = '';  
      
    if (products.length === 0) {  
        listContainer.innerHTML = '<p>No products available.</p>';  
        return;  
    }  
  
    products.forEach(product => {  
        const item = document.createElement('div');  
        item.className = 'admin-item';  
        item.innerHTML = `  
            <span class="admin-item-title">${product.title}</span>  
            <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>  
        `;  
        listContainer.appendChild(item);  
    });  
}  
  
// Add New Product via Admin  
document.getElementById('add-product-form').addEventListener('submit', function(e) {  
    e.preventDefault();  
      
    const newProduct = {  
        id: Date.now(),  
        title: document.getElementById('add-title').value,  
        price: document.getElementById('add-price').value,  
        thumbnail: document.getElementById('add-thumbnail').value,  
        fileURL: document.getElementById('add-file').value,  
        description: document.getElementById('add-desc').value  
    };  
  
    products.push(newProduct);  
    localStorage.setItem('rivonStoreProducts', JSON.stringify(products));  
      
    this.reset();  
    renderProducts(products);  
    renderAdminList();  
    showToast("Product Added Successfully!");  
});  
  
// Delete Product via Admin  
window.deleteProduct = function(id) {  
    if(confirm("Are you sure you want to delete this product?")) {  
        products = products.filter(p => p.id !== id);  
        localStorage.setItem('rivonStoreProducts', JSON.stringify(products));  
          
        renderProducts(products);  
        renderAdminList();  
        showToast("Product Deleted!");  
    }  
}  
  
// Remove Loading Screen Initialization  
window.addEventListener('load', () => {  
    setTimeout(() => {  
        loader.style.opacity = '0';  
        setTimeout(() => loader.style.display = 'none', 400);  
    }, 500); // Slight delay to let animations prepare visually  
      
    // Initial Render  
    renderProducts(products);  
});