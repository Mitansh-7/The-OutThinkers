document.addEventListener('DOMContentLoaded', function () {

  /* ── Mock User Dataset ───────────────────────────────────────── */
  const USERS = [
    { email: 'dikshit@gmail.com',  password: '123456',  name: 'Dikshit'   },
    { email: 'mitansh@gmail.com',  password: '654321',  name: 'Mitansh'   },
    { email: 'user@gmail.com',     password: 'user123', name: 'Test User'  }
  ];

  /* ── Element refs ────────────────────────────────────────────── */
  const loginContainer  = document.getElementById('loginContainer');
  const accountLayout   = document.getElementById('accountLayout');
  const loginForm       = document.getElementById('loginForm');
  const loginError      = document.getElementById('loginError');
  const welcomeUser     = document.getElementById('welcomeUser');
  const profileName     = document.getElementById('profileName');
  const profileEmail    = document.getElementById('profileEmail');

  // Address refs
  const savedAddressEl  = document.getElementById('savedAddress');
  const addressFormWrap = document.getElementById('addressFormWrap');
  const addAddressBtn   = document.getElementById('addAddressBtn');
  const cancelAddressBtn= document.getElementById('cancelAddressBtn');
  const saveAddressBtn  = document.getElementById('saveAddressBtn');
  const editAddressBtn  = document.getElementById('editAddressBtn');
  const addressInputs   = {
    name:    document.getElementById('addressName'),
    street:  document.getElementById('addressStreet'),
    city:    document.getElementById('addressCity'),
    state:   document.getElementById('addressState'),
    country: document.getElementById('addressCountry')
  };

  /* ── Session helpers ─────────────────────────────────────────── */
  function getSession()     { return JSON.parse(localStorage.getItem('loggedInUser')); }
  function clearSession()   { localStorage.removeItem('loggedInUser'); }
  function saveSession(u)   { localStorage.setItem('loggedInUser', JSON.stringify(u)); }

  /* ── Address helpers (stored per email) ─────────────────────── */
  function addressKey(email) { return 'address_' + email; }
  function getAddress(email) { return JSON.parse(localStorage.getItem(addressKey(email))); }
  function saveAddress(email, addr) { localStorage.setItem(addressKey(email), JSON.stringify(addr)); }

  /* ── Show / hide screens ─────────────────────────────────────── */
  function showAccount(user) {
    loginContainer.style.display  = 'none';
    accountLayout.style.display   = 'flex';

    if (welcomeUser) welcomeUser.textContent = 'Welcome back, ' + user.name;
    if (profileName)  profileName.textContent  = user.name;
    if (profileEmail) profileEmail.textContent = user.email;

    renderAddress(user.email);
    renderOrders();
  }

  function showLogin() {
    accountLayout.style.display  = 'none';
    loginContainer.style.display = 'flex';
    if (loginForm) loginForm.reset();
    if (loginError) loginError.style.display = 'none';
  }

  /* ── Boot: check existing session ───────────────────────────── */
  const session = getSession();
  if (session) {
    showAccount(session);
  } else {
    showLogin();
  }

  /* ── Login ───────────────────────────────────────────────────── */
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;

      const user = USERS.find(function (u) {
        return u.email.toLowerCase() === email && u.password === password;
      });

      if (user) {
        saveSession(user);
        if (loginError) loginError.style.display = 'none';

        var redirect = localStorage.getItem('redirectAfterLogin');
        if (redirect) {
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirect;
          return;
        }

        showAccount(user);
      } else {
        if (loginError) {
          loginError.textContent = 'Incorrect email or password. Please try again.';
          loginError.style.display = 'block';
        }
      }
    });
  }

  /* ── Sign Out ────────────────────────────────────────────────── */
  const signOutLink = document.querySelector('.nav-link.sign-out');
  if (signOutLink) {
    signOutLink.addEventListener('click', function (e) {
      e.preventDefault();
      if (confirm('Are you sure you want to sign out?')) {
        clearSession();
        showLogin();
      }
    });
  }

  /* ── Tab switching ───────────────────────────────────────────── */
  const navLinks = document.querySelectorAll('.nav-link[data-tab]');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = link.getAttribute('data-tab');
      if (!targetId) return;

      navLinks.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');

      tabPanes.forEach(function (pane) {
        pane.classList.toggle('active', pane.id === 'tab-' + targetId);
      });
    });
  });

  /* ── Address rendering & editing ─────────────────────────────── */
  function renderAddress(email) {
    const addr = getAddress(email);

    if (addr) {
      // Show saved address
      savedAddressEl.innerHTML =
        '<strong>' + addr.name    + '</strong><br>' +
        addr.street + '<br>' +
        addr.city   + ', ' + addr.state + '<br>' +
        addr.country;

      savedAddressEl.style.display  = 'block';
      if (addAddressBtn)  addAddressBtn.style.display  = 'none';
      if (editAddressBtn) editAddressBtn.style.display = 'inline-block';
      if (addressFormWrap) addressFormWrap.style.display = 'none';
    } else {
      // No address yet
      savedAddressEl.textContent    = 'No address added yet.';
      if (addAddressBtn)  addAddressBtn.style.display  = 'inline-block';
      if (editAddressBtn) editAddressBtn.style.display = 'none';
      if (addressFormWrap) addressFormWrap.style.display = 'none';
    }
  }

  function openAddressForm(email) {
    const addr = getAddress(email);
    if (addr) {
      // Pre-fill for editing
      addressInputs.name.value    = addr.name;
      addressInputs.street.value  = addr.street;
      addressInputs.city.value    = addr.city;
      addressInputs.state.value   = addr.state;
      addressInputs.country.value = addr.country;
    } else {
      // Clear for fresh entry
      Object.values(addressInputs).forEach(function (el) { el.value = ''; });
    }
    if (addressFormWrap) addressFormWrap.style.display = 'block';
    if (addAddressBtn)   addAddressBtn.style.display   = 'none';
    if (editAddressBtn)  editAddressBtn.style.display  = 'none';
  }

  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', function () {
      const user = getSession();
      if (user) openAddressForm(user.email);
    });
  }

  if (editAddressBtn) {
    editAddressBtn.addEventListener('click', function () {
      const user = getSession();
      if (user) openAddressForm(user.email);
    });
  }

  if (cancelAddressBtn) {
    cancelAddressBtn.addEventListener('click', function () {
      const user = getSession();
      if (user) renderAddress(user.email);
    });
  }

  if (saveAddressBtn) {
    saveAddressBtn.addEventListener('click', function () {
      const user = getSession();
      if (!user) return;

      const name    = addressInputs.name.value.trim();
      const street  = addressInputs.street.value.trim();
      const city    = addressInputs.city.value.trim();
      const state   = addressInputs.state.value.trim();
      const country = addressInputs.country.value.trim();

      if (!name || !street || !city || !state || !country) {
        alert('Please fill in all address fields.');
        return;
      }

      saveAddress(user.email, { name, street, city, state, country });
      renderAddress(user.email);
    });
  }

  /* ── Order History ───────────────────────────────────────────── */
  function renderOrders() {
    const ordersBody        = document.getElementById('ordersBody');
    const emptyOrders       = document.getElementById('emptyOrders');
    const ordersTableWrapper = document.getElementById('ordersTableWrapper');

    if (!ordersBody) return;

    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const ordersKey = currentUser ? 'orders_' + currentUser.email : 'orders_guest';
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];

    if (orders.length === 0) {
      if (ordersTableWrapper) ordersTableWrapper.style.display = 'none';
      if (emptyOrders)        emptyOrders.style.display        = 'block';
      return;
    }

    if (ordersTableWrapper) ordersTableWrapper.style.display = 'block';
    if (emptyOrders)        emptyOrders.style.display        = 'none';

    ordersBody.innerHTML = '';

    orders.forEach(function (order) {
      let statusClass = 'status-confirmed';
      if (order.status === 'Delivered')  statusClass = 'status-delivered';
      if (order.status === 'Processing') statusClass = 'status-processing';

      const tr = document.createElement('tr');
      tr.className = 'order-row';
      tr.setAttribute('data-order-id', order.id);
      tr.innerHTML =
        '<td class="order-number"><a href="#">#' + order.id + '</a></td>' +
        '<td>' + order.date + '</td>' +
        '<td><span class="status-dot ' + statusClass + '"></span> ' + order.status + '</td>' +
        '<td>' + order.itemCount + ' item' + (order.itemCount > 1 ? 's' : '') + '</td>' +
        '<td class="order-total-cell">₹' + order.total.toLocaleString('en-IN') + '</td>' +
        '<td><button type="button" class="btn-expand" aria-label="Toggle details">' +
          '<i class="fa-solid fa-chevron-down"></i></button></td>';

      ordersBody.appendChild(tr);

      const detailTr = document.createElement('tr');
      detailTr.className = 'order-detail-expand';
      let detailHtml = '<td colspan="6"><div class="expand-inner">';
      if (order.items && order.items.length > 0) {
        order.items.forEach(function (item) {
          detailHtml += '<div class="expand-item">';
          if (item.image) {
            detailHtml += '<img src="' + item.image + '" alt="' + item.name + '" class="expand-img">';
          }
          detailHtml +=
            '<div class="expand-info">' +
            '<span class="expand-name">' + item.name + '</span>' +
            '<span class="expand-meta">Size: ' + item.size + ' &middot; Qty: ' + item.quantity + '</span>' +
            '</div>' +
            '<span class="expand-price">₹' + (item.price * item.quantity).toLocaleString('en-IN') + '</span>' +
            '</div>';
        });
      }
      detailHtml += '</div></td>';
      detailTr.innerHTML = detailHtml;
      ordersBody.appendChild(detailTr);

      tr.querySelector('.btn-expand').addEventListener('click', function () {
        const isOpen = detailTr.classList.contains('open');
        document.querySelectorAll('.order-detail-expand.open').forEach(function (r) { r.classList.remove('open'); });
        document.querySelectorAll('.btn-expand i').forEach(function (i) { i.className = 'fa-solid fa-chevron-down'; });
        if (!isOpen) {
          detailTr.classList.add('open');
          this.querySelector('i').className = 'fa-solid fa-chevron-up';
        }
      });
    });
  }

});