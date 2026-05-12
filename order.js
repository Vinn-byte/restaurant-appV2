const selectedTableDisplay = document.getElementById('selectedTableDisplay');
const catalogGrid = document.getElementById('catalogGrid');
const cartItemsElement = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const placeOrderButton = document.getElementById('placeOrderButton');
const cartMessage = document.getElementById('cartMessage');

let selectedTable = null;
let cart = [];

const menuItems = [
  {
    id: 'moonlight-curry',
    name: 'Moonlight Curry',
    description: 'Rich spiced chicken curry, fragrant jasmine rice, and fresh cilantro.',
    price: 16.5,
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mystic-salad',
    name: 'Mystic Salad',
    description: 'Seasonal greens, roasted nuts, berries, and citrus dressing.',
    price: 12.0,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sunset-burger',
    name: 'Sunset Burger',
    description: 'Grilled beef, caramelized onions, aged cheddar, and house aioli.',
    price: 15.9,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'celestial-pasta',
    name: 'Celestial Pasta',
    description: 'Handmade pasta with garlic, cherry tomatoes, olives, and parmesan.',
    price: 14.0,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coastal-seafood',
    name: 'Coastal Seafood',
    description: 'Shellfish medley with lemon butter, herbs, and toasted garlic bread.',
    price: 18.75,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
];

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function renderCatalog() {
  if (!catalogGrid) {
    return;
  }

  catalogGrid.innerHTML = menuItems
    .map(
      (item) => `
        <article class="catalog-card">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
          </div>
          <div class="catalog-footer">
            <span>$${item.price.toFixed(2)}</span>
            <button class="button secondary add-to-cart-button" data-item="${item.id}">Add</button>
          </div>
        </article>
      `,
    )
    .join('');

  document.querySelectorAll('.add-to-cart-button').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.getAttribute('data-item');
      addToCart(itemId);
    });
  });
}

function renderCart() {
  if (!cartItemsElement || !cartTotalElement) {
    return;
  }

  cartItemsElement.innerHTML = cart
    .map((item) => {
      const menuItem = menuItems.find((menu) => menu.id === item.id);
      return `
        <div class="cart-item">
          <div>
            <strong>${menuItem.name}</strong>
            <p>${item.quantity} x $${menuItem.price.toFixed(2)}</p>
          </div>
          <button class="button secondary remove-cart-button" data-item="${item.id}">Remove</button>
        </div>
      `;
    })
    .join('');

  const total = cart.reduce((sum, item) => {
    const menuItem = menuItems.find((menu) => menu.id === item.id);
    return sum + menuItem.price * item.quantity;
  }, 0);

  cartTotalElement.textContent = `$${total.toFixed(2)}`;

  document.querySelectorAll('.remove-cart-button').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.getAttribute('data-item');
      removeFromCart(itemId);
    });
  });
}

function setWelcomeMessage() {
  if (!selectedTableDisplay) {
    return;
  }

  if (!selectedTable) {
    selectedTableDisplay.innerHTML = `
      <p class="eyebrow">Awaiting table scan</p>
      <h3>Welcome, dear customer.</h3>
      <p>Scan your table QR code from the homepage to begin ordering, or return to the scanner if the table is not yet confirmed.</p>
    `;
    return;
  }

  selectedTableDisplay.innerHTML = `
    <p class="eyebrow">Table ${selectedTable} confirmed</p>
    <h3>Welcome, dear customer.</h3>
    <p>You have scanned table ${selectedTable}. Please pick your orders below and they will be served immediately.</p>
  `;
}

function addToCart(itemId) {
  if (!selectedTable) {
    if (cartMessage) {
      cartMessage.textContent = 'Please scan your table QR code from the homepage before ordering.';
    }
    return;
  }

  const found = cart.find((entry) => entry.id === itemId);
  if (found) {
    found.quantity += 1;
  } else {
    cart.push({ id: itemId, quantity: 1 });
  }

  if (cartMessage) {
    cartMessage.textContent = `Added to your table ${selectedTable} order.`;
  }

  renderCart();
}

function removeFromCart(itemId) {
  cart = cart.filter((entry) => entry.id !== itemId);
  if (cartMessage) {
    cartMessage.textContent = 'Removed from your order.';
  }
  renderCart();
}

function placeOrder() {
  if (!selectedTable) {
    if (cartMessage) {
      cartMessage.textContent = 'You must scan a table QR code first.';
    }
    return;
  }

  if (cart.length === 0) {
    if (cartMessage) {
      cartMessage.textContent = 'Add at least one dish before placing your order.';
    }
    return;
  }

  const total = cart.reduce((sum, item) => {
    const menuItem = menuItems.find((menu) => menu.id === item.id);
    return sum + menuItem.price * item.quantity;
  }, 0);

  if (cartMessage) {
    cartMessage.textContent = `Order confirmed for table ${selectedTable}. Total $${total.toFixed(2)}. Your dishes will arrive shortly.`;
  }

  cart = [];
  renderCart();
}

function initOrderPage() {
  const tableParam = getQueryParam('table');
  selectedTable = tableParam ? Number(tableParam) : null;
  setWelcomeMessage();
  renderCatalog();
  renderCart();

  if (placeOrderButton) {
    placeOrderButton.addEventListener('click', placeOrder);
  }
}

document.addEventListener('DOMContentLoaded', initOrderPage);
