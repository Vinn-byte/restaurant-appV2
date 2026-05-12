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
    tableStatus.textContent = `Table ${tableId} is already taken.`;
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

function placeOrder() {
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

  cartMessage.textContent = `Order placed for table ${selectedTable}! Total: $${total.toFixed(2)}.`;
  cart = [];
  renderCart();
}

function handleScanResult(result) {
  console.log('Scanned result:', result);
  if (!result) {
    showMessage('No QR code found yet. Point your camera steadily at the code.');
    return;
  }

  showMessage(`QR code scanned: ${result}`);
  stopScanner();

  if (result.includes('?table=')) {
    const url = new URL(result, window.location.origin);
    const tableParam = url.searchParams.get('table');
    const tableId = Number(tableParam);
    if (tableId >= 1 && tableId <= 10) {
      scanTable(tableId);
      return;
    }
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

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('customerName').value.trim();
  const table = document.getElementById('tableNumber').value.trim();
  const dish = document.getElementById('dishName').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();

  if (!name || !table || !dish) {
    alert('Please complete your name, table number, and dish selection.');
    return;
  }

  const orderSummary = `Thanks ${name}!\nTable: ${table}\nDish: ${dish}${notes ? `\nNotes: ${notes}` : ''}`;
  orderConfirmation.classList.remove('hidden');
  orderConfirmation.querySelector('p').textContent = orderSummary;
  orderForm.reset();
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

document.addEventListener('DOMContentLoaded', () => {
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
