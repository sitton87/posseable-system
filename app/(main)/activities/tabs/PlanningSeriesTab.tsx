"use client";

import { useState, useEffect } from "react";
import { SeasonPlan, ActivitySeries, Activity } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { Search, X, Filter } from "lucide-react";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;
const smallButtonStyle = { fontSize: 12, padding: `${px(spacing.xs)} ${px(spacing.sm)}` };

const ACTIVITY_KINDS = [
  { value: "surf", label: "גלישה" },
  { value: "social", label: "חברתי" },
  { value: "lecture", label: "הדרכה/הרצאה" },
  { value: "preparation", label: "הכנה" },
  { value: "special", label: "אירוע מיוחד" },
  { value: "other", label: "אחר" },
] as const;
const SERIES_STATUS_OPTIONS = ["פעיל", "בהקמה", "הוקפא", "נסגר"] as const;

export default function PlanningSeriesTab() {
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [seriesList, setSeriesList] = useState<ActivitySeries[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Data needed for forms & display
  const [groups, setGroups] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Filters
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | "all">("all");
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterGroup, setFilterGroup] = useState<string>("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<ActivitySeries | null>(null);
  const [seriesModalSeason, setSeriesModalSeason] = useState<SeasonPlan | null>(null);
  const [seriesSaving, setSeriesSaving] = useState(false);
  
  const [seriesForm, setSeriesForm] = useState({
    name: "",
    status: "פעיל",
    start_date: "",
    end_date: "",
    lead_national_id: "",
    notes: "",
    is_default: false,
    group_id: "",
    schedule_type: "Fixed",
    default_day: "",
    default_start_time: "",
    default_end_time: "",
    frequency: "Weekly",
    occurrences_count: "",
    manual_activities: [] as Array<{ date: string; start_time: string; end_time: string }>,
    default_activity_kind: ACTIVITY_KINDS[0].value,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [selectedSeasonId]);

  const fetchInitialData = async () => {
    try {
      const seasonsRes = await fetch("/api/seasons");
      const seasonsData = await seasonsRes.json();
      if (seasonsData.success) {
        setSeasons(seasonsData.seasons);
        const active = seasonsData.seasons.find((s: SeasonPlan) => {
            const now = new Date();
            return new Date(s.start_date) <= now && new Date(s.end_date) >= now;
        });
        if (active) setSelectedSeasonId(active.id);
        else if (seasonsData.seasons.length > 0) setSelectedSeasonId(seasonsData.seasons[0].id);
      }

      const groupsRes = await fetch("/api/groups");
      const groupsData = await groupsRes.json();
      if (groupsData.success) setGroups(groupsData.groups);

      const [staffRes, mgmtRes] = await Promise.all([
        fetch("/api/volunteers?classification=staff"),
        fetch("/api/volunteers?classification=management"),
      ]);
      const staffD = await staffRes.json();
      const mgmtD = await mgmtRes.json();
      const allStaff = [
        ...(staffD.success ? staffD.volunteers : []),
        ...(mgmtD.success ? mgmtD.volunteers : [])
      ];
      const uniqueStaff = Array.from(new Map(allStaff.map(item => [item.national_id, item])).values());
      setStaffList(uniqueStaff);

    } catch (err) {
      console.error("Error fetching initial data", err);
    }
  };

  const fetchSeries = async () => {
    setLoading(true);
    try {
      let url = "/api/series";
      if (selectedSeasonId !== "all") {
        url += `?season_id=${selectedSeasonId}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSeriesList(data.series);
      } else {
        setSeriesList([]);
      }
    } catch (err) {
      console.error("Error fetching series", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterText("");
    setFilterStatus("");
    setFilterGroup("");
  };

  const filteredSeries = seriesList.filter(s => {
      if (filterText && !s.name.includes(filterText)) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      if (filterGroup && s.group_id !== filterGroup) return false;
      return true;
  });

  const openModal = (series?: ActivitySeries) => {
    const seasonIdToUse = (series ? series.season_id : (selectedSeasonId === "all" ? seasons[0]?.id : selectedSeasonId));
    const season = seasons.find(s => s.id === Number(seasonIdToUse));
    
    if (!season) {
        alert("יש לבחור עונה כדי ליצור סדרה");
        return;
    }

    setSeriesModalSeason(season);
    setEditingSeries(series || null);

    let initialDate = "";
    if (series?.start_date) {
      initialDate = new Date(series.start_date).toISOString().split("T")[0];
    } else if (season.start_date) {
      initialDate = new Date(season.start_date).toISOString().split("T")[0];
    }

    setSeriesForm({
      name: series?.name || "",
      status: series?.status || "פעיל",
      start_date: initialDate,
      end_date: series?.end_date ? new Date(series.end_date).toISOString().split("T")[0] : "",
      lead_national_id: series?.lead_national_id || "",
      notes: series?.notes || "",
      is_default: Boolean(series?.is_default),
      group_id: series?.group_id || "",
      schedule_type: series?.schedule_type || "Fixed",
      default_day: series?.default_day || "",
      default_start_time: series?.default_start_time ? series.default_start_time.substring(0, 5) : "",
      default_end_time: series?.default_end_time ? series.default_end_time.substring(0, 5) : "",
      frequency: series?.frequency || "Weekly",
      occurrences_count: series?.occurrences_count || "",
      manual_activities: [], 
      default_activity_kind: series?.default_activity_kind || ACTIVITY_KINDS[0].value,
    });
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSeries(null);
    setSeriesModalSeason(null);
  };

  const handleSubmit = async () => {
    if (!seriesModalSeason) return;
    if (!seriesForm.name.trim()) {
      alert("שם הסדרה הוא שדה חובה");
      return;
    }
    
    try {
      setSeriesSaving(true);
      const payload: any = {
        season_id: seriesModalSeason.id,
        name: seriesForm.name.trim(),
        status: seriesForm.status || null,
        start_date: seriesForm.start_date || null,
        end_date: seriesForm.end_date || null,
        lead_national_id: seriesForm.lead_national_id || null,
        notes: seriesForm.notes || null,
        is_default: seriesForm.is_default,
        group_id: seriesForm.group_id || null,
        schedule_type: seriesForm.schedule_type,
        default_day: seriesForm.default_day || null,
        default_start_time: seriesForm.default_start_time || null,
        default_end_time: seriesForm.default_end_time || null,
        frequency: seriesForm.frequency || null,
        occurrences_count: seriesForm.occurrences_count || null,
        manual_activities: seriesForm.schedule_type === "Manual" ? seriesForm.manual_activities : [],
        default_activity_kind: seriesForm.default_activity_kind,
      };

      const url = editingSeries ? "/api/series/update" : "/api/series/add";
      const method = editingSeries ? "PUT" : "POST";
      if (editingSeries) payload.id = editingSeries.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (data.success) {
        alert(editingSeries ? "סדרה עודכנה בהצלחה!" : "סדרה נוספה בהצלחה!");
        closeModal();
        fetchSeries();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving series", err);
      alert("שגיאה בשמירה");
    } finally {
      setSeriesSaving(false);
    }
  };

  const handleDelete = async (series: ActivitySeries) => {
    if (!confirm(`מחיקת הסדרה "${series.name}" תמחק גם את כל הפעילויות המשויכות אליה. להמשיך?`)) return;
    try {
      const res = await fetch(`/api/series/update?id=${series.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("הסדרה נמחקה בהצלחה");
        fetchSeries();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      alert("שגיאה במחיקת סדרה");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        {/* Header Row: Title + Add Button + Global Season Select */}
        <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            flexWrap: "wrap", 
            gap: spacing.md,
            marginBottom: spacing.md 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>רשימת סדרות</h2>
            <select 
                style={{ ...inputStyle, width: "auto", minWidth: 200, margin: 0 }}
                value={selectedSeasonId}
                onChange={(e) => {
                    const val = e.target.value;
                    setSelectedSeasonId(val === "all" ? "all" : Number(val));
                }}
            >
                {seasons.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.year})</option>
                ))}
            </select>
          </div>
          <Button onClick={() => openModal()}>+ הוסף סדרה</Button>
        </div>
        
        {/* Filters Row - Integrated nicely */}
        <div style={{ 
            display: "flex", 
            gap: spacing.sm, 
            paddingTop: spacing.sm, 
            borderTop: `1px solid ${colors.borderMuted}`, 
            alignItems: "center", 
            flexWrap: "wrap" 
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: muted }}>
                <Filter size={14} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>סינון:</span>
            </div>
            
            <input 
                type="text" 
                placeholder="חיפוש לפי שם..." 
                style={{ ...inputStyle, width: 150, margin: 0, fontSize: 13, height: 36 }}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />

            <select 
                style={{ ...inputStyle, width: 140, margin: 0, fontSize: 13, height: 36 }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="">כל הסטטוסים</option>
                {SERIES_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
                style={{ ...inputStyle, width: 160, margin: 0, fontSize: 13, height: 36 }}
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
            >
                <option value="">כל הקבוצות</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>

            {(filterText || filterStatus || filterGroup) && (
                <button 
                    onClick={clearFilters} 
                    style={{ 
                        background: "none", 
                        border: "none", 
                        fontSize: 12, 
                        color: colors.danger, 
                        cursor: "pointer", 
                        display: "flex", 
                        alignItems: "center",
                        gap: 4
                    }}
                >
                    <X size={12} /> ניקוי פילטרים
                </button>
            )}
        </div>
        
        {/* Table */}
        <div style={{ overflowX: "auto", marginTop: spacing.sm }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
              <tr style={{ color: muted, fontSize: 13 }}>
                <th style={{ textAlign: "center", padding: 8 }}>שם הסדרה</th>
                <th style={{ textAlign: "center", padding: 8 }}>קבוצה</th>
                <th style={{ textAlign: "center", padding: 8 }}>סוג</th>
                <th style={{ textAlign: "center", padding: 8 }}>תזמון</th>
                <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={6} style={{ textAlign: "center", padding: 20 }}>טוען...</td></tr>
              ) : filteredSeries.length === 0 ? (
                 <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: muted }}>לא נמצאו סדרות.</td></tr>
              ) : filteredSeries.map((series) => (
                  <tr key={series.id} style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{series.name}</td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                        {series.group_name || "-"}
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      {ACTIVITY_KINDS.find(k => k.value === series.default_activity_kind)?.label || series.default_activity_kind || "-"}
                    </td>
                    <td style={{ textAlign: "center", padding: 8, fontSize: 12 }}>
                        {series.schedule_type === 'Fixed' ? 
                            `${series.frequency === 'Weekly' ? 'שבועי' : series.frequency === 'Daily' ? 'יומי' : series.frequency === 'Monthly' ? 'חודשי' : series.frequency} (${series.occurrences_count || 0} חזרות)` : 
                            'ידני'}
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                       <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(16, 185, 129, 0.1)", color: "#059669", fontSize: 12, fontWeight: 600 }}>
                         {series.status}
                       </span>
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      <div style={{ display: "flex", gap: spacing.xs, justifyContent: "center" }}>
                        <Button variant="secondary" style={smallButtonStyle} onClick={() => openModal(series)} title="עריכה">✏️</Button>
                        <Button variant="secondary" style={{ ...smallButtonStyle, color: colors.danger }} onClick={() => handleDelete(series)} title="מחיקה">🗑️</Button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Modal code is identical as before, omitted for brevity in thought but included in write tool */}
      <Modal
        open={showModal}
        onClose={closeModal}
        width="min(800px, 95vw)"
        style={{ padding: spacing.xxl, maxHeight: "90vh", overflowY: "auto" }}
      >
        {seriesModalSeason && (
          <>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 800 }}>
              {editingSeries ? "ערוך סדרת פעילויות" : "הוסף סדרת פעילויות חדשה"}
            </h3>
            <div style={{ color: muted, fontSize: 13, marginBottom: spacing.sm }}>
              עונה: <strong>{seriesModalSeason.name}</strong>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: spacing.md }}>
                <div>
                  <label style={labelStyle}>שם הסדרה <span style={{ color: colors.danger }}>*</span></label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={seriesForm.name}
                    onChange={(e) => setSeriesForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>סטטוס</label>
                  <select style={inputStyle} value={seriesForm.status} onChange={(e) => setSeriesForm((prev) => ({ ...prev, status: e.target.value }))}>
                    <option value="">ללא</option>
                    {SERIES_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>סוג פעילות</label>
                  <select style={inputStyle} value={seriesForm.default_activity_kind} onChange={(e) => setSeriesForm((prev) => ({ ...prev, default_activity_kind: e.target.value }))}>
                    {ACTIVITY_KINDS.map(kind => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>מנהל/ת סדרה</label>
                  <select style={inputStyle} value={seriesForm.lead_national_id} onChange={(e) => setSeriesForm((prev) => ({ ...prev, lead_national_id: e.target.value }))}>
                    <option value="">בחר מנהל/ת</option>
                    {staffList.map(staff => <option key={staff.national_id} value={staff.national_id}>{staff.full_name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: spacing.md }}>
                <div>
                  <label style={labelStyle}>קבוצה משויכת</label>
                  <select style={inputStyle} value={seriesForm.group_id} onChange={(e) => setSeriesForm((prev) => ({ ...prev, group_id: e.target.value }))}>
                    <option value="">בחר קבוצה</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>סוג תזמון</label>
                  <select style={inputStyle} value={seriesForm.schedule_type} onChange={(e) => setSeriesForm((prev) => ({ ...prev, schedule_type: e.target.value }))}>
                    <option value="Fixed">קבוע (ימים ושעות)</option>
                    <option value="Manual">ידני</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>תדירות</label>
                  <select style={inputStyle} value={seriesForm.frequency} onChange={(e) => setSeriesForm((prev) => ({ ...prev, frequency: e.target.value }))} disabled={seriesForm.schedule_type === "Manual"}>
                    <option value="Weekly">שבועי</option>
                    <option value="Daily">יומי</option>
                    <option value="Monthly">חודשי</option>
                  </select>
                </div>
              </div>

              {seriesForm.schedule_type === "Fixed" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: spacing.md }}>
                    <div>
                      <label style={labelStyle}>תאריך התחלה (וקביעת יום)</label>
                      <input
                        type="date"
                        style={inputStyle}
                        value={seriesForm.start_date}
                        min={seriesModalSeason ? new Date(seriesModalSeason.start_date).toISOString().split('T')[0] : undefined}
                        max={seriesModalSeason ? new Date(seriesModalSeason.end_date).toISOString().split('T')[0] : undefined}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          const day = date.getDay() + 1;
                          setSeriesForm((prev) => ({ ...prev, start_date: e.target.value, default_day: day.toString() }));
                        }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.xs }}>
                        <div>
                          <label style={labelStyle}>שעת התחלה</label>
                          <input type="time" style={inputStyle} value={seriesForm.default_start_time} onChange={(e) => setSeriesForm((prev) => ({ ...prev, default_start_time: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>שעת סיום</label>
                          <input type="time" style={inputStyle} value={seriesForm.default_end_time} onChange={(e) => setSeriesForm((prev) => ({ ...prev, default_end_time: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                      <label style={labelStyle}>כמות חזרות</label>
                      <input type="number" style={inputStyle} value={seriesForm.occurrences_count} onChange={(e) => setSeriesForm((prev) => ({ ...prev, occurrences_count: e.target.value }))} min="1" placeholder="כמה פעילויות ליצור?" />
                    </div>
                </div>
              )}

              {seriesForm.schedule_type === "Manual" && (
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                  <label style={labelStyle}>תאריכים ידניים</label>
                  {seriesForm.manual_activities.map((activity, index) => (
                    <div key={index} style={{ display: "flex", gap: spacing.sm, alignItems: "center" }}>
                      <input
                        type="date"
                        style={{ ...inputStyle, flex: 1 }}
                        value={activity.date}
                        min={seriesModalSeason ? new Date(seriesModalSeason.start_date).toISOString().split('T')[0] : undefined}
                        max={seriesModalSeason ? new Date(seriesModalSeason.end_date).toISOString().split('T')[0] : undefined}
                        onChange={(e) => {
                          const newActivities = [...seriesForm.manual_activities];
                          newActivities[index].date = e.target.value;
                          setSeriesForm(prev => ({ ...prev, manual_activities: newActivities }));
                        }}
                      />
                      <input type="time" style={{ ...inputStyle, width: 100 }} value={activity.start_time} onChange={(e) => {
                          const newActivities = [...seriesForm.manual_activities];
                          newActivities[index].start_time = e.target.value;
                          setSeriesForm(prev => ({ ...prev, manual_activities: newActivities }));
                      }} />
                      <input type="time" style={{ ...inputStyle, width: 100 }} value={activity.end_time} onChange={(e) => {
                          const newActivities = [...seriesForm.manual_activities];
                          newActivities[index].end_time = e.target.value;
                          setSeriesForm(prev => ({ ...prev, manual_activities: newActivities }));
                      }} />
                      <Button variant="secondary" style={{ padding: "4px 8px", color: colors.danger }} onClick={() => {
                          const newActivities = seriesForm.manual_activities.filter((_, i) => i !== index);
                          setSeriesForm(prev => ({ ...prev, manual_activities: newActivities }));
                      }}>🗑️</Button>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => {
                      setSeriesForm(prev => ({ ...prev, manual_activities: [...prev.manual_activities, { date: "", start_time: "", end_time: "" }] }));
                  }}>+ הוסף תאריך</Button>
                </div>
              )}

              <div style={{ display: "flex", gap: spacing.md, justifyContent: "flex-end", marginTop: spacing.md }}>
                <Button variant="secondary" onClick={closeModal}>ביטול</Button>
                <Button onClick={handleSubmit} disabled={seriesSaving}>{seriesSaving ? "שומר..." : editingSeries ? "עדכן" : "הוסף"}</Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

