import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const BarcodeScanner = ({ onScanSuccess, scanning = true, scanMode = "check" }) => {
  const html5QrcodeScannerRef = useRef(null);
  const [scannerKey, setScannerKey] = useState(0);
  const [showCamera, setShowCamera] = useState(scanning);
  const isProcessingRef = useRef(false);

  // ทุกครั้งที่ scanning=true จะเปลี่ยน key (id ใหม่ทุกครั้ง)
  useEffect(() => {
    if (scanning) {
      setScannerKey((k) => k + 1);
      setShowCamera(true);
    } else if (showCamera) {
      // cleanup scanner ก่อนปิดกล้อง
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().then(() => {
          html5QrcodeScannerRef.current = null;
          setShowCamera(false);
        }).catch(() => {
          html5QrcodeScannerRef.current = null;
          setShowCamera(false);
        });
      } else {
        setShowCamera(false);
      }
    }
  }, [scanning]);

  useEffect(() => {
    if (!showCamera) return;

    // รอให้ DOM element พร้อมก่อนสร้าง scanner
    const timer = setTimeout(() => {
      const scannerId = `qr-reader-${scannerKey}`;
      const element = document.getElementById(scannerId);
      if (!element) return;

      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        scannerId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      html5QrcodeScannerRef.current.render(async (decodedText) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        try {
          const endpoint = scanMode === "stock" ? "/api/products/scan-in" : "/api/products/scan";
          const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barcode: decodedText }),
          });
          const data = await response.json();
          onScanSuccess(decodedText, data);
        } catch (error) {
          onScanSuccess(decodedText, {
            success: false,
            message: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
          });
        } finally {
          setTimeout(() => {
            isProcessingRef.current = false;
          }, 1200);
        }
      });
    }, 100); // รอ 100ms ให้ DOM พร้อม

    return () => {
      clearTimeout(timer);
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(() => {});
        html5QrcodeScannerRef.current = null;
      }
    };
  }, [showCamera, scannerKey, onScanSuccess, scanMode]);

  return (
    <div>
      {showCamera ? (
        <div id={`qr-reader-${scannerKey}`} style={{ width: 250 }}></div>
      ) : (
        <div
          style={{
            width: 250,
            height: 250,
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            color: "#666",
          }}
        >
          กล้องปิดแล้ว
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
