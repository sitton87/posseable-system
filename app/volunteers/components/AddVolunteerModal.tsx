"use client";

import React, { useState, useEffect } from "react";
import { Volunteer } from "@/type";

// Styles (matching your demo)
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

interface AddVolunteerModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editingVolunteer: Volunteer | null;
  fetchVolunteers: () => void;
}

export default function AddVolunteerModal({
  showModal,
  setShowModal,
  editingVolunteer,
  fetchVolunteers,
}: AddVolunteerModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    kind: "",
    active: true,
    notes: "",
  });

  useEffect(() => {
    if (editingVolunteer) {
      setFormData({
        full_name: editingVolunteer.full_name,
        phone: editingVolunteer.phone || "",
        email: editingVolunteer.email || "",
        kind: editingVolunteer.kind || "",
        active: editingVolunteer.active,
        notes: editingVolunteer.notes || "",
      });
    } else {
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        kind: "",
        active: true,
        notes: "",
      });
    }
  }, [editingVolunteer, showModal]);

  const handleSubmit = async () => {
    if (!formData.full_name.trim()) {
      alert("שם מלא הוא שדה חובה");
      return;
    }

    try {
      const url = editingVolunteer
        ? "/api/volunteers/update"
        : "/api/volunteers/add";
      const method = editingVolunteer ? "PUT" : "POST";
      const body = editingVolunteer
        ? { id: editingVolunteer.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingVolunteer ? "מתנדב עודכן בהצלחה!" : "מתנדב נוסף בהצלחה!");
        setShowModal(false);
        fetchVolunteers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving volunteer:", err);
      alert("שגיאה בשמירת מתנדב");
    }
  };

  if (!showModal) return null;

  return (
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
          {editingVolunteer ? "ערוך מתנדב" : "הוסף מתנדב חדש"}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: muted }}>
              שם מלא *
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              placeholder="הזן שם מלא"
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
              <label
                style={{ fontSize: 13, fontWeight: 600, color: muted }}
              >
                טלפון
              </label>
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
              <label
                style={{ fontSize: 13, fontWeight: 600, color: muted }}
              >
                אימייל
              </label>
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
            <label style={{ fontSize: 13, fontWeight: 600, color: muted }}>
              סוג מתנדב
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.kind}
              onChange={(e) =>
                setFormData({ ...formData, kind: e.target.value })
              }
              placeholder="למשל: מדריך, רפרנט, וכו׳"
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: muted }}>
              הערות
            </label>
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
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
            />
            <label
              htmlFor="active"
              style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              מתנדב פעיל
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
              {editingVolunteer ? "עדכן" : "הוסף"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
