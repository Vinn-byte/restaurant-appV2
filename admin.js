const adminLoginForm = document.getElementById('adminLoginForm');
const adminPasswordInput = document.getElementById('adminPassword');
const loginMessage = document.getElementById('loginMessage');
const adminLoginView = document.getElementById('adminLoginView');
const adminPanel = document.getElementById('adminPanel');
const settingsForm = document.getElementById('settingsForm');
const restaurantNameInput = document.getElementById('restaurantName');
const restaurantTaglineInput = document.getElementById('restaurantTagline');
const heroHeadlineInput = document.getElementById('heroHeadlineInput');
const heroTextInput = document.getElementById('heroTextInput');
const heroImageInput = document.getElementById('heroImageInput');
const menuList = document.getElementById('menuList');
const addDishButton = document.getElementById('addDishButton');
const clearOrdersButton = document.getElementById('clearOrdersButton');
const logoutButton = document.getElementById('logoutButton');
const ordersList = document.getElementById('ordersList');
const saveConfigButton = document.getElementById('saveConfigButton');
const resetConfigButton = document.getElementById('resetConfigButton');
const statusMessage = document.getElementById('statusMessage');

const configKey = 'maankuliConfig';
const adminAuthKey = 'maankuliAdminAuth';
const adminPassword = 'maankuli123';
const serverOrdersApi = '/api/orders';

let appConfig = null;
let orders = [];

const defaultConfig = {
  restaurantName: 'Maankuli Restaurant',
  restaurantTagline: 'Modern dining with a classic soul',
  heroTagline: 'Fine dining, simplified',
  heroHeadline: 'Maankuli Restaurant delivers an elegant QR dining experience.',
  heroText: 'Discover carefully crafted dishes, reserve a table, and place orders directly from your phone. Enjoy refined flavors without the wait.',
  heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  menuItems: [
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
  ],
};

function loadAppConfig() {
  const saved = localStorage.getItem(configKey);
  if (saved) {
    try {
      appConfig = JSON.parse(saved);
    } catch (error) {
      appConfig = JSON.parse(JSON.stringify(defaultConfig));
    }
  } else {
    appConfig = JSON.parse(JSON.stringify(defaultConfig));
  }
}

function saveAppConfig() {
  localStorage.setItem(configKey, JSON.stringify(appConfig));
}

async function fetchOrdersFromServer() {
  try {
    const response = await fetch(serverOrdersApi);
    if (!response.ok) {
      throw new Error('Unable to fetch orders from the server.');
    }
    orders = await response.json();
  } catch (error) {
    console.error(error);
    orders = [];
  }
}

async function updateOrderOnServer(orderId, changes) {
  const response = await fetch(`${serverOrdersApi}/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });

  if (!response.ok) {
    throw new Error('Unable to update order on the server.');
  }

  return response.json();
}

async function deleteOrderFromServer(orderId) {
  const response = await fetch(`${serverOrdersApi}/${orderId}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    throw new Error('Unable to delete order from the server.');
  }
}

async function clearAllServerOrders() {
  const response = await fetch(serverOrdersApi, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    throw new Error('Unable to clear server orders.');
  }
}

async function renderAdminView() {
  const authenticated = sessionStorage.getItem(adminAuthKey) === 'true';
  if (authenticated) {
    adminLoginView.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadAppConfig();
    await fetchOrdersFromServer();
    populateSettings();
    renderMenuItems();
    renderOrders();
  } else {
    adminLoginView.classList.remove('hidden');
    adminPanel.classList.add('hidden');
  }
}

function populateSettings() {
  restaurantNameInput.value = appConfig.restaurantName || defaultConfig.restaurantName;
  restaurantTaglineInput.value = appConfig.restaurantTagline || defaultConfig.restaurantTagline;
  heroHeadlineInput.value = appConfig.heroHeadline || defaultConfig.heroHeadline;
  heroTextInput.value = appConfig.heroText || defaultConfig.heroText;
  heroImageInput.value = appConfig.heroImage || defaultConfig.heroImage;
}

function renderMenuItems() {
  menuList.innerHTML = '';
  appConfig.menuItems = appConfig.menuItems || [];

  appConfig.menuItems.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    card.innerHTML = `
      <div class="menu-item-header">
        <strong>Dish ${index + 1}</strong>
        <button type="button" class="button secondary remove-menu-item">Remove</button>
      </div>
      <img class="menu-item-preview" src="${item.image || 'https://via.placeholder.com/800x450?text=No+image'}" alt="${item.name}" />
      <label>
        Dish name
        <input type="text" name="name" value="${item.name}" />
      </label>
      <label>
        Description
        <textarea name="description">${item.description}</textarea>
      </label>
      <label>
        Price
        <input type="number" name="price" step="0.01" value="${item.price}" />
      </label>
      <label>
        Image URL
        <input type="text" name="image" value="${item.image}" />
      </label>
    `;

    const removeButton = card.querySelector('.remove-menu-item');
    removeButton.addEventListener('click', () => {
      if (appConfig.menuItems.length <= 1) {
        statusMessage.textContent = 'At least one menu item is required.';
        return;
      }
      appConfig.menuItems.splice(index, 1);
      renderMenuItems();
    });

    const imageInput = card.querySelector('input[name="image"]');
    const previewImage = card.querySelector('.menu-item-preview');
    imageInput.addEventListener('input', () => {
      previewImage.src = imageInput.value.trim() || 'https://via.placeholder.com/800x450?text=No+image';
    });

    menuList.appendChild(card);
  });
}

function collectMenuItems() {
  const cards = menuList.querySelectorAll('.menu-item-card');
  return Array.from(cards).map((card, index) => {
    const nameInput = card.querySelector('input[name="name"]');
    const descriptionInput = card.querySelector('textarea[name="description"]');
    const priceInput = card.querySelector('input[name="price"]');
    const imageInput = card.querySelector('input[name="image"]');

    return {
      id: appConfig.menuItems[index]?.id || `dish-${Date.now()}-${index}`,
      name: nameInput.value.trim() || `Dish ${index + 1}`,
      description: descriptionInput.value.trim() || 'Delicious menu item.',
      price: Number(priceInput.value) || 0,
      image: imageInput.value.trim() || defaultConfig.menuItems[index]?.image || '',
    };
  });
}

function applySettingsFromForm() {
  appConfig.restaurantName = restaurantNameInput.value.trim() || defaultConfig.restaurantName;
  appConfig.restaurantTagline = restaurantTaglineInput.value.trim() || defaultConfig.restaurantTagline;
  appConfig.heroHeadline = heroHeadlineInput.value.trim() || defaultConfig.heroHeadline;
  appConfig.heroText = heroTextInput.value.trim() || defaultConfig.heroText;
  appConfig.heroImage = heroImageInput.value.trim() || defaultConfig.heroImage;
  appConfig.menuItems = collectMenuItems();
}

function addMenuItem() {
  const newItem = {
    id: `dish-${Date.now()}`,
    name: 'New Dish',
    description: 'Add a description for this dish.',
    price: 0,
    image: '',
  };
  appConfig.menuItems.push(newItem);
  renderMenuItems();
}

function handleLogin(event) {
  event.preventDefault();
  const password = adminPasswordInput.value.trim();
  if (password === adminPassword) {
    sessionStorage.setItem(adminAuthKey, 'true');
    loginMessage.textContent = '';
    renderAdminView();
  } else {
    loginMessage.textContent = 'Wrong password. Try again.';
    adminPasswordInput.value = '';
  }
}

function handleLogout() {
  sessionStorage.removeItem(adminAuthKey);
  renderAdminView();
}

function createOrderCard(order) {
  const card = document.createElement('div');
  card.className = 'order-card';
  card.innerHTML = `
    <div class="order-card-header">
      <div>
        <strong>Order ${order.id}</strong>
        <span class="eyebrow">${new Date(order.createdAt).toLocaleString()}</span>
      </div>
      <button type="button" class="button secondary delete-order">Delete</button>
    </div>
    <label>
      Table number
      <input type="number" name="order-table" value="${order.table}" min="1" />
    </label>
    <label>
      Order status
      <select name="order-status">
        <option value="New" ${order.status === 'New' ? 'selected' : ''}>New</option>
        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
        <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
        <option value="Served" ${order.status === 'Served' ? 'selected' : ''}>Served</option>
      </select>
    </label>
    <label>
      Notes
      <textarea name="order-notes" rows="2">${order.notes || ''}</textarea>
    </label>
    <div class="order-items">
      ${order.items.map((item) => `<div class="order-item"><strong>${item.name}</strong><span>${item.quantity} × $${item.price.toFixed(2)}</span></div>`).join('')}
    </div>
    <div class="order-summary">
      <span>Total</span>
      <strong>$${order.total.toFixed(2)}</strong>
    </div>
    <div class="admin-grid">
      <button type="button" class="button primary save-order-button">Save Order</button>
    </div>
  `;

  const deleteButton = card.querySelector('.delete-order');
  const saveOrderButton = card.querySelector('.save-order-button');
  const tableInput = card.querySelector('input[name="order-table"]');
  const statusSelect = card.querySelector('select[name="order-status"]');
  const notesInput = card.querySelector('textarea[name="order-notes"]');

  deleteButton.addEventListener('click', async () => {
    try {
      await deleteOrderFromServer(order.id);
      await fetchOrdersFromServer();
      renderOrders();
    } catch (error) {
      console.error(error);
      statusMessage.textContent = 'Unable to delete this order right now.';
      setTimeout(() => {
        statusMessage.textContent = '';
      }, 2500);
    }
  });

  saveOrderButton.addEventListener('click', async () => {
    const orderToUpdate = orders.find((current) => current.id === order.id);
    if (!orderToUpdate) {
      return;
    }

    const updates = {
      table: Number(tableInput.value) || order.table,
      status: statusSelect.value,
      notes: notesInput.value.trim(),
    };

    try {
      await updateOrderOnServer(order.id, updates);
      await fetchOrdersFromServer();
      statusMessage.textContent = `Order ${order.id} updated.`;
      setTimeout(() => {
        statusMessage.textContent = '';
      }, 2500);
      renderOrders();
    } catch (error) {
      console.error(error);
      statusMessage.textContent = 'Unable to save changes for this order.';
      setTimeout(() => {
        statusMessage.textContent = '';
      }, 2500);
    }
  });

  return card;
}

function renderOrders() {
  if (!ordersList) {
    return;
  }

  ordersList.innerHTML = '';
  if (!orders.length) {
    ordersList.innerHTML = '<p class="scanner-status">No table orders have been placed yet.</p>';
    return;
  }

  orders.slice().reverse().forEach((order) => {
    const orderCard = createOrderCard(order);
    ordersList.appendChild(orderCard);
  });
}

async function handleClearOrders() {
  if (!confirm('Clear all saved orders from storage?')) {
    return;
  }

  try {
    await clearAllServerOrders();
    orders = [];
    renderOrders();
    statusMessage.textContent = 'All orders cleared.';
  } catch (error) {
    console.error(error);
    statusMessage.textContent = 'Unable to clear orders from the server.';
  }

  setTimeout(() => {
    statusMessage.textContent = '';
  }, 2500);
}

function handleSave(event) {
  event.preventDefault();
  applySettingsFromForm();
  saveAppConfig();
  statusMessage.textContent = 'Restaurant settings updated successfully.';
  setTimeout(() => {
    statusMessage.textContent = '';
  }, 3500);
}

function handleReset() {
  if (!confirm('Reset the admin content to the default restaurant configuration?')) {
    return;
  }

  appConfig = JSON.parse(JSON.stringify(defaultConfig));
  saveAppConfig();
  populateSettings();
  renderMenuItems();
  statusMessage.textContent = 'Configuration reset to defaults.';
  setTimeout(() => {
    statusMessage.textContent = '';
  }, 3500);
}

window.addEventListener('DOMContentLoaded', () => {
  loadAppConfig();
  renderAdminView();

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleLogin);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  if (addDishButton) {
    addDishButton.addEventListener('click', addMenuItem);
  }

  if (saveConfigButton) {
    saveConfigButton.addEventListener('click', handleSave);
  }

  if (resetConfigButton) {
    resetConfigButton.addEventListener('click', handleReset);
  }

  if (clearOrdersButton) {
    clearOrdersButton.addEventListener('click', handleClearOrders);
  }
});
