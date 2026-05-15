/**
 * js/account.js
 * Handles tab switching + dynamic order history from localStorage
 */

document.addEventListener('DOMContentLoaded', function() {
  var navLinks = document.querySelectorAll('.nav-link[data-tab]');
  var tabPanes = document.querySelectorAll('.tab-pane');

  if (navLinks.length === 0 || tabPanes.length === 0) return;

  navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      var targetTabId = link.getAttribute('data-tab');
      if (!targetTabId) return;

      // Update active nav link
      navLinks.forEach(function(l) { l.classList.remove('active'); });
      link.classList.add('active');

      // Update active tab pane
      tabPanes.forEach(function(pane) {
        if (pane.id === 'tab-' + targetTabId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // Render order history
  renderOrders();
});

function renderOrders() {
  var ordersBody = document.getElementById('ordersBody');
  var emptyOrders = document.getElementById('emptyOrders');
  var ordersTableWrapper = document.getElementById('ordersTableWrapper');

  if (!ordersBody) return;

  var orders = JSON.parse(localStorage.getItem('orders')) || [];

  if (orders.length === 0) {
    if (ordersTableWrapper) ordersTableWrapper.style.display = 'none';
    if (emptyOrders) emptyOrders.style.display = 'block';
    return;
  }

  if (ordersTableWrapper) ordersTableWrapper.style.display = 'block';
  if (emptyOrders) emptyOrders.style.display = 'none';

  ordersBody.innerHTML = '';

  orders.forEach(function(order) {
    var statusClass = 'status-confirmed';
    if (order.status === 'Delivered') statusClass = 'status-delivered';
    if (order.status === 'Processing') statusClass = 'status-processing';

    var tr = document.createElement('tr');
    tr.className = 'order-row';
    tr.setAttribute('data-order-id', order.id);

    var html = '';
    html += '<td class="order-number"><a href="#">#' + order.id + '</a></td>';
    html += '<td>' + order.date + '</td>';
    html += '<td><span class="status-dot ' + statusClass + '"></span> ' + order.status + '</td>';
    html += '<td>' + order.itemCount + ' item' + (order.itemCount > 1 ? 's' : '') + '</td>';
    html += '<td class="order-total-cell">\u20b9' + order.total.toLocaleString('en-IN') + '</td>';
    html += '<td><button type="button" class="btn-expand" aria-label="Toggle details"><i class="fa-solid fa-chevron-down"></i></button></td>';

    tr.innerHTML = html;
    ordersBody.appendChild(tr);

    // Build expandable details row
    var detailTr = document.createElement('tr');
    detailTr.className = 'order-detail-expand';

    var detailHtml = '<td colspan="6"><div class="expand-inner">';
    if (order.items && order.items.length > 0) {
      order.items.forEach(function(item) {
        detailHtml += '<div class="expand-item">';
        if (item.image) {
          detailHtml += '<img src="' + item.image + '" alt="' + item.name + '" class="expand-img">';
        }
        detailHtml += '<div class="expand-info">';
        detailHtml += '<span class="expand-name">' + item.name + '</span>';
        detailHtml += '<span class="expand-meta">Size: ' + item.size + ' &middot; Qty: ' + item.quantity + '</span>';
        detailHtml += '</div>';
        detailHtml += '<span class="expand-price">\u20b9' + (item.price * item.quantity).toLocaleString('en-IN') + '</span>';
        detailHtml += '</div>';
      });
    }
    detailHtml += '</div></td>';
    detailTr.innerHTML = detailHtml;
    ordersBody.appendChild(detailTr);

    // Toggle expand on click
    tr.querySelector('.btn-expand').addEventListener('click', function() {
      var isOpen = detailTr.classList.contains('open');
      // Close all other open rows
      document.querySelectorAll('.order-detail-expand.open').forEach(function(row) {
        row.classList.remove('open');
      });
      document.querySelectorAll('.btn-expand i').forEach(function(icon) {
        icon.className = 'fa-solid fa-chevron-down';
      });

      if (!isOpen) {
        detailTr.classList.add('open');
        this.querySelector('i').className = 'fa-solid fa-chevron-up';
      }
    });
  });
}
