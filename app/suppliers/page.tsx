"use client";

import { useState, useEffect } from "react";
import { Supplier } from "@/type";

// Styles
const muted = "#6b7280";
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 6px 18px rgba(12,18,31,0.06)",
  border: "1px solid rgba(15,23,42,0.06)",
};

const btn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
  color: "#fff",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
};

const btnSecondary: React.CSSProperties = {
  ...btn,
  background: "#f3f4f6",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: muted,
  marginBottom: 4,
  display: "block",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    notes: "",
    is_active: true,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.suppliers);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      alert("שגיאה בטעינת ספקים");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      contact_name: "",
      phone: "",
      email: "",
      notes: "",
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_name: supplier.contact_name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      notes: supplier.notes || "",
      is_active: supplier.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("שם הספק הוא שדה חובה");
      return;
    }

    try {
      const url = editingSupplier
        ? "/api/suppliers/update"
        : "/api/suppliers/add";
      const method = editingSupplier ? "PUT" : "POST";

      const body: any = {
        name: formData.name,
        contact_name: formData.contact_name || null,
        phone: formData.phone || null,
        email: formData.email || null,
        notes: formData.notes || null,
        is_active: formData.is_active,
      };

      if (editingSupplier) {
        body.id = editingSupplier.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingSupplier ? "ספק עודכן בהצלחה!" : "ספק נוסף בהצלחה!");
        setShowModal(false);
        fetchSuppliers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving supplier:", err);
      alert("שגיאה בשמירת ספק");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את הספק?")) return;

    try {
      const res = await fetch(`/api/suppliers/update?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("ספק בוטל בהצלחה!");
        fetchSuppliers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting supplier:", err);
      alert("שגיאה במחיקת ספק");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען ספקים...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              🤝 ניהול ספקים
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {suppliers.length} ספקים במערכת
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף ספק
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div style={cardStyle}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 8px",
          }}
        >
          <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
            <tr style={{ color: muted, fontSize: 13 }}>
              <th style={{ textAlign: "right", padding: 8 }}>שם הספק</th>
              <th style={{ textAlign: "center", padding: 8 }}>איש קשר</th>
              <th style={{ textAlign: "center", padding: 8 }}>טלפון</th>
              <th style={{ textAlign: "center", padding: 8 }}>אימייל</th>
              <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
              <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr
                key={s.id}
                style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
              >
                <td style={{ padding: 8, fontWeight: 600 }}>{s.name}</td>
                <td style={{ textAlign: "center", padding: 8, color: muted }}>
                  {s.contact_name || "—"}
                </td>
                <td style={{ textAlign: "center", padding: 8, color: muted }}>
                  {s.phone || "—"}
                </td>
                <td style={{ textAlign: "center", padding: 8, color: muted }}>
                  {s.email || "—"}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: s.is_active
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                      color: s.is_active ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {s.is_active ? "פעיל" : "לא פעיל"}
                  </span>
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <button
                    style={{ ...btnSecondary, marginLeft: 4 }}
                    onClick={() => handleEdit(s)}
                  >
                    ✏️ ערוך
                  </button>
                  <button
                    style={{
                      ...btnSecondary,
                      color: "#dc2626",
                    }}
                    onClick={() => handleDelete(s.id)}
                  >
                    🗑️ בטל
                  </button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 20, color: muted }}
                >
                  אין ספקים במערכת. לחץ על "הוסף ספק" להתחיל.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(600px, 90vw)",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
              {editingSupplier ? "ערוך ספק" : "הוסף ספק חדש"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  שם הספק <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="שם החברה / הספק"
                />
              </div>

              <div>
                <label style={labelStyle}>שם איש קשר</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.contact_name}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_name: e.target.value })
                  }
                  placeholder="שם איש הקשר בחברה"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>טלפון</label>
                  <input
                    type="tel"
                    style={inputStyle}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="050-1234567"
                  />
                </div>

                <div>
                  <label style={labelStyle}>אימייל</label>
                  <input
                    type="email"
                    style={inputStyle}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>הערות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="הערות נוספות..."
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
                <label
                  htmlFor="active"
                  style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  ספק פעיל
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  style={btnSecondary}
                  onClick={() => setShowModal(false)}
                >
                  ביטול
                </button>
                <button style={btnPrimary} onClick={handleSubmit}>
                  {editingSupplier ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

