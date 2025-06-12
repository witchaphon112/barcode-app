import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

function StockManager() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({
    name: "",
    barcode: "",
    category: "",
    price: "",
    unit: "",
    stock: ""
  });
  const [editId, setEditId] = useState(null);
  const [stockAction, setStockAction] = useState({ id: null, type: "sale", amount: "", note: "" });

  // Load products
  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    setProducts(data.products || []);
  };

  // Load stock movements
  const fetchMovements = async () => {
    const res = await fetch(`${API_URL}/api/stock-movements`);
    const data = await res.json();
    setMovements(data.stockMovements || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchMovements();
    // eslint-disable-next-line
  }, []);

  // Add or Edit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await fetch(`${API_URL}/api/products/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
    } else {
      await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
    }
    setForm({ name: "", barcode: "", category: "", price: "", unit: "", stock: "" });
    setEditId(null);
    fetchProducts();
    fetchMovements();
  };

  // Delete product
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
    fetchMovements();
  };

  // Start edit
  const handleEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      price: product.price,
      unit: product.unit,
      stock: product.stock
    });
  };

  // Stock adjustment
  const handleStockAdjust = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/products/${stockAction.id}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: stockAction.type,
        amount: Number(stockAction.amount),
        note: stockAction.note
      })
    });
    setStockAction({ id: null, type: "sale", amount: "", note: "" });
    fetchProducts();
    fetchMovements();
  };

  // --- UI style ---
  const styles = {
    section: { background: "#fff", borderRadius: 10, boxShadow: "0 2px 12px #e3e6f0", padding: 28, marginBottom: 32 },
    label: { display: "block", fontWeight: 500, margin: "6px 0 2px" },
    input: {
      width: "100%",
      padding: "9px 12px",
      marginBottom: 10,
      border: "1.2px solid #d1d9e6",
      borderRadius: 7,
      fontSize: 16
    },
    button: {
      padding: "9px 28px",
      border: "none",
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 16,
      background: "#1e88e5",
      color: "#fff",
      marginRight: 10,
      marginBottom: 3,
      cursor: "pointer",
      transition: "background 0.2s"
    },
    danger: { background: "#d32f2f" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 15,
      background: "#fff",
      boxShadow: "0 1px 5px #e3e6f033"
    },
    th: {
      background: "#f5f6fa",
      fontWeight: 700,
      padding: "9px 5px",
      borderBottom: "2px solid #e5e7ee"
    },
    td: {
      padding: "8px 6px",
      borderBottom: "1px solid #eef1f5",
      textAlign: "center"
    }
  };

  return (
    <div style={{ maxWidth: 1050, margin: "auto", padding: 20 }}>
      {/* --- เพิ่ม/แก้ไขสินค้า --- */}
      <div style={styles.section}>
        <h2 style={{ color: "#1e88e5", marginBottom: 18 }}>{editId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "end" }}>
          <div>
            <label style={styles.label}>ชื่อสินค้า</label>
            <input style={styles.input} placeholder="ชื่อสินค้า" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label style={styles.label}>บาร์โค้ด</label>
            <input style={styles.input} placeholder="บาร์โค้ด" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} required />
          </div>
          <div>
            <label style={styles.label}>หมวดหมู่</label>
            <input style={styles.input} placeholder="หมวดหมู่" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
          </div>
          <div>
            <label style={styles.label}>ราคา</label>
            <input style={styles.input} placeholder="ราคา" type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div>
            <label style={styles.label}>หน่วย</label>
            <input style={styles.input} placeholder="หน่วย" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required />
          </div>
          <div>
            <label style={styles.label}>จำนวนคงเหลือ</label>
            <input style={styles.input} placeholder="จำนวนคงเหลือ" type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
          </div>
          <div style={{ gridColumn: "span 3", marginTop: 2 }}>
            <button type="submit" style={styles.button}>{editId ? "บันทึก" : "เพิ่มสินค้า"}</button>
            {editId &&
              <button type="button" style={{ ...styles.button, background: "#888" }}
                onClick={() => { setEditId(null); setForm({ name: "", barcode: "", category: "", price: "", unit: "", stock: "" }); }}>
                ยกเลิก
              </button>
            }
          </div>
        </form>
      </div>

      {/* --- รายการสินค้า --- */}
      <div style={styles.section}>
        <h3 style={{ color: "#354b7a" }}>รายการสินค้า</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ชื่อ</th>
                <th style={styles.th}>บาร์โค้ด</th>
                <th style={styles.th}>หมวดหมู่</th>
                <th style={styles.th}>ราคา</th>
                <th style={styles.th}>หน่วย</th>
                <th style={styles.th}>คงเหลือ</th>
                <th style={styles.th}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.barcode}</td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>{p.price}</td>
                  <td style={styles.td}>{p.unit}</td>
                  <td style={styles.td}>{p.stock}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(p)} style={styles.button}>แก้ไข</button>
                    <button onClick={() => handleDelete(p.id)} style={{ ...styles.button, ...styles.danger }}>ลบ</button>
                    <button onClick={() => setStockAction({ ...stockAction, id: p.id })} style={{ ...styles.button, background: "#43a047" }}>ปรับสต็อก</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ปรับสต็อก --- */}
      {stockAction.id && (
        <div style={styles.section}>
          <form onSubmit={handleStockAdjust} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <h4 style={{ margin: 0, marginRight: 20 }}>ปรับสต็อกสินค้า (ID: {stockAction.id})</h4>
            <select value={stockAction.type} onChange={e => setStockAction({ ...stockAction, type: e.target.value })} style={styles.input}>
              <option value="sale">ขายสินค้า</option>
              <option value="receive">รับสินค้าเข้า</option>
            </select>
            <input placeholder="จำนวน" type="number" min={1} value={stockAction.amount} onChange={e => setStockAction({ ...stockAction, amount: e.target.value })} required style={styles.input} />
            <input placeholder="หมายเหตุ" value={stockAction.note} onChange={e => setStockAction({ ...stockAction, note: e.target.value })} style={styles.input} />
            <button type="submit" style={{ ...styles.button, background: "#43a047" }}>บันทึก</button>
            <button type="button" style={{ ...styles.button, background: "#888" }} onClick={() => setStockAction({ id: null, type: "sale", amount: "", note: "" })}>ยกเลิก</button>
          </form>
        </div>
      )}

      {/* --- ประวัติการเคลื่อนไหว --- */}
      <div style={styles.section}>
        <h3 style={{ color: "#354b7a" }}>ประวัติการเคลื่อนไหวสต็อก</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>วันที่</th>
                <th style={styles.th}>สินค้า (ID)</th>
                <th style={styles.th}>ประเภท</th>
                <th style={styles.th}>จำนวน</th>
                <th style={styles.th}>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id}>
                  <td style={styles.td}>{new Date(m.date).toLocaleString()}</td>
                  <td style={styles.td}>{m.productId}</td>
                  <td style={styles.td}>{m.type === "sale" ? "ขาย" : m.type === "receive" ? "รับเข้า" : m.type === "add" ? "เพิ่มใหม่" : m.type}</td>
                  <td style={styles.td}>{m.amount}</td>
                  <td style={styles.td}>{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockManager;
