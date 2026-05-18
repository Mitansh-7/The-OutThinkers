/**
 * js/search.js
 * Dynamic search with a full product catalog, live filtering, and category/price filters.
 */

// ─── Product Catalog ───────────────────────────────────────────────
var PRODUCTS = [
  // Women
  { id: 'women-1', name: 'Silk Blouse',          price: 2408, category: 'Women',    image: 'images/silk-blouse.png' },
  { id: 'women-2', name: 'Pleated Midi Skirt',   price: 1899, category: 'Women',    image: 'images/midi-skirt.png' },
  { id: 'women-3', name: 'Cashmere Sweater',     price: 3999, category: 'Women',    image: 'images/cashmere-sweater.png' },
  { id: 'women-4', name: 'Classic Trench Coat',  price: 3600, category: 'Women',    image: 'images/trench-coat.png' },
  { id: 'women-5', name: 'Wide Leg Pants',       price: 2199, category: 'Women',    image: 'images/wide-leg-pants.png' },
  { id: 'women-6', name: 'Ribbed Knit Dress',    price: 2800, category: 'Women',    image: 'images/knit-dress.png' },
  { id: 'women-7', name: 'Leather Handbag',      price: 3200, category: 'Women',    image: 'images/leather-handbag.png' },
  { id: 'women-8', name: 'Suede Ankle Boots',    price: 2800, category: 'Women',    image: 'images/ankle-boots.png' },

  // Men
  { id: 'men-1', name: 'Structured Wool Coat',   price: 4509, category: 'Men',      image: 'images/structured-wool-coat.png' },
  { id: 'men-2', name: 'Tailored Shirt',         price: 2199, category: 'Men',      image: 'images/tailored-shirt.png' },
  { id: 'men-3', name: 'Trousers',               price: 2800, category: 'Men',      image: 'images/trousers.png' },
  { id: 'men-4', name: 'Bomber Jacket',          price: 3001, category: 'Men',      image: 'images/bomber-jacket.png' },
  { id: 'men-5', name: 'Cargo Basket',           price: 1699, category: 'Men',      image: 'images/cargo-basket.png' },
  { id: 'men-6', name: 'Tailored Trouser',       price: 2699, category: 'Men',      image: 'images/tailored-trouser.png' },
  { id: 'men-7', name: 'Minimalist Jacket',      price: 3611, category: 'Men',      image: 'images/minimalist-jacket.png' },
  { id: 'men-8', name: 'Leather Boots',          price: 2999, category: 'Men',      image: 'images/leather-boots.png' },

  // Home Featured
  { id: 'home-1', name: 'Soft Hoodie',           price: 2399, category: 'Featured', image: 'images/soft-hoodie.png' },
  { id: 'home-2', name: 'Urban Track Top',       price: 2974, category: 'Featured', image: 'images/urban-track-top.png' },
  { id: 'home-3', name: 'Daily Pullover',        price: 1799, category: 'Featured', image: 'images/daily-pullover.png' },
  { id: 'home-4', name: 'Street Bomber',         price: 3509, category: 'Featured', image: 'images/street-bomber.png' }
];

// ─── State ─────────────────────────────────────────────────────────
var activeCategories = [];
var activePriceRanges = [];

// ─── DOM References ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

  var searchInput     = document.getElementById('searchInput');
  var clearBtn        = document.getElementById('clearSearch');
  var searchGrid      = document.getElementById('searchGrid');
  var searchMeta      = document.getElementById('searchMeta');
  var resultCount     = document.getElementById('resultCount');
  var placeholder     = document.getElementById('searchPlaceholder');
  var categoryFilters = document.getElementById('categoryFilters');

  // Build category checkboxes dynamically
  var categories = [];
  PRODUCTS.forEach(function(p) {
    if (categories.indexOf(p.category) === -1) categories.push(p.category);
  });
  categories.forEach(function(cat) {
    var count = PRODUCTS.filter(function(p) { return p.category === cat; }).length;
    var label = document.createElement('label');
    label.className = 'custom-checkbox';
    label.innerHTML = '<input type="checkbox" data-category="' + cat + '">' +
                      '<span class="checkmark"><i class="fa-solid fa-check"></i></span>' +
                      '<span class="checkbox-label">' + cat + ' (' + count + ')</span>';
    categoryFilters.appendChild(label);
  });

  // Debounce timer
  var debounceTimer = null;

  searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    var query = searchInput.value.trim();
    clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
    debounceTimer = setTimeout(function() { runSearch(); }, 200);
  });

  clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    searchMeta.style.display = 'none';
    showPlaceholder();
    searchInput.focus();
  });

  // Filter toggle (accordion)
  document.querySelectorAll('.filter-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      var content = toggle.nextElementSibling;
      var icon = toggle.querySelector('i');
      if (isExpanded) {
        toggle.setAttribute('aria-expanded', 'false');
        content.classList.remove('open');
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
      } else {
        toggle.setAttribute('aria-expanded', 'true');
        content.classList.add('open');
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
      }
    });
  });

  // Category & price filter changes
  document.querySelectorAll('#categoryFilters input, #priceFilters input').forEach(function(cb) {
    cb.addEventListener('change', function() { runSearch(); });
  });

  function showPlaceholder() {
    // Remove product cards but keep placeholder
    var cards = searchGrid.querySelectorAll('.product-card');
    cards.forEach(function(c) { c.remove(); });
    if (placeholder) placeholder.style.display = '';
  }

  function runSearch() {
    var query = searchInput.value.trim().toLowerCase();

    // Gather active category filters
    activeCategories = [];
    document.querySelectorAll('#categoryFilters input:checked').forEach(function(cb) {
      activeCategories.push(cb.getAttribute('data-category'));
    });

    // Gather active price filters
    activePriceRanges = [];
    document.querySelectorAll('#priceFilters input:checked').forEach(function(cb) {
      activePriceRanges.push(cb.getAttribute('data-price'));
    });

    // If nothing typed and no filters active, show placeholder
    if (query.length === 0 && activeCategories.length === 0 && activePriceRanges.length === 0) {
      searchMeta.style.display = 'none';
      showPlaceholder();
      return;
    }

    // Filter products
    var results = PRODUCTS.filter(function(p) {
      // Text match (name or category)
      var textMatch = true;
      if (query.length > 0) {
        textMatch = p.name.toLowerCase().indexOf(query) !== -1 ||
                    p.category.toLowerCase().indexOf(query) !== -1;
      }

      // Category filter
      var catMatch = true;
      if (activeCategories.length > 0) {
        catMatch = activeCategories.indexOf(p.category) !== -1;
      }

      // Price filter
      var priceMatch = true;
      if (activePriceRanges.length > 0) {
        priceMatch = activePriceRanges.some(function(range) {
          if (range === '0-2000')    return p.price < 2000;
          if (range === '2000-3500') return p.price >= 2000 && p.price <= 3500;
          if (range === '3500-5000') return p.price > 3500 && p.price <= 5000;
          if (range === '5000+')     return p.price > 5000;
          return false;
        });
      }

      return textMatch && catMatch && priceMatch;
    });

    // Render results
    if (placeholder) placeholder.style.display = 'none';

    // Remove old cards
    var oldItems = searchGrid.querySelectorAll('.product-card, .search-no-results');
    oldItems.forEach(function(item) {
    item.remove();
  });

    if (results.length === 0) {
      var noResults = document.createElement('div');
      noResults.className = 'search-no-results';
      noResults.innerHTML = '<i class="fa-regular fa-face-meh"></i><p>No products found. Try a different search term.</p>';
      searchGrid.appendChild(noResults);
      searchMeta.style.display = 'flex';
      resultCount.textContent = '0 Results';
      return;
    }

    searchMeta.style.display = 'flex';
    resultCount.textContent = results.length + (results.length === 1 ? ' Result' : ' Results');

    results.forEach(function(p) {
      var card = document.createElement('div');
      card.className = 'product-card';

      var html = '';
      html += '<div class="product-image-wrap">';
      html += '  <img src="' + p.image + '" alt="' + p.name + '" class="product-image">';
      html += '</div>';
      html += '<div class="product-info">';
      html += '  <div class="product-title-price">';
      html += '    <h3 class="product-title">' + p.name + '</h3>';
      html += '    <span class="product-price">\u20b9' + p.price.toLocaleString('en-IN') + '</span>';
      html += '  </div>';
      html += '  <p class="product-category">' + p.category + '</p>';
      html += '  <button class="add-to-cart-search" data-id="' + p.id + '" data-name="' + p.name + '" data-price="' + p.price + '" data-image="' + p.image + '" data-category="' + p.category + '">Add to Cart</button>';
      html += '</div>';

      card.innerHTML = html;
      searchGrid.appendChild(card);
    });

    // Attach add-to-cart handlers
    document.querySelectorAll('.add-to-cart-search').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var product = {
          id:       this.getAttribute('data-id'),
          name:     this.getAttribute('data-name'),
          price:    this.getAttribute('data-price'),
          image:    this.getAttribute('data-image'),
          category: this.getAttribute('data-category')
        };
        var self = this;
        if (window.CartManager) {
          CartManager.openSizeModal(product, function() {
            self.textContent = 'Added!';
            setTimeout(function() { self.textContent = 'Add to Cart'; }, 1500);
          });
        } else {
          var cart = JSON.parse(localStorage.getItem('cart')) || [];
          product.cartId = Date.now().toString();
          product.quantity = 1;
          cart.push(product);
          localStorage.setItem('cart', JSON.stringify(cart));
          self.textContent = 'Added!';
          setTimeout(function() { self.textContent = 'Add to Cart'; }, 1500);
        }
      });
    });
  }

  // Show all products on initial load
  showPlaceholder();
});
