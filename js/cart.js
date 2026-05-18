var COUPONS = {
  'SAVE10':    { type: 'percent', value: 10,   label: '10% off'  },
  'SAVE20':    { type: 'percent', value: 20,   label: '20% off'  },
  'FLAT500':   { type: 'flat',    value: 500,  label: '₹500 off' },
  'FLAT200':   { type: 'flat',    value: 200,  label: '₹200 off' },
  'WELCOME15': { type: 'percent', value: 15,   label: '15% off'  }
};
 
var appliedCoupon = null; // tracks currently applied coupon
 
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
 
  // Coupon button
  var applyCouponBtn = document.getElementById('applyCouponBtn');
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', handleCoupon);
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
 
  if (summarySubtotal) summarySubtotal.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (summaryTotal) summaryTotal.textContent = '₹' + subtotal.toLocaleString('en-IN');
  updateDiscount(subtotal);
 
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
 
// ─── Coupon ────────────────────────────────────────────────────────
 
function handleCoupon() {
  var input   = document.getElementById('couponInput');
  var msg     = document.getElementById('couponMsg');
  var code    = input ? input.value.trim().toUpperCase() : '';
 
  if (!code) {
    showCouponMsg('Please enter a coupon code.', 'error');
    return;
  }
 
  var coupon = COUPONS[code];
  if (!coupon) {
    showCouponMsg('Invalid coupon code. Try SAVE10, SAVE20, FLAT500, FLAT200 or WELCOME15.', 'error');
    appliedCoupon = null;
    updateDiscount(getSubtotal());
    return;
  }
 
  appliedCoupon = { code: code, ...coupon };
  showCouponMsg('Coupon "' + code + '" applied — ' + coupon.label + '!', 'success');
  updateDiscount(getSubtotal());
}
 
function getSubtotal() {
  var cart = JSON.parse(localStorage.getItem('cart')) || [];
  var subtotal = 0;
  cart.forEach(function (item) {
    var unitPrice = item.cleanPrice || parseFloat((item.price || '0').toString().replace(/[^0-9.]/g, ''));
    subtotal += unitPrice * (item.quantity || 1);
  });
  return subtotal;
}
 
function updateDiscount(subtotal) {
  var discountRow    = document.getElementById('discountRow');
  var couponLabel    = document.getElementById('couponLabel');
  var summaryDiscount = document.getElementById('summaryDiscount');
  var summaryTotal   = document.getElementById('summaryTotal');
 
  if (!appliedCoupon) {
    if (discountRow) discountRow.style.display = 'none';
    if (summaryTotal) summaryTotal.textContent = '₹' + subtotal.toLocaleString('en-IN');
    return;
  }
 
  var discount = 0;
  if (appliedCoupon.type === 'percent') {
    discount = Math.round(subtotal * appliedCoupon.value / 100);
  } else {
    discount = Math.min(appliedCoupon.value, subtotal);
  }
 
  var finalTotal = subtotal - discount;
 
  if (discountRow)     discountRow.style.display = 'flex';
  if (couponLabel)     couponLabel.textContent    = appliedCoupon.code;
  if (summaryDiscount) summaryDiscount.textContent = '−₹' + discount.toLocaleString('en-IN');
  if (summaryTotal)    summaryTotal.textContent    = '₹' + finalTotal.toLocaleString('en-IN');
}
 
function showCouponMsg(text, type) {
  var msg = document.getElementById('couponMsg');
  if (!msg) return;
  msg.textContent  = text;
  msg.className    = 'coupon-msg ' + type;
}
 
// ─── Checkout ──────────────────────────────────────────────────────
 
function handleCheckout() {
  var cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) return;
 
  // Must be signed in before checkout
  var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    if (confirm('You need to sign in to checkout.\n\nGo to Sign In page?')) {
      localStorage.setItem('redirectAfterLogin', 'cart.html');
      window.location.href = 'account.html';
    }
    return;
  }
 
  // Calculate totals
  var subtotal = 0;
  var itemCount = 0;
  cart.forEach(function(item) {
    var unitPrice = item.cleanPrice || parseFloat((item.price || '0').toString().replace(/[^0-9.]/g, ''));
    subtotal += unitPrice * (item.quantity || 1);
    itemCount += (item.quantity || 1);
  });
  var discountAmt = 0;
  if (appliedCoupon) {
    discountAmt = appliedCoupon.type === 'percent'
      ? Math.round(subtotal * appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, subtotal);
  }
  var total = subtotal - discountAmt;
 
  // Show step 1 — address selection
  showAddressStep(cart, itemCount, total, loggedInUser);
}
 
/* ─── Step 1: Address ────────────────────────────────────────────── */
function showAddressStep(cart, itemCount, total, user) {
  var savedAddr = null;
  try { savedAddr = JSON.parse(localStorage.getItem('address_' + user.email)); } catch(e) {}
 
  var overlay = document.createElement('div');
  overlay.className = 'order-overlay';
  overlay.id = 'checkoutOverlay';
 
  var addrHtml = '';
  if (savedAddr) {
    addrHtml =
      '<div class="co-saved-addr" id="coSavedAddr">' +
        '<label class="co-radio-row">' +
          '<input type="radio" name="addrChoice" value="saved" checked> ' +
          '<span>' +
            '<strong>' + savedAddr.name + '</strong><br>' +
            savedAddr.street + ', ' + savedAddr.city + '<br>' +
            savedAddr.state + ', ' + savedAddr.country +
          '</span>' +
        '</label>' +
        '<label class="co-radio-row">' +
          '<input type="radio" name="addrChoice" value="new"> ' +
          '<span>Use a different address</span>' +
        '</label>' +
      '</div>';
  }
 
  addrHtml +=
    '<div class="co-addr-form" id="coAddrForm" style="' + (savedAddr ? 'display:none;' : '') + '">' +
      '<input type="text" id="coName"    placeholder="Full Name">' +
      '<input type="text" id="coStreet"  placeholder="Street Address">' +
      '<input type="text" id="coCity"    placeholder="City">' +
      '<input type="text" id="coState"   placeholder="State / Province">' +
      '<input type="text" id="coCountry" placeholder="Country">' +
    '</div>' +
    '<p class="co-err" id="addrErr"></p>';
 
  var html =
    '<div class="order-modal co-modal">' +
      '<div class="co-steps"><span class="co-step active">1. Address</span><span class="co-step">2. Payment</span></div>' +
      '<h2>Delivery Address</h2>' +
      addrHtml +
      '<div class="co-actions">' +
        '<button class="co-btn-primary" id="coAddrNext">CONTINUE TO PAYMENT</button>' +
        '<button class="co-btn-ghost"   id="coAddrCancel">CANCEL</button>' +
      '</div>' +
    '</div>';
 
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  requestAnimationFrame(function() { overlay.classList.add('visible'); });
 
  // Toggle form visibility based on radio
  overlay.querySelectorAll('input[name="addrChoice"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      document.getElementById('coAddrForm').style.display =
        this.value === 'new' ? 'block' : 'none';
    });
  });
 
  document.getElementById('coAddrCancel').addEventListener('click', function() {
    overlay.remove();
  });
 
  document.getElementById('coAddrNext').addEventListener('click', function() {
    var chosenAddr = null;
    var choice = overlay.querySelector('input[name="addrChoice"]:checked');
 
    if (choice && choice.value === 'saved') {
      chosenAddr = savedAddr;
    } else {
      var n = document.getElementById('coName').value.trim();
      var s = document.getElementById('coStreet').value.trim();
      var c = document.getElementById('coCity').value.trim();
      var st= document.getElementById('coState').value.trim();
      var co= document.getElementById('coCountry').value.trim();
      if (!n || !s || !c || !st || !co) {
        document.getElementById('addrErr').textContent = 'Please fill in all address fields.';
        return;
      }
      chosenAddr = { name: n, street: s, city: c, state: st, country: co };
    }
 
    overlay.remove();
    showPaymentStep(cart, itemCount, total, user, chosenAddr);
  });
}
 
/* ─── Step 2: Payment ────────────────────────────────────────────── */
function showPaymentStep(cart, itemCount, total, user, address) {
  var overlay = document.createElement('div');
  overlay.className = 'order-overlay';
  overlay.id = 'checkoutOverlay';
 
  var html =
    '<div class="order-modal co-modal">' +
      '<div class="co-steps"><span class="co-step done">1. Address</span><span class="co-step active">2. Payment</span></div>' +
      '<h2>Payment Method</h2>' +
      '<p class="co-addr-preview"><i class="fa-solid fa-location-dot"></i> ' +
        address.name + ', ' + address.street + ', ' + address.city +
      '</p>' +
      '<div class="co-pay-options">' +
        '<label class="co-pay-card">' +
          '<input type="radio" name="payMethod" value="cod" checked>' +
          '<div class="co-pay-body">' +
            '<i class="fa-solid fa-truck"></i>' +
            '<span class="co-pay-name">Cash on Delivery</span>' +
            '<span class="co-pay-sub">Pay when your order arrives</span>' +
          '</div>' +
        '</label>' +
        '<label class="co-pay-card">' +
          '<input type="radio" name="payMethod" value="upi">' +
          '<div class="co-pay-body">' +
            '<i class="fa-solid fa-mobile-screen"></i>' +
            '<span class="co-pay-name">UPI</span>' +
            '<span class="co-pay-sub">GPay, PhonePe, Paytm & more</span>' +
          '</div>' +
        '</label>' +
        '<label class="co-pay-card">' +
          '<input type="radio" name="payMethod" value="debit">' +
          '<div class="co-pay-body">' +
            '<i class="fa-solid fa-credit-card"></i>' +
            '<span class="co-pay-name">Debit Card</span>' +
            '<span class="co-pay-sub">All major banks supported</span>' +
          '</div>' +
        '</label>' +
        '<label class="co-pay-card">' +
          '<input type="radio" name="payMethod" value="credit">' +
          '<div class="co-pay-body">' +
            '<i class="fa-regular fa-credit-card"></i>' +
            '<span class="co-pay-name">Credit Card</span>' +
            '<span class="co-pay-sub">Visa, Mastercard, RuPay</span>' +
          '</div>' +
        '</label>' +
      '</div>' +
      '<p class="co-total-line">Order Total: <strong>₹' + total.toLocaleString('en-IN') + '</strong></p>' +
      '<p class="co-err" id="payErr"></p>' +
      '<div class="co-actions">' +
        '<button class="co-btn-primary" id="coPlaceOrder">PLACE ORDER</button>' +
        '<button class="co-btn-ghost"   id="coPayBack">BACK</button>' +
      '</div>' +
    '</div>';
 
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  requestAnimationFrame(function() { overlay.classList.add('visible'); });
 
  document.getElementById('coPayBack').addEventListener('click', function() {
    overlay.remove();
    showAddressStep(cart, itemCount, total, user);
  });
 
  document.getElementById('coPlaceOrder').addEventListener('click', function() {
    var method = overlay.querySelector('input[name="payMethod"]:checked').value;
 
    if (method !== 'cod') {
      document.getElementById('payErr').textContent =
        'Online payment gateway is not available yet. Please select Cash on Delivery.';
      return;
    }
 
    overlay.remove();
    placeOrder(cart, itemCount, total, user, address, 'Cash on Delivery');
  });
}
 
/* ─── Place Order ────────────────────────────────────────────────── */
function placeOrder(cart, itemCount, total, user, address, paymentMethod) {
  var orderId = 'ORD-' + Date.now().toString(36).toUpperCase().slice(-6);
  var now = new Date();
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dateStr = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
 
  var order = {
    id: orderId,
    date: dateStr,
    timestamp: now.getTime(),
    status: 'Confirmed',
    total: total,
    itemCount: itemCount,
    paymentMethod: paymentMethod,
    address: address,
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
 
  var ordersKey = 'orders_' + user.email;
  var orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
  orders.unshift(order);
  localStorage.setItem(ordersKey, JSON.stringify(orders));
  localStorage.setItem('cart', JSON.stringify([]));
 
  showOrderConfirmation(order);
}
 
/* ─── Success overlay ────────────────────────────────────────────── */
function showOrderConfirmation(order) {
  var overlay = document.createElement('div');
  overlay.className = 'order-overlay';
 
  var html =
    '<div class="order-modal">' +
    '  <div class="order-icon"><i class="fa-solid fa-circle-check"></i></div>' +
    '  <h2>Order Placed!</h2>' +
    '  <p class="order-thanks">Thank you for shopping with The OutThinkers</p>' +
    '  <div class="order-details-card">' +
    '    <div class="order-detail-row"><span class="detail-label">Order Number</span><span class="detail-val">#' + order.id + '</span></div>' +
    '    <div class="order-detail-row"><span class="detail-label">Items</span><span class="detail-val">' + order.itemCount + ' item' + (order.itemCount > 1 ? 's' : '') + '</span></div>' +
    '    <div class="order-detail-row"><span class="detail-label">Total</span><span class="detail-val order-total">₹' + order.total.toLocaleString('en-IN') + '</span></div>' +
    '    <div class="order-detail-row"><span class="detail-label">Payment</span><span class="detail-val">' + order.paymentMethod + '</span></div>' +
    '    <div class="order-detail-row"><span class="detail-label">Status</span><span class="detail-val"><span class="status-badge status-confirmed">Confirmed</span></span></div>' +
    '  </div>' +
    '  <div class="order-actions">' +
    '    <a href="account.html" class="btn-view-orders">VIEW MY ORDERS</a>' +
    '    <a href="index.html"   class="btn-continue">CONTINUE SHOPPING</a>' +
    '  </div>' +
    '</div>';
 
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  requestAnimationFrame(function() { overlay.classList.add('visible'); });
}