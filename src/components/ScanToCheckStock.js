import React, { useState, useRef } from 'react';
import BarcodeScanner from '../BarcodeScanner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function ScanToCheckStock() {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(true);

  // ป้องกันผลลัพธ์ API ซ้อนกันกรณีสแกนรัว
  const scanId = useRef(0);

  const handleScanSuccess = async (barcode) => {
    // ปิดกล้องก่อนกันซ้อน
    setScanning(false);
    setLoading(true);
    setError('');
    setProduct(null);
    scanId.current += 1;
    const thisScan = scanId.current;
    try {
      const response = await fetch(`${API_URL}/api/products/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });
      if (!response.ok) {
        if (scanId.current === thisScan) {
          setError('❌ ไม่พบสินค้านี้ในระบบ');
        }
      } else {
        const data = await response.json();
        if (scanId.current === thisScan) {
          if (!data.product) {
            setError('❌ ไม่พบสินค้านี้ในระบบ');
          } else {
            setProduct(data.product);
          }
        }
      }
    } catch (e) {
      if (scanId.current === thisScan) {
        setError('⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ');
      }
    }
    if (scanId.current === thisScan) setLoading(false);
  };

  const handleRescan = () => {
    setProduct(null);
    setError('');
    setScanning(true);
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 24, textAlign: 'center' }}>
      <h2>สแกนบาร์โค้ดเพื่อตรวจสอบสินค้าในสต็อก</h2>
      <BarcodeScanner onScanSuccess={handleScanSuccess} scanning={scanning} />
      {loading && <p style={{ color: 'blue', marginTop: 16 }}>กำลังตรวจสอบ...</p>}

      {error && !loading && (
        <div style={{ marginTop: 22, background: '#ffe0e0', color: '#c62828', padding: 16, borderRadius: 8 }}>
          <h3>ไม่พบสินค้า</h3>
          <div style={{ marginBottom: 6 }}>{error}</div>
          <button
            onClick={handleRescan}
            style={{
              padding: "6px 18px",
              background: "#d1410c",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer"
            }}>
            สแกนใหม่
          </button>
        </div>
      )}

      {product && !loading && (
        <div style={{ marginTop: 24, padding: 16, background: '#e0ffe0', borderRadius: 8, boxShadow: "0 2px 8px #e0e0e0" }}>
          <h3 style={{ color: "#1b5e20" }}>พบสินค้าในระบบ</h3>
          {product.imageUrl && (
            <div style={{ marginBottom: 16, textAlign: "center" }}>
              <img 
                src={product.imageUrl} 
                alt={product.name}
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
          <p><strong>ชื่อสินค้า:</strong> {product.name}</p>
          <p><strong>บาร์โค้ด:</strong> {product.barcode}</p>
          <p><strong>ราคา:</strong> {product.price} บาท</p>
          <p><strong>คงเหลือ:</strong> {product.stock} ชิ้น</p>
          <button
            onClick={handleRescan}
            style={{
              marginTop: 8,
              padding: "6px 18px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer"
            }}>
            สแกนสินค้าอื่น
          </button>
        </div>
      )}

      {!product && !error && !loading && (
        <p style={{ color: "gray", marginTop: 18 }}>สแกนบาร์โค้ดเพื่อดูข้อมูลสินค้า</p>
      )}
    </div>
  );
}

export default ScanToCheckStock;
