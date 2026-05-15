/* ══════════════════════════════════════════
   The OutThinkers – category.js
   Shared logic for Men / Women / Sale / New Arrivals
   Handles cart, filtering, sorting
   ══════════════════════════════════════════ */

// ── Cart ────────────────────────────────
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCartHandler(button) {
  const card = button.closest('.product-card');
  const productName = card.querySelector('h3').textContent;
  const mrp = Number(card.dataset.mrp || 0);
  const discountPercent = Number(card.dataset.discount || 0);
  const finalPrice = Math.round(mrp * (1 - discountPercent / 100));
  const productId = button.getAttribute('data-product');
  const image = card.querySelector('img')?.getAttribute('src') || '';
  const category = card.dataset.category || 'Uncategorized';

  const product = {
    id: productId,
    name: productName,
    price: finalPrice,
    mrp,
    discountPercent,
    category,
    image,
  };

  if (window.CartManager) {
    CartManager.openSizeModal(product, () => {
      // Feedback
      const originalText = button.textContent;
      button.textContent = 'Added!';
      button.style.opacity = '0.6';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.opacity = '';
      }, 1500);
    });
  } else {
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    // Feedback
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.style.opacity = '0.6';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.opacity = '';
    }, 1500);
  }
}

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function () {
    addToCartHandler(this);
  });
});

// ── Sidebar Category Filtering ──────────
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const productCards = document.querySelectorAll('.product-card');

sidebarLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const selectedCategory = this.dataset.category;

    // Update active state
    sidebarLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');

    // Filter cards
    productCards.forEach(card => {
      if (selectedCategory === 'all') {
        card.style.display = '';
      } else {
        const cardCategory = card.dataset.subcategory || '';
        card.style.display = (cardCategory === selectedCategory) ? '' : 'none';
      }
    });
  });
});

// ── Sort Dropdown ───────────────────────
const sortSelect = document.getElementById('sortBy');
if (sortSelect) {
  sortSelect.addEventListener('change', function () {
    const grid = document.getElementById('productGrid');
    const cards = Array.from(grid.querySelectorAll('.product-card'));

    cards.sort((a, b) => {
      const priceA = Number(a.dataset.mrp || 0) * (1 - Number(a.dataset.discount || 0) / 100);
      const priceB = Number(b.dataset.mrp || 0) * (1 - Number(b.dataset.discount || 0) / 100);
      const nameA = a.querySelector('h3').textContent.toLowerCase();
      const nameB = b.querySelector('h3').textContent.toLowerCase();

      switch (this.value) {
        case 'price-low':  return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'name-az':    return nameA.localeCompare(nameB);
        case 'name-za':    return nameB.localeCompare(nameA);
        default:           return 0; // Featured — keep original order
      }
    });

    cards.forEach(card => grid.appendChild(card));
  });
}

// ── Color Filter ────────────────────────
const colorSelect = document.getElementById('colorFilter');
if (colorSelect) {
  colorSelect.addEventListener('change', function () {
    const selectedColor = this.value;
    productCards.forEach(card => {
      if (selectedColor === 'all') {
        card.style.display = '';
      } else {
        const cardColor = card.dataset.color || '';
        card.style.display = (cardColor === selectedColor) ? '' : 'none';
      }
    });
  });
}

// ── Size Filter ─────────────────────────
const sizeSelect = document.getElementById('sizeFilter');
if (sizeSelect) {
  sizeSelect.addEventListener('change', function () {
    const selectedSize = this.value;
    productCards.forEach(card => {
      if (selectedSize === 'all') {
        card.style.display = '';
      } else {
        const sizes = (card.dataset.sizes || '').split(',');
        card.style.display = sizes.includes(selectedSize) ? '' : 'none';
      }
    });
  });
}

// ── Price Range Filter ──────────────────
const priceSelect = document.getElementById('priceRange');
if (priceSelect) {
  priceSelect.addEventListener('change', function () {
    const range = this.value;
    productCards.forEach(card => {
      const price = Number(card.dataset.mrp || 0) * (1 - Number(card.dataset.discount || 0) / 100);
      let show = true;

      if (range === '0-1000') show = price <= 1000;
      else if (range === '1000-2000') show = price > 1000 && price <= 2000;
      else if (range === '2000-3000') show = price > 2000 && price <= 3000;
      else if (range === '3000+') show = price > 3000;

      card.style.display = show ? '' : 'none';
    });
  });
}

console.log('Category page loaded.');
