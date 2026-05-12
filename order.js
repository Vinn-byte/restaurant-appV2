const selectedTableDisplay = document.getElementById('selectedTableDisplay');
const catalogGrid = document.getElementById('catalogGrid');
const cartItemsElement = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const placeOrderButton = document.getElementById('placeOrderButton');
const cartMessage = document.getElementById('cartMessage');
const orderNotesInput = document.getElementById('orderNotes');
const orderStatusPanel = document.getElementById('orderStatusPanel');
const brandTitle = document.querySelector('.brand h1');
const brandSubtitle = document.querySelector('.brand p');

let selectedTable = null;
let cart = [];
let menuItems = [];
let appConfig = {};
let orders = [];
let statusPollInterval = null;

const ordersKey = 'maankuliOrders';

const configKey = 'maankuliConfig';
const defaultConfig = {
  restaurantName: 'Maankuli Restaurant',
  restaurantTagline: 'Table ordering experience',
  menuItems: [
  {
    id: 'moonlight-curry',
    name: 'Moonlight Curry',
    description: 'Rich spiced chicken curry, fragrant jasmine rice, and fresh cilantro.',
    price: 16.5,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mystic-salad',
    name: 'Mystic Salad',
    description: 'Seasonal greens, roasted nuts, berries, and citrus dressing.',
    price: 12.0,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sunset-burger',
    name: 'Sunset Burger',
    description: 'Grilled beef, caramelized onions, aged cheddar, and house aioli.',
    price: 15.9,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'celestial-pasta',
    name: 'Celestial Pasta',
    description: 'Handmade pasta with garlic, cherry tomatoes, olives, and parmesan.',
    price: 14.0,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coastal-seafood',
    name: 'Coastal Seafood',
    description: 'Shellfish medley with lemon butter, herbs, and toasted garlic bread.',
    price: 18.75,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'grilled-salmon',
    name: 'Grilled Salmon',
    description: 'Pan-seared salmon fillet with asparagus, lemon butter, and herb seasoning.',
    price: 19.5,
    image: 'https://images.unsplash.com/photo-1580959375944-abd7e991f971?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'vegetable-stir-fry',
    name: 'Vegetable Stir-Fry',
    description: 'Fresh mixed vegetables with garlic ginger sauce, served over jasmine rice.',
    price: 13.5,
    image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ribeye-steak',
    name: 'Ribeye Steak',
    description: 'Premium cut, grilled to perfection with roasted potatoes and seasonal vegetables.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1599141726850-1d375ed63cb7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'shrimp-risotto',
    name: 'Shrimp Risotto',
    description: 'Creamy arborio rice with garlic butter shrimp, white wine, and parmesan.',
    price: 17.5,
    image: 'https://images.unsplash.com/photo-1589985643294-4bf00d9bef07?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'chocolate-cake',
    name: 'Chocolate Cake',
    description: 'Rich dark chocolate cake with ganache frosting and berry compote.',
    price: 7.5,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with mascarpone cream, espresso, and cocoa powder.',
    price: 8.0,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cheesecake',
    name: 'New York Cheesecake',
    description: 'Creamy cheesecake with graham cracker crust and cherry topping.',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1533134242443-742ce9688868?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'house-wine',
    name: 'House Wine',
    description: 'Selection of red and white wines from local vineyards.',
    price: 8.5,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'craft-beer',
    name: 'Craft Beer',
    description: 'Locally brewed IPA with citrus notes and hoppy finish.',
    price: 6.0,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'signature-cocktail',
    name: 'Signature Cocktail',
    description: 'House-made margarita with fresh lime and agave syrup.',
    price: 10.0,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'espresso',
    name: 'Espresso',
    description: 'Rich, bold espresso shot with crema, made from premium coffee beans.',
    price: 3.5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam, topped with cocoa powder.',
    price: 4.5,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba53dba?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    description: 'Refreshing iced tea with lemon, served over ice.',
    price: 3.0,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fresh-juice',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice, cold and refreshing.',
    price: 5.0,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'soft-drink',
    name: 'Soft Drink',
    description: 'Choice of cola, lemonade, or ginger ale.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1554866585-d42d2411adb4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'virgin-mojito',
    name: 'Virgin Mojito',
    description: 'Fresh mint, lime juice, sugar, soda water, and ice - non-alcoholic.',
    price: 5.5,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
  },
];

function loadAppConfig() {
  const saved = localStorage.getItem(configKey);
  if (saved) {
    try {
      appConfig = JSON.parse(saved);
    } catch (error) {
      appConfig = defaultConfig;
    }
  } else {
    appConfig = defaultConfig;
  }

  menuItems = (appConfig.menuItems && appConfig.menuItems.length) ? appConfig.menuItems : defaultConfig.menuItems;

  if (brandTitle) {
    brandTitle.textContent = appConfig.restaurantName;
  }

  if (brandSubtitle) {
    brandSubtitle.textContent = appConfig.restaurantTagline;
  }

  document.title = `${appConfig.restaurantName} | Table Ordering`;
}

function loadOrders() {
  const saved = localStorage.getItem(ordersKey);
  if (saved) {
    try {
      orders = JSON.parse(saved);
    } catch (error) {
      orders = [];
    }
  } else {
    orders = [];
  }
}

function saveOrders() {
  localStorage.setItem(ordersKey, JSON.stringify(orders));
}

function generateOrderId() {
  return `ORD-${Date.now()}`;
}

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

async function createServerOrder(orderPayload) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    throw new Error('Failed to send order to the server.');
  }

  return response.json();
}

async function fetchOrderStatus(orderId) {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Unable to get order status.');
  }
  return response.json();
}

function displayOrderStatus(order) {
  if (!orderStatusPanel) {
    return;
  }

  if (order.status === 'Accepted') {
    orderStatusPanel.textContent = 'Chef has accepted the order and will begin preparing it soon.';
  } else if (order.status === 'Preparing') {
    orderStatusPanel.textContent = 'Your meal is being prepared by the kitchen.';
  } else if (order.status === 'Ready') {
    orderStatusPanel.textContent = 'Your meal is ready to be served.';
  } else if (order.status === 'Completed') {
    orderStatusPanel.textContent = 'Your order has been completed.';
  } else {
    orderStatusPanel.textContent = 'The kitchen has received your order and will review it shortly.';
  }
}

function startStatusPolling(orderId) {
  if (statusPollInterval) {
    clearInterval(statusPollInterval);
  }

  statusPollInterval = setInterval(async () => {
    try {
      const order = await fetchOrderStatus(orderId);
      displayOrderStatus(order);
      if (['Ready', 'Completed'].includes(order.status)) {
        clearInterval(statusPollInterval);
      }
    } catch (error) {
      console.error(error);
    }
  }, 5000);
}

function stopStatusPolling() {
  if (statusPollInterval) {
    clearInterval(statusPollInterval);
    statusPollInterval = null;
  }
}

function setWelcomeMessage() {
  if (!selectedTableDisplay) {
    return;
  }

  if (!selectedTable) {
    selectedTableDisplay.innerHTML = `
      <p class="eyebrow">Awaiting table scan</p>
      <h3>Welcome to ${appConfig.restaurantName}.</h3>
      <p>Scan your table QR code from the homepage to begin ordering, or return to the scanner if the table is not yet confirmed.</p>
    `;
    return;
  }

  selectedTableDisplay.innerHTML = `
    <p class="eyebrow">Table ${selectedTable} confirmed</p>
    <h3>Welcome to ${appConfig.restaurantName}.</h3>
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

async function placeOrder() {
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

  const notes = orderNotesInput ? orderNotesInput.value.trim() : '';
  const payload = {
    table: selectedTable,
    customer: `Table ${selectedTable}`,
    items: cart.map((item) => {
      const menuItem = menuItems.find((menu) => menu.id === item.id);
      return {
        id: item.id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
      };
    }),
    total,
    notes,
  };

  try {
    const savedOrder = await createServerOrder(payload);
    if (cartMessage) {
      cartMessage.textContent = `Order ${savedOrder.id} confirmed for table ${selectedTable}. Total $${total.toFixed(2)}.`;
    }
    if (orderStatusPanel) {
      displayOrderStatus(savedOrder);
      startStatusPolling(savedOrder.id);
    }
    cart = [];
    if (orderNotesInput) {
      orderNotesInput.value = '';
    }
    renderCart();
  } catch (error) {
    console.error(error);
    if (cartMessage) {
      cartMessage.textContent = 'Unable to place your order right now. Please try again.';
    }
  }
}

function initOrderPage() {
  loadAppConfig();
  const tableParam = getQueryParam('table');
  console.log('Order page loaded. Table param from URL:', tableParam);
  
  // Try to get table from URL parameter first, then localStorage as fallback
  let table = tableParam ? Number(tableParam) : null;
  if (!table) {
    const savedState = localStorage.getItem('maankuliTableState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        for (const [tableId, reserved] of Object.entries(state)) {
          if (reserved) {
            table = Number(tableId);
            console.log('Found reserved table in localStorage:', table);
            break;
          }
        }
      } catch (e) {
        console.error('Error reading table state:', e);
      }
    }
  }
  
  selectedTable = table;
  console.log('Selected table set to:', selectedTable);
  console.log('Window location:', window.location.href);
  setWelcomeMessage();
  renderCatalog();
  renderCart();

  if (placeOrderButton) {
    placeOrderButton.addEventListener('click', placeOrder);
  }
}

document.addEventListener('DOMContentLoaded', initOrderPage);
