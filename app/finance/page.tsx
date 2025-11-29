"use client";

import { useState, useEffect } from "react";

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

type Transaction = {
  id: string;
  transaction_date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  donor_id?: string;
  supplier_id?: string;
  notes?: string;
  created_at: string;
};

const TRANSACTION_TYPES = ["income", "expense"] as const;
const INCOME_CATEGORIES = ["תרומה", "מענק", "מכירת ציוד", "אחר"] as const;
const EXPENSE_CATEGORIES = [
  "ציוד",
  "תחזוקה",
  "שכר",
  "ביטוח",
  "שכירות",
  "דלק",
  "אחר",
] as const;

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<string>("");

  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    type: "expense" as "income" | "expense",
    category: "",
    amount: "",
    description: "",
    donor_id: "",
    supplier_id: "",
    notes: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = "/api/finance";
      if (filterType) url += `?type=${filterType}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("שגיאה בטעינת תנועות");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setFormData({
      transaction_date: new Date().toISOString().split("T")[0],
      type: "expense",
      category: "",
      amount: "",
      description: "",
      donor_id: "",
      supplier_id: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      transaction_date: transaction.transaction_date.split("T")[0],
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      donor_id: transaction.donor_id || "",
      supplier_id: transaction.supplier_id || "",
      notes: transaction.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.transaction_date ||
      !formData.category ||
      !formData.amount ||
      !formData.description
    ) {
      alert("תאריך, קטגוריה, סכום ותיאור הם שדות חובה");
      return;
    }

    try {
      const url = editingTransaction
        ? "/api/finance/update"
        : "/api/finance/add";
      const method = editingTransaction ? "PUT" : "POST";

      const body: any = {
        transaction_date: formData.transaction_date,
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        donor_id: formData.donor_id || null,
        supplier_id: formData.supplier_id || null,
        notes: formData.notes || null,
      };

      if (editingTransaction) {
        body.id = editingTransaction.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          editingTransaction ? "תנועה עודכנה בהצלחה!" : "תנועה נוספה בהצלחה!"
        );
        setShowModal(false);
        fetchTransactions();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving transaction:", err);
      alert("שגיאה בשמירת תנועה");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את התנועה?")) return;

    try {
      const res = await fetch(`/api/finance/update?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("תנועה נמחקה בהצלחה!");
        fetchTransactions();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
      alert("שגיאה במחיקת תנועה");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען תנועות...</div>
      </div>
    );
  }

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div style={{ padding: 20 }}>
      {/* Header with Stats */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              💰 ניהול כספים
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {transactions.length} תנועות במערכת
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף תנועה
          </button>
        </div>

        {/* Summary Cards */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}
        >
          <div
            style={{
              padding: 16,
              background: "rgba(34, 197, 94, 0.1)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
              סה״כ הכנסות
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#16a34a" }}>
              ₪{totalIncome.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              padding: 16,
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
              סה״כ הוצאות
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#dc2626" }}>
              ₪{totalExpense.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              padding: 16,
              background:
                balance >= 0
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(251, 191, 36, 0.1)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
              יתרה
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: balance >= 0 ? "#2563eb" : "#d97706",
              }}
            >
              ₪{balance.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ marginTop: 16 }}>
          <select
            style={inputStyle}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">כל התנועות</option>
            <option value="income">הכנסות בלבד</option>
            <option value="expense">הוצאות בלבד</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={cardStyle}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px",
            }}
          >
            <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
              <tr style={{ color: muted, fontSize: 13 }}>
                <th style={{ textAlign: "right", padding: 8 }}>תאריך</th>
                <th style={{ textAlign: "center", padding: 8 }}>סוג</th>
                <th style={{ textAlign: "center", padding: 8 }}>קטגוריה</th>
                <th style={{ textAlign: "right", padding: 8 }}>תיאור</th>
                <th style={{ textAlign: "center", padding: 8 }}>סכום</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
                >
                  <td style={{ padding: 8, fontSize: 13, color: muted }}>
                    {new Date(t.transaction_date).toLocaleDateString("he-IL")}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          t.type === "income"
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        color: t.type === "income" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {t.type === "income" ? "הכנסה" : "הוצאה"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                    {t.category}
                  </td>
                  <td style={{ padding: 8, fontWeight: 600 }}>
                    {t.description}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: 8,
                      fontWeight: 700,
                      fontSize: 16,
                      color: t.type === "income" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {t.type === "income" ? "+" : "-"}₪
                    {t.amount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <button
                      style={{ ...btnSecondary, marginLeft: 4, fontSize: 12 }}
                      onClick={() => handleEdit(t)}
                    >
                      ✏️
                    </button>
                    <button
                      style={{
                        ...btnSecondary,
                        color: "#dc2626",
                        fontSize: 12,
                      }}
                      onClick={() => handleDelete(t.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין תנועות במערכת. לחץ על "הוסף תנועה" להתחיל.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
              {editingTransaction ? "ערוך תנועה" : "הוסף תנועה חדשה"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    תאריך <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.transaction_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transaction_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    סוג תנועה <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    style={inputStyle}
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "income" | "expense",
                        category: "", // Reset category on type change
                      })
                    }
                  >
                    <option value="expense">הוצאה</option>
                    <option value="income">הכנסה</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  קטגוריה <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  style={inputStyle}
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">בחר קטגוריה...</option>
                  {(formData.type === "income"
                    ? INCOME_CATEGORIES
                    : EXPENSE_CATEGORIES
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  סכום (₪) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  style={inputStyle}
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  תיאור <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="תיאור התנועה"
                />
              </div>

              <div>
                <label style={labelStyle}>הערות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="הערות נוספות..."
                />
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
                  {editingTransaction ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

