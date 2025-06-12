const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// Mock data (in-memory)
let barcodes = [
  { id: 1, code: '1234567890', scannedAt: new Date().toISOString() },
  { id: 2, code: '0987654321', scannedAt: new Date().toISOString() }
];

// Inventory Management mock data
let products = [
  {
    id: 1,
    name: "น้ำดื่ม",
    barcode: "6291003085116",
    category: "เครื่องดื่ม",
    price: 10,
    unit: "ขวด",
    stock: 100,
    imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2F0ZXIlMjBib3R0bGV8ZW58MHx8MHx8fDA%3D"
  }
];
let stockMovements = [];

let users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "employee", password: "emp123", role: "employee" }
];

// เพิ่ม mock data สำหรับสมาชิก
let members = [
  {
    id: 1,
    name: "สมชาย ใจดี",
    phone: "0812345678",
    points: 100,
    memberType: "silver",
    discount: 5, // 5%
    createdAt: new Date().toISOString()
  }
];

// เพิ่ม mock data สำหรับประวัติการซื้อของสมาชิก
let memberTransactions = [];

// เพิ่ม mock data สำหรับยอดขายรายวัน
let dailySales = [
  { date: '2024-03-01', total: 15000 },
  { date: '2024-03-02', total: 18000 },
  { date: '2024-03-03', total: 22000 },
  { date: '2024-03-04', total: 19000 },
  { date: '2024-03-05', total: 25000 },
  { date: '2024-03-06', total: 21000 },
  { date: '2024-03-07', total: 23000 }
];

// Mock data (in-memory)
let sales = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Barcode Scanner Backend' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Inventory Management APIs
// Get all products
app.get('/api/products', (req, res) => {
  res.json({ success: true, products });
});
// Add new product
app.post('/api/products', (req, res) => {
  const { name, barcode, category, price, unit, stock } = req.body;
  if (!name || !barcode || !category || !price || !unit || stock === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    name, barcode, category, price, unit, stock
  };
  products.push(newProduct);
  stockMovements.push({
    id: stockMovements.length + 1,
    productId: newProduct.id,
    type: 'add',
    amount: stock,
    date: new Date().toISOString(),
    note: 'เพิ่มสินค้าใหม่'
  });
  res.json({ success: true, product: newProduct });
});
// Delete product
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  products.splice(idx, 1);
  res.json({ success: true });
});
// Update product
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const { name, barcode, category, price, unit, stock } = req.body;
  if (name) product.name = name;
  if (barcode) product.barcode = barcode;
  if (category) product.category = category;
  if (price !== undefined) product.price = price;
  if (unit) product.unit = unit;
  if (stock !== undefined) product.stock = stock;
  res.json({ success: true, product });
});
// Adjust stock (sale/receive)
app.post('/api/products/:id/stock', (req, res) => {
  const id = parseInt(req.params.id);
  const { type, amount, note } = req.body; // type: 'sale' | 'receive'
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (!['sale', 'receive'].includes(type) || typeof amount !== 'number') {
    return res.status(400).json({ success: false, message: 'Invalid type or amount' });
  }
  if (type === 'sale') {
    if (product.stock < amount) return res.status(400).json({ success: false, message: 'Stock not enough' });
    product.stock -= amount;
  } else if (type === 'receive') {
    product.stock += amount;
  }
  stockMovements.push({
    id: stockMovements.length + 1,
    productId: id,
    type,
    amount,
    date: new Date().toISOString(),
    note: note || (type === 'sale' ? 'ขายสินค้า' : 'รับสินค้าเข้า')
  });
  res.json({ success: true, product });
});
// Get stock movement log
app.get('/api/stock-movements', (req, res) => {
  res.json({ success: true, stockMovements });
});

// Get all barcodes (mock)
app.get('/api/barcodes', (req, res) => {
  res.json({ success: true, barcodes });
});
// Add a new barcode (mock)
app.post('/api/barcode', (req, res) => {
  const { barcode } = req.body;
  if (!barcode) {
    return res.status(400).json({ success: false, message: 'Barcode is required' });
  }
  const newBarcode = {
    id: barcodes.length + 1,
    code: barcode,
    scannedAt: new Date().toISOString()
  };
  barcodes.push(newBarcode);
  res.json({ success: true, barcode: newBarcode, allBarcodes: barcodes });
});

// Scan product: add 1 stock (or create if not exist)
app.post('/api/products/scan-in', (req, res) => {
  const { barcode } = req.body;
  if (!barcode) {
    return res.status(400).json({ success: false, message: 'Barcode is required' });
  }
  let product = products.find(p => p.barcode === barcode);
  if (product) {
    product.stock += 1;
    stockMovements.push({
      id: stockMovements.length + 1,
      productId: product.id,
      type: 'receive',
      amount: 1,
      date: new Date().toISOString(),
      note: 'เพิ่มสต็อกจากการสแกน'
    });
    return res.json({ success: true, product, message: 'เพิ่มสต็อกสำเร็จ' });
  } else {
    // สร้างสินค้าใหม่ (ข้อมูลอื่น default)
    const newProduct = {
      id: products.length ? products[products.length - 1].id + 1 : 1,
      name: '',
      barcode,
      category: '',
      price: 0,
      unit: '',
      stock: 1
    };
    products.push(newProduct);
    stockMovements.push({
      id: stockMovements.length + 1,
      productId: newProduct.id,
      type: 'add',
      amount: 1,
      date: new Date().toISOString(),
      note: 'สร้างสินค้าใหม่จากการสแกน'
    });
    return res.json({ success: true, product: newProduct, message: 'สร้างสินค้าใหม่และเพิ่มสต็อกสำเร็จ' });
  }
});

// สำหรับ "เช็คสินค้า" ไม่เพิ่ม stock
app.post('/api/products/scan', (req, res) => {
  const { barcode } = req.body;
  if (!barcode) {
    return res.status(400).json({ success: false, message: 'Barcode is required' });
  }
  const product = products.find(p => p.barcode === barcode);
  if (product) {
    return res.json({ success: true, product, message: 'พบสินค้า' });
  } else {
    return res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });
  }
});

// ค้นหาสินค้าด้วย barcode (ไม่เพิ่ม stock)
app.post('/api/products/find', (req, res) => {
  const { barcode } = req.body;
  if (!barcode) {
    return res.status(400).json({ success: false, message: 'Barcode is required' });
  }
  const product = products.find(p => p.barcode === barcode);
  if (product) {
    return res.json({ success: true, product });
  } else {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
});

// อัปเดตสต็อกหลายรายการ (ขายของ)
app.post('/api/products/update-stock', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Invalid items' });
  }
  for (const { id, quantity } of items) {
    const product = products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product id ${id} not found` });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Stock not enough for product id ${id}` });
    }
    product.stock -= quantity;
    stockMovements.push({
      id: stockMovements.length + 1,
      productId: id,
      type: 'sale',
      amount: quantity,
      date: new Date().toISOString(),
      note: 'ขายสินค้า (POS)'
    });
  }
  res.json({ success: true });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }
  // สมมติใช้ username เป็น token (จริงควรใช้ JWT)
  res.json({
    success: true,
    token: `Bearer ${user.username}`,
    user: { id: user.id, username: user.username, role: user.role }
  });
});

// Dashboard summary endpoint
app.get('/api/dashboard/summary', (req, res) => {
  const { range = 'today' } = req.query;
  
  // กรองข้อมูลตามช่วงเวลา
  let filteredSales = sales;
  const now = new Date();
  if (range === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    filteredSales = sales.filter(s => new Date(s.timestamp) >= today);
  } else if (range === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredSales = sales.filter(s => new Date(s.timestamp) >= weekAgo);
  } else if (range === 'month') {
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    filteredSales = sales.filter(s => new Date(s.timestamp) >= monthAgo);
  } else if (range === 'year') {
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    filteredSales = sales.filter(s => new Date(s.timestamp) >= yearAgo);
  }

  // คำนวณยอดขายรวม
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalTransactions = filteredSales.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // สินค้าขายดี
  const productSales = {};
  filteredSales.forEach(sale => {
    (sale.items || []).forEach(item => {
      if (!productSales[item.id]) productSales[item.id] = 0;
      productSales[item.id] += item.quantity;
    });
  });
  const topSellingProducts = Object.entries(productSales)
    .map(([productId, quantity]) => ({
      product: products.find(p => p.id === parseInt(productId)),
      quantity
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // สินค้าใกล้หมด
  const lowStockProducts = products
    .filter(p => p.stock < 10)
    .sort((a, b) => a.stock - b.stock);

  // ยอดขายรายวัน
  const salesByDate = {};
  filteredSales.forEach(sale => {
    const date = new Date(sale.timestamp).toISOString().split('T')[0];
    if (!salesByDate[date]) salesByDate[date] = 0;
    salesByDate[date] += sale.total;
  });
  const dailySalesData = Object.entries(salesByDate)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    totalSales,
    totalTransactions,
    averageTransaction,
    topSellingProducts,
    lowStockProducts,
    dailySales: dailySalesData
  });
});

// API สำหรับรายงานยอดขายตามช่วงเวลา
app.get('/api/reports/sales', (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุช่วงเวลา' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const filteredSales = sales.filter(s => {
    const saleDate = new Date(s.timestamp);
    return saleDate >= start && saleDate <= end;
  });

  // สรุปยอดขาย
  const summary = {
    totalSales: filteredSales.reduce((sum, s) => sum + s.total, 0),
    totalTransactions: filteredSales.length,
    averageTransaction: filteredSales.length > 0 
      ? filteredSales.reduce((sum, s) => sum + s.total, 0) / filteredSales.length 
      : 0,
    salesByPaymentMethod: filteredSales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'cash';
      if (!acc[method]) acc[method] = 0;
      acc[method] += sale.total;
      return acc;
    }, {}),
    salesByMember: filteredSales.reduce((acc, sale) => {
      const isMember = sale.memberId ? 'member' : 'non-member';
      if (!acc[isMember]) acc[isMember] = 0;
      acc[isMember] += sale.total;
      return acc;
    }, {})
  };

  res.json({ success: true, summary, sales: filteredSales });
});

// API สำหรับรายงานสินค้า
app.get('/api/reports/products', (req, res) => {
  const { type = 'all' } = req.query;
  
  let reportData = [];
  if (type === 'low-stock') {
    reportData = products.filter(p => p.stock < 10);
  } else if (type === 'top-selling') {
    const productSales = {};
    sales.forEach(sale => {
      (sale.items || []).forEach(item => {
        if (!productSales[item.id]) productSales[item.id] = 0;
        productSales[item.id] += item.quantity;
      });
    });
    reportData = Object.entries(productSales)
      .map(([productId, quantity]) => ({
        ...products.find(p => p.id === parseInt(productId)),
        totalSold: quantity
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);
  } else {
    reportData = products;
  }

  res.json({ success: true, products: reportData });
});

// API สำหรับสมาชิก
app.get('/api/members', (req, res) => {
  res.json({ success: true, members });
});

app.post('/api/members', (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' });
  }
  const newMember = {
    id: members.length ? members[members.length - 1].id + 1 : 1,
    name,
    phone,
    points: 0,
    memberType: "silver",
    discount: 5,
    createdAt: new Date().toISOString()
  };
  members.push(newMember);
  res.json({ success: true, member: newMember });
});

app.get('/api/members/:id/transactions', (req, res) => {
  const memberId = parseInt(req.params.id);
  const transactions = memberTransactions.filter(t => t.memberId === memberId);
  res.json({ success: true, transactions });
});

// แก้ไข API sales เพื่อรองรับสมาชิก
app.post('/api/sales', (req, res) => {
  const { items, total, paymentMethod, paymentDetails, memberId, timestamp } = req.body;
  
  // คำนวณส่วนลดสมาชิก
  let finalTotal = total;
  let memberDiscount = 0;
  let pointsEarned = 0;
  
  if (memberId) {
    const member = members.find(m => m.id === memberId);
    if (member) {
      memberDiscount = (total * member.discount) / 100;
      finalTotal = total - memberDiscount;
      pointsEarned = Math.floor(finalTotal / 100); // 1 คะแนนต่อ 100 บาท
      
      // อัปเดตคะแนนสมาชิก
      member.points += pointsEarned;
      
      // บันทึกประวัติการซื้อ
      memberTransactions.push({
        id: memberTransactions.length + 1,
        memberId,
        items,
        total: finalTotal,
        discount: memberDiscount,
        pointsEarned,
        timestamp: timestamp || new Date().toISOString()
      });
    }
  }

  // บันทึกการขาย
  const sale = {
    id: sales.length + 1,
    items,
    total: finalTotal,
    memberDiscount,
    pointsEarned,
    paymentMethod,
    paymentDetails,
    memberId,
    timestamp: timestamp || new Date().toISOString()
  };
  sales.push(sale);
  
  res.json({ 
    success: true, 
    sale,
    memberDiscount,
    pointsEarned
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server running on port ${port}`);
}); 