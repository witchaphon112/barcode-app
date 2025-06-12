import React from "react";
import {
  MdPointOfSale, MdQrCodeScanner, MdInventory, MdDashboard, MdChevronLeft, MdChevronRight, MdListAlt,
  MdPeople, MdPerson, MdAssessment, MdBackup, MdHelp, MdWifiOff, MdFactCheck, MdPieChart
} from "react-icons/md";

const MENUS = [
  { key: 'report-overview', label: "รายงานภาพรวม", icon: <MdPieChart size={22} /> },
  { key: 'pos', label: "ขายสินค้า", icon: <MdPointOfSale size={22} /> },
  { key: 'scan', label: "สแกนบาร์โค้ด", icon: <MdQrCodeScanner size={22} /> },
  { key: 'stock', label: "จัดการสต็อก", icon: <MdInventory size={22} />, adminOnly: true },
  { key: 'dashboard', label: "รายงาน", icon: <MdDashboard size={22} /> },
  { divider: true },
  { key: 'product', label: "สินค้า", icon: <MdListAlt size={22} /> },
  { key: 'customer', label: "ลูกค้า/สมาชิก", icon: <MdPeople size={22} /> },
  { key: 'user', label: "ผู้ใช้/สิทธิ์", icon: <MdPerson size={22} />, adminOnly: true },
  { divider: true },
  { key: 'report-product', label: "รายงานสินค้า", icon: <MdAssessment size={22} /> },
  { key: 'report-profit', label: "รายงานกำไร", icon: <MdFactCheck size={22} /> },
  { divider: true },
  { key: 'backup', label: "สำรอง/กู้คืน", icon: <MdBackup size={22} />, adminOnly: true },
  { key: 'audit', label: "Audit Log", icon: <MdAssessment size={22} />, adminOnly: true },
  { key: 'offline', label: "สถานะ Offline", icon: <MdWifiOff size={22} /> },
  { key: 'help', label: "คู่มือ/ช่วยเหลือ", icon: <MdHelp size={22} /> },
];

// ใช้ custom Tooltip เวลา sidebar ย่อ
function Tooltip({ children, label }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <span className="custom-tooltip">{label}</span>
      <style>{`
        .custom-tooltip {
          visibility: hidden;
          opacity: 0;
          background: #222;
          color: #fff;
          border-radius: 5px;
          font-size: 14px;
          padding: 5px 13px;
          position: absolute;
          left: 110%;
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          pointer-events: none;
          z-index: 99;
          box-shadow: 0 1.5px 10px #4442;
          transition: opacity 0.2s;
        }
        span:hover > .custom-tooltip {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </span>
  );
}

export default function Sidebar({ open, setOpen, activeTab, setActiveTab, role }) {
  return (
    <nav style={{
      width: open ? 220 : 56,
      background: "#fff",
      borderRight: "1px solid #eee",
      transition: "width 0.18s cubic-bezier(.4,0,.2,1)",
      height: "100vh",
      position: "sticky",
      top: 0,
      zIndex: 10,
      overflow: "hidden",
      boxShadow: open ? "1.5px 0 7px #d5dbe7" : "none"
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", height: 48, padding: 8, background: "#f8f9fa", border: "none",
          cursor: "pointer", fontSize: 16, borderBottom: "1px solid #eee",
          display: "flex", alignItems: "center", justifyContent: open ? "flex-end" : "center"
        }}>
        {open ? <MdChevronLeft size={22} /> : <MdChevronRight size={22} />}
      </button>
      {/* Menu List */}
      <div style={{
        overflowY: 'auto',
        height: 'calc(100vh - 48px)',
        scrollbarWidth: 'thin',
        scrollbarColor: '#e0e0e0 #fff',
        msOverflowStyle: 'none',
      }}>
        <style>{`
          nav::-webkit-scrollbar, nav > div::-webkit-scrollbar { width: 6px; background: #fff; }
          nav::-webkit-scrollbar-thumb, nav > div::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
        `}</style>
        {MENUS.filter(m => !m.adminOnly || role === "admin").map((menu, idx) =>
          menu.divider ? (
            <div
              key={"divider-" + idx}
              style={{
                borderBottom: "1px solid #eee",
                margin: open ? "10px 0" : "12px 0",
                width: open ? "84%" : 28,
                marginLeft: open ? 18 : 14,
                transition: "all 0.2s"
              }}
            />
          ) : (
            <Tooltip key={menu.key} label={!open ? menu.label : undefined}>
              <button
                onClick={() => setActiveTab(menu.key)}
                style={{
                  display: "flex", alignItems: "center", width: "100%",
                  padding: open ? "14px 18px" : "14px 8px",
                  background: activeTab === menu.key ? "#e3f2fd" : "none",
                  border: "none", borderBottom: "1px solid #f2f2f2",
                  fontWeight: activeTab === menu.key ? 600 : 400,
                  fontSize: 16, color: activeTab === menu.key ? "#1565c0" : "#222", cursor: "pointer",
                  transition: "background 0.17s"
                }}>
                <span style={{ marginRight: open ? 15 : 0, display: "flex" }}>{menu.icon}</span>
                {open && <span>{menu.label}</span>}
              </button>
            </Tooltip>
          )
        )}
      </div>
    </nav>
  );
}
