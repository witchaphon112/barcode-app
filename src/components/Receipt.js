import React from 'react';

export default function Receipt({ sale, onPrint, onSend }) {
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', background: '#fff', borderRadius: 8, padding: 24 }}>
      <h2>ใบเสร็จ</h2>
      {/* รายละเอียดบิล */}
      <div>วันที่: {sale?.timestamp ? new Date(sale.timestamp).toLocaleString() : '-'}</div>
      <div>ลูกค้า: {sale?.customerName || '-'}</div>
      <div>ยอดสุทธิ: {sale?.total || 0} บาท</div>
      {/* ...แสดงรายการสินค้า... */}
      <div style={{ margin: '16px 0' }}>
        {(sale?.items || []).map((item, idx) => (
          <div key={idx}>{item.name} x {item.quantity} = {item.price * item.quantity} บาท</div>
        ))}
      </div>
      <button onClick={onPrint}>พิมพ์ใบเสร็จ</button>
      <button onClick={onSend} style={{ marginLeft: 8 }}>ส่งใบเสร็จ (PDF/Line/Email)</button>
    </div>
  );
} 
