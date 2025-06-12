const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let products = [
  { id: 1, name: 'สินค้า A', barcode: '1234567890', price: 100, stock: 10 },
  { id: 2, name: 'สินค้า B', barcode: '2345678901', price: 200, stock: 20 },
  { id: 3, name: 'สินค้า C', barcode: '3456789012', price: 300, stock: 15 },
  { id: 4, name: 'สินค้า Test', barcode: '6291003085116', price: 50, stock: 8 },
];

let sales = [];
let stockMovements = [];

// Routes
app.get('/api/products', (req, res) => {
  res.json({ products }); // ✅ ให้ส่งออกเป็น { products: [...] }
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    ...req.body,
    stock: 0
  };
  products.push(newProduct);
  res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  products = products.filter(p => p.id !== id);
  res.json({ message: 'Product deleted' });
});

app.post('/api/stock/movement', (req, res) => {
  const { productId, quantity, type, note } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const movement = {
    id: stockMovements.length + 1,
    productId,
    quantity,
    type,
    note,
    timestamp: new Date()
  };

  if (type === 'in') {
    product.stock += quantity;
  } else if (type === 'out') {
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    product.stock -= quantity;
  }

  stockMovements.push(movement);
  res.json(movement);
});

app.get('/api/stock/movements', (req, res) => {
  const movements = stockMovements.map(movement => ({
    ...movement,
    product: products.find(p => p.id === movement.productId)
  }));
  res.json(movements);
});

app.post('/api/sales', (req, res) => {
  const { items, discount, paymentMethod } = req.body;
  const sale = {
    id: sales.length + 1,
    items,
    discount: discount || 0,
    paymentMethod,
    timestamp: new Date(),
    total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - (discount || 0)
  };

  // Update stock
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
      stockMovements.push({
        id: stockMovements.length + 1,
        productId: item.productId,
        quantity: item.quantity,
        type: 'out',
        note: `Sold in sale #${sale.id}`,
        timestamp: new Date()
      });
    }
  });

  sales.push(sale);
  res.json(sale);
});

app.get('/api/sales', (req, res) => {
  const { startDate, endDate } = req.query;
  let filteredSales = sales;

  if (startDate && endDate) {
    filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });
  }

  const salesWithDetails = filteredSales.map(sale => ({
    ...sale,
    items: sale.items.map(item => ({
      ...item,
      product: products.find(p => p.id === item.productId)
    }))
  }));

  res.json(salesWithDetails);
});

app.get('/api/dashboard/summary', (req, res) => {
  const { startDate, endDate } = req.query;
  let filteredSales = sales;

  if (startDate && endDate) {
    filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });
  }

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Top selling products
  const productSales = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = 0;
      }
      productSales[item.productId] += item.quantity;
    });
  });

  const topSellingProducts = Object.entries(productSales)
    .map(([productId, quantity]) => ({
      product: products.find(p => p.id === parseInt(productId)),
      quantity
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Low stock products
  const lowStockProducts = products
    .filter(p => p.stock < 10)
    .sort((a, b) => a.stock - b.stock);

  res.json({
    totalSales,
    totalTransactions,
    averageTransaction,
    topSellingProducts,
    lowStockProducts
  });
});

app.post('/api/products/scan', (req, res) => {
  const { barcode } = req.body;
  const product = products.find(p => p.barcode === barcode);
  if (product) {
    res.json(product); // แค่คืนข้อมูลสินค้า ไม่เพิ่ม stock
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 