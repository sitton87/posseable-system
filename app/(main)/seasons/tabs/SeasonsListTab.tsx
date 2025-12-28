"use client";

import { useState, useEffect, Fragment } from "react";
import { SeasonPlan } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { inputStyle, labelStyle } from "@/app/styles/components";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;
const smallButtonStyle = { fontSize: 12, padding: `${px(spacing.xs)} ${px(spacing.sm)}` };

export default function SeasonsListTab() {
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonPlan | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seasons");
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    } catch (err) {
      console.error("Error fetching seasons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSeason(null);
    setFormData({
      name: "",
      year: new Date().getFullYear().toString(),
      start_date: "",
      end_date: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (season: SeasonPlan) => {
    setEditingSeason(season);
    setFormData({
      name: season.name,
      year: season.year.toString(),
      start_date: season.start_date.toString().split("T")[0],
      end_date: season.end_date.toString().split("T")[0],
      notes: season.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.year || !formData.start_date || !formData.end_date) {
      alert("שם, שנה, תאריך התחלה וסיום הם שדות חובה");
      return;
    }

    try {
      const url = editingSeason ? "/api/seasons/update" : "/api/seasons/add";
      const method = editingSeason ? "PUT" : "POST";
      const body: any = {
        name: formData.name,
        year: parseInt(formData.year),
        start_date: formData.start_date,
        end_date: formData.end_date,
        notes: formData.notes || null,
      };
      if (editingSeason) body.id = editingSeason.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        alert(editingSeason ? "עונה עודכנה בהצלחה!" : "עונה נוספה בהצלחה!");
        setShowModal(false);
        fetchSeasons();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving season:", err);
      alert("שגיאה בשמירת עונה");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את העונה?")) return;
    try {
      const res = await fetch(`/api/seasons/update?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("עונה נמחקה בהצלחה!");
        fetchSeasons();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      alert("שגיאה במחיקת עונה");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>רשימת עונות</h2>
          <Button onClick={handleAdd}>+ הוסף עונה</Button>
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
              <tr style={{ color: muted, fontSize: 13 }}>
                <th style={{ textAlign: "center", padding: 8 }}>שם העונה</th>
                <th style={{ textAlign: "center", padding: 8 }}>שנה</th>
                <th style={{ textAlign: "center", padding: 8 }}>תאריך התחלה</th>
                <th style={{ textAlign: "center", padding: 8 }}>תאריך סיום</th>
                <th style={{ textAlign: "center", padding: 8 }}>משך (ימים)</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={6} style={{ textAlign: "center", padding: 20 }}>טוען...</td></tr>
              ) : seasons.map((s) => {
                const start = new Date(s.start_date);
                const end = new Date(s.end_date);
                const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={s.id} style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{s.name}</td>
                    <td style={{ textAlign: "center", padding: 8, color: muted }}>{s.year}</td>
                    <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>{start.toLocaleDateString("he-IL")}</td>
                    <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>{end.toLocaleDateString("he-IL")}</td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}>
                        {duration} ימים
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      <div style={{ display: "flex", gap: spacing.xs, justifyContent: "center" }}>
                        <Button variant="secondary" style={smallButtonStyle} onClick={() => handleEdit(s)} title="עריכה">✏️</Button>
                        <Button variant="secondary" style={{ ...smallButtonStyle, color: colors.danger }} onClick={() => handleDelete(s.id)} title="מחיקה">🗑️</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && seasons.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: muted }}>אין עונות במערכת.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} width="min(640px, 95vw)" style={{ padding: spacing.xxl }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>{editingSeason ? "ערוך עונה" : "הוסף עונה חדשה"}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          <div>
            <label style={labelStyle}>שם העונה <span style={{ color: colors.danger }}>*</span></label>
            <input type="text" style={inputStyle} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>שנה <span style={{ color: colors.danger }}>*</span></label>
            <input type="number" style={inputStyle} value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} min="2000" max="2100" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
            <div>
              <label style={labelStyle}>תאריך התחלה <span style={{ color: colors.danger }}>*</span></label>
              <input type="date" style={inputStyle} value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>תאריך סיום <span style={{ color: colors.danger }}>*</span></label>
              <input type="date" style={inputStyle} value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>הערות</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: spacing.md, marginTop: spacing.sm, justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>ביטול</Button>
            <Button onClick={handleSubmit}>{editingSeason ? "עדכן" : "הוסף"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

