// cart.js — Dynamic cart renderer with quantity controls + checkout

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCart);
} else {
  initCart();
}

function initCart() {
  renderCartPage();

  // Checkout button
  var checkoutBtn = document.querySelector('.btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
}

function renderCartPage() {
  var cartItemsList = document.getElementById('cartItemsList');
  var summarySubtotal = document.getElementById('summarySubtotal');
  var summaryTotal = document.getElementById('summaryTotal');

  if (!cartItemsList) return;

  var cart = JSON.parse(localStorage.getItem('cart')) || [];

  cartItemsList.innerHTML = '';

  if (cart.length === 0) {
    cartItemsList.innerHTML = '<div class="empty-cart-message" style="padding: 40px 0; text-align: center; color: var(--muted); font-size: 16px;">Your shopping bag is empty.</div>';
    if (summarySubtotal) summarySubtotal.textContent = '\u20b90';
    if (summaryTotal) summaryTotal.textContent = '\u20b90';
    return;
  }

  // Ensure every item has a cartId and quantity
  var needsSave = false;
  cart.forEach(function(item) {
    if (!item.cartId) {
      item.cartId = Date.now().toString() + Math.random().toString(36).slice(2, 7);
      needsSave = true;
    }
    if (!item.quantity || item.quantity < 1) {
      item.quantity = 1;
      needsSave = true;
    }
  });
  if (needsSave) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  var subtotal = 0;

  cart.forEach(function(item) {
    var unitPrice = item.cleanPrice || parseFloat((item.price || '0').toString().replace(/[^0-9.]/g, ''));
    var qty = item.quantity || 1;
    var lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    var div = document.createElement('div');
    div.className = 'cart-item';

    var html = '';
    html += '<div class="item-product">';
    html += '  <img src="' + (item.image || '') + '" alt="' + (item.name || '') + '" class="item-image">';
    html += '  <div class="item-details">';
    html += '    <h3 class="item-title">' + (item.name || 'Unknown') + '</h3>';
    if (item.category) {
      html += '    <p class="item-attr">' + item.category + '</p>';
    }
    if (item.color) {
      html += '    <p class="item-attr">Color: ' + item.color + '</p>';
    }
    html += '    <p class="item-attr">Size: ' + (item.size || 'Default') + '</p>';
    html += '  </div>';
    html += '</div>';

    html += '<div class="item-quantity">';
    html += '  <div class="qty-selector">';
    html += '    <button type="button" class="qty-btn qty-minus" data-cart-id="' + item.cartId + '" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>';
    html += '    <span class="qty-val">' + qty + '</span>';
    html += '    <button type="button" class="qty-btn qty-plus" data-cart-id="' + item.cartId + '" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>';
    html += '  </div>';
    html += '</div>';

    html += '<div class="item-price">';
    html += '  <span class="price-val">\u20b9' + lineTotal.toLocaleString('en-IN') + '</span>';
    html += '  <button type="button" class="btn-remove" data-cart-id="' + item.cartId + '" aria-label="Remove item"><i class="fa-solid fa-xmark"></i></button>';
    html += '</div>';

    div.innerHTML = html;
    cartItemsList.appendChild(div);
  });

  if (summarySubtotal) summarySubtotal.textContent = '\u20b9' + subtotal.toLocaleString('en-IN');
  if (summaryTotal) summaryTotal.textContent = '\u20b9' + subtotal.toLocaleString('en-IN');

  // Remove buttons
  document.querySelectorAll('.btn-remove').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var button = e.target.closest('.btn-remove');
      if (button) {
        removeFromCart(button.getAttribute('data-cart-id'));
      }
    });
  });

  // Minus buttons
  document.querySelectorAll('.qty-minus').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var button = e.target.closest('.qty-minus');
      if (button) {
        changeQuantity(button.getAttribute('data-cart-id'), -1);
      }
    });
  });

  // Plus buttons
  document.querySelectorAll('.qty-plus').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var button = e.target.closest('.qty-plus');
      if (button) {
        changeQuantity(button.getAttribute('data-cart-id'), 1);
      }
    });
  });
}

function changeQuantity(cartId, delta) {
  var cart = JSON.parse(localStorage.getItem('cart')) || [];
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].cartId === cartId) {
      var newQty = (cart[i].quantity || 1) + delta;
      if (newQty < 1) {
        cart.splice(i, 1);
      } else {
        cart[i].quantity = newQty;
      }
      break;
    }
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartPage();
}

function removeFromCart(cartId) {
  var cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(function(item) { return item.cartId !== cartId; });
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartPage();
}

// ─── Checkout ──────────────────────────────────────────────────────

function handleCheckout() {
  var cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) return;

  // Calculate total
  var total = 0;
  var itemCount = 0;
  cart.forEach(function(item) {
    var unitPrice = item.cleanPrice || parseFloat((item.price || '0').toString().replace(/[^0-9.]/g, ''));
    var qty = item.quantity || 1;
    total += unitPrice * qty;
    itemCount += qty;
  });

  // Build order object
  var orderId = 'ORD-' + Date.now().toString(36).toUpperCase().slice(-6);
  var now = new Date();
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var dateStr = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();

  var order = {
    id: orderId,
    date: dateStr,
    timestamp: now.getTime(),
    status: 'Confirmed',
    total: total,
    itemCount: itemCount,
    items: cart.map(function(item) {
      return {
        name: item.name || 'Unknown',
        size: item.size || 'Default',
        quantity: item.quantity || 1,
        price: item.cleanPrice || parseFloat((item.price || '0').toString().replace(/[^0-9.]/g, '')),
        image: item.image || ''
      };
    })
  };

  // Save to orders in localStorage
  var orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Clear the cart
  localStorage.setItem('cart', JSON.stringify([]));

  // Show the confirmation overlay
  showOrderConfirmation(order);
}

function showOrderConfirmation(order) {
  var overlay = document.createElement('div');
  overlay.className = 'order-overlay';

  var html = '';
  html += '<div class="order-modal">';
  html += '  <div class="order-icon"><i class="fa-solid fa-circle-check"></i></div>';
  html += '  <h2>Order Placed!</h2>';
  html += '  <p class="order-thanks">Thank you for shopping with The OutThinkers</p>';
  html += '  <div class="order-details-card">';
  html += '    <div class="order-detail-row">';
  html += '      <span class="detail-label">Order Number</span>';
  html += '      <span class="detail-val">#' + order.id + '</span>';
  html += '    </div>';
  html += '    <div class="order-detail-row">';
  html += '      <span class="detail-label">Items</span>';
  html += '      <span class="detail-val">' + order.itemCount + ' item' + (order.itemCount > 1 ? 's' : '') + '</span>';
  html += '    </div>';
  html += '    <div class="order-detail-row">';
  html += '      <span class="detail-label">Total</span>';
  html += '      <span class="detail-val order-total">\u20b9' + order.total.toLocaleString('en-IN') + '</span>';
  html += '    </div>';
  html += '    <div class="order-detail-row">';
  html += '      <span class="detail-label">Status</span>';
  html += '      <span class="detail-val"><span class="status-badge status-confirmed">Confirmed</span></span>';
  html += '    </div>';
  html += '  </div>';
  html += '  <div class="order-actions">';
  html += '    <a href="account.html" class="btn-view-orders">VIEW MY ORDERS</a>';
  html += '    <a href="index.html" class="btn-continue">CONTINUE SHOPPING</a>';
  html += '  </div>';
  html += '</div>';

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  // Trigger animation
  requestAnimationFrame(function() {
    overlay.classList.add('visible');
  });
}
