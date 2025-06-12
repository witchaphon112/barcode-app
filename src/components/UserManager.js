import React, { useState } from 'react';

// Mock user data
const mockUsers = [
  { id: 1, username: 'admin1', name: 'อภิสิทธิ์ สมใจ', role: 'admin', phone: '0891234567', salesCount: 8, history: ['ขายสินค้า A', 'ขายสินค้า B'] },
  { id: 2, username: 'staff1', name: 'กิตติ พนักงาน', role: 'staff', phone: '0812345678', salesCount: 2, history: ['ขายสินค้า C'] },
];

const roles = [
  { key: 'admin', label: 'ผู้ดูแลระบบ' },
  { key: 'staff', label: 'พนักงาน' },
];

export default function UserManager() {
  const [users, setUsers] = useState(mockUsers);
  const [form, setForm] = useState({ username: '', name: '', phone: '', role: 'staff' });
  const [editingId, setEditingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Handle input change
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Edit user
  const handleSubmit = e => {
    e.preventDefault();
    if (editingId) {
      setUsers(users.map(u => u.id === editingId ? { ...u, ...form } : u));
    } else {
      setUsers([...users, {
        id: Date.now(),
        ...form,
        salesCount: 0,
        history: [],
      }]);
    }
    setForm({ username: '', name: '', phone: '', role: 'staff' });
    setEditingId(null);
  };

  // Edit user
  const handleEdit = user => {
    setForm({ username: user.username, name: user.name, phone: user.phone, role: user.role });
    setEditingId(user.id);
  };

  // Delete user
  const handleDelete = id => {
    if (window.confirm('ยืนยันการลบผู้ใช้นี้?')) {
      setUsers(users.filter(u => u.id !== id));
      if (selectedUser && selectedUser.id === id) setSelectedUser(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>จัดการผู้ใช้/สิทธิ์</h2>
      {/* ฟอร์มเพิ่ม/แก้ไขผู้ใช้ */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 120, padding: 8 }}
        />
        <input
          name="name"
          placeholder="ชื่อ-นามสกุล"
          value={form.name}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 140, padding: 8 }}
        />
        <input
          name="phone"
          placeholder="เบอร์โทร"
          value={form.phone}
          onChange={handleChange}
          style={{ flex: 1, minWidth: 120, padding: 8 }}
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          style={{ flex: 1, minWidth: 100, padding: 8 }}
        >
          {roles.map(r => <option value={r.key} key={r.key}>{r.label}</option>)}
        </select>
        <button type="submit" style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
          {editingId ? 'บันทึก' : 'เพิ่มผู้ใช้'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setForm({ username: '', name: '', phone: '', role: 'staff' }); setEditingId(null); }} style={{ padding: '8px 20px', background: '#aaa', color: '#fff', border: 'none', borderRadius: 4 }}>
            ยกเลิก
          </button>
        )}
      </form>

      {/* ตารางผู้ใช้ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Username</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>ชื่อ</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>เบอร์โทร</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>สิทธิ์</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>จำนวนขาย</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ background: selectedUser && selectedUser.id === u.id ? '#e3f2fd' : '#fff' }}>
              <td style={{ padding: 8, border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => setSelectedUser(u)}>{u.username}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{u.name}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{u.phone}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{roles.find(r => r.key === u.role)?.label || u.role}</td>
              <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>{u.salesCount}</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>
                <button onClick={() => handleEdit(u)} style={{ marginRight: 8 }}>แก้ไข</button>
                <button onClick={() => handleDelete(u.id)} style={{ color: 'red' }}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* รายละเอียดประวัติการขาย */}
      {selectedUser && (
        <div style={{ background: '#f9fbe7', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h3>ประวัติการขายของ: {selectedUser.name}</h3>
          <div>Username: {selectedUser.username}</div>
          <div>เบอร์โทร: {selectedUser.phone}</div>
          <div>สิทธิ์: {roles.find(r => r.key === selectedUser.role)?.label}</div>
          <div>จำนวนการขายทั้งหมด: {selectedUser.salesCount} รายการ</div>
          <div style={{ marginTop: 8 }}>
            <b>ประวัติ:</b>
            <ul>
              {selectedUser.history.length === 0 ? <li>ไม่มีข้อมูล</li> : selectedUser.history.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </div>
          <button onClick={() => setSelectedUser(null)} style={{ marginTop: 8 }}>ปิด</button>
        </div>
      )}
    </div>
  );
}
