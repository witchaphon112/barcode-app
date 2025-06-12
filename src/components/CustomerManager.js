import React, { useState } from 'react';
import { FaUserEdit, FaTrash, FaUserCircle, FaTimes, FaUserFriends } from "react-icons/fa";

// ถ้าจะใช้ react-icons ให้ import ได้เลย เช่น
// import { FaUserEdit, FaTrash, FaUserCircle, FaTimes } from "react-icons/fa";

export default function CustomerManager() {
  // mock data ลูกค้า
  const [customers, setCustomers] = useState([
    { id: 1, name: 'สมชาย ใจดี', phone: '0812345678', email: 'somchai@email.com', points: 120, discount: 5, history: ['ซื้อสินค้า A', 'ซื้อสินค้า B'] },
    { id: 2, name: 'สมหญิง รักดี', phone: '0898765432', email: 'somying@email.com', points: 80, discount: 0, history: ['ซื้อสินค้า C'] },
  ]);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setCustomers(customers.map(c => c.id === editingId ? { ...c, ...form } : c));
    } else {
      setCustomers([
        ...customers,
        { id: Date.now(), ...form, points: 0, discount: 0, history: [] },
      ]);
    }
    setForm({ name: '', phone: '', email: '' });
    setEditingId(null);
  };

  const handleEdit = (customer) => {
    setForm({ name: customer.name, phone: customer.phone, email: customer.email });
    setEditingId(customer.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('ยืนยันการลบลูกค้าคนนี้?')) {
      setCustomers(customers.filter(c => c.id !== id));
      if (selectedCustomer && selectedCustomer.id === id) setSelectedCustomer(null);
    }
  };

  return (
    <div style={{
      maxWidth: 900, margin: '0 auto', padding: 28, fontFamily: 'Prompt, Arial, sans-serif',
      background: "#f7fafc", borderRadius: 18, boxShadow: "0 4px 32px #e8eaf6"
    }}>
      <h2 style={{ textAlign: "center", color: "#2b436b", marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <FaUserFriends style={{ marginBottom: 2 }} /> จัดการลูกค้า/สมาชิก
      </h2>
      {/* ฟอร์มเพิ่ม/แก้ไขลูกค้า */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex', gap: 12, marginBottom: 26, flexWrap: 'wrap', background: "#fff",
          borderRadius: 10, boxShadow: "0 1px 8px #dde7fb", padding: 18, alignItems: "flex-end"
        }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 4 }}>ชื่อ*</label>
          <input
            name="name"
            placeholder="ชื่อลูกค้า"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 9, borderRadius: 6, border: '1px solid #ccd', fontSize: 16 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 4 }}>เบอร์โทร*</label>
          <input
            name="phone"
            placeholder="เบอร์โทร"
            value={form.phone}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 9, borderRadius: 6, border: '1px solid #ccd', fontSize: 16 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500, fontSize: 15, display: 'block', marginBottom: 4 }}>อีเมล</label>
          <input
            name="email"
            placeholder="อีเมล"
            value={form.email}
            onChange={handleChange}
            style={{ width: "100%", padding: 9, borderRadius: 6, border: '1px solid #ccd', fontSize: 16 }}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            style={{
              padding: '9px 22px', background: editingId ? '#2196f3' : '#1976d2', color: '#fff',
              border: 'none', borderRadius: 7, fontWeight: 500, fontSize: 16, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            {editingId ? <FaUserEdit /> : <FaUserCircle />} {editingId ? 'บันทึก' : 'เพิ่มลูกค้า'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setForm({ name: '', phone: '', email: '' }); setEditingId(null); }}
              style={{
                padding: '9px 18px', background: '#aaa', color: '#fff',
                border: 'none', borderRadius: 7, fontWeight: 500, fontSize: 16, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 8
              }}>
              <FaTimes /> ยกเลิก
            </button>
          )}
        </div>
      </form>
      {/* ตารางลูกค้า */}
      <div style={{
        overflowX: "auto", background: "#fff", borderRadius: 10,
        boxShadow: "0 1px 8px #dde7fb", marginBottom: 24
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#e3f2fd', color: "#234c8e" }}>
              <th style={{ padding: 9, border: '1px solid #dbe7fd' }}></th>
              <th style={{ padding: 9, border: '1px solid #dbe7fd' }}>ชื่อ</th>
              <th style={{ padding: 9, border: '1px solid #dbe7fd' }}>เบอร์โทร</th>
              <th style={{ padding: 9, border: '1px solid #dbe7fd' }}>อีเมล</th>
              <th style={{ padding: 9, border: '1px solid #dbe7fd' }}>คะแนน</th>
              <th style={{ padding: 9, border: '1px solid #dbe7fd' }}>ส่วนลด (%)</th>
              <th style={{ padding: 9, border: '1px solid #dbe7fd' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr
                key={c.id}
                style={{
                  background: selectedCustomer && selectedCustomer.id === c.id ? '#e8f4fa' : '#fff',
                  transition: "background 0.2s"
                }}>
                <td style={{ padding: 9, border: '1px solid #e0e7ef', textAlign: 'center' }}>
                  <FaUserCircle size={28} color="#b0bec5" />
                </td>
                <td
                  style={{
                    padding: 9, border: '1px solid #e0e7ef', cursor: 'pointer', fontWeight: 500, color: "#235a7c"
                  }}
                  onClick={() => setSelectedCustomer(c)}
                >
                  {c.name}
                  {c.discount > 0 && (
                    <span style={{
                      marginLeft: 8,
                      background: "#43a047",
                      color: "#fff",
                      borderRadius: 7,
                      fontSize: 13,
                      padding: "2px 10px",
                      verticalAlign: "middle"
                    }}>
                      {c.discount}% OFF
                    </span>
                  )}
                </td>
                <td style={{ padding: 9, border: '1px solid #e0e7ef' }}>{c.phone}</td>
                <td style={{ padding: 9, border: '1px solid #e0e7ef' }}>{c.email}</td>
                <td style={{ padding: 9, border: '1px solid #e0e7ef', textAlign: "center" }}>
                  <span style={{
                    display: "inline-block", background: "#ffecb3", color: "#8d6e63",
                    padding: "2px 10px", borderRadius: 8, fontWeight: 600, fontSize: 15, minWidth: 35
                  }}>{c.points}</span>
                </td>
                <td style={{ padding: 9, border: '1px solid #e0e7ef', textAlign: "center" }}>
                  <span style={{
                    background: c.discount > 0 ? "#b9f6ca" : "#ececec",
                    color: c.discount > 0 ? "#388e3c" : "#999",
                    padding: "2px 10px", borderRadius: 8, fontWeight: 600, fontSize: 15
                  }}>{c.discount}</span>
                </td>
                <td style={{ padding: 9, border: '1px solid #e0e7ef', textAlign: 'center' }}>
                  <button
                    onClick={() => handleEdit(c)}
                    style={{
                      marginRight: 8, background: "#2979ff", color: "#fff",
                      border: "none", borderRadius: 5, padding: "6px 16px", cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: 6
                    }}><FaUserEdit /> แก้ไข</button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      background: "#d32f2f", color: "#fff",
                      border: "none", borderRadius: 5, padding: "6px 16px", cursor: "pointer", display: 'inline-flex', alignItems: 'center', gap: 6
                    }}><FaTrash /> ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ประวัติซื้อ, คะแนน, ส่วนลด */}
      {selectedCustomer && (
        <div style={{
          background: '#f3faed', padding: 22, borderRadius: 12, marginBottom: 16,
          boxShadow: "0 1px 8px #e2eed5", border: "2.5px solid #c7e2c6", position: 'relative'
        }}>
          <button
            onClick={() => setSelectedCustomer(null)}
            style={{
              position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#234c8e', fontSize: 22
            }}
            title="ปิด"
          >
            <FaTimes />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10 }}>
            <FaUserCircle size={48} color="#b0bec5" />
            <div>
              <h3 style={{ color: "#235a7c", margin: 0 }}>
                รายละเอียดลูกค้า: <span style={{ color: "#2e7d32" }}>{selectedCustomer.name}</span>
              </h3>
              <div style={{ margin: "8px 0 5px 0", fontSize: 16 }}>เบอร์โทร: <b>{selectedCustomer.phone}</b></div>
              <div style={{ marginBottom: 5, fontSize: 16 }}>อีเมล: <b>{selectedCustomer.email}</b></div>
            </div>
          </div>
          <div style={{ marginBottom: 5, fontSize: 16 }}>
            คะแนนสะสม: <span style={{
              background: "#ffd54f", color: "#6d4c41", padding: "3px 12px", borderRadius: 8, fontWeight: 700
            }}>{selectedCustomer.points}</span>
          </div>
          <div style={{ marginBottom: 8, fontSize: 16 }}>
            ส่วนลดพิเศษ: <span style={{
              background: "#81c784", color: "#234c28", padding: "2px 10px", borderRadius: 8, fontWeight: 600
            }}>{selectedCustomer.discount}%</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <b>ประวัติซื้อ:</b>
            <ul style={{ marginTop: 3, marginBottom: 0 }}>
              {selectedCustomer.history.length === 0
                ? <li style={{ color: "#888" }}>ไม่มีข้อมูล</li>
                : selectedCustomer.history.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
