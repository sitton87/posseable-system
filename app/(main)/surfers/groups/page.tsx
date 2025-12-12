"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Group, SeasonPlan, Surfer } from "@/type";
import { GROUP_STATUS_OPTIONS } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import {
  DraftList,
  FilterToolbar,
  FormGrid,
  Section,
  SmallActionButton,
  StatusPill,
  sectionCardStyle,
} from "@/app/components/shared";
import { useDraftManager, type DraftEntry } from "@/app/hooks/useDraftManager";
import {
  filterControlStyle,
  inputStyle,
  labelStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
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

const muted = colors.textMuted;

const statusToneMap: Record<string, "success" | "info" | "danger" | "warning"> =
  {
    פעיל: "success",
    מלא: "info",
    סגור: "danger",
    הושהה: "warning",
  };
const sectionBoxStyle = {
  ...sectionCardStyle,
  background: colors.surface,
  padding: spacing.md,
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

const filterAdditionalSelection = (
  selected: string[],
  mainSeason: string
): string[] => selected.filter((value) => value !== mainSeason);

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithSurfers[]>([]);
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupWithSurfers | null>(
    null
  );
  const [viewingGroup, setViewingGroup] = useState<GroupWithSurfers | null>(
    null
  );
  const [formData, setFormData] = useState<GroupFormState>(
    createEmptyFormState()
  );
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [formDirty, setFormDirty] = useState(false);
  const [draftPromptOpen, setDraftPromptOpen] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const { drafts, saveDraft, deleteDraft } =
    useDraftManager<GroupFormState>("group");

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
    setCurrentDraftId(null);
    setFormDirty(false);
    setShowModal(true);
  };

  const handleEdit = (group: GroupWithSurfers) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      season_id: group.season_id.toString(),
      start_season_id: group.start_season_id
        ? group.start_season_id.toString()
        : "",
      additional_seasons: parseAdditionalSeasonsValue(group.additional_seasons),
      min_participants: group.min_participants?.toString() || "",
      max_participants: group.max_participants?.toString() || "",
      status: group.status,
      is_active: group.is_active,
      notes: group.notes || "",
    });
    setCurrentDraftId(group.id);
    setFormDirty(false);
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

  const handleAdditionalSeasonsChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
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
        setFormDirty(false);
        setCurrentDraftId(null);
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

  const filteredGroups = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return groups.filter((g) => {
      if (filters.status === "active" && !g.is_active) return false;
      if (filters.status === "inactive" && g.is_active) return false;
      if (term) {
        const haystack = [g.name, g.description]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        if (!haystack.some((v) => v.includes(term))) return false;
      }
      return true;
    });
  }, [groups, filters]);

  const handleFilterChange = (key: "search" | "status", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters({ search: "", status: "all" });

  const handleFormChange = <K extends keyof GroupFormState>(
    key: K,
    value: GroupFormState[K]
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (next !== prev) setFormDirty(true);
      return next;
    });
  };

  const handleResumeDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;
    setEditingGroup(null);
    setFormData(draft.payload);
    setCurrentDraftId(draft.id);
    setFormDirty(false);
    setShowModal(true);
  };

  const handleSaveDraft = () => {
    const draftId = currentDraftId || editingGroup?.id || `group-${Date.now()}`;
    saveDraft(draftId, formData);
    setCurrentDraftId(draftId);
    setFormDirty(false);
    setDraftPromptOpen(false);
    setShowModal(false);
  };

  const closeForm = () => {
    setShowModal(false);
    setEditingGroup(null);
    setFormData(createEmptyFormState());
    setFormDirty(false);
    setCurrentDraftId(null);
  };

  const requestCloseForm = () => {
    if (formDirty) {
      setDraftPromptOpen(true);
      return;
    }
    closeForm();
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div>טוען קבוצות...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
      }}
    >
      <Card
        style={{
          padding: spacing.lg,
          display: "flex",
          flexDirection: "column",
          gap: spacing.md,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: spacing.sm,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: spacing.sm,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              👥 ניהול קבוצות
            </h2>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              ניהול שיוך קבוצות ותיאום משתתפים
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: spacing.sm,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <SmallActionButton variant="secondary" onClick={() => fetchGroups()}>
              רענן
            </SmallActionButton>
            <SmallActionButton variant="secondary" onClick={clearFilters}>
              ניקוי פילטרים
            </SmallActionButton>
            <Button onClick={handleAdd}>+ הוסף קבוצה</Button>
          </div>
        </div>

        <FilterToolbar columns="repeat(auto-fit, minmax(220px, 1fr))">
          <input
            style={filterControlStyle}
            placeholder="חיפוש קבוצה או תיאור"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <select
            style={filterControlStyle}
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="active">פעילות</option>
            <option value="inactive">לא פעילות</option>
          </select>
        </FilterToolbar>

        {drafts.length > 0 && (
          <DraftList
            drafts={drafts as DraftEntry<GroupFormState>[]}
            title={`טיוטות שמורות (${drafts.length})`}
            description="טיוטות זמינות עבורך בלבד עד לשמירה."
            onResume={handleResumeDraft}
            onDelete={(id) => deleteDraft(id)}
            badgeLabel="טיוטה"
            getTitle={(draft) => draft.payload.name || "קבוצה ללא שם"}
            getSubtitle={(draft) =>
              `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
            }
          />
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ ...tableStyle, width: "100%" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>שם הקבוצה</th>
                <th style={tableHeaderStyle}>עונה</th>
                <th style={tableHeaderStyle}>משתתפים</th>
                <th style={tableHeaderStyle}>מינימום</th>
                <th style={tableHeaderStyle}>מקסימום</th>
                <th style={tableHeaderStyle}>סטטוס</th>
                <th style={tableHeaderStyle}>פעיל</th>
                <th style={tableHeaderStyle}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <tr key={group.id}>
                  <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                    {group.name}
                  </td>
                  <td style={{ ...tableCellStyle, color: muted }}>
                    {getSeasonLabel(group)}
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{ fontWeight: 700, color: colors.primary }}>
                      {group.current_participants ?? 0}
                    </span>
                  </td>
                  <td style={{ ...tableCellStyle, color: muted }}>
                    {group.min_participants}
                  </td>
                  <td style={{ ...tableCellStyle, color: muted }}>
                    {group.max_participants}
                  </td>
                  <td style={tableCellStyle}>
                    <StatusPill tone={statusToneMap[group.status] || "info"}>
                      {group.status}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>
                    {group.is_active ? "✅" : "❌"}
                  </td>
                  <td style={tableCellStyle}>
                    <SmallActionButton
                      variant="secondary"
                      onClick={() => handleView(group)}
                      title="צפייה בקבוצה"
                      aria-label="צפייה"
                      style={{ marginInlineEnd: spacing.xs }}
                    >
                      👁️
                    </SmallActionButton>
                    <SmallActionButton
                      variant="secondary"
                      onClick={() => handleEdit(group)}
                      title="עריכת קבוצה"
                      aria-label="עריכה"
                      style={{ marginInlineEnd: spacing.xs }}
                    >
                      ✏️
                    </SmallActionButton>
                    <SmallActionButton
                      variant="secondary"
                      style={{ color: colors.danger }}
                      onClick={() => handleDelete(group.id)}
                      title="מחיקת קבוצה"
                      aria-label="מחיקה"
                    >
                      🗑️
                    </SmallActionButton>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ ...tableCellStyle, textAlign: "center" }}
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
        onClose={requestCloseForm}
        width="min(720px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
          {editingGroup ? "ערוך קבוצה" : "הוסף קבוצה חדשה"}
        </h3>

        <div
          style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
        >
          <div>
            <label style={labelStyle}>
              שם הקבוצה <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              placeholder="למשל: קבוצת ילדים א׳"
            />
          </div>

          <div>
            <label style={labelStyle}>תיאור</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
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
                  handleFormChange("season_id", nextSeason);
                  setFormData((prev) => ({
                    ...prev,
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
                  handleFormChange("min_participants", e.target.value)
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
                  handleFormChange("max_participants", e.target.value)
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
                  handleFormChange("start_season_id", e.target.value)
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
              <div style={{ fontSize: 12, color: muted, marginTop: spacing.xs }}>
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
                onChange={(e) => handleFormChange("status", e.target.value)}
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
                  handleFormChange("is_active", e.target.checked)
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
              onChange={(e) => handleFormChange("notes", e.target.value)}
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
              onClick={requestCloseForm}
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
        open={draftPromptOpen}
        onClose={() => setDraftPromptOpen(false)}
        width={420}
        style={{ padding: spacing.lg }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
        >
          <h4 style={{ margin: 0 }}>לשמור כטיוטה?</h4>
          <div style={{ color: muted, fontSize: 14 }}>
            זיהינו שינויים שלא נשמרו. האם לשמור כטיוטה לפני סגירה?
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: spacing.sm,
            }}
          >
            <Button variant="secondary" onClick={closeForm}>
              סגור בלי לשמור
            </Button>
            <Button onClick={handleSaveDraft}>שמור טיוטה וסגור</Button>
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
              <Button
                variant="secondary"
                type="button"
                onClick={closeViewModal}
              >
                ✕ סגור
              </Button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
              }}
            >
              <div style={sectionBoxStyle}>
                <h4 style={{ margin: "0 0 8px 0", color: muted }}>
                  פרטים כלליים
                </h4>
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
                    <StatusPill
                      tone={statusToneMap[viewingGroup.status] || "info"}
                      style={{ marginTop: spacing.xs }}
                    >
                      {viewingGroup.status}
                    </StatusPill>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>
                      עונת תחילת פעילות
                    </div>
                    <div>{viewingGroupStartSeasonLabel || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>
                      עונות נוספות
                    </div>
                    <div>
                      {viewingGroupAdditionalSeasonLabels.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: spacing.xs,
                            marginTop: spacing.xs,
                          }}
                        >
                          {viewingGroupAdditionalSeasonLabels.map((label) => (
                            <span
                              key={label}
                              style={{
                                padding: `${spacing.xs}px ${spacing.sm}px`,
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
                    <div style={{ fontSize: 12, color: muted }}>
                      משתתפים (נוכחי)
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {viewingGroup.current_participants ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>
                      טווח משתתפים
                    </div>
                    <div>
                      {viewingGroup.min_participants} -{" "}
                      {viewingGroup.max_participants}
                    </div>
                  </div>
                </div>
                {viewingGroup.description && (
                  <p style={{ marginTop: spacing.md }}>
                    {viewingGroup.description}
                  </p>
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
                          padding: `${spacing.xs}px 0`,
                          borderBottom: `1px solid ${colors.borderMuted}`,
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {surfer.full_name}
                        </div>
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
