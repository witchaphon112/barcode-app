// src/App.js
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import StockManager from "./StockManager";
import ScanToStock from "./ScanToStock";
import POS from "./components/POS";
import Dashboard from "./components/Dashboard";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import Header from "./components/Header";
import ReportOverview from "./components/ReportOverview";
import CustomerManager from "./components/CustomerManager";
import UserManager from "./components/UserManager";


function AppContent() {
  const [activeTab, setActiveTab] = useState('pos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  if (!user) return <LoginPage />;

  // หน้าทุกหน้าจะได้ user (role) กับฟังก์ชัน logout
  // เพิ่ม key ให้ content เพื่อ reset state ในแต่ละ tab ถ้าเปลี่ยน (optional)
  return (
    <div style={{
      minHeight: '100vh',
      background: "#f8f9fa",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <Header user={user} logout={logout} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} />
        
        {/* Page Content */}
        <main style={{
          flex: 1,
          marginLeft: sidebarOpen ? 10 : 56, // กว้าง sidebar (ปรับให้เท่ากับ sidebar จริง)
          transition: "margin-left 0.2s",
          padding: 32,
          minHeight: "calc(100vh - 80px)", // ปรับตาม header สูง
        }}>
          {activeTab === 'pos' && <POS user={user} logout={logout} key="pos" />}
          {activeTab === 'scan' && <ScanToStock key="scan" />}
          {activeTab === 'stock' && user.role === "admin" && <StockManager key="stock" />}
          {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
          {activeTab === 'report-overview' && <ReportOverview key="report-overview" />}
          {activeTab === 'customer' && <CustomerManager key="customer" />}
          {activeTab === 'user' && user.role === "admin" && <UserManager key="user" />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
