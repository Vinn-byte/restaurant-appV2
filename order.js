const selectedTableDisplay = document.getElementById('selectedTableDisplay');
const catalogGrid = document.getElementById('catalogGrid');
const cartItemsElement = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartEstimatedTimeElement = document.getElementById('cartEstimatedTime');
const placeOrderButton = document.getElementById('placeOrderButton');
const cartMessage = document.getElementById('cartMessage');
const orderNotesInput = document.getElementById('orderNotes');
const orderStatusPanel = document.getElementById('orderStatusPanel');
const brandTitle = document.querySelector('.brand h1');
const brandSubtitle = document.querySelector('.brand p');

// Cooking animation elements
const cookingModal = document.getElementById('cookingModal');
const cookingTimeRemaining = document.getElementById('cookingTimeRemaining');
const cookingProgressFill = document.getElementById('cookingProgressFill');
const cookingStatusText = document.getElementById('cookingStatusText');
const toggleCookingModalButton = document.getElementById('toggleCookingModalButton');

// Cooking stages
const emptyPot = document.getElementById('emptyPot');
const pouringIngredients = document.getElementById('pouringIngredients');
const mixingIngredients = document.getElementById('mixingIngredients');
const servingSandwich = document.getElementById('servingSandwich');
const readyToServe = document.getElementById('readyToServe');

let selectedTable = null;
let cart = [];
let menuItems = [];
let appConfig = {};
let orders = [];
let statusPollInterval = null;
let cookingAnimationInterval = null;
let cookingStartTime = null;
let cookingDuration = 0;

const ordersKey = 'maankuliOrders';

// Debug: Run immediately
console.log('order.js script loaded');
console.log('Current URL:', window.location.href);
const immediateParams = new URLSearchParams(window.location.search);
console.log('Immediate table param check:', immediateParams.get('table'));

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
    estimatedTime: 25,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mystic-salad',
    name: 'Mystic Salad',
    description: 'Seasonal greens, roasted nuts, berries, and citrus dressing.',
    price: 12.0,
    estimatedTime: 10,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sunset-burger',
    name: 'Sunset Burger',
    description: 'Grilled beef, caramelized onions, aged cheddar, and house aioli.',
    price: 15.9,
    estimatedTime: 15,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'celestial-pasta',
    name: 'Celestial Pasta',
    description: 'Handmade pasta with garlic, cherry tomatoes, olives, and parmesan.',
    price: 14.0,
    estimatedTime: 20,
    image: 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8e0f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coastal-seafood',
    name: 'Coastal Seafood',
    description: 'Shellfish medley with lemon butter, herbs, and toasted garlic bread.',
    price: 18.75,
    estimatedTime: 22,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'grilled-salmon',
    name: 'Grilled Salmon',
    description: 'Pan-seared salmon fillet with asparagus, lemon butter, and herb seasoning.',
    price: 19.5,
    estimatedTime: 18,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'vegetable-stir-fry',
    name: 'Vegetable Stir-Fry',
    description: 'Fresh mixed vegetables with garlic ginger sauce, served over jasmine rice.',
    price: 13.5,
    estimatedTime: 12,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ribeye-steak',
    name: 'Ribeye Steak',
    description: 'Premium cut, grilled to perfection with roasted potatoes and seasonal vegetables.',
    price: 24.99,
    estimatedTime: 20,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'shrimp-risotto',
    name: 'Shrimp Risotto',
    description: 'Creamy arborio rice with garlic butter shrimp, white wine, and parmesan.',
    price: 17.5,
    estimatedTime: 22,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'chocolate-cake',
    name: 'Chocolate Cake',
    description: 'Rich dark chocolate cake with ganache frosting and berry compote.',
    price: 7.5,
    estimatedTime: 3,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with mascarpone cream, espresso, and cocoa powder.',
    price: 8.0,
    estimatedTime: 3,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cheesecake',
    name: 'New York Cheesecake',
    description: 'Creamy cheesecake with graham cracker crust and cherry topping.',
    price: 7.99,
    estimatedTime: 3,
    image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'house-wine',
    name: 'House Wine',
    description: 'Selection of red and white wines from local vineyards.',
    price: 8.5,
    estimatedTime: 2,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'craft-beer',
    name: 'Craft Beer',
    description: 'Locally brewed IPA with citrus notes and hoppy finish.',
    price: 6.0,
    estimatedTime: 2,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'signature-cocktail',
    name: 'Signature Cocktail',
    description: 'House-made margarita with fresh lime and agave syrup.',
    price: 10.0,
    estimatedTime: 5,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'espresso',
    name: 'Espresso',
    description: 'Rich, bold espresso shot with crema, made from premium coffee beans.',
    price: 3.5,
    estimatedTime: 2,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam, topped with cocoa powder.',
    price: 4.5,
    estimatedTime: 3,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    description: 'Refreshing iced tea with lemon, served over ice.',
    price: 3.0,
    estimatedTime: 2,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fresh-juice',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice, cold and refreshing.',
    price: 5.0,
    estimatedTime: 3,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'soft-drink',
    name: 'Soft Drink',
    description: 'Choice of cola, lemonade, or ginger ale.',
    price: 2.5,
    estimatedTime: 1,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'virgin-mojito',
    name: 'Virgin Mojito',
    description: 'Fresh mint, lime juice, sugar, soda water, and ice - non-alcoholic.',
    price: 5.5,
    estimatedTime: 4,
    image: 'https://images.unsplash.com/photo-1561047029-3000fde5734d?auto=format&fit=crop&w=800&q=80',
  },
  ],
};

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

  // Merge saved menuItems with defaults to ensure all items are present
  const savedMenuItems = appConfig.menuItems || [];
  menuItems = defaultConfig.menuItems.map(defaultItem => {
    const savedItem = savedMenuItems.find(item => item.id === defaultItem.id);
    return savedItem ? { ...defaultItem, ...savedItem, image: defaultItem.image } : defaultItem;
  });

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

function computeEstimatedTimeFromItems(items) {
  const times = items
    .map((item) => {
      const menuItem = menuItems.find((menu) => menu.id === item.id || menu.name === item.name);
      return menuItem ? menuItem.estimatedTime : 0;
    })
    .filter((time) => Number.isFinite(time) && time > 0);

  if (times.length === 0) {
    return 0;
  }

  return Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
}

function createLocalOrder(payload) {
  const estimatedTime = computeEstimatedTimeFromItems(payload.items);
  const order = {
    id: generateOrderId(),
    table: payload.table,
    customer: payload.customer || `Table ${payload.table}`,
    items: payload.items,
    total: Number(payload.total) || 0,
    notes: payload.notes || '',
    status: 'Accepted',
    estimatedTime,
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  saveOrders();
  return order;
}

function getLocalOrder(orderId) {
  return orders.find((item) => item.id === orderId);
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
          <img src="${item.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'}" alt="${item.name}" />
          <div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
          </div>
          <div class="catalog-footer">
            <span>$${item.price.toFixed(2)} | Est. ${item.estimatedTime} min</span>
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

  // Calculate average estimated time
  if (cartEstimatedTimeElement) {
    const times = cart.map(item => {
      const menuItem = menuItems.find(menu => menu.id === item.id);
      return menuItem ? menuItem.estimatedTime : 0;
    }).filter(t => t > 0);
    if (times.length > 0) {
      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      cartEstimatedTimeElement.textContent = `${Math.round(averageTime)} min`;
    } else {
      cartEstimatedTimeElement.textContent = '-- min';
    }
  }

  document.querySelectorAll('.remove-cart-button').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.getAttribute('data-item');
      removeFromCart(itemId);
    });
  });
}

async function createServerOrder(orderPayload) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      console.warn('Server order failed, falling back to local order.', response.status);
      return createLocalOrder(orderPayload);
    }

    return response.json();
  } catch (error) {
    console.warn('Server unavailable, falling back to local order.', error);
    return createLocalOrder(orderPayload);
  }
}

async function fetchOrderStatus(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Unable to get order status.');
    }
    return response.json();
  } catch (error) {
    console.warn('Unable to fetch order status from server, using local copy if available.', error);
    const localOrder = getLocalOrder(orderId);
    if (localOrder) {
      return localOrder;
    }
    throw new Error('Unable to get order status.');
  }
}

function displayOrderStatus(order) {
  if (!orderStatusPanel) {
    return;
  }

  if (order.status === 'Accepted') {
    hideCookingAnimation();
    orderStatusPanel.textContent = 'Chef has accepted the order and will begin preparing it soon.';
  } else if (order.status === 'Preparing') {
    orderStatusPanel.textContent = 'Your meal is being prepared by the kitchen.';
    if (order.estimatedTime) {
      startCookingAnimation(order.estimatedTime);
    }
  } else if (order.status === 'Ready') {
    hideCookingAnimation();
    orderStatusPanel.textContent = 'Your meal is ready to be served!';
  } else if (order.status === 'Completed') {
    hideCookingAnimation();
    orderStatusPanel.textContent = 'Your order has been completed. Enjoy your meal!';
  } else {
    hideCookingAnimation();
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

function startCookingAnimation(durationMinutes) {
  if (!cookingModal) return;

  cookingDuration = durationMinutes * 60 * 1000; // Convert to milliseconds
  cookingStartTime = Date.now();

  // Show modal
  cookingModal.style.display = 'flex';

  // Ensure animation is visible
  const cookingAnimation = document.querySelector('.cooking-animation');
  if (cookingAnimation) {
    cookingAnimation.style.display = 'block';
  }
  if (toggleCookingModalButton) {
    toggleCookingModalButton.textContent = '👁';
  }

  // Reset all stages
  [emptyPot, pouringIngredients, mixingIngredients, servingSandwich, readyToServe].forEach(stage => {
    stage.classList.remove('active');
  });

  // Start with empty pot
  emptyPot.classList.add('active');
  cookingStatusText.textContent = 'Chef is preparing your ingredients...';

  // Clear any existing animation
  if (cookingAnimationInterval) {
    clearInterval(cookingAnimationInterval);
  }

  // Start animation loop
  cookingAnimationInterval = setInterval(() => {
    updateCookingAnimation();
  }, 1000);
}

function updateCookingAnimation() {
  if (!cookingStartTime || !cookingDuration) return;

  const elapsed = Date.now() - cookingStartTime;
  const remaining = Math.max(0, cookingDuration - elapsed);
  const progress = Math.min(100, (elapsed / cookingDuration) * 100);

  // Update timer display
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  cookingTimeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Update progress bar
  cookingProgressFill.style.width = `${progress}%`;

  // Update animation stages based on progress
  const stageDuration = cookingDuration / 5; // 5 stages

  if (elapsed < stageDuration) {
    // Stage 1: Empty pot (0-20%)
    setActiveStage(emptyPot);
    cookingStatusText.textContent = 'Chef is preparing your ingredients...';
  } else if (elapsed < stageDuration * 2) {
    // Stage 2: Pouring ingredients (20-40%)
    setActiveStage(pouringIngredients);
    cookingStatusText.textContent = 'Adding fresh ingredients to your meal...';
  } else if (elapsed < stageDuration * 3) {
    // Stage 3: Mixing ingredients (40-60%)
    setActiveStage(mixingIngredients);
    cookingStatusText.textContent = 'Mixing everything together perfectly...';
  } else if (elapsed < stageDuration * 4) {
    // Stage 4: Serving sandwich (60-80%)
    setActiveStage(servingSandwich);
    cookingStatusText.textContent = 'Assembling your perfect sandwich...';
  } else {
    // Stage 5: Ready to serve (80-100%)
    setActiveStage(readyToServe);
    cookingStatusText.textContent = 'Your meal is almost ready!';
  }

  // When animation completes
  if (elapsed >= cookingDuration) {
    hideCookingAnimation();
  }
}

function setActiveStage(activeStage) {
  [emptyPot, pouringIngredients, mixingIngredients, servingSandwich, readyToServe].forEach(stage => {
    stage.classList.remove('active');
  });
  activeStage.classList.add('active');
}

function hideCookingAnimation() {
  if (cookingModal) {
    cookingModal.style.display = 'none';
  }
  if (cookingAnimationInterval) {
    clearInterval(cookingAnimationInterval);
    cookingAnimationInterval = null;
  }
  cookingStartTime = null;
  cookingDuration = 0;
}

function stopStatusPolling() {
  if (statusPollInterval) {
    clearInterval(statusPollInterval);
    statusPollInterval = null;
  }
  hideCookingAnimation();
}

function setWelcomeMessage() {
  if (!selectedTableDisplay) {
    console.error('selectedTableDisplay element not found!');
    return;
  }

  console.log('setWelcomeMessage called. selectedTable:', selectedTable);

  if (!selectedTable || selectedTable === 0 || Number.isNaN(selectedTable)) {
    console.log('selectedTable is falsy, showing awaiting message');
    selectedTableDisplay.innerHTML = `
      <p class="eyebrow">Awaiting table scan</p>
      <h3>Welcome to ${appConfig.restaurantName}.</h3>
      <p>Scan your table QR code from the homepage to begin ordering, or return to the scanner if the table is not yet confirmed.</p>
      <small style="color: #999; margin-top: 10px; display: block;">[Debug: selectedTable = ${selectedTable}]</small>
    `;
    return;
  }

  console.log('selectedTable is truthy, showing confirmed message for table:', selectedTable);
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
  loadOrders();
  loadAppConfig();
  
  // Get elements (they should exist now after DOMContentLoaded)
  const debugUrl = document.getElementById('debugUrl');
  const debugTable = document.getElementById('debugTable');
  const selectedTableDisplay = document.getElementById('selectedTableDisplay');
  
  // Show debug info immediately
  console.log('=== initOrderPage starting ===');
  console.log('Window location:', window.location.href);
  
  if (debugUrl) {
    debugUrl.textContent = window.location.href;
    console.log('Debug URL updated');
  } else {
    console.error('debugUrl element not found!');
  }
  
  // Parse table parameter directly from URL
  const urlParams = new URLSearchParams(window.location.search);
  const tableParam = urlParams.get('table');
  console.log('URL params:', Array.from(urlParams.entries()));
  console.log('Table param extracted:', tableParam);
  
  if (debugTable) {
    debugTable.textContent = tableParam || 'null';
    console.log('Debug table param updated to:', tableParam);
  } else {
    console.error('debugTable element not found!');
  }
  
  // Convert to number, or try localStorage as fallback
  let table = null;
  
  if (tableParam) {
    table = parseInt(tableParam, 10);
    console.log('Parsed table from URL param:', table, 'isNaN:', Number.isNaN(table));
  }
  
  if (!table || Number.isNaN(table)) {
    console.log('No valid table param, checking localStorage...');
    const savedState = localStorage.getItem('maankuliTableState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        console.log('Saved table state:', state);
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
  console.log('=== Final selectedTable value:', selectedTable, '===');
  
  setWelcomeMessage();
  renderCatalog();
  renderCart();

  if (placeOrderButton) {
    placeOrderButton.addEventListener('click', placeOrder);
  }

  // Add toggle button for cooking modal
  if (toggleCookingModalButton) {
    toggleCookingModalButton.addEventListener('click', () => {
      const cookingAnimation = document.querySelector('.cooking-animation');
      if (cookingAnimation.style.display === 'none') {
        cookingAnimation.style.display = 'block';
        toggleCookingModalButton.textContent = '👁';
      } else {
        cookingAnimation.style.display = 'none';
        toggleCookingModalButton.textContent = '🙈';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initOrderPage);

// Also try window.onload as fallback
window.addEventListener('load', () => {
  console.log('Window load event fired');
  if (!selectedTable) {
    initOrderPage();
  }
});

// Additional fallback: if nothing has happened by 2 seconds, try again
setTimeout(() => {
  console.log('Timeout check: selectedTable =', selectedTable);
  if (!selectedTable && !menuItems.length) {
    console.log('Forcing initOrderPage due to timeout');
    initOrderPage();
  }
}, 2000);
