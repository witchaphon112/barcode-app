import React from "react";

const navs = [
  { key: "pos", label: "ขายสินค้า" },
  { key: "scan", label: "สแกนบาร์โค้ด" },
  { key: "stock", label: "จัดการสต็อก", adminOnly: true },
  { key: "dashboard", label: "รายงาน" },
];

export default function Header({ user, logout, activeTab, setActiveTab }) {
  return (
    <div style={{
      background: "#fff",
      color: "#222",
      padding: "0 24px 0 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "2px solid #e0e0e0",
      minHeight: 56
    }}>
      {/* โลโก้และชื่อระบบ */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="logo" style={{ height: 36, marginRight: 10 }} />
        <span style={{ fontWeight: 900, fontSize: 26, color: "#e53935", letterSpacing: 1 }}>ร้าน ขายของจ้า</span>
        {/* Navigation Tabs */}
      </div>
      {/* ขวา: user info + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {user && (
          <>
            <span style={{ fontWeight: 500, color: "#1976d2", fontSize: 16 }}>
              {user.username} <span style={{ color: "#888", fontWeight: 400 }}>({user.role})</span>
            </span>
            {/* Avatar (ถ้ามี) */}
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e3e3e3", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1976d2", fontSize: 18 }}>
              {user.avatar ? <img src={user.avatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%" }} /> : user.username[0].toUpperCase()}
            </div>
            <button onClick={logout} style={{
              marginLeft: 8, background: "#e53935", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, cursor: "pointer", fontSize: 15
            }}>ออกจากระบบ</button>
          </>
        )}
      </div>
    </div>
  );
} 