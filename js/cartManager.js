// cartManager.js

// Inject Modal CSS via link tag to comply with CSP
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'css/modal.css';
document.head.appendChild(link);

let selectedSize = null;
let currentProduct = null;
let addToCartCallback = null;

// Create Modal DOM
function initCartModal() {
  const overlay = document.createElement('div');
  overlay.className = 'size-modal-overlay';
  overlay.id = 'sizeModalOverlay';

  overlay.innerHTML = `
    <div class="size-modal">
      <h3>Select Size</h3>
      <div class="size-options">
        <button class="size-btn" data-size="XS">XS</button>
        <button class="size-btn" data-size="S">S</button>
        <button class="size-btn" data-size="M">M</button>
        <button class="size-btn" data-size="L">L</button>
        <button class="size-btn" data-size="XL">XL</button>
        <button class="size-btn" data-size="XXL">XXL</button>
      </div>
      <div class="modal-actions">
        <button class="modal-btn cancel" id="cancelSizeModal">Cancel</button>
        <button class="modal-btn confirm" id="confirmSizeModal">Add to Cart</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Event Listeners for Modal
  const sizeBtns = overlay.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = btn.getAttribute('data-size');
    });
  });

  document.getElementById('cancelSizeModal').addEventListener('click', closeSizeModal);
  document.getElementById('confirmSizeModal').addEventListener('click', () => {
    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }
    
    // Perform Add to Cart
    if (currentProduct) {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      
      // Ensure product price is clean and formatted
      let cleanPrice = currentProduct.price.toString().replace(/[^0-9.]/g, ''); // removes $, Rs, etc
      
      const cartItem = {
        ...currentProduct,
        cartId: Date.now().toString(), // unique id for cart removal
        size: selectedSize,
        cleanPrice: parseFloat(cleanPrice)
      };
      
      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));
      
      closeSizeModal();
      
      if (addToCartCallback) {
        addToCartCallback();
      } else {
        alert(`Added ${currentProduct.name} (Size: ${selectedSize}) to Cart!`);
      }
    }
  });
}

function openSizeModal(product, callback) {
  currentProduct = product;
  addToCartCallback = callback;
  selectedSize = null;
  
  const overlay = document.getElementById('sizeModalOverlay');
  if (overlay) {
    overlay.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    overlay.classList.add('active');
  } else {
    console.error('ERROR: sizeModalOverlay not found!');
  }
}

function closeSizeModal() {
  const overlay = document.getElementById('sizeModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCartModal);
} else {
  initCartModal();
}

// Export globally
window.CartManager = {
  openSizeModal
};
