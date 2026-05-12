const chefGrid = document.getElementById('chefGrid');
const refreshOrdersButton = document.getElementById('refreshOrders');
const chefMessage = document.getElementById('chefMessage');

async function fetchOrders() {
  try {
    const response = await fetch('/api/orders');
    if (!response.ok) {
      throw new Error('Failed to load orders.');
    }
    const orders = await response.json();
    renderOrders(orders);
    chefMessage.textContent = `Loaded ${orders.length} order${orders.length === 1 ? '' : 's'}.`;
  } catch (error) {
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

  const statusLabel = order.status === 'New'
    ? 'New order waiting for kitchen review.'
    : order.status === 'Accepted'
      ? 'Order accepted. Ready to start cooking.'
      : order.status === 'Preparing'
        ? 'Order is being prepared.'
        : order.status === 'Ready'
          ? 'Order is ready to serve.'
          : order.status;

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
    makeButton.addEventListener('click', () => updateOrderStatus(order.id, 'Preparing'));
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
  if (order.status === 'New') {
    return '<button type="button" class="button primary accept-order">Accept order</button>';
  }

  if (order.status === 'Accepted') {
    return '<button type="button" class="button primary make-order">Start making</button>';
  }

  if (order.status === 'Preparing') {
    return '<button type="button" class="button primary ready-order">Mark ready</button>';
  }

  if (order.status === 'Ready') {
    return '<button type="button" class="button secondary complete-order">Complete order</button>';
  }

  return '<span class="scanner-status">No action available.</span>';
}

function renderOrders(orders) {
  if (!chefGrid) {
    return;
  }

  if (!orders.length) {
    chefGrid.innerHTML = '<p class="scanner-status">No placed orders have arrived yet.</p>';
    return;
  }

  chefGrid.innerHTML = '';
  orders.forEach((order) => {
    chefGrid.appendChild(createOrderCard(order));
  });
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Unable to update order status.');
    }

    chefMessage.textContent = `Order ${orderId} updated to ${status}.`;
    setTimeout(() => { chefMessage.textContent = ''; }, 2500);
    await fetchOrders();
  } catch (error) {
    chefMessage.textContent = 'Failed to update the order. Please try again.';
    console.error(error);
  }
}

refreshOrdersButton.addEventListener('click', fetchOrders);

window.addEventListener('DOMContentLoaded', () => {
  fetchOrders();
  setInterval(fetchOrders, 8000);
});
