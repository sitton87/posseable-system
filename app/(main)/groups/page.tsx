"use client";

import type { CSSProperties, ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Group, SeasonPlan, Surfer } from "@/type";
import { GROUP_STATUS_OPTIONS } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { formatPhoneNumber } from "@/lib/utils/format";
import { colors, radii, spacing } from "@/app/styles/foundations";

type GroupWithSurfers = Group & { surfers?: Surfer[] };

type GroupFormState = {
  name: string;
  description: string;
  season_id: string;
  start_season_id: string;
  additional_seasons: string[];
  min_participants: string;
  max_participants: string;
  status: string;
  is_active: boolean;
  notes: string;
};

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;

const statusStyles: Record<string, { background: string; color: string }> = {
  פעיל: { background: colors.successSoft, color: colors.success },
  מלא: { background: colors.primarySoft, color: colors.primary },
  סגור: { background: colors.dangerSoft, color: colors.danger },
  הושהה: { background: colors.warningSoft, color: colors.warning },
};

const smallButtonStyle: CSSProperties = {
  fontSize: 12,
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
};

const sectionBoxStyle: CSSProperties = {
  padding: spacing.md,
  borderRadius: radii.card,
  border: `1px solid ${colors.borderMuted}`,
  background: colors.surface,
};

const createEmptyFormState = (): GroupFormState => ({
  name: "",
  description: "",
  season_id: "",
  start_season_id: "",
  additional_seasons: [],
  min_participants: "",
  max_participants: "",
  status: GROUP_STATUS_OPTIONS[0],
  is_active: true,
  notes: "",
});

const parseAdditionalSeasonsValue = (value?: string | null): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => item.toString());
    }
  } catch {
    // ignore and fallback to string parsing
  }
  return value
    .split(",")
    .map((val) => val.trim())
    .filter(Boolean);
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithSurfers[]>([]);
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupWithSurfers | null>(null);
  const [viewingGroup, setViewingGroup] = useState<GroupWithSurfers | null>(null);
  const [formData, setFormData] = useState<GroupFormState>(createEmptyFormState());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchGroups(), fetchSeasons()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups?includeSurfers=true", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups);
      } else {
        console.error(data.error || "Failed to load groups");
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
      alert("שגיאה בטעינת קבוצות");
    }
  };

  const fetchSeasons = async () => {
    try {
      setSeasonLoading(true);
      const res = await fetch("/api/seasons", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    } catch (err) {
      console.error("Error fetching seasons:", err);
    } finally {
      setSeasonLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGroup(null);
    setFormData(createEmptyFormState());
    setShowModal(true);
  };

  const handleEdit = (group: GroupWithSurfers) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      season_id: group.season_id.toString(),
      start_season_id: group.start_season_id ? group.start_season_id.toString() : "",
      additional_seasons: parseAdditionalSeasonsValue(group.additional_seasons),
      min_participants: group.min_participants?.toString() || "",
      max_participants: group.max_participants?.toString() || "",
      status: group.status,
      is_active: group.is_active,
      notes: group.notes || "",
    });
    setShowModal(true);
  };

  const handleView = (group: GroupWithSurfers) => {
    setViewingGroup(group);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingGroup(null);
  };

  const handleAdditionalSeasonsChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    setFormData((prev) => ({ ...prev, additional_seasons: selected }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.season_id) {
      alert("שם הקבוצה ומזהה העונה הם שדות חובה");
      return;
    }

    try {
      const url = editingGroup ? "/api/groups/update" : "/api/groups/add";
      const method = editingGroup ? "PUT" : "POST";

      const body: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        season_id: parseInt(formData.season_id, 10),
        start_season_id: formData.start_season_id
          ? parseInt(formData.start_season_id, 10)
          : null,
        additional_seasons: formData.additional_seasons.map((seasonId) =>
          parseInt(seasonId, 10)
        ),
        min_participants: parseInt(formData.min_participants || "0", 10),
        max_participants: parseInt(formData.max_participants || "0", 10),
        status: formData.status,
        is_active: formData.is_active,
        notes: formData.notes.trim() || null,
      };

      if (editingGroup) {
        body.id = editingGroup.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingGroup ? "קבוצה עודכנה בהצלחה!" : "קבוצה נוספה בהצלחה!");
        setShowModal(false);
        await fetchGroups();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving group:", err);
      alert("שגיאה בשמירת קבוצה");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הקבוצה?")) return;

    try {
      const res = await fetch(`/api/groups/update?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        alert("קבוצה נמחקה בהצלחה!");
        fetchGroups();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("שגיאה במחיקת קבוצה");
    }
  };

  const getSeasonLabel = (group: GroupWithSurfers) => {
    if (group.season_name) {
      return `${group.season_name} · ${group.season_year || ""}`.trim();
    }

    const match = seasons.find((season) => season.id === group.season_id);
    if (match) {
      return `${match.name} · ${match.year}`;
    }
    return `עונה ${group.season_id}`;
  };

  const seasonOptions = useMemo(
    () =>
      seasons.map((season) => ({
        value: season.id.toString(),
        label: `${season.name} · ${season.year}`,
      })),
    [seasons]
  );

  const getSeasonLabelById = (id?: number | null) => {
    if (!id) return null;
    const match = seasons.find((season) => season.id === id);
    return match ? `${match.name} · ${match.year}` : `עונה ${id}`;
  };

  const getAdditionalSeasonLabels = (value?: string | null) => {
    const ids = parseAdditionalSeasonsValue(value).map((seasonId) =>
      parseInt(seasonId, 10)
    );
    return ids
      .map((seasonId) => getSeasonLabelById(seasonId))
      .filter((label): label is string => Boolean(label));
  };

  const viewingGroupStartSeasonLabel = viewingGroup
    ? getSeasonLabelById(viewingGroup.start_season_id)
    : null;

  const viewingGroupAdditionalSeasonLabels = viewingGroup
    ? getAdditionalSeasonLabels(viewingGroup.additional_seasons)
    : [];

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div>טוען קבוצות...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.xl }}>
      <Card style={{ marginBottom: spacing.lg }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: spacing.md,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              👥 ניהול קבוצות
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: px(2) }}>
              סה״כ {groups.length} קבוצות במערכת
            </div>
          </div>
          <Button onClick={handleAdd}>+ הוסף קבוצה</Button>
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px",
            }}
          >
            <thead style={{ borderBottom: `2px solid ${colors.borderMuted}` }}>
              <tr style={{ color: muted, fontSize: 13 }}>
                <th style={{ textAlign: "center", padding: 8 }}>שם הקבוצה</th>
                <th style={{ textAlign: "center", padding: 8 }}>עונה</th>
                <th style={{ textAlign: "center", padding: 8 }}>משתתפים</th>
                <th style={{ textAlign: "center", padding: 8 }}>מינימום</th>
                <th style={{ textAlign: "center", padding: 8 }}>מקסימום</th>
                <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעיל</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr
                  key={group.id}
                  style={{ borderTop: `1px solid ${colors.borderMuted}` }}
                >
                  <td style={{ padding: 8, fontWeight: 600 }}>{group.name}</td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {getSeasonLabel(group)}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span style={{ fontWeight: 700, color: colors.primary }}>
                      {group.current_participants ?? 0}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {group.min_participants}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {group.max_participants}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
                        borderRadius: radii.button,
                        fontSize: 12,
                        fontWeight: 600,
                        ...(statusStyles[group.status] || {
                          background: colors.borderMuted,
                          color: colors.textPrimary,
                        }),
                      }}
                    >
                      {group.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    {group.is_active ? "✅" : "❌"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: spacing.xs }}
                      onClick={() => handleView(group)}
                      title="צפייה בקבוצה"
                      aria-label="צפייה"
                    >
                      👁️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: spacing.xs }}
                      onClick={() => handleEdit(group)}
                      title="עריכת קבוצה"
                      aria-label="עריכה"
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, color: colors.danger }}
                      onClick={() => handleDelete(group.id)}
                      title="מחיקת קבוצה"
                      aria-label="מחיקה"
                    >
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין קבוצות במערכת. לחץ על "הוסף קבוצה" להתחיל.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        width="min(720px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
          {editingGroup ? "ערוך קבוצה" : "הוסף קבוצה חדשה"}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          <div>
            <label style={labelStyle}>
              שם הקבוצה <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="למשל: קבוצת ילדים א׳"
            />
          </div>

          <div>
            <label style={labelStyle}>תיאור</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="תיאור הקבוצה..."
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>
                עונה <span style={{ color: colors.danger }}>*</span>
              </label>
              <select
                style={inputStyle}
                value={formData.season_id}
                onChange={(e) => {
                  const nextSeason = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    season_id: nextSeason,
                    additional_seasons: filterAdditionalSelection(
                      prev.additional_seasons,
                      nextSeason
                    ),
                  }));
                }}
              >
                <option value="">
                  {seasonLoading ? "טוען עונות..." : "בחר עונה"}
                </option>
                {seasonOptions.map((season) => (
                  <option key={season.value} value={season.value}>
                    {season.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>מינימום משתתפים</label>
              <input
                type="number"
                style={inputStyle}
                min="0"
                value={formData.min_participants}
                onChange={(e) =>
                  setFormData({ ...formData, min_participants: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div>
              <label style={labelStyle}>מקסימום משתתפים</label>
              <input
                type="number"
                style={inputStyle}
                min="0"
                value={formData.max_participants}
                onChange={(e) =>
                  setFormData({ ...formData, max_participants: e.target.value })
                }
                placeholder="30"
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>עונת תחילת פעילות</label>
              <select
                style={inputStyle}
                value={formData.start_season_id}
                onChange={(e) =>
                  setFormData({ ...formData, start_season_id: e.target.value })
                }
              >
                <option value="">לא נבחר</option>
                {seasonOptions.map((season) => (
                  <option key={season.value} value={season.value}>
                    {season.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>עונות נוספות</label>
              <select
                multiple
                style={{ ...inputStyle, minHeight: 110 }}
                value={formData.additional_seasons}
                onChange={handleAdditionalSeasonsChange}
              >
                {seasonOptions
                  .filter((season) => season.value !== formData.season_id)
                  .map((season) => (
                    <option key={season.value} value={season.value}>
                      {season.label}
                    </option>
                  ))}
              </select>
              <div style={{ fontSize: 12, color: muted, marginTop: px(4) }}>
                ניתן לבחור כמה עונות נוספות (Ctrl / Cmd + קליק).
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>סטטוס</label>
              <select
                style={inputStyle}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                {GROUP_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.sm,
                marginTop: spacing.xl,
              }}
            >
              <input
                type="checkbox"
                id="group_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
              <label
                htmlFor="group_active"
                style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                קבוצה פעילה
              </label>
            </div>
          </div>

          <div>
            <label style={labelStyle}>הערות</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="הערות נוספות..."
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: spacing.md,
              marginTop: spacing.sm,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowModal(false)}
            >
              ביטול
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editingGroup ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showViewModal && !!viewingGroup}
        onClose={closeViewModal}
        width="min(720px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingGroup && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: spacing.md,
                marginBottom: spacing.md,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                פרטי קבוצה – {viewingGroup.name}
              </h3>
              <Button variant="secondary" type="button" onClick={closeViewModal}>
                ✕ סגור
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
              <div style={sectionBoxStyle}>
                <h4 style={{ margin: "0 0 8px 0", color: muted }}>פרטים כלליים</h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: spacing.md,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>עונה</div>
                    <div>{getSeasonLabel(viewingGroup)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: px(4),
                        padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
                        borderRadius: radii.button,
                        fontSize: 12,
                        fontWeight: 600,
                        ...(statusStyles[viewingGroup.status] || {
                          background: colors.borderMuted,
                          color: colors.textPrimary,
                        }),
                      }}
                    >
                      {viewingGroup.status}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>עונת תחילת פעילות</div>
                    <div>{viewingGroupStartSeasonLabel || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>עונות נוספות</div>
                    <div>
                      {viewingGroupAdditionalSeasonLabels.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: spacing.xs,
                            marginTop: px(4),
                          }}
                        >
                          {viewingGroupAdditionalSeasonLabels.map((label) => (
                            <span
                              key={label}
                              style={{
                                padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
                                borderRadius: radii.button,
                                background: colors.surfaceAlt,
                                border: `1px solid ${colors.borderMuted}`,
                                fontSize: 12,
                              }}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>משתתפים (נוכחי)</div>
                    <div style={{ fontWeight: 700 }}>
                      {viewingGroup.current_participants ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>טווח משתתפים</div>
                    <div>
                      {viewingGroup.min_participants} - {viewingGroup.max_participants}
                    </div>
                  </div>
                </div>
                {viewingGroup.description && (
                  <p style={{ marginTop: spacing.md }}>{viewingGroup.description}</p>
                )}
              </div>

              <div style={sectionBoxStyle}>
                <h4 style={{ margin: "0 0 8px 0", color: muted }}>
                  גולשים משויכים ({viewingGroup.surfers?.length || 0})
                </h4>
                {viewingGroup.surfers && viewingGroup.surfers.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: spacing.sm,
                    }}
                  >
                    {viewingGroup.surfers.map((surfer) => (
                      <div
                        key={surfer.national_id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: spacing.sm,
                          padding: `${px(spacing.xs)} 0`,
                          borderBottom: `1px solid ${colors.borderMuted}`,
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{surfer.full_name}</div>
                        <div style={{ fontSize: 12, color: muted }}>
                          {formatPhoneNumber(surfer.phone)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: muted, fontSize: 13 }}>
                    אין גולשים משויכים לקבוצה זו.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
