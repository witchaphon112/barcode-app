import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#d32f2f', '#1976d2'];

function fakeDateTH(date) {
  return date.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ReportOverview() {
  const [summaryMonth, setSummaryMonth] = useState(null);
  const [summaryToday, setSummaryToday] = useState(null);
  const [summary7Days, setSummary7Days] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // mock data for demo
  const [systemInfo] = useState({
    registered: '08/05/2562',
    expired: '27/11/2568',
    daysLeft: 182
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/dashboard/summary?range=month`).then(res => res.json()),
      fetch(`${API_URL}/api/dashboard/summary?range=today`).then(res => res.json()),
      fetch(`${API_URL}/api/dashboard/summary?range=week`).then(res => res.json()),
    ])
      .then(([month, today, week]) => {
        setSummaryMonth(month);
        setSummaryToday(today);
        setSummary7Days(week);
        setLoading(false);
      })
      .catch(() => { setError('โหลดข้อมูลไม่สำเร็จ'); setLoading(false); });
  }, []);

  // pie chart
  const pieData = [
    { name: 'รายรับ', value: summaryMonth?.totalSales || 0, color: '#1976d2' },
    { name: 'รายจ่าย', value: 45789, color: '#e53935' }
  ];

  if (loading) return <div>กำลังโหลด...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!summaryMonth || !summaryToday || !summary7Days) return null;

  const todayDate = new Date();
  const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      {/* Top summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 32 }}>
        <SummaryCard color="#1976d2" icon="$" label="รายรับ" value={(summaryMonth?.totalSales || 0).toLocaleString()} />
        <SummaryCard color="#e53935" icon={<span style={{fontWeight:700}}>🛒</span>} label="รายจ่าย" value={45789.00.toLocaleString()} />
        <SummaryCard color="#43a047" icon={<span style={{fontWeight:700}}>💵</span>} label="กำไร/ขาดทุน" value={((summaryMonth?.totalSales || 0)-45789).toLocaleString()} />
        <SummaryCard color="#0288d1" icon={<span style={{fontWeight:700}}>📈</span>} label="จำนวนการขาย" value={summaryMonth?.totalTransactions || 0} />
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Main left */}
        <div style={{ flex: 2, minWidth: 400 }}>
          {/* ยอดขายวันนี้ */}
          <SectionTitle>ยอดขายวันนี้</SectionTitle>
          <div style={{ color: '#888', marginBottom: 8 }}>{fakeDateTH(todayDate)}</div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
            <MiniCard icon="$" label="รายได้" value={(summaryToday?.totalSales || 0).toLocaleString()} color="#1976d2" />
            <MiniCard icon={<span style={{fontWeight:700}}>🛒</span>} label="จำนวนครั้งขาย" value={summaryToday?.totalTransactions || 0} color="#43a047" />
            <MiniCard icon={<span style={{fontWeight:700}}>📦</span>} label="จำนวนรายการที่ขาย" value={summaryToday?.topSellingProducts?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0} color="#ffb300" />
          </div>

          {/* ยอดขาย 7 วันย้อนหลัง */}
          <SectionTitle>ยอดขาย 7 วันย้อนหลัง</SectionTitle>
          <div style={{ color: '#888', marginBottom: 8 }}>{fakeDateTH(last7)} - {fakeDateTH(todayDate)}</div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
            <MiniCard icon="$" label="รายได้" value={(summary7Days?.totalSales || 0).toLocaleString()} color="#1976d2" />
            <MiniCard icon={<span style={{fontWeight:700}}>🛒</span>} label="จำนวนครั้งขาย" value={summary7Days?.totalTransactions || 0} color="#43a047" />
            <MiniCard icon={<span style={{fontWeight:700}}>📦</span>} label="จำนวนรายการที่ขาย" value={summary7Days?.topSellingProducts?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0} color="#ffb300" />
          </div>

          {/* กราฟยอดขายรายวัน */}
          <SectionTitle>กราฟยอดขายรายวัน</SectionTitle>
          <div style={{ background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 2px 8px #e0e0e0', marginBottom: 32 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summaryMonth.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* สินค้าขายดี */}
          <SectionTitle>สินค้าขายดี</SectionTitle>
          <div style={{ background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 2px 8px #e0e0e0', marginBottom: 32 }}>
            {(summaryMonth?.topSellingProducts && summaryMonth.topSellingProducts.length > 0) ? (
              summaryMonth.topSellingProducts.map((item, idx) => (
                <div key={item.product?.id || idx} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 18, height: 18, background: COLORS[idx % COLORS.length], borderRadius: 3 }} />
                    <div style={{ flex: 1 }}>{item.product?.name || '-'}</div>
                    <div style={{ fontWeight: 600 }}>{item.quantity}</div>
                  </div>
                  <div style={{ height: 6, background: '#e0e0e0', borderRadius: 3, marginTop: 4 }}>
                    <div style={{ width: `${Math.min(100, (item.quantity / (summaryMonth.topSellingProducts[0]?.quantity || 1)) * 100)}%`, height: 6, background: COLORS[idx % COLORS.length], borderRadius: 3 }} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#bbb', textAlign: 'center' }}>ไม่มีข้อมูลสินค้าขายดี</div>
            )}
          </div>
        </div>

        {/* Main right */}
        <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* อายุการใช้งานระบบ */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 2px 8px #e0e0e0', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: 15 }}>ระยะเวลาการใช้งานระบบ</div>
            <div style={{ fontSize: 15, margin: '8px 0' }}>ลงทะเบียนเข้าใช้ : {systemInfo.registered}</div>
            <div style={{ fontSize: 15, marginBottom: 8 }}>หมดอายุ : {systemInfo.expired}</div>
            <div style={{ color: 'green', fontWeight: 700, fontSize: 38, margin: '12px 0 0' }}>คงเหลือ<br />{systemInfo.daysLeft} วัน</div>
          </div>

          {/* Pie Chart รายรับ/รายจ่าย */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 2px 8px #e0e0e0', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>รายรับรายจ่าย</div>
            <PieChart width={180} height={180}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name }) => name}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* รายการขายต่อเดือน (mock) */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 2px 8px #e0e0e0', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>ทำรายการขายต่อเดือน</div>
            <div style={{ fontSize: 32, color: '#d32f2f', fontWeight: 700 }}>{summaryMonth?.totalTransactions || 0} <span style={{ color: '#888', fontWeight: 400, fontSize: 20 }}>/1,000,000</span></div>
          </div>

          {/* สินค้าใกล้หมด */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 2px 8px #e0e0e0', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>สินค้าใกล้หมด</div>
            {(summaryMonth?.lowStockProducts && summaryMonth.lowStockProducts.length > 0) ? (
              summaryMonth.lowStockProducts.map(product => (
                <div key={product.id} style={{ background: '#fff3e0', borderRadius: 6, padding: 8, margin: '8px 0', textAlign: 'center', boxShadow: '0 1px 4px #ffe0b2' }}>
                  {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} />}
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div style={{ color: '#d84315' }}>คงเหลือ: {product.stock} ชิ้น</div>
                </div>
              ))
            ) : (
              <div style={{ color: '#bbb', textAlign: 'center' }}>ไม่มีสินค้าใกล้หมด</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ color, icon, label, value }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 2px 8px #e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 32, color, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 22 }}>{value}</div>
      <div style={{ color: '#888', fontSize: 15 }}>{label}</div>
    </div>
  );
}

function MiniCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, minWidth: 120, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 1px 4px #e0e0e0' }}>
      <div style={{ fontSize: 24, color, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
      <div style={{ color: '#888', fontSize: 14 }}>{label}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontWeight: 700, fontSize: 20, margin: '18px 0 8px', color: '#1976d2' }}>{children}</div>;
} 