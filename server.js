const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ORDERS_FILE = path.join(__dirname, 'orders.json');

let orders = [];

function loadOrdersFile() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    orders = JSON.parse(raw || '[]');
  } catch (error) {
    console.error('Failed to load orders file:', error);
    orders = [];
  }
}

function saveOrdersFile() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save orders file:', error);
  }
}

function generateOrderId() {
  return `ORD-${Date.now()}`;
}

// Function to automatically complete orders based on estimated time
function checkAndCompleteOrders() {
  const now = new Date();
  let hasChanges = false;

  orders.forEach(order => {
    if (order.status === 'Preparing' && order.estimatedTime && order.statusChangedAt) {
      const statusChangedTime = new Date(order.statusChangedAt);
      const elapsedMinutes = (now - statusChangedTime) / (1000 * 60);

      if (elapsedMinutes >= order.estimatedTime) {
        order.status = 'Ready';
        hasChanges = true;
        console.log(`Order ${order.id} automatically marked as Ready after ${order.estimatedTime} minutes`);
      }
    }
  });

  if (hasChanges) {
    saveOrdersFile();
  }
}

app.use(express.json());

// QR Code scan endpoint - handles external scanner app redirects
app.get('/scan', (req, res) => {
  const table = req.query.table;
  
  if (table && /^\d+$/.test(table)) {
    console.log(`QR scan detected for table: ${table}`);
    // Redirect to the scan.html landing page which handles the redirect
    res.redirect(`/scan.html?table=${table}`);
  } else {
    console.log('Invalid QR scan - no valid table parameter');
    res.redirect('/');
  }
});

app.use(express.static(path.join(__dirname)));

app.get('/api/orders', (req, res) => {
  res.json(orders.slice().reverse());
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const { table, items, total, notes, customer } = req.body;

  if (!table || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include a table number and at least one item.' });
  }

  const order = {
    id: generateOrderId(),
    table,
    customer: customer || `Table ${table}`,
    items,
    total: Number(total) || 0,
    notes: notes || '',
    status: 'New',
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  saveOrdersFile();
  res.status(201).json(order);
});

app.patch('/api/orders/:id', (req, res) => {
  console.log(`PATCH /api/orders/${req.params.id} received`);
  console.log('Request body:', req.body);
  
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    console.log('Order not found');
    return res.status(404).json({ error: 'Order not found.' });
  }

  console.log('Found order:', order.id, 'current status:', order.status);
  
  const { status, notes, table, customer, estimatedTime } = req.body;
  if (status) {
    console.log('Updating status to:', status);
    order.status = status;
    // Record when status changes to 'Preparing' for automatic completion
    if (status === 'Preparing') {
      order.statusChangedAt = new Date().toISOString();
    }
  }
  if (typeof notes === 'string') {
    order.notes = notes;
  }
  if (table) {
    order.table = table;
  }
  if (customer) {
    order.customer = customer;
  }
  if (typeof estimatedTime === 'number') {
    console.log('Setting estimatedTime to:', estimatedTime);
    order.estimatedTime = estimatedTime;
  }

  saveOrdersFile();
  console.log('Order updated successfully:', order);
  res.json(order);
});

app.delete('/api/orders/:id', (req, res) => {
  const orderIndex = orders.findIndex((item) => item.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  orders.splice(orderIndex, 1);
  saveOrdersFile();
  res.status(204).end();
});

app.delete('/api/orders', (req, res) => {
  orders = [];
  saveOrdersFile();
  res.status(204).end();
});

loadOrdersFile();

// Start automatic order completion check every minute
setInterval(checkAndCompleteOrders, 60 * 1000);

app.listen(PORT, () => {
  console.log(`Chef server started on http://localhost:${PORT}`);
});
