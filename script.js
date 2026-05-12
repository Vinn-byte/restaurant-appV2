const orderForm = document.getElementById('orderForm');
const orderConfirmation = document.getElementById('orderConfirmation');
const openScannerButton = document.getElementById('openScannerButton');
const stopScannerButton = document.getElementById('stopScannerButton');
const scannerStatus = document.getElementById('scannerStatus');
const video = document.getElementById('video');
const scanCanvas = document.getElementById('scanCanvas');
const qrCodeElement = document.getElementById('qrCode');
const tableGrid = document.getElementById('tableGrid');
const tableStatus = document.getElementById('tableStatus');
const releaseAllTablesButton = document.getElementById('releaseAllTables');
const selectedTableDisplay = document.getElementById('selectedTableDisplay');
const menuGrid = document.getElementById('menuGrid');
const catalogGrid = document.getElementById('catalogGrid');
const cartItemsElement = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const placeOrderButton = document.getElementById('placeOrderButton');
const cartMessage = document.getElementById('cartMessage');
const aboutLink = document.getElementById('aboutLink');
const aboutSection = document.getElementById('about');
const orderSection = document.getElementById('order');
const scannerSection = document.getElementById('scanner');
const tablesSection = document.getElementById('tables');
const catalogSection = document.getElementById('catalog');
const canvasContext = scanCanvas.getContext('2d');

let scanStream = null;
let animationFrameId = null;
let selectedTable = null;
let cart = [];
let tableState = {};
let menuItems = [];
let appConfig = {};

const configKey = 'maankuliConfig';
const defaultConfig = {
  restaurantName: 'Maankuli Restaurant',
  restaurantTagline: 'Modern dining with a classic soul',
  heroTagline: 'Fine dining, simplified',
  heroHeadline: 'Maankuli Restaurant delivers an elegant QR dining experience.',
  heroText: 'Discover carefully crafted dishes, reserve a table, and place orders directly from your phone. Enjoy refined flavors without the wait.',
  heroImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
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
  ],
};

function getTableQrUrl(tableId) {
  return `${window.location.origin}${window.location.pathname}?table=${tableId}`;
}

function loadTableState() {
  const saved = localStorage.getItem('maankuliTableState');
  if (saved) {
    try {
      tableState = JSON.parse(saved);
    } catch (error) {
      tableState = {};
    }
  }

  for (let i = 1; i <= 10; i += 1) {
    if (typeof tableState[i] === 'undefined') {
      tableState[i] = false;
    }
  }
}

function saveTableState() {
  localStorage.setItem('maankuliTableState', JSON.stringify(tableState));
}

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
}

function saveAppConfig() {
  localStorage.setItem(configKey, JSON.stringify(appConfig));
}

function applySiteContent() {
  const brandTitle = document.querySelector('.brand h1');
  const brandSubtitle = document.querySelector('.brand p');
  const heroTagline = document.getElementById('heroTagline');
  const heroHeadline = document.getElementById('heroHeadline');
  const heroText = document.getElementById('heroText');
  const heroImage = document.getElementById('heroImage');
  const pageTitle = document.querySelector('title');

  if (brandTitle) {
    brandTitle.textContent = appConfig.restaurantName;
  }

  if (brandSubtitle) {
    brandSubtitle.textContent = appConfig.restaurantTagline;
  }

  if (heroTagline) {
    heroTagline.textContent = appConfig.heroTagline;
  }

  if (heroHeadline) {
    heroHeadline.textContent = appConfig.heroHeadline;
  }

  if (heroText) {
    heroText.textContent = appConfig.heroText;
  }

  if (heroImage) {
    heroImage.src = appConfig.heroImage;
  }

  if (pageTitle) {
    pageTitle.textContent = `${appConfig.restaurantName} | Modern QR Dining`;
  }
}

function renderMenu() {
  if (!menuGrid) {
    return;
  }

  menuGrid.innerHTML = menuItems
    .map(
      (item) => `
        <article class="menu-card">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
          </div>
          <span class="price">$${item.price.toFixed(2)}</span>
        </article>
      `,
    )
    .join('');
}

function renderTables() {
  if (!tableGrid) {
    return;
  }

  tableGrid.innerHTML = '';

  for (let i = 1; i <= 10; i += 1) {
    const taken = tableState[i];
    const card = document.createElement('article');
    card.className = `table-card ${taken ? 'taken' : ''}`;
    card.innerHTML = `
      <div class="table-header">
        <div>
          <span class="eyebrow">Table ${i}</span>
        </div>
        ${taken ? '<span class="taken-label">Taken</span>' : '<span class="available-label">Available</span>'}
      </div>
      <div class="table-qr-wrap">
        <canvas id="tableQr-${i}" class="table-qr"></canvas>
      </div>
      <div class="table-controls">
        <button class="button primary scan-table-button" data-table="${i}" ${taken ? 'disabled' : ''}>Scan table ${i}</button>
        <button class="button secondary release-table-button ${taken ? '' : 'hidden'}" data-table="${i}">Release</button>
      </div>
    `;
    tableGrid.appendChild(card);
  }

  for (let i = 1; i <= 10; i += 1) {
    const canvas = document.getElementById(`tableQr-${i}`);
    if (canvas) {
      canvas.width = 256;
      canvas.height = 256;
      QRCode.toCanvas(canvas, getTableQrUrl(i), {
        width: 256,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch((error) => {
        console.error('Table QR generation failed:', error);
      });
    }
  }

  document.querySelectorAll('.scan-table-button').forEach((button) => {
    button.addEventListener('click', () => {
      const tableId = Number(button.getAttribute('data-table'));
      scanTable(tableId);
    });
  });

  document.querySelectorAll('.release-table-button').forEach((button) => {
    button.addEventListener('click', () => {
      const tableId = Number(button.getAttribute('data-table'));
      releaseTable(tableId);
    });
  });
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
          <span class="price">$${item.price.toFixed(2)}</span>
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

function addToCart(itemId) {
  if (!selectedTable) {
    cartMessage.textContent = 'Please reserve a table before ordering.';
    return;
  }

  const found = cart.find((entry) => entry.id === itemId);
  if (found) {
    found.quantity += 1;
  } else {
    cart.push({ id: itemId, quantity: 1 });
  }

  cartMessage.textContent = `Added to order for table ${selectedTable}.`;
  renderCart();
}

function removeFromCart(itemId) {
  cart = cart.filter((entry) => entry.id !== itemId);
  cartMessage.textContent = 'Item removed from your order.';
  renderCart();
}

function scanTable(tableId) {
  if (tableState[tableId]) {
    tableStatus.textContent = `Table ${tableId} is already reserved. Please wait for release before scanning again.`;
    return;
  }

  tableState[tableId] = true;
  selectedTable = tableId;
  saveTableState();
  window.location.href = `order.html?table=${tableId}`;
}

function releaseTable(tableId) {
  tableState[tableId] = false;
  if (selectedTable === tableId) {
    selectedTable = null;
    cart = [];
    if (selectedTableDisplay) {
      selectedTableDisplay.textContent = 'Table not selected yet.';
    }
    if (cartMessage) {
      cartMessage.textContent = 'Released the selected table and cleared the cart.';
    }
    renderCart();
  }
  saveTableState();
  renderTables();
  tableStatus.textContent = `Table ${tableId} is now available.`;
}

function releaseAllTables() {
  for (let i = 1; i <= 10; i += 1) {
    tableState[i] = false;
  }
  selectedTable = null;
  cart = [];
  saveTableState();
  renderTables();
  renderCart();
  if (selectedTableDisplay) {
    selectedTableDisplay.textContent = 'Table not selected yet.';
  }
  if (cartMessage) {
    cartMessage.textContent = 'All tables have been released.';
  }
  tableStatus.textContent = 'All tables are available again.';
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

async function placeOrder() {
  if (!selectedTable) {
    cartMessage.textContent = 'Reserve a table before placing your order.';
    return;
  }

  if (cart.length === 0) {
    cartMessage.textContent = 'Add dishes to your order before placing it.';
    return;
  }

  const total = cart.reduce((sum, item) => {
    const menuItem = menuItems.find((menu) => menu.id === item.id);
    return sum + menuItem.price * item.quantity;
  }, 0);

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
    notes: '',
  };

  try {
    const order = await createServerOrder(payload);
    cartMessage.textContent = `Order ${order.id} confirmed for table ${selectedTable}! Chef will accept it shortly.`;
    cart = [];
    renderCart();
  } catch (error) {
    console.error(error);
    cartMessage.textContent = 'Unable to place your order right now. Please try again.';
  }
}

function getTableIdFromScan(result) {
  if (!result || typeof result !== 'string') {
    return null;
  }

  const tableMatch = result.match(/[?&]table=(\d+)/);
  if (tableMatch && tableMatch[1]) {
    return Number(tableMatch[1]);
  }

  const numericMatch = result.match(/^(\d+)$/);
  if (numericMatch && numericMatch[1]) {
    return Number(numericMatch[1]);
  }

  return null;
}

function goToOrderPage(tableId) {
  if (!tableId || Number.isNaN(tableId)) {
    return;
  }

  if (tableState[tableId]) {
    showMessage(`Table ${tableId} is already reserved. Please wait for release before scanning again.`);
    return;
  }

  selectedTable = tableId;
  tableState[tableId] = true;
  saveTableState();
  window.location.href = `order.html?table=${tableId}`;
}

function handleScanResult(result) {
  console.log('Scanned result:', result);
  if (!result) {
    showMessage('No QR code found yet. Point your camera steadily at the code.');
    return;
  }

  showMessage(`QR code scanned: ${result}`);
  stopScanner();

  const tableId = getTableIdFromScan(result);
  if (tableId >= 1 && tableId <= 10) {
    goToOrderPage(tableId);
    return;
  }

  if (result.includes('?menu=true')) {
    window.location.href = result;
    return;
  }

  alert(`Scanned QR data:\n${result}`);
}

function showMessage(message) {
  if (scannerStatus) {
    scannerStatus.textContent = message;
  }
}

function isSecureContextAvailable() {
  return window.isSecureContext || ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

const scannerFallback = document.getElementById('scannerFallback');

function showFallbackMessage(show) {
  if (scannerFallback) {
    scannerFallback.classList.toggle('hidden', !show);
  }
}

function stopScanner() {
  if (scanStream) {
    scanStream.getTracks().forEach(track => track.stop());
    scanStream = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  video.classList.add('hidden');
  scanCanvas.classList.add('hidden');
  stopScannerButton.classList.add('hidden');
  openScannerButton.classList.remove('hidden');
  showMessage('Scanner stopped.');
}

async function startScanner() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showMessage('Your browser does not support camera access.');
    showFallbackMessage(true);
    return;
  }

  if (!isSecureContextAvailable()) {
    showMessage('Camera access requires HTTPS or localhost on many mobile browsers.');
    showFallbackMessage(true);
    return;
  }

  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = scanStream;
    video.classList.remove('hidden');
    scanCanvas.classList.remove('hidden');
    stopScannerButton.classList.remove('hidden');
    openScannerButton.classList.add('hidden');
    showFallbackMessage(false);
    showMessage('Starting camera... point it at the QR code.');
    video.play();
    animationFrameId = requestAnimationFrame(tick);
  } catch (error) {
    showMessage('Camera access denied or unavailable.');
    showFallbackMessage(true);
    console.error(error);
  }
}

function tick() {
  if (!video.videoWidth || !video.videoHeight) {
    animationFrameId = requestAnimationFrame(tick);
    return;
  }

  scanCanvas.width = video.videoWidth;
  scanCanvas.height = video.videoHeight;
  canvasContext.drawImage(video, 0, 0, scanCanvas.width, scanCanvas.height);
  const imageData = canvasContext.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });

  if (code) {
    console.log('QR code detected:', code.data);
    handleScanResult(code.data);
  } else {
    showMessage('Searching for a QR code...');
    animationFrameId = requestAnimationFrame(tick);
  }
}

function revealSection(section) {
  if (!section) {
    return;
  }
  section.classList.remove('hidden');
  setTimeout(() => section.scrollIntoView({ behavior: 'smooth' }), 100);
}

if (aboutLink) {
  aboutLink.addEventListener('click', (event) => {
    event.preventDefault();
    revealSection(aboutSection);
  });
}

const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (!hash || !hash.startsWith('#')) {
      return;
    }

    const sectionId = hash.substring(1);
    const section = document.getElementById(sectionId);
    if (section) {
      event.preventDefault();
      revealSection(section);
    }
  });
});

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('customerName').value.trim();
  const table = document.getElementById('tableNumber').value.trim();
  const dish = document.getElementById('dishName').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();

  if (!name || !table || !dish) {
    alert('Please complete your name, table number, and dish selection.');
    return;
  }

  const payload = {
    table: Number(table),
    customer: name,
    items: [{ id: `manual-${Date.now()}`, name: dish, quantity: 1, price: 0 }],
    total: 0,
    notes,
  };

  try {
    const order = await createServerOrder(payload);
    orderConfirmation.classList.remove('hidden');
    orderConfirmation.querySelector('p').textContent = `Thanks ${name}! Your order ${order.id} is now with the kitchen.`;
    orderForm.reset();
  } catch (error) {
    console.error(error);
    orderConfirmation.classList.remove('hidden');
    orderConfirmation.querySelector('p').textContent = 'Unable to submit your order right now. Please try again.';
  }
});

openScannerButton.addEventListener('click', startScanner);
stopScannerButton.addEventListener('click', stopScanner);

if (releaseAllTablesButton) {
  releaseAllTablesButton.addEventListener('click', releaseAllTables);
}

if (placeOrderButton) {
  placeOrderButton.addEventListener('click', placeOrder);
}

function scrollToMenuOnQuery() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('menu') === 'true') {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      setTimeout(() => menuSection.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }
}

function scrollToSectionOnHash() {
  const hash = window.location.hash;
  if (!hash) {
    return;
  }
  const sectionId = hash.substring(1);
  const section = document.getElementById(sectionId);
  if (section) {
    revealSection(section);
  }
}

function refreshTableStatus() {
  loadTableState();
  renderTables();
}

document.addEventListener('DOMContentLoaded', () => {
  loadAppConfig();
  applySiteContent();
  renderMenu();
  loadTableState();
  renderTables();
  renderCatalog();
  renderCart();
  scrollToMenuOnQuery();
  scrollToSectionOnHash();

  const toggleQrCodesButton = document.getElementById('toggleQrCodes');
  if (toggleQrCodesButton) {
    toggleQrCodesButton.addEventListener('click', () => {
      const tablesSection = document.getElementById('tables');
      if (tablesSection.classList.contains('hidden')) {
        tablesSection.classList.remove('hidden');
        toggleQrCodesButton.textContent = 'Hide Table QR Codes';
      } else {
        tablesSection.classList.add('hidden');
        toggleQrCodesButton.textContent = 'Show Table QR Codes';
      }
    });
  }
});

window.addEventListener('pageshow', () => {
  refreshTableStatus();
});

window.addEventListener('focus', () => {
  refreshTableStatus();
});
