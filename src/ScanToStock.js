import React, { useState, useEffect, useRef } from "react";
import BarcodeScanner from "./BarcodeScanner";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

function ScanToStock() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const html5QrcodeScannerRef = useRef(null);

  const handleScanSuccess = async (barcode, backendData) => {
    setLoading(true);
    setScanning(false); // ปิดกล้องหลังสแกน
    setResult({
      barcode,
      ...backendData.product,
      message: backendData.message,
      success: backendData.success
    });
    setLoading(false);

    // เปิดสแกนใหม่อัตโนมัติ (delay 1.1 วินาที)
    setTimeout(() => {
      setResult(null);
      setScanning(true);
    }, 1100);
  };

  const handleStartScan = () => {
    setResult(null);
    setScanning(true);
  };

  const handleStopScan = () => {
    setScanning(false);
  };

  useEffect(() => {
    // ... สร้าง scanner ...
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(() => {});
        html5QrcodeScannerRef.current = null;
      }
    };
  }, [scanning]);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "36px auto",
        padding: "32px 16px",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 4px 28px #dbeafe40",
        textAlign: "center",
        minHeight: 400,
      }}
    >
      <h2 style={{
        fontWeight: 700,
        color: "#1565c0",
        fontSize: 26,
        marginBottom: 8
      }}>เพิ่มสินค้าเข้าสต็อกด้วยบาร์โค้ด</h2>
      <div style={{ color: "#616161", fontSize: 17, marginBottom: 22 }}>
        สแกน 1 ครั้ง = เพิ่มสินค้า 1 ชิ้น ในคลัง
      </div>
      <div style={{ marginBottom: 16 }}>
        {!scanning ? (
          <button
            onClick={handleStartScan}
            style={{
              padding: "12px 34px",
              background: "#1565c0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 500,
              boxShadow: "0 1px 5px #2962ff23",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "background 0.2s"
            }}
            disabled={loading}
          >
            {result ? "สแกนรายการถัดไป" : "เริ่มสแกน"}
          </button>
        ) : (
          <button
            onClick={handleStopScan}
            style={{
              padding: "12px 34px",
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 500,
              boxShadow: "0 1px 5px #d32f2f28",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            หยุดสแกน
          </button>
        )}
      </div>

      <div style={{
        margin: "0 auto",
        width: 260,
        maxWidth: "100%",
        minHeight: 240,
        display: scanning ? "block" : "none"
      }}>
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          scanning={scanning}
          scanMode="stock"
        />
      </div>

      {loading && (
        <div style={{ marginTop: 22, color: "#1976d2", fontSize: 17 }}>
          <span className="pi pi-spin pi-spinner" /> กำลังเพิ่มสินค้าเข้าสต็อก...
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 28,
            background: result.success ? "#e0f7fa" : "#ffebee",
            borderRadius: 11,
            padding: "20px 16px",
            border: `1.5px solid ${result.success ? "#26c6da" : "#e57373"}`,
            boxShadow: "0 2px 10px #e3f2fd55",
            transition: "background 0.2s"
          }}
        >
          {result.imageUrl && (
            <div style={{ marginBottom: 16, textAlign: "center" }}>
              <img 
                src={result.imageUrl} 
                alt={result.name}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "2px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              />
            </div>
          )}
          <h3 style={{
            color: result.success ? "#00796b" : "#d32f2f",
            fontWeight: 700,
            marginBottom: 10
          }}>
            {result.success ? "เพิ่มสต็อกสำเร็จ!" : "เกิดข้อผิดพลาด"}
          </h3>
          <div style={{ fontSize: 16, marginBottom: 3 }}>
            <b>บาร์โค้ด:</b> {result.barcode}
          </div>
          <div style={{ fontSize: 16, marginBottom: 3 }}>
            <b>ชื่อสินค้า:</b> {result.name || "-"}
          </div>
          <div style={{ fontSize: 16, marginBottom: 3 }}>
            <b>จำนวนคงเหลือ:</b> <span style={{ color: "#0288d1", fontWeight: 600 }}>{result.stock}</span>
          </div>
          <div style={{ color: "#888", fontSize: 15 }}>
            <b>ข้อความ:</b> {result.message}
          </div>
        </div>
      )}

      {!result && !scanning && (
        <div style={{
          color: "#757575",
          marginTop: 26,
          fontSize: 15
        }}>
          กด <b>เริ่มสแกน</b> เพื่อเพิ่มสินค้าเข้าสต็อก <br />แต่ละการสแกนจะเพิ่มสินค้าเพียง 1 ชิ้น
        </div>
      )}
    </div>
  );
}

export default ScanToStock;
