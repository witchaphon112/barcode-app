import React, { useState, useEffect, useRef } from 'react';
import BarcodeScanner from '../BarcodeScanner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [customer, setCustomer] = useState("ทั่วไป");
  const [total, setTotal] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [change, setChange] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [scanning, setScanning] = useState(false); // default ปิดกล้อง
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDetails, setPaymentDetails] = useState({
    cash: { received: 0, change: 0 },
    transfer: { bank: '', reference: '' },
    qr: { provider: '', reference: '' },
    credit: { cardType: '', last4: '' }
  });
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDiscount, setMemberDiscount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const cashInputRef = useRef(null);

  const paymentMethods = [
    { key: 'cash', label: 'เงินสด' },
    { key: 'transfer', label: 'โอนเงิน' },
    { key: 'qr', label: 'QR Code' },
    { key: 'credit', label: 'บัตรเครดิต' }
  ];

  useEffect(() => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    setTotal(subtotal);
    const netTotal = selectedMember ? subtotal - ((subtotal * selectedMember.discount) / 100) : subtotal;
    setChange(receivedAmount - netTotal);
    if (selectedMember) {
      const discount = (subtotal * selectedMember.discount) / 100;
      setMemberDiscount(discount);
      setPointsEarned(Math.floor((subtotal - discount) / 100));
    } else {
      setMemberDiscount(0);
      setPointsEarned(0);
    }
  }, [cart, receivedAmount, selectedMember]);

  // โหลดสินค้า
  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }, []);

  // โหลดข้อมูลสมาชิก
  useEffect(() => {
    fetch(`${API_URL}/api/members`)
      .then(res => res.json())
      .then(data => setMembers(data.members || []));
  }, []);

  // เมื่อเปลี่ยนลูกค้าจาก 'สมาชิก' เป็น 'ทั่วไป' ให้ reset selectedMember
  useEffect(() => {
    if (customer !== 'สมาชิก') {
      setSelectedMember(null);
    }
  }, [customer]);

  // ฟิลเตอร์สินค้า
  const filteredProducts = products.filter(
    p => p.name.includes(search) || p.barcode?.includes(search)
  );

  // สแกนและเช็ค stock ก่อนเพิ่มตะกร้า
  const handleScanSuccess = async (barcode, data) => {
    setFeedback('');
    setScanning(false);
    if (!data.success || !data.product) {
      setFeedback('❌ ไม่พบสินค้า หรือสินค้าหมด');
      setTimeout(() => setFeedback(""), 2000);
      return;
    }
    const product = data.product;
    if (product.stock < 1) {
      setFeedback(`❌ สินค้า "${product.name}" หมดสต็อก`);
      setTimeout(() => setFeedback(""), 2000);
      return;
    }
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          setFeedback(`❗ สินค้า "${product.name}" มีในสต็อกแค่ ${product.stock} ชิ้น`);
          setTimeout(() => setFeedback(""), 2000);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, stock: product.stock }
            : item
        );
      } else {
        setFeedback(`✅ เพิ่ม "${product.name}" เรียบร้อย`);
        setTimeout(() => setFeedback(""), 1200);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // เพิ่มสินค้าเข้าตะกร้า (คลิก)
  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        if (found.quantity < product.stock)
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        else return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ลบ/ปรับจำนวน
  const removeFromCart = id => setCart(cart => cart.filter(i => i.id !== id));
  const updateQty = (id, qty) => setCart(cart =>
    cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)
  );

  // พิมพ์ใบเสร็จ
  const printReceipt = (sale, memberDiscount, pointsEarned) => {
    const receiptWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>ใบเสร็จ</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .receipt { width: 320px; margin: 30px auto; }
            .header { text-align: center; }
            .item { margin-bottom: 10px; border-bottom: 1px dashed #ddd; padding-bottom: 5px;}
            .total { font-weight: bold; margin-top: 20px; }
            .member { margin: 10px 0; padding: 10px; background: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>ใบเสร็จ</h2>
              <div>${sale.timestamp ? new Date(sale.timestamp).toLocaleString() : new Date().toLocaleString()}</div>
            </div>
            ${sale.memberId ? `
              <div class="member">
                <div>สมาชิก: ${selectedMember?.name || '-'}</div>
                <div>เบอร์โทร: ${selectedMember?.phone || '-'}</div>
                <div>ส่วนลด: ${memberDiscount || 0} บาท</div>
                <div>คะแนนที่ได้: ${pointsEarned || 0} คะแนน</div>
              </div>
            ` : ''}
            ${(sale.items || []).map(item => `
              <div class="item">
                <div>${item.name} (${item.price} x ${item.quantity})</div>
                <div style="text-align:right;">${item.price * item.quantity} บาท</div>
              </div>
            `).join('')}
            <div class="total">
              ยอดรวม: ${sale.total + (memberDiscount || 0)} บาท<br/>
              ${memberDiscount > 0 ? `ส่วนลด: ${memberDiscount} บาท<br/>` : ''}
              ยอดสุทธิ: ${sale.total} บาท<br/>
              วิธีการชำระเงิน: ${sale.paymentMethod}<br/>
              ${sale.paymentMethod === 'cash' ? `
                รับเงิน: ${paymentDetails.cash.received} บาท<br/>
                เงินทอน: ${paymentDetails.cash.change} บาท
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
    receiptWindow.document.write(html);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  // ชำระเงิน + update stock
  const handleCheckout = async () => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const memberId = customer === 'สมาชิก' && selectedMember ? selectedMember.id : undefined;
    if (paymentMethod === 'cash' && paymentDetails.cash.received < (total - memberDiscount)) {
      setFeedback('⚠️ จำนวนเงินที่รับมาไม่เพียงพอ');
      setTimeout(() => setFeedback(""), 2000);
      return;
    }
    let hasStock = true;
    for (const item of cart) {
      if (item.quantity > item.stock) {
        setFeedback(`❗ สินค้า "${item.name}" มีในสต็อกแค่ ${item.stock} ชิ้น`);
        setTimeout(() => setFeedback(""), 2000);
        hasStock = false;
        break;
      }
    }
    if (!hasStock) return;
    try {
      setLoading(true);
      // อัปเดตสต็อก
      await fetch(`${API_URL}/api/products/update-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, quantity: item.quantity }))
        }),
      });
      // บันทึกการขาย
      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
          total: subtotal,
          paymentMethod,
          paymentDetails: paymentDetails[paymentMethod],
          memberId,
          timestamp: new Date().toISOString()
        }),
      });
      const data = await response.json();
      if (data.success) {
        setLastSaleData({ sale: data.sale, memberDiscount: data.memberDiscount, pointsEarned: data.pointsEarned });
        setShowReceiptModal(true);
        resetCart();
        setFeedback('✅ บันทึกการขายและปรับสต็อกสำเร็จ');
        setTimeout(() => setFeedback(""), 2000);
      }
    } catch (error) {
      setFeedback('เกิดข้อผิดพลาดในการบันทึกการขาย');
      setTimeout(() => setFeedback(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  // เพิ่มฟังก์ชัน reset cart
  const resetCart = () => {
    setCart([]);
    setTotal(0);
    setPaymentDetails({
      cash: { received: 0, change: 0 },
      transfer: { bank: '', reference: '' },
      qr: { provider: '', reference: '' },
      credit: { cardType: '', last4: '' }
    });
  };

  // ฟังก์ชันพิมพ์ใบเสร็จจาก modal
  const printReceiptModal = () => {
    if (!lastSaleData) return;
    printReceipt(lastSaleData.sale, lastSaleData.memberDiscount, lastSaleData.pointsEarned);
  };

  // โฟกัสช่องรับเงินหลังปิด modal
  useEffect(() => {
    if (!showReceiptModal && cashInputRef.current) {
      cashInputRef.current.focus();
    }
  }, [showReceiptModal]);

  const styles = {
    root: { display: 'flex', gap: 32, maxWidth: 1200, margin: '32px auto', fontFamily: 'Prompt, Arial, sans-serif' },
    card: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e0e0', padding: 28, minWidth: 320 },
    product: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', marginBottom: 12, paddingBottom: 8 },
    button: { border: 'none', borderRadius: 8, padding: '7px 18px', background: '#d1410c', color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: 16 },
    buttonDanger: { background: '#d32f2f' },
    buttonSmall: { padding: '6px 12px', fontSize: 15 },
    quantityControl: { display: 'flex', gap: 10, alignItems: 'center' }
  };

  return (
    <div style={styles.root}>
      {/* Grid สินค้า */}
      <div style={{ flex: 2 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            placeholder="ค้นหาสินค้า/บาร์โค้ด"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <select value={customer} onChange={e => setCustomer(e.target.value)}>
            <option>ทั่วไป</option>
            <option>สมาชิก</option>
          </select>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12
        }}>
          {filteredProducts.map(p => (
            <div key={p.id}
              style={{
                border: "1px solid #ddd", borderRadius: 8, padding: 12,
                background: p.stock === 0 ? "#ffe0e0" : "#fff", cursor: p.stock === 0 ? "not-allowed" : "pointer"
              }}
              onClick={() => p.stock > 0 && addToCart(p)}
            >
              {p.imageUrl && (
                <div style={{ marginBottom: 8, textAlign: "center" }}>
                  <img 
                    src={p.imageUrl} 
                    alt={p.name}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid #eee"
                    }}
                  />
                </div>
              )}
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ color: "#888" }}>{p.barcode}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{p.price} บาท</div>
              {p.stock === 0 && <div style={{ color: "#c00", fontWeight: 500 }}>สินค้าหมดสต็อก</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{
  ...styles.card, flex: 1, minWidth: 350, background: "#fafdff", boxShadow: "0 2px 16px #c2dbff40",
  display: "flex", flexDirection: "column"
}}>
  <h2 style={{ color: '#003366', marginBottom: 10 }}>🛒 ตะกร้าสินค้า</h2>
  <div style={{ marginBottom: 10 }}>
    <button
      style={{
        ...styles.button,
        background: scanning ? "#757575" : "#009688",
        width: 160,
        marginRight: 8,
        marginBottom: 10
      }}
      onClick={() => setScanning(s => !s)}
    >
      {scanning ? "ปิดกล้องสแกน" : "แสกนบาร์โค้ด"}
    </button>
    <span style={{ color: '#b71c1c', fontWeight: 500 }}>{feedback}</span>
  </div>
  {scanning &&
    <div style={{ marginBottom: 14 }}>
      <BarcodeScanner
        onScanSuccess={handleScanSuccess}
        scanning={scanning}
        scanMode="check"
      />
    </div>
  }

  {cart.length === 0 ? (
    <div style={{
      color: '#b0b0b0', textAlign: 'center', margin: '40px 0',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <span style={{ fontSize: 48, marginBottom: 10 }}>🛒</span>
      <span>ยังไม่มีสินค้าในตะกร้า</span>
    </div>
  ) : (
    <div>
      {cart.map((item, idx) => (
        <div key={item.id} style={{
          display: "flex", alignItems: "center", marginBottom: 14,
          background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px #eef2fa",
          padding: 10, gap: 12, borderLeft: item.stock === 0 ? '6px solid #b71c1c' : '6px solid #009688'
        }}>
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{
                width: 44, height: 44, objectFit: "cover",
                borderRadius: 5, border: "1px solid #eee"
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 17 }}>{item.name}</div>
            <div style={{ color: "#777", fontSize: 13 }}>{item.price} บาท x {item.quantity} = <span style={{ fontWeight: 600 }}>{item.price * item.quantity} บาท</span></div>
            <div style={{ fontSize: 13, color: "#ff9800" }}>
              คงเหลือ: {item.stock} ชิ้น
              {item.quantity > item.stock &&
                <span style={{ color: "#d32f2f", marginLeft: 6 }}> (เกินสต็อก!)</span>
              }
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 5 }}>
              <button
                style={{ ...styles.buttonSmall, ...styles.button, width: 34, height: 34, padding: 0, fontSize: 20, borderRadius: 50 }}
                onClick={() => updateQty(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                title="ลดจำนวน"
              >-</button>
              <span style={{ width: 32, textAlign: "center", fontWeight: 700, fontSize: 17 }}>{item.quantity}</span>
              <button
                style={{ ...styles.buttonSmall, ...styles.button, width: 34, height: 34, padding: 0, fontSize: 20, borderRadius: 50 }}
                onClick={() => updateQty(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                title="เพิ่มจำนวน"
              >+</button>
            </div>
            <button
              style={{
                ...styles.buttonSmall, ...styles.buttonDanger,
                width: 70, fontSize: 15, marginTop: 6, borderRadius: 6
              }}
              onClick={() => removeFromCart(item.id)}
              title="ลบออก"
            >
              ลบ
            </button>
          </div>
        </div>
      ))}

      {/* --- เงื่อนไขแสดง dropdown สมาชิก --- */}
      {customer === 'สมาชิก' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>สมาชิก:</label>
          <select
            value={selectedMember?.id || ''}
            onChange={e => {
              const memberId = e.target.value;
              setSelectedMember(members.find(m => m.id === parseInt(memberId)) || null);
            }}
            style={{ width: '100%', padding: 8, borderRadius: 4 }}
          >
            <option value="">-- เลือกสมาชิก --</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} (เบอร์: {member.phone})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* --- เลือกวิธีชำระเงิน --- */}
      <div style={{ margin: '16px 0' }}>
        <label style={{ fontWeight: 600, marginRight: 8 }}>วิธีชำระเงิน:</label>
        {paymentMethods.map(pm => (
          <label key={pm.key} style={{ marginRight: 16 }}>
            <input
              type="radio"
              name="paymentMethod"
              value={pm.key}
              checked={paymentMethod === pm.key}
              onChange={() => setPaymentMethod(pm.key)}
              style={{ marginRight: 4 }}
            />
            {pm.label}
          </label>
        ))}
      </div>

      {/* ฟอร์มรับเงินตามประเภท */}
      {paymentMethod === 'cash' && (
        <div>
          <div style={{ marginBottom: 8 }}>
            รับเงิน: <input
              type="number"
              value={paymentDetails.cash.received}
              onChange={e => {
                const received = Number(e.target.value);
                setPaymentDetails(prev => ({
                  ...prev,
                  cash: {
                    received,
                    change: received - (total - memberDiscount)
                  }
                }));
                setReceivedAmount(received); // อัปเดตเงินรับ
              }}
              style={{ width: 120, padding: 4 }}
              ref={cashInputRef}
            /> บาท
          </div>
          <div style={{ color: '#666' }}>
            เงินทอน: {paymentDetails.cash.change} บาท
          </div>
        </div>
      )}

      {/* Transfer */}
      {paymentMethod === 'transfer' && (
        <div>
          <div style={{ marginBottom: 8 }}>
            ธนาคาร: <input
              type="text"
              value={paymentDetails.transfer.bank}
              onChange={e => setPaymentDetails(prev => ({
                ...prev,
                transfer: { ...prev.transfer, bank: e.target.value }
              }))}
              style={{ width: 120, padding: 4 }}
            />
          </div>
          <div>
            เลขอ้างอิง: <input
              type="text"
              value={paymentDetails.transfer.reference}
              onChange={e => setPaymentDetails(prev => ({
                ...prev,
                transfer: { ...prev.transfer, reference: e.target.value }
              }))}
              style={{ width: 120, padding: 4 }}
            />
          </div>
        </div>
      )}
      {/* QR Payment */}
      {paymentMethod === 'qr' && (
        <div>
          <div style={{ marginBottom: 8 }}>
            ผู้ให้บริการ: <input
              type="text"
              value={paymentDetails.qr.provider}
              onChange={e => setPaymentDetails(prev => ({
                ...prev,
                qr: { ...prev.qr, provider: e.target.value }
              }))}
              style={{ width: 120, padding: 4 }}
            />
          </div>
          <div>
            เลขอ้างอิง: <input
              type="text"
              value={paymentDetails.qr.reference}
              onChange={e => setPaymentDetails(prev => ({
                ...prev,
                qr: { ...prev.qr, reference: e.target.value }
              }))}
              style={{ width: 120, padding: 4 }}
            />
          </div>
        </div>
      )}
      {/* Credit */}
      {paymentMethod === 'credit' && (
        <div>
          <div style={{ marginBottom: 8 }}>
            ประเภทบัตร: <input
              type="text"
              value={paymentDetails.credit.cardType}
              onChange={e => setPaymentDetails(prev => ({
                ...prev,
                credit: { ...prev.credit, cardType: e.target.value }
              }))}
              style={{ width: 120, padding: 4 }}
            />
          </div>
          <div>
            เลข 4 หลักท้าย: <input
              type="text"
              value={paymentDetails.credit.last4}
              onChange={e => setPaymentDetails(prev => ({
                ...prev,
                credit: { ...prev.credit, last4: e.target.value }
              }))}
              style={{ width: 120, padding: 4 }}
            />
          </div>
        </div>
      )}

      {/* สรุปยอด */}
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 18 }}>
          ยอดรวม: {total} บาท
        </div>
        {memberDiscount > 0 && (
          <div style={{ fontSize: 16, color: '#388e3c', marginBottom: 6 }}>
            ส่วนลดสมาชิก: {memberDiscount} บาท
          </div>
        )}
        <div style={{ marginBottom: 8, fontSize: 18 }}>
          <b>ยอดสุทธิ: {total - memberDiscount} บาท</b>
        </div>
        {pointsEarned > 0 && (
          <div style={{ fontSize: 14, color: '#666' }}>
            คะแนนที่จะได้รับ: {pointsEarned} คะแนน
          </div>
        )}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || (paymentMethod === 'cash' && paymentDetails.cash.received < (total - memberDiscount)) || loading}
          style={{
            ...styles.button,
            width: '100%',
            marginTop: 12,
            background: cart.length === 0 || (paymentMethod === 'cash' && paymentDetails.cash.received < (total - memberDiscount)) || loading ? '#bbb' : '#d1410c',
            cursor: cart.length === 0 || (paymentMethod === 'cash' && paymentDetails.cash.received < (total - memberDiscount)) || loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'กำลังบันทึก...' : 'ชำระเงิน'}
        </button>
      </div>
    </div>
  )}
</div>

{/* Modal แจ้งผลลัพธ์/ใบเสร็จ */}
{showReceiptModal && lastSaleData && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}>
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, maxWidth: 400, boxShadow: '0 4px 32px #0003', textAlign: 'center' }}>
      <h2 style={{ color: '#388e3c', marginBottom: 12 }}>✅ ชำระเงินสำเร็จ</h2>
      <div style={{ textAlign: 'left', marginBottom: 18 }}>
        <div><b>วันที่:</b> {lastSaleData.sale.timestamp ? new Date(lastSaleData.sale.timestamp).toLocaleString() : '-'}</div>
        <div><b>ยอดสุทธิ:</b> {lastSaleData.sale.total} บาท</div>
        {lastSaleData.memberDiscount > 0 && <div><b>ส่วนลดสมาชิก:</b> {lastSaleData.memberDiscount} บาท</div>}
        {lastSaleData.pointsEarned > 0 && <div><b>คะแนนที่ได้รับ:</b> {lastSaleData.pointsEarned} คะแนน</div>}
        <div style={{ margin: '10px 0 0' }}><b>สินค้า:</b></div>
        <ul style={{ paddingLeft: 18 }}>
          {(lastSaleData.sale.items || []).map((item, idx) => (
            <li key={idx}>{item.name} x {item.quantity} = {item.price * item.quantity} บาท</li>
          ))}
        </ul>
      </div>
      <button onClick={printReceiptModal} style={{ ...styles.button, marginRight: 10 }}>พิมพ์ใบเสร็จ</button>
      <button onClick={() => setShowReceiptModal(false)} style={{ ...styles.button, background: '#888' }}>ปิด</button>
    </div>
  </div>
)}
</div>
  );
}

export default POS;
