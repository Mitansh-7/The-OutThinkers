function switchTab(e, tabName) {
  e.preventDefault();
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => section.classList.remove('active'));
  const links = document.querySelectorAll('.tab-link');
  links.forEach(link => link.classList.remove('active'));
  const selectedSection = document.getElementById(tabName);
  if (selectedSection) {
    selectedSection.classList.add('active');
  }
  e.target.classList.add('active');
}

function showSectionByHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) {
    return;
  }

  const targetSection = document.getElementById(hash);
  if (!targetSection) {
    return;
  }

  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.tab-link').forEach(link => {
    link.classList.remove('active');
  });

  targetSection.classList.add('active');
  const targetTab = document.querySelector(`.tab-link[href="#₹{hash}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
}

window.addEventListener('DOMContentLoaded', showSectionByHash);
window.addEventListener('hashchange', showSectionByHash);
const cartLink = document.getElementById('cartLink');
const newsletterForm = document.getElementById('newsletterForm');

document.querySelectorAll('.tab-link[data-tab]').forEach(link => {
  link.addEventListener('click', function (event) {
    const tabName = this.getAttribute('data-tab');
    if (tabName) {
      switchTab(event, tabName);
    }
  });
});

if (newsletterForm) {
  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;

    if(email) {
      alert('Thank you for subscribing! Check your email for exclusive offers.');
      this.reset();
    }
  });
}
document.querySelector('.contact-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = this.querySelector('#name').value;
  const email = this.querySelector('#email').value;
  const subject = this.querySelector('#subject').value;
  
  if (name && email && subject) {
    alert('Thank you for your message! We will respond within 24 hours.');
    this.reset();
  } else {
    alert('Please fill in all required fields.');
  }
});
function viewCart(e) {
  e.preventDefault();
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    alert('Your cart is empty. Visit our shop!');
  } else {
    let cartSummary = `Items in cart (₹{cart.length}):\n\n`;
    let total = 0;
    cart.forEach((item, index) => {
      const price = parseFloat(item.price.replace('₹', ''));
      total += price;
      cartSummary += `₹{index + 1}. ₹{item.name} - ₹{item.price}\n`;
    });
    cartSummary += `\nTotal: ₹₹{total.toFixed(2)}`;
    alert(cartSummary);
  }
}
if (cartLink) {
  cartLink.addEventListener('click', viewCart);
}
console.log('About Page Loaded');

