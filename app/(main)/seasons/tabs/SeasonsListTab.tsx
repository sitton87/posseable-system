"use client";

import { useState, useEffect, Fragment } from "react";
import { SeasonPlan, ActivitySeries } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;
const smallButtonStyle = { fontSize: 12, padding: `${px(spacing.xs)} ${px(spacing.sm)}` };

export default function SeasonsListTab() {
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonPlan | null>(null);
  
  // Filtering
  const [filterText, setFilterText] = useState("");

  // Expandable Rows State
  const [expandedSeasons, setExpandedSeasons] = useState<Record<number, boolean>>({});
  const [seasonSeries, setSeasonSeries] = useState<Record<number, ActivitySeries[]>>({});
  const [seriesLoading, setSeriesLoading] = useState<Record<number, boolean>>({});

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

  const fetchSeasonSeries = async (seasonId: number, force = false) => {
    if (seriesLoading[seasonId]) return;
    if (!force && seasonSeries[seasonId]) return;

    setSeriesLoading((prev) => ({ ...prev, [seasonId]: true }));
    try {
      const res = await fetch(`/api/series?season_id=${seasonId}`);
      const data = await res.json();
      if (data.success) {
        setSeasonSeries((prev) => ({ ...prev, [seasonId]: data.series }));
      }
    } catch (err) {
      console.error("Error fetching season series:", err);
    } finally {
      setSeriesLoading((prev) => ({ ...prev, [seasonId]: false }));
    }
  };

  const toggleSeasonExpand = (season: SeasonPlan) => {
    const nextExpanded = !expandedSeasons[season.id];
    setExpandedSeasons((prev) => ({ ...prev, [season.id]: nextExpanded }));
    if (nextExpanded) {
      fetchSeasonSeries(season.id);
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

  const filteredSeasons = seasons.filter(s => 
    s.name.includes(filterText) || s.year.toString().includes(filterText)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        {/* Header with Search and Add Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.md }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>רשימת עונות</h2>
            
            {/* Integrated Search Bar */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search size={16} style={{ position: "absolute", right: 10, color: muted }} />
                <input 
                    type="text" 
                    placeholder="חיפוש עונה..." 
                    style={{ ...inputStyle, paddingRight: 32, width: 200, margin: 0, height: 36, fontSize: 13 }}
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
                {filterText && (
                    <button 
                        onClick={() => setFilterText("")}
                        style={{ position: "absolute", left: 10, background: "none", border: "none", cursor: "pointer", color: muted }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
          </div>
          <Button onClick={handleAdd}>+ הוסף עונה</Button>
        </div>

        {/* Table inside the same Card */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
              <tr style={{ color: muted, fontSize: 13 }}>
                <th style={{ width: 40 }}></th>
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
                 <tr><td colSpan={7} style={{ textAlign: "center", padding: 20 }}>טוען...</td></tr>
              ) : filteredSeasons.map((s) => {
                const start = new Date(s.start_date);
                const end = new Date(s.end_date);
                const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const isExpanded = expandedSeasons[s.id];

                return (
                  <Fragment key={s.id}>
                    <tr style={{ borderTop: "1px solid rgba(15,23,42,0.08)", background: isExpanded ? colors.surfaceAlt : "transparent" }}>
                      <td style={{ textAlign: "center" }}>
                        <button 
                            onClick={() => toggleSeasonExpand(s)}
                            style={{ border: "none", background: "none", cursor: "pointer", color: muted }}
                        >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
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
                    {isExpanded && (
                        <tr>
                            <td colSpan={7} style={{ padding: 0 }}>
                                <div style={{ background: colors.surfaceAlt, padding: spacing.md, borderBottom: `1px solid ${colors.borderMuted}` }}>
                                    <h4 style={{ margin: "0 0 10px 0", fontSize: 14 }}>סדרות פעילות ({seasonSeries[s.id]?.length || 0})</h4>
                                    {seriesLoading[s.id] ? (
                                        <div style={{ fontSize: 13, color: muted }}>טוען סדרות...</div>
                                    ) : (seasonSeries[s.id]?.length || 0) === 0 ? (
                                        <div style={{ fontSize: 13, color: muted }}>אין סדרות משויכות לעונה זו.</div>
                                    ) : (
                                        <div style={{ display: "grid", gap: 8 }}>
                                            {(seasonSeries[s.id] || []).map(series => (
                                                <div key={series.id} style={{ 
                                                    background: "white", 
                                                    padding: 8, 
                                                    borderRadius: 6, 
                                                    border: `1px solid ${colors.borderMuted}`,
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    fontSize: 13
                                                }}>
                                                    <div>
                                                        <strong>{series.name}</strong>
                                                        <span style={{ margin: "0 8px", color: muted }}>|</span>
                                                        <span>{series.group_name || "ללא קבוצה"}</span>
                                                        <span style={{ margin: "0 8px", color: muted }}>|</span>
                                                        <span style={{ color: series.status === 'פעיל' ? colors.success : colors.textMuted }}>{series.status}</span>
                                                    </div>
                                                    <div style={{ color: muted }}>
                                                        {series.schedule_type === 'Fixed' ? 
                                                            `${series.frequency === 'Weekly' ? 'שבועי' : series.frequency === 'Daily' ? 'יומי' : series.frequency === 'Monthly' ? 'חודשי' : series.frequency} (${series.occurrences_count || 0} חזרות)` : 
                                                            'תזמון ידני'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                  </Fragment>
                );
              })}
              {!loading && filteredSeasons.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 20, color: muted }}>אין עונות במערכת.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} width="min(640px, 95vw)" style={{ padding: spacing.xxl }}>
        {/* Same Modal Content */}
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
