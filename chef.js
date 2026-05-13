const chefGrid = document.getElementById('chefGrid');
const refreshOrdersButton = document.getElementById('refreshOrders');
const testModalButton = document.getElementById('testModal');
const testFetchButton = document.getElementById('testFetch');
const chefMessage = document.getElementById('chefMessage');
const estimatedTimeModal = document.getElementById('estimatedTimeModal');
const estimatedTimeInput = document.getElementById('estimatedTimeInput');
const toggleInputButton = document.getElementById('toggleInputButton');
const inputGroup = document.getElementById('inputGroup');
const confirmTimeButton = document.getElementById('confirmTimeButton');
const cancelTimeButton = document.getElementById('cancelTimeButton');

console.log('Elements found:', {
  chefGrid: !!chefGrid,
  refreshOrdersButton: !!refreshOrdersButton,
  testModalButton: !!testModalButton,
  testFetchButton: !!testFetchButton,
  chefMessage: !!chefMessage,
  estimatedTimeModal: !!estimatedTimeModal,
  estimatedTimeInput: !!estimatedTimeInput,
  toggleInputButton: !!toggleInputButton,
  inputGroup: !!inputGroup,
  confirmTimeButton: !!confirmTimeButton,
  cancelTimeButton: !!cancelTimeButton
});

let menuItems = [];
let pendingOrderId = null;

function loadMenuItems() {
  const saved = localStorage.getItem('maankuliConfig');
  if (saved) {
    try {
      const config = JSON.parse(saved);
      menuItems = config.menuItems || [];
    } catch (error) {
      menuItems = [];
    }
  }
}

async function fetchOrders() {
  try {
    console.log('Fetching orders...');
    const response = await fetch('/api/orders');
    console.log('Fetch response status:', response.status);
    if (!response.ok) {
      throw new Error('Failed to load orders.');
    }
    const orders = await response.json();
    console.log('Fetched orders:', orders);
    renderOrders(orders);
    chefMessage.textContent = `Loaded ${orders.length} order${orders.length === 1 ? '' : 's'}.`;
  } catch (error) {
    console.error('Error fetching orders:', error);
    chefGrid.innerHTML = '<p class="scanner-status">Unable to fetch orders from the chef server.</p>';
    chefMessage.textContent = 'Chef dashboard cannot load orders right now.';
    console.error(error);
  }
}

function createOrderCard(order) {
  const card = document.createElement('article');
  card.className = 'order-card';

  const itemRows = order.items
    .map(
      (item) => `
        <div class="order-item">
          <span>${item.name}</span>
          <strong>${item.quantity} × $${item.price.toFixed(2)}</strong>
        </div>
      `,
    )
    .join('');

  let statusLabel = order.status === 'New'
    ? 'New order waiting for kitchen review.'
    : order.status === 'Accepted'
      ? 'Order accepted. Ready to start cooking.'
      : order.status === 'Preparing'
        ? 'Order is being prepared.'
        : order.status === 'Ready'
          ? 'Order is ready to serve.'
          : order.status;

  // Show chef-provided or menu-based preparation time
  let timeInfo = '';
  if (order.status === 'Preparing') {
    if (order.estimatedTime) {
      timeInfo = `Chef estimated time: ${order.estimatedTime} minutes`;
    } else {
      const times = order.items.map(item => {
        const menuItem = menuItems.find(m => m.name === item.name);
        return menuItem ? menuItem.estimatedTime : 0;
      }).filter(t => t > 0);
      if (times.length > 0) {
        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        timeInfo = `Estimated total time: ${Math.round(averageTime)} minutes`;
      }
    }
  }

  card.innerHTML = `
    <div class="order-card-header">
      <div>
        <strong>Order ${order.id}</strong>
        <span class="eyebrow">Table ${order.table} · ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <span class="available-label">${order.status}</span>
    </div>
    <p>${order.customer || `Table ${order.table}`}</p>
    <div class="order-items">${itemRows}</div>
    <div class="order-summary">
      <span>Total</span>
      <strong>$${order.total.toFixed(2)}</strong>
    </div>
    <p class="scanner-status">${statusLabel}</p>
    ${timeInfo ? `<p class="scanner-status">${timeInfo}</p>` : ''}
    <div class="admin-grid">
      ${renderActionButtons(order)}
    </div>
  `;

  const acceptButton = card.querySelector('.accept-order');
  const makeButton = card.querySelector('.make-order');
  const readyButton = card.querySelector('.ready-order');
  const completeButton = card.querySelector('.complete-order');

  if (acceptButton) {
    acceptButton.addEventListener('click', () => updateOrderStatus(order.id, 'Accepted'));
  }
  if (makeButton) {
    makeButton.addEventListener('click', () => showEstimatedTimeModal(order.id));
  }
  if (readyButton) {
    readyButton.addEventListener('click', () => updateOrderStatus(order.id, 'Ready'));
  }
  if (completeButton) {
    completeButton.addEventListener('click', () => updateOrderStatus(order.id, 'Completed'));
  }

  return card;
}

function renderActionButtons(order) {
  console.log('Rendering action buttons for order:', order.id, 'status:', order.status);
  if (order.status === 'New') {
    console.log('Creating Accept order button');
    return '<button type="button" class="button primary accept-order">Accept order</button>';
  }

  if (order.status === 'Accepted') {
    console.log('Creating Start making button');
    return '<button type="button" class="button primary make-order">Start making</button>';
  }

  if (order.status === 'Preparing') {
    console.log('Creating Mark ready button');
    return '<button type="button" class="button primary ready-order">Mark ready</button>';
  }

  if (order.status === 'Ready') {
    console.log('Creating Complete order button');
    return '<button type="button" class="button secondary complete-order">Complete order</button>';
  }

  console.log('No action available for status:', order.status);
  return '<span class="scanner-status">No action available.</span>';
}

function renderOrders(orders) {
  console.log('Rendering orders:', orders);
  if (!chefGrid) {
    console.log('chefGrid element not found');
    return;
  }

  if (!orders.length) {
    console.log('No orders to render');
    chefGrid.innerHTML = '<p class="scanner-status">No placed orders have arrived yet.</p>';
    return;
  }

  chefGrid.innerHTML = '';
  orders.forEach((order) => {
    console.log('Creating card for order:', order.id, 'status:', order.status);
    chefGrid.appendChild(createOrderCard(order));
  });
}

function showEstimatedTimeModal(orderId) {
  console.log('showEstimatedTimeModal called with orderId:', orderId);
  pendingOrderId = orderId;
  console.log('pendingOrderId set to:', pendingOrderId);
  estimatedTimeInput.value = '';
  inputGroup.style.display = 'block'; // Ensure input is visible when modal opens
  toggleInputButton.textContent = '👁'; // Reset to show icon
  estimatedTimeModal.style.display = 'flex';
  console.log('Modal displayed');
  // Focus the input after a short delay to ensure the modal is visible
  setTimeout(() => {
    estimatedTimeInput.focus();
  }, 100);
}

function hideEstimatedTimeModal() {
  console.log('hideEstimatedTimeModal called');
  estimatedTimeModal.style.display = 'none';
  pendingOrderId = null;
  estimatedTimeInput.value = '';
  console.log('Modal hidden and pendingOrderId cleared');
}

async function updateOrderStatus(orderId, status, estimatedTime = null) {
  console.log('=== UPDATE ORDER STATUS START ===');
  console.log('Parameters:', { orderId, status, estimatedTime });
  
  try {
    const body = { status };
    if (estimatedTime !== null) {
      body.estimatedTime = estimatedTime;
    }
    
    console.log('Request URL:', `/api/orders/${orderId}`);
    console.log('Request body:', JSON.stringify(body));
    
    console.log('MAKING FETCH REQUEST...');
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('FETCH RESPONSE RECEIVED');
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('ERROR RESPONSE TEXT:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('SUCCESS RESPONSE:', result);
    
    chefMessage.textContent = `Order ${orderId} updated to ${status}.`;
    setTimeout(() => { chefMessage.textContent = ''; }, 2500);
    
    console.log('CALLING FETCH ORDERS...');
    await fetchOrders();
    console.log('FETCH ORDERS COMPLETED');
  } catch (error) {
    console.error('=== UPDATE ORDER STATUS ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    chefMessage.textContent = `Failed to update the order: ${error.message}`;
  }
}

confirmTimeButton.addEventListener('click', async (event) => {
  console.log('=== CONFIRM TIME BUTTON CLICKED ===');
  console.log('Event:', event);
  console.log('pendingOrderId:', pendingOrderId);
  console.log('estimatedTimeInput.value:', estimatedTimeInput.value);
  
  const estimatedTime = parseInt(estimatedTimeInput.value, 10);
  console.log('Parsed estimatedTime:', estimatedTime);
  
  if (!estimatedTime || estimatedTime < 1 || estimatedTime > 180) {
    console.log('INVALID TIME - showing error');
    chefMessage.textContent = 'Please enter a valid time between 1 and 180 minutes.';
    return;
  }
  
  if (!pendingOrderId) {
    console.error('NO PENDING ORDER ID!');
    chefMessage.textContent = 'Error: No order selected.';
    return;
  }
  
  console.log('VALID INPUT - hiding modal');
  hideEstimatedTimeModal();
  
  console.log('MODAL HIDDEN - calling updateOrderStatus');
  try {
    await updateOrderStatus(pendingOrderId, 'Preparing', estimatedTime);
    console.log('UPDATE ORDER STATUS COMPLETED');
  } catch (error) {
    console.error('UPDATE ORDER STATUS FAILED:', error);
  }
});

cancelTimeButton.addEventListener('click', hideEstimatedTimeModal);

toggleInputButton.addEventListener('click', () => {
  if (inputGroup.style.display === 'none') {
    inputGroup.style.display = 'block';
    toggleInputButton.textContent = '👁';
  } else {
    inputGroup.style.display = 'none';
    toggleInputButton.textContent = '🙈';
  }
});

estimatedTimeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    confirmTimeButton.click();
  }
});

// Close modal when clicking outside of it
estimatedTimeModal.addEventListener('click', (e) => {
  if (e.target === estimatedTimeModal) {
    hideEstimatedTimeModal();
  }
});

refreshOrdersButton.addEventListener('click', fetchOrders);

testModalButton.addEventListener('click', () => {
  showEstimatedTimeModal('TEST-ORDER');
});

testFetchButton.addEventListener('click', async () => {
  console.log('Test fetch button clicked');
  try {
    const response = await fetch('/api/orders');
    console.log('Test fetch response:', response.status);
    const data = await response.json();
    console.log('Test fetch data:', data);
    chefMessage.textContent = 'Fetch test successful';
  } catch (error) {
    console.error('Test fetch error:', error);
    chefMessage.textContent = 'Fetch test failed: ' + error.message;
  }
});

window.addEventListener('DOMContentLoaded', () => {
  loadMenuItems();
  fetchOrders();
  setInterval(fetchOrders, 8000);
});
