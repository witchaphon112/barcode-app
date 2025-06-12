import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    fetchSummary();
  }, [dateRange]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/dashboard/summary?range=${dateRange}`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      setSummary(data);
      setError('');
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>กำลังโหลด...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!summary) return null;

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>แดชบอร์ด</h1>
        <select 
          value={dateRange} 
          onChange={e => setDateRange(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: 4 }}
        >
          <option value="today">วันนี้</option>
          <option value="week">สัปดาห์นี้</option>
          <option value="month">เดือนนี้</option>
          <option value="year">ปีนี้</option>
        </select>
      </div>

      {/* สรุปยอดขาย */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        <div style={cardStyle}>
          <h3>ยอดขายรวม</h3>
          <div style={valueStyle}>{summary.totalSales.toLocaleString()} บาท</div>
        </div>
        <div style={cardStyle}>
          <h3>จำนวนรายการขาย</h3>
          <div style={valueStyle}>{summary.totalTransactions} รายการ</div>
        </div>
        <div style={cardStyle}>
          <h3>ยอดขายเฉลี่ยต่อรายการ</h3>
          <div style={valueStyle}>{summary.averageTransaction.toLocaleString()} บาท</div>
        </div>
      </div>

      {/* กราฟยอดขายรายวัน */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <h3>ยอดขายรายวัน</h3>
        <LineChart
          width={800}
          height={300}
          data={summary.dailySales}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#8884d8" name="ยอดขาย" />
        </LineChart>
      </div>

      {/* สินค้าขายดี */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <h3>สินค้าขายดี</h3>
        <BarChart
          width={800}
          height={300}
          data={summary.topSellingProducts}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product.name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="quantity" fill="#82ca9d" name="จำนวนที่ขาย" />
        </BarChart>
      </div>

      {/* สินค้าใกล้หมด */}
      <div style={{ ...cardStyle }}>
        <h3>สินค้าใกล้หมด</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {summary.lowStockProducts.map(product => (
            <div key={product.id} style={productCardStyle}>
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                />
              )}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600 }}>{product.name}</div>
                <div style={{ color: product.stock < 5 ? '#f44336' : '#ff9800' }}>
                  คงเหลือ: {product.stock} ชิ้น
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  borderRadius: 8,
  padding: 24,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const valueStyle = {
  fontSize: 24,
  fontWeight: 700,
  color: '#1976d2',
  marginTop: 8
};

const productCardStyle = {
  background: '#f5f5f5',
  borderRadius: 8,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

export default Dashboard; 