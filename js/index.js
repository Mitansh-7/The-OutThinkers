/* ══════════════════════════════════════════
   The OutThinkers – index.js
   Cart logic for the home page
   ══════════════════════════════════════════ */

// ── Cart ────────────────────────────────
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function () {
    const card = this.closest('.product-card');
    const productName = card.querySelector('h3').textContent;
    const mrp = Number(card.dataset.mrp || 0);
    const discountPercent = Number(card.dataset.discount || 0);
    const finalPrice = Math.round(mrp * (1 - discountPercent / 100));
    const productId = this.getAttribute('data-product');
    const image = card.querySelector('img')?.getAttribute('src') || '';
    const category = card.dataset.category || 'Home Collection';

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
          this.textContent = 'Added!';
          setTimeout(() => { this.textContent = 'Add to Cart'; }, 1500);
        });
      } else {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
      }
  });
});
