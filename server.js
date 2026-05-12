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

app.use(express.json());
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
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const { status, notes, table, customer } = req.body;
  if (status) {
    order.status = status;
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

  saveOrdersFile();
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
app.listen(PORT, () => {
  console.log(`Chef server started on http://localhost:${PORT}`);
});
