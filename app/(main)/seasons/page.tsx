"use client";

import { useState, useEffect, Fragment } from "react";
import { SeasonPlan, Activity, ActivitySeries } from "@/type";

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

const ACTIVITY_KINDS = [
  "גלישה",
  "הכנה",
  "אירוע מיוחד",
  "הדרכה",
  "אחר",
] as const;
const ACTIVITY_STATUS = ["מתוכנן", "פעיל", "הושלם", "בוטל"] as const;
const SERIES_STATUS_OPTIONS = ["פעיל", "בהקמה", "הוקפא", "נסגר"] as const;

type SeriesWithActivities = ActivitySeries & {
  activities?: Activity[];
};

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonPlan | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<
    Record<number, boolean>
  >({});
  const [seasonSeries, setSeasonSeries] = useState<
    Record<number, SeriesWithActivities[]>
  >({});
  const [seriesLoading, setSeriesLoading] = useState<Record<number, boolean>>(
    {}
  );
  const [seriesModalSeason, setSeriesModalSeason] = useState<SeasonPlan | null>(
    null
  );
  const [editingSeries, setEditingSeries] = useState<ActivitySeries | null>(
    null
  );
  const [seriesForm, setSeriesForm] = useState({
    name: "",
    status: "פעיל",
    start_date: "",
    end_date: "",
    lead_national_id: "",
    notes: "",
    is_default: false,
  });
  const [seriesSaving, setSeriesSaving] = useState(false);
  const [activityModalSeason, setActivityModalSeason] =
    useState<SeasonPlan | null>(null);
  const [activityModalSeries, setActivityModalSeries] =
    useState<ActivitySeries | null>(null);
  const [activityForm, setActivityForm] = useState({
    kind: ACTIVITY_KINDS[0] as Activity["kind"],
    status: ACTIVITY_STATUS[0] as Activity["status"],
    activity_date: "",
    start_time: "",
    end_time: "",
    location: "",
    capacity: "",
    notes: "",
  });
  const [activitySaving, setActivitySaving] = useState(false);
  const [expandedSeries, setExpandedSeries] = useState<Record<number, boolean>>(
    {}
  );

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
      const res = await fetch("/api/seasons", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    } catch (err) {
      console.error("Error fetching seasons:", err);
      alert("שגיאה בטעינת עונות");
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
    if (
      !formData.name.trim() ||
      !formData.year ||
      !formData.start_date ||
      !formData.end_date
    ) {
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

      if (editingSeason) {
        body.id = editingSeason.id;
      }

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
      const res = await fetch(`/api/seasons/update?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        alert("עונה נמחקה בהצלחה!");
        fetchSeasons();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting season:", err);
      alert("שגיאה במחיקת עונה");
    }
  };

  const toggleSeasonExpand = (season: SeasonPlan) => {
    const nextExpanded = !expandedSeasons[season.id];
    setExpandedSeasons((prev) => ({ ...prev, [season.id]: nextExpanded }));
    if (nextExpanded) {
      fetchSeasonSeries(season.id, true);
    } else {
      setExpandedSeries((prev) => {
        const updated = { ...prev };
        (seasonSeries[season.id] || []).forEach((series) => {
          if (updated[series.id]) {
            delete updated[series.id];
          }
        });
        return updated;
      });
    }
  };

  const fetchSeasonSeries = async (seasonId: number, force = false) => {
    if (seriesLoading[seasonId]) return;
    if (!force && seasonSeries[seasonId]) {
      return;
    }
    setSeriesLoading((prev) => ({ ...prev, [seasonId]: true }));
    try {
      const params = new URLSearchParams({
        season_id: seasonId.toString(),
        includeActivities: "true",
        ts: Date.now().toString(),
      });
      const res = await fetch(`/api/series?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setSeasonSeries((prev) => ({
          ...prev,
          [seasonId]: data.series,
        }));
        setExpandedSeries((prev) => {
          const updated = { ...prev };
          const ids = new Set<number>(
            data.series.map((s: ActivitySeries) => s.id)
          );
          Object.keys(updated).forEach((key) => {
            const numeric = Number(key);
            if (!ids.has(numeric)) {
              delete updated[numeric];
            }
          });
          return updated;
        });
      }
    } catch (err) {
      console.error("Error fetching season series:", err);
      alert("שגיאה בטעינת סדרות הפעילות של העונה");
    } finally {
      setSeriesLoading((prev) => ({ ...prev, [seasonId]: false }));
    }
  };

  const openActivityModal = (season: SeasonPlan, series: ActivitySeries) => {
    setActivityModalSeason(season);
    setActivityModalSeries(series);
    const baseDate =
      series.start_date || season.start_date
        ? new Date(series.start_date || season.start_date)
            .toISOString()
            .split("T")[0]
        : "";
    setActivityForm({
      kind: ACTIVITY_KINDS[0] as Activity["kind"],
      status: ACTIVITY_STATUS[0] as Activity["status"],
      activity_date: baseDate,
      start_time: "",
      end_time: "",
      location: "",
      capacity: "",
      notes: "",
    });
  };

  const closeActivityModal = () => {
    setActivityModalSeason(null);
    setActivityModalSeries(null);
  };

  const handleActivitySubmit = async () => {
    if (!activityModalSeason || !activityModalSeries) return;
    if (!activityForm.activity_date) {
      alert("יש לבחור תאריך פעילות");
      return;
    }

    try {
      setActivitySaving(true);
      const payload: any = {
        season_id: activityModalSeason.id,
        series_id: activityModalSeries.id,
        kind: activityForm.kind,
        status: activityForm.status,
        activity_date: activityForm.activity_date,
        start_time: activityForm.start_time || null,
        end_time: activityForm.end_time || null,
        location: activityForm.location || null,
        capacity: activityForm.capacity
          ? parseInt(activityForm.capacity, 10)
          : null,
        notes: activityForm.notes || null,
      };

      const res = await fetch("/api/activities/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert("פעילות נוספה לעונה בהצלחה!");
        closeActivityModal();
        fetchSeasonSeries(activityModalSeason.id, true);
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error adding activity:", err);
      alert("שגיאה בשמירת הפעילות");
    } finally {
      setActivitySaving(false);
    }
  };

  const openSeriesModal = (season: SeasonPlan, series?: ActivitySeries) => {
    setSeriesModalSeason(season);
    setEditingSeries(series ?? null);
    setSeriesForm({
      name: series?.name || "",
      status: series?.status || "פעיל",
      start_date: series?.start_date
        ? new Date(series.start_date).toISOString().split("T")[0]
        : "",
      end_date: series?.end_date
        ? new Date(series.end_date).toISOString().split("T")[0]
        : "",
      lead_national_id: series?.lead_national_id || "",
      notes: series?.notes || "",
      is_default: Boolean(series?.is_default),
    });
  };

  const closeSeriesModal = () => {
    setSeriesModalSeason(null);
    setEditingSeries(null);
    setSeriesForm({
      name: "",
      status: "פעיל",
      start_date: "",
      end_date: "",
      lead_national_id: "",
      notes: "",
      is_default: false,
    });
  };

  const handleSeriesSubmit = async () => {
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
      };
      const url = editingSeries ? "/api/series/update" : "/api/series/add";
      const method = editingSeries ? "PUT" : "POST";
      if (editingSeries) {
        payload.id = editingSeries.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert(editingSeries ? "סדרה עודכנה בהצלחה!" : "סדרה נוספה בהצלחה!");
        closeSeriesModal();
        fetchSeasonSeries(seriesModalSeason.id, true);
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving series:", err);
      alert("שגיאה בשמירת סדרה");
    } finally {
      setSeriesSaving(false);
    }
  };

  const handleSeriesDelete = async (
    season: SeasonPlan,
    series: ActivitySeries
  ) => {
    if (
      !confirm(
        `מחיקת הסדרה "${series.name}" תמחק גם את כל הפעילויות המשויכות אליה. האם להמשיך?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/series/update?id=${series.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        alert("הסדרה נמחקה בהצלחה");
        fetchSeasonSeries(season.id, true);
        setExpandedSeries((prev) => {
          if (!prev[series.id]) return prev;
          const updated = { ...prev };
          delete updated[series.id];
          return updated;
        });
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting series:", err);
      alert("שגיאה במחיקת סדרה");
    }
  };

  const toggleSeriesExpand = (seriesId: number) => {
    setExpandedSeries((prev) => ({
      ...prev,
      [seriesId]: !prev[seriesId],
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען עונות...</div>
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
              🗓️ ניהול עונות
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {seasons.length} עונות במערכת
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף עונה
          </button>
        </div>
      </div>

      {/* Seasons Table */}
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
                <th style={{ textAlign: "right", padding: 8 }}>שם העונה</th>
                <th style={{ textAlign: "center", padding: 8 }}>שנה</th>
                <th style={{ textAlign: "center", padding: 8 }}>תאריך התחלה</th>
                <th style={{ textAlign: "center", padding: 8 }}>תאריך סיום</th>
                <th style={{ textAlign: "center", padding: 8 }}>משך (ימים)</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => {
                const start = new Date(s.start_date);
                const end = new Date(s.end_date);
                const duration = Math.ceil(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <Fragment key={s.id}>
                    <tr style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}>
                      <td style={{ padding: 8, fontWeight: 600 }}>{s.name}</td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: 8,
                          color: muted,
                        }}
                      >
                        {s.year}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: 8,
                          fontSize: 13,
                        }}
                      >
                        {start.toLocaleDateString("he-IL")}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: 8,
                          fontSize: 13,
                        }}
                      >
                        {end.toLocaleDateString("he-IL")}
                      </td>
                      <td style={{ textAlign: "center", padding: 8 }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            background: "rgba(59, 130, 246, 0.1)",
                            color: "#2563eb",
                          }}
                        >
                          {duration} ימים
                        </span>
                      </td>
                      <td style={{ textAlign: "center", padding: 8 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            justifyContent: "center",
                          }}
                        >
                          <button
                            style={{ ...btnSecondary, fontSize: 12 }}
                            onClick={() => toggleSeasonExpand(s)}
                          >
                            {expandedSeasons[s.id] ? "הסתר" : "צפייה"}
                          </button>
                          <button
                            style={{ ...btnSecondary, fontSize: 12 }}
                            onClick={() => handleEdit(s)}
                          >
                            ✏️
                          </button>
                          <button
                            style={{
                              ...btnSecondary,
                              fontSize: 12,
                              color: "#dc2626",
                            }}
                            onClick={() => handleDelete(s.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedSeasons[s.id] && (
                      <tr>
                        <td colSpan={6} style={{ background: "#f8fafc" }}>
                          <div
                            style={{
                              padding: 16,
                              borderRadius: 10,
                              border: "1px solid rgba(15,23,42,0.08)",
                              marginTop: -8,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 700 }}>
                                  סדרות פעילות בעונה {s.name}
                                </div>
                                <div style={{ color: muted, fontSize: 13 }}>
                                  סה״כ {seasonSeries[s.id]?.length || 0} סדרות
                                  פעילות
                                </div>
                              </div>
                              <button
                                style={btnPrimary}
                                onClick={() => openSeriesModal(s)}
                              >
                                + הוסף סדרת פעילויות
                              </button>
                            </div>
                            {seriesLoading[s.id] ? (
                              <div style={{ textAlign: "center", padding: 20 }}>
                                טוען סדרות...
                              </div>
                            ) : (seasonSeries[s.id]?.length || 0) === 0 ? (
                              <div style={{ padding: 12, color: muted }}>
                                אין סדרות פעילות לעונה זו. לחץ על "הוסף סדרת
                                פעילויות" כדי להתחיל.
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 16,
                                }}
                              >
                                {(seasonSeries[s.id] || []).map((series) => (
                                  <div
                                    key={series.id}
                                    style={{
                                      background: "#fff",
                                      borderRadius: 10,
                                      border: "1px solid rgba(15,23,42,0.08)",
                                      padding: 16,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        gap: 12,
                                      }}
                                    >
                                      <div>
                                        <div
                                          style={{
                                            fontWeight: 700,
                                            fontSize: 16,
                                          }}
                                        >
                                          {series.name}
                                        </div>
                                        <div
                                          style={{ color: muted, fontSize: 13 }}
                                        >
                                          {series.status || "בלי סטטוס"} ·{" "}
                                          {series.activities_count ??
                                            series.activities?.length ??
                                            0}{" "}
                                          פעילויות
                                          {series.start_date
                                            ? ` · מתחילה ב-${new Date(
                                                series.start_date
                                              ).toLocaleDateString("he-IL")}`
                                            : ""}
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: 8,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        {series.is_default && (
                                          <span
                                            style={{
                                              padding: "4px 10px",
                                              borderRadius: 999,
                                              background:
                                                "rgba(34,197,94,0.15)",
                                              color: "#15803d",
                                              fontSize: 12,
                                              fontWeight: 600,
                                            }}
                                          >
                                            סדרת ברירת מחדל
                                          </span>
                                        )}
                                        <button
                                          style={{
                                            ...btnSecondary,
                                            fontSize: 12,
                                          }}
                                          onClick={() =>
                                            toggleSeriesExpand(series.id)
                                          }
                                        >
                                          {expandedSeries[series.id]
                                            ? "👁️ הסתר"
                                            : "👁️ צפייה"}
                                        </button>
                                        <button
                                          style={{
                                            ...btnSecondary,
                                            fontSize: 12,
                                          }}
                                          onClick={() =>
                                            openSeriesModal(s, series)
                                          }
                                        >
                                          ✏️ עריכה
                                        </button>
                                        <button
                                          style={{
                                            ...btnSecondary,
                                            fontSize: 12,
                                            color: "#dc2626",
                                          }}
                                          onClick={() =>
                                            handleSeriesDelete(s, series)
                                          }
                                        >
                                          🗑️ מחיקה
                                        </button>
                                      </div>
                                    </div>
                                    {expandedSeries[series.id] && (
                                      <div style={{ marginTop: 12 }}>
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            gap: 8,
                                          }}
                                        >
                                          <div
                                            style={{
                                              color: muted,
                                              fontSize: 13,
                                            }}
                                          >
                                            רשימת הפעילויות של הסדרה
                                          </div>
                                          <button
                                            style={btnPrimary}
                                            onClick={() =>
                                              openActivityModal(s, series)
                                            }
                                          >
                                            + הוסף פעילות לסדרה
                                          </button>
                                        </div>
                                        {series.activities &&
                                        series.activities.length > 0 ? (
                                          <div
                                            style={{
                                              marginTop: 12,
                                              overflowX: "auto",
                                            }}
                                          >
                                            <table
                                              style={{
                                                width: "100%",
                                                borderCollapse: "separate",
                                                borderSpacing: "0 6px",
                                              }}
                                            >
                                              <thead
                                                style={{
                                                  borderBottom:
                                                    "1px solid rgba(15,23,42,0.15)",
                                                }}
                                              >
                                                <tr
                                                  style={{
                                                    color: muted,
                                                    fontSize: 12,
                                                  }}
                                                >
                                                  <th
                                                    style={{
                                                      textAlign: "right",
                                                      padding: 6,
                                                    }}
                                                  >
                                                    פעילות / תאריך
                                                  </th>
                                                  <th
                                                    style={{
                                                      textAlign: "center",
                                                      padding: 6,
                                                    }}
                                                  >
                                                    משתתפים
                                                  </th>
                                                  <th
                                                    style={{
                                                      textAlign: "center",
                                                      padding: 6,
                                                    }}
                                                  >
                                                    סטטוס
                                                  </th>
                                                  <th
                                                    style={{
                                                      textAlign: "center",
                                                      padding: 6,
                                                    }}
                                                  >
                                                    מנהל פעילות
                                                  </th>
                                                  <th
                                                    style={{
                                                      textAlign: "center",
                                                      padding: 6,
                                                    }}
                                                  >
                                                    הערות
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {series.activities.map(
                                                  (activity) => (
                                                    <tr
                                                      key={activity.id}
                                                      style={{
                                                        background: "#fff",
                                                      }}
                                                    >
                                                      <td
                                                        style={{ padding: 6 }}
                                                      >
                                                        <div
                                                          style={{
                                                            fontWeight: 600,
                                                          }}
                                                        >
                                                          {activity.kind} ·{" "}
                                                          {new Date(
                                                            activity.activity_date
                                                          ).toLocaleDateString(
                                                            "he-IL"
                                                          )}
                                                        </div>
                                                        <div
                                                          style={{
                                                            color: muted,
                                                            fontSize: 12,
                                                          }}
                                                        >
                                                          {activity.location ||
                                                            "מיקום לא הוגדר"}
                                                        </div>
                                                      </td>
                                                      <td
                                                        style={{
                                                          textAlign: "center",
                                                          padding: 6,
                                                        }}
                                                      >
                                                        {activity.participant_count ??
                                                          0}
                                                      </td>
                                                      <td
                                                        style={{
                                                          textAlign: "center",
                                                          padding: 6,
                                                        }}
                                                      >
                                                        <span
                                                          style={{
                                                            padding: "2px 8px",
                                                            borderRadius: 999,
                                                            background:
                                                              "rgba(59,130,246,0.08)",
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                          }}
                                                        >
                                                          {activity.status}
                                                        </span>
                                                      </td>
                                                      <td
                                                        style={{
                                                          textAlign: "center",
                                                          padding: 6,
                                                        }}
                                                      >
                                                        {activity.lead_name ||
                                                          "לא הוגדר"}
                                                      </td>
                                                      <td
                                                        style={{
                                                          textAlign: "center",
                                                          padding: 6,
                                                          fontSize: 12,
                                                          color: muted,
                                                        }}
                                                      >
                                                        {activity.notes || "—"}
                                                      </td>
                                                    </tr>
                                                  )
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <div
                                            style={{
                                              marginTop: 10,
                                              color: muted,
                                              fontSize: 13,
                                            }}
                                          >
                                            אין פעילויות בסדרה זו עדיין.
                                          </div>
                                        )}
                                      </div>
                                    )}
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
              {seasons.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין עונות במערכת. לחץ על "הוסף עונה" להתחיל.
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
              {editingSeason ? "ערוך עונה" : "הוסף עונה חדשה"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  שם העונה <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="למשל: קיץ 2024"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  שנה <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  style={inputStyle}
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  placeholder="2024"
                  min="2000"
                  max="2100"
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
                  <label style={labelStyle}>
                    תאריך התחלה <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    תאריך סיום <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
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
                  {editingSeason ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {activityModalSeason && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 1100,
            padding: 20,
          }}
          onClick={closeActivityModal}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(560px, 95vw)",
              padding: 24,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 800 }}>
              פעילות חדשה לעונה {activityModalSeason.name}
            </h3>
            {activityModalSeries && (
              <div style={{ marginBottom: 12, color: muted, fontSize: 13 }}>
                סדרת פעילות: <strong>{activityModalSeries.name}</strong>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>סוג פעילות</label>
                  <select
                    style={inputStyle}
                    value={activityForm.kind}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        kind: e.target.value as Activity["kind"],
                      })
                    }
                  >
                    {ACTIVITY_KINDS.map((kind) => (
                      <option key={kind} value={kind}>
                        {kind}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>סטטוס</label>
                  <select
                    style={inputStyle}
                    value={activityForm.status}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        status: e.target.value as Activity["status"],
                      })
                    }
                  >
                    {ACTIVITY_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    תאריך פעילות <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={activityForm.activity_date}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        activity_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>מיקום</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={activityForm.location}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        location: e.target.value,
                      })
                    }
                    placeholder="למשל: חוף הצוק"
                  />
                </div>
                <div>
                  <label style={labelStyle}>שעת התחלה</label>
                  <input
                    type="time"
                    style={inputStyle}
                    value={activityForm.start_time}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        start_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>שעת סיום</label>
                  <input
                    type="time"
                    style={inputStyle}
                    value={activityForm.end_time}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        end_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>כמות משתתפים</label>
                  <input
                    type="number"
                    style={inputStyle}
                    min="0"
                    value={activityForm.capacity}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        capacity: e.target.value,
                      })
                    }
                    placeholder="לדוגמה 20"
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>הערות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  value={activityForm.notes}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, notes: e.target.value })
                  }
                  placeholder="פרטים שחשוב לציין..."
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <button style={btnSecondary} onClick={closeActivityModal}>
                  ביטול
                </button>
                <button
                  style={{ ...btnPrimary, opacity: activitySaving ? 0.7 : 1 }}
                  onClick={handleActivitySubmit}
                  disabled={activitySaving}
                >
                  {activitySaving ? "שומר..." : "שמור פעילות"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Series Modal */}
      {seriesModalSeason && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 1200,
            padding: 20,
          }}
          onClick={closeSeriesModal}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(520px, 95vw)",
              padding: 24,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 800 }}>
              {editingSeries ? "ערוך סדרת פעילויות" : "הוסף סדרת פעילויות חדשה"}
            </h3>
            <div style={{ color: muted, fontSize: 13, marginBottom: 12 }}>
              עונה: <strong>{seriesModalSeason.name}</strong>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  שם הסדרה <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={seriesForm.name}
                  onChange={(e) =>
                    setSeriesForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="לדוגמה: סדרת גלים מתקדמת"
                />
              </div>
              <div>
                <label style={labelStyle}>סטטוס</label>
                <select
                  style={inputStyle}
                  value={seriesForm.status}
                  onChange={(e) =>
                    setSeriesForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="">ללא</option>
                  {SERIES_STATUS_OPTIONS.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>תאריך התחלה</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={seriesForm.start_date}
                    onChange={(e) =>
                      setSeriesForm((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>תאריך סיום</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={seriesForm.end_date}
                    onChange={(e) =>
                      setSeriesForm((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>ת.ז מנהל/ת סדרה</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={seriesForm.lead_national_id}
                  onChange={(e) =>
                    setSeriesForm((prev) => ({
                      ...prev,
                      lead_national_id: e.target.value,
                    }))
                  }
                  placeholder="9 ספרות (אופציונלי)"
                  maxLength={9}
                />
              </div>
              <div>
                <label style={labelStyle}>הערות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  value={seriesForm.notes}
                  onChange={(e) =>
                    setSeriesForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="פרטים נוספים על הסדרה..."
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="series_default"
                  checked={seriesForm.is_default}
                  onChange={(e) =>
                    setSeriesForm((prev) => ({
                      ...prev,
                      is_default: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="series_default" style={{ fontWeight: 600 }}>
                  סדרת ברירת מחדל לעונה זו
                </label>
              </div>
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button style={btnSecondary} onClick={closeSeriesModal}>
                  ביטול
                </button>
                <button
                  style={{ ...btnPrimary, opacity: seriesSaving ? 0.7 : 1 }}
                  onClick={handleSeriesSubmit}
                  disabled={seriesSaving}
                >
                  {seriesSaving ? "שומר..." : editingSeries ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
