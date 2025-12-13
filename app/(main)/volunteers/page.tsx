"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PROGRAM_OPTIONS, STATUS_OPTIONS, type NoteStatus } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import {
  DraftList,
  FilterToolbar,
  StatCardGrid,
  FormGrid,
  Section,
  SmallActionButton,
  StatusPill,
  sectionCardStyle,
} from "@/app/components/shared";
import {
  filterControlStyle,
  inputStyle,
  labelStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { useDraftManager, type DraftEntry } from "@/app/hooks/useDraftManager";
import { formatPhoneNumber } from "@/lib/utils/format";

type Volunteer = {
  national_id: string;
  full_name: string;
  phone: string;
  email: string;
  residence?: string | null;
  program?: string | null;
  group_id?: string | null;
  group_name?: string | null;
  status?: string | null;
  active: boolean;
  notes?: string | null;
};

type VolunteerFilters = {
  search: string;
  status: "all" | "active" | "inactive" | "approved" | "pending";
  program: string;
};

type VolunteerStats = {
  total: number;
  active: number;
  approved: number;
  pending: number;
  grouped: number;
};

type VolunteerNote = {
  note_id: string;
  entity_id: string;
  title: string;
  body: string;
  status: NoteStatus;
  due_date?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

type VolunteerSummaryData = {
  stats: VolunteerStats;
  tasks: VolunteerNote[];
  recentActivity: {
    national_id: string;
    full_name: string;
    status?: string | null;
    program?: string | null;
    group_name?: string | null;
    created_at?: string | null;
  }[];
};

type VolunteerActivityRow = {
  activity_id: number;
  activity_date?: string | null;
  kind?: string | null;
  volunteer_national_id: string;
  surfer_name?: string | null;
};

type SupportedSurferRow = {
  national_id: string;
  full_name: string;
  program?: string | null;
  status?: string | null;
  group_name?: string | null;
};

type VolunteerDetail = {
  activities: VolunteerActivityRow[];
  supportedSurfers: SupportedSurferRow[];
};

type VolunteerFormState = {
  national_id: string;
  full_name: string;
  phone: string;
  email: string;
  residence: string;
  program: string;
  group_id: string;
  status: string;
  active: boolean;
  notes: string;
};

type TaskFormState = {
  volunteer_id: string;
  title: string;
  body: string;
  due_date: string;
};

type TabId = "home" | "list" | "settings";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;
const warningSoft = "rgba(217,119,6,0.15)";
const volunteerDraftType = "volunteer";

const defaultStats: VolunteerStats = {
  total: 0,
  active: 0,
  approved: 0,
  pending: 0,
  grouped: 0,
};

const TASK_STATUSES: { value: NoteStatus; label: string; tone: string }[] = [
  { value: "open", label: "פתוח", tone: "warning" },
  { value: "in_progress", label: "בתהליך", tone: "info" },
  { value: "done", label: "הסתיים", tone: "success" },
  { value: "cancelled", label: "בוטל", tone: "danger" },
];

const normalizeStatus = (value?: string | null): NoteStatus => {
  if (!value) return "open";
  const v = value.toLowerCase();
  if (v === "pending") return "open";
  if (v === "closed") return "done";
  return TASK_STATUSES.some((s) => s.value === v) ? (v as NoteStatus) : "open";
};

const nextStatus = (current: NoteStatus) => {
  const idx = TASK_STATUSES.findIndex((s) => s.value === current);
  return TASK_STATUSES[(idx + 1) % TASK_STATUSES.length].value;
};

type SafeJsonResult =
  | { success: false; error: string; raw: string }
  | (Record<string, any> & { success?: boolean });

const tryParseJson = async (res: Response): Promise<SafeJsonResult> => {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
    return {
      success: false,
      error: `HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`,
      raw: text,
    };
  }

  if (!contentType.includes("application/json")) {
    return {
      success: false,
      error: `Invalid JSON (content-type: ${
        contentType || "unknown"
      }): ${text.slice(0, 200)}`,
      raw: text,
    };
  }

  try {
    return JSON.parse(text);
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to parse JSON: ${err?.message || "unknown error"}`,
      raw: text,
    };
  }
};

const deriveStatsFromVolunteers = (items: Volunteer[]): VolunteerStats => {
  const total = items.length;
  const active = items.filter((v) => v.active).length;
  const approved = items.filter((v) => v.status === "מאושר").length;
  const pending = items.filter((v) => v.status === "בהמתנה").length;
  const grouped = items.filter((v) => v.group_id || v.group_name).length;
  return { total, active, approved, pending, grouped };
};

const createEmptyForm = (): VolunteerFormState => ({
  national_id: "",
  full_name: "",
  phone: "",
  email: "",
  residence: "",
  program: "",
  group_id: "",
  status: "בהמתנה",
  active: true,
  notes: "",
});

const createEmptyTaskForm = (): TaskFormState => ({
  volunteer_id: "",
  title: "",
  body: "",
  due_date: "",
});

export default function VolunteersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab: TabId =
    searchParams?.get("view") === "list"
      ? "list"
      : searchParams?.get("view") === "settings"
      ? "settings"
      : "home";

  const [filters, setFilters] = useState<VolunteerFilters>({
    search: "",
    status: "all",
    program: "",
  });
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [summary, setSummary] = useState<VolunteerSummaryData>({
    stats: defaultStats,
    tasks: [],
    recentActivity: [],
  });
  const [listLoading, setListLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [formState, setFormState] = useState<VolunteerFormState>(
    createEmptyForm()
  );
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(
    null
  );
  const [viewingVolunteer, setViewingVolunteer] = useState<Volunteer | null>(
    null
  );
  const [viewDetail, setViewDetail] = useState<VolunteerDetail | null>(null);
  const [viewDetailLoading, setViewDetailLoading] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [draftPromptOpen, setDraftPromptOpen] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const {
    drafts,
    saveDraft: saveVolunteerDraft,
    deleteDraft: deleteVolunteerDraft,
  } = useDraftManager<VolunteerFormState>(volunteerDraftType);

  const [taskForm, setTaskForm] = useState<TaskFormState>(
    createEmptyTaskForm()
  );
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  const fetchVolunteers = useCallback(async () => {
    try {
      setListLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.program) params.append("program", filters.program);
      if (filters.status === "active") params.append("active", "true");
      if (filters.status === "inactive") params.append("active", "false");
      if (filters.status === "approved") params.append("status", "מאושר");
      if (filters.status === "pending") params.append("status", "בהמתנה");

      const res = await fetch(`/api/volunteers?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "שגיאה בטעינת הנתונים");
      const items = data.volunteers || [];
      setVolunteers(items);
      setSummary((prev) => {
        // אם ה-API לא החזיר סטטיסטיקות, נגזור מהנתונים שהגיעו
        const shouldDerive =
          !prev.stats.total &&
          !prev.stats.active &&
          !prev.stats.approved &&
          !prev.stats.pending &&
          !prev.stats.grouped;
        return {
          ...prev,
          stats: shouldDerive ? deriveStatsFromVolunteers(items) : prev.stats,
        };
      });
    } catch (err: any) {
      console.error("Error loading volunteers:", err);
      setError(err.message || "שגיאה בטעינת הנתונים");
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch("/api/volunteers/summary", {
        credentials: "include",
      });
      const data = await tryParseJson(res);
      if (!data.success) throw new Error(data.error || "שגיאה בטעינת הנתונים");
      setSummary({
        stats: data.stats || defaultStats,
        tasks: data.tasks || [],
        recentActivity: data.recentActivity || [],
      });
      if (!data.tasks || data.tasks.length === 0) {
        await loadTasksFallback();
      }
    } catch (err) {
      console.error("Error loading summary:", err);
      // fallback: load tasks בלבד אם חזרה שגיאה
      await loadTasksFallback();
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadTasksFallback = useCallback(async () => {
    const attempt = async (url: string) => {
      const res = await fetch(url, { credentials: "include" });
      const data = await tryParseJson(res);
      if (data?.success && Array.isArray(data.notes)) {
        return (data.notes as VolunteerNote[]).map((t) => ({
          ...t,
          status: normalizeStatus(t.status),
        }));
      }
      return null;
    };

    try {
      setTasksLoading(true);
      // נסה בשני פרמטרים נפוצים
      const primary =
        (await attempt("/api/notes?entity_type=volunteer")) ||
        (await attempt("/api/notes?entityType=volunteer"));
      if (primary) {
        setSummary((prev) => ({ ...prev, tasks: primary }));
      }
    } catch (err) {
      console.error("Error loading volunteer tasks fallback:", err);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const filteredVolunteers = useMemo(() => volunteers, [volunteers]);

  const handleFilterChange = <K extends keyof VolunteerFilters>(
    key: K,
    value: VolunteerFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", status: "all", program: "" });
  };

  const handleFormChange = <K extends keyof VolunteerFormState>(
    key: K,
    value: VolunteerFormState[K]
  ) => {
    setFormState((prev) => {
      const next = { ...prev, [key]: value };
      if (next !== prev) setFormDirty(true);
      return next;
    });
  };

  const openCreateModal = () => {
    setEditingVolunteer(null);
    setFormState(createEmptyForm());
    setCurrentDraftId(null);
    setFormDirty(false);
    setShowFormModal(true);
  };

  const handleEdit = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setFormState({
      national_id: volunteer.national_id,
      full_name: volunteer.full_name,
      phone: volunteer.phone || "",
      email: volunteer.email || "",
      residence: volunteer.residence || "",
      program: volunteer.program || "",
      group_id: volunteer.group_id || "",
      status: volunteer.status || "בהמתנה",
      active: volunteer.active,
      notes: volunteer.notes || "",
    });
    setCurrentDraftId(volunteer.national_id);
    setFormDirty(false);
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק מתנדב זה?")) return;
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "מחיקה נכשלה");
      fetchVolunteers();
    } catch (err: any) {
      alert(err?.message || "שגיאה במחיקה");
    }
  };

  const handleSubmit = async () => {
    if (!formState.national_id.trim() || !formState.full_name.trim()) {
      alert("תעודת זהות ושם מלא הם שדות חובה");
      return;
    }

    const payload = {
      national_id: formState.national_id,
      full_name: formState.full_name,
      phone: formState.phone || null,
      email: formState.email || null,
      residence: formState.residence || null,
      program: formState.program || null,
      group_id: formState.group_id || null,
      status: formState.status || null,
      active: formState.active,
      notes: formState.notes || null,
    };

    try {
      const endpoint = editingVolunteer
        ? "/api/volunteers/update"
        : "/api/volunteers/add";
      const method = editingVolunteer ? "PUT" : "POST";
      const body = editingVolunteer
        ? { ...payload, id: editingVolunteer.national_id }
        : payload;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const response = await res.json();
      if (!response.success) {
        throw new Error(response.error || "שמירת מתנדב נכשלה");
      }

      const draftId = currentDraftId;
      if (draftId) {
        deleteVolunteerDraft(draftId);
        setCurrentDraftId(null);
      }
      closeFormModal();
      fetchVolunteers();
    } catch (err: any) {
      alert(err?.message || "שגיאה בשמירת המתנדב");
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingVolunteer(null);
    setFormState(createEmptyForm());
    setFormDirty(false);
    setDraftPromptOpen(false);
  };

  const requestCloseModal = () => {
    if (formDirty) {
      setDraftPromptOpen(true);
      return;
    }
    closeFormModal();
  };

  const handleSaveDraft = () => {
    const draftId =
      currentDraftId || editingVolunteer?.national_id || crypto.randomUUID();
    saveVolunteerDraft(draftId, formState);
    setCurrentDraftId(draftId);
    setFormDirty(false);
    setDraftPromptOpen(false);
    closeFormModal();
  };

  const handleDiscardDraft = () => {
    setDraftPromptOpen(false);
    setFormDirty(false);
    closeFormModal();
  };

  const handleResumeDraft = (draftId: string) => {
    const draft = drafts.find((entry) => entry.id === draftId);
    if (!draft) return;
    setFormState(draft.payload);
    setEditingVolunteer(null);
    setCurrentDraftId(draftId);
    setFormDirty(false);
    setDraftPromptOpen(false);
    setShowFormModal(true);
  };

  const handleDeleteDraftEntry = (draftId: string) => {
    deleteVolunteerDraft(draftId);
    if (currentDraftId === draftId) {
      setCurrentDraftId(null);
    }
  };

  const handleView = useCallback(async (volunteer: Volunteer) => {
    setViewingVolunteer(volunteer);
    setViewDetail(null);
    setViewDetailLoading(true);
    try {
      const res = await fetch(`/api/volunteer/${volunteer.national_id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.error || "שגיאה בטעינת נתוני מתנדב");
      setViewDetail({
        activities: data.activities || [],
        supportedSurfers: data.supportedSurfers || [],
      });
    } catch (err) {
      console.error("Error loading volunteer detail:", err);
    } finally {
      setViewDetailLoading(false);
    }
  }, []);

  const handleTaskFormChange = <K extends keyof TaskFormState>(
    key: K,
    value: TaskFormState[K]
  ) => {
    setTaskForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateTask = async () => {
    if (!taskForm.volunteer_id || !taskForm.body.trim()) {
      alert("בחר מתנדב והכנס תוכן למשימה/פתק");
      return;
    }
    setTaskSubmitting(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          entity_type: "volunteer",
          entity_id: taskForm.volunteer_id,
          title: taskForm.title || "משימה",
          body: taskForm.body,
          status: TASK_STATUSES[0].value,
          due_date: taskForm.due_date || null,
        }),
      });
      const data = await tryParseJson(res);
      if (!data.success) throw new Error(data.error || "יצירת משימה נכשלה");
      setTaskForm(createEmptyTaskForm());
      // עדכון מקומי מיידי כדי שיופיע בלי להמתין לרענון
      if (data.note) {
        setSummary((prev) => ({
          ...prev,
          tasks: [
            ...prev.tasks,
            { ...data.note, status: normalizeStatus(data.note.status) },
          ],
        }));
      }
      await fetchSummary();
      await loadTasksFallback();
    } catch (err: any) {
      alert(err.message || "שגיאה ביצירת משימה");
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (
    task: VolunteerNote,
    nextStatusValue: VolunteerNote["status"]
  ) => {
    try {
      const normalized = normalizeStatus(nextStatusValue);
      const res = await fetch(`/api/notes/${task.note_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: normalized }),
      });
      await tryParseJson(res);
      setSummary((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.note_id === task.note_id ? { ...t, status: normalized } : t
        ),
      }));
      await fetchSummary();
      await loadTasksFallback();
    } catch (err) {
      console.error("Error updating task status:", err);
      alert("שגיאה בעדכון סטטוס משימה");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("למחוק משימה זו?")) return;
    try {
      await fetch(`/api/notes/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setSummary((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.note_id !== taskId),
      }));
      await fetchSummary();
      await loadTasksFallback();
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("שגיאה במחיקת משימה");
    }
  };

  const handleUpdateTask = async (
    taskId: string,
    payload: { title: string; body: string; due_date: string }
  ) => {
    try {
      const res = await fetch(`/api/notes/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: payload.title || null,
          body: payload.body || "",
          due_date: payload.due_date || null,
        }),
      });
      const data = await tryParseJson(res);
      if (!data.success) throw new Error(data.error || "שמירת משימה נכשלה");
      setSummary((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.note_id === taskId
            ? {
                ...t,
                title: payload.title || t.title,
                body: payload.body ?? t.body,
                due_date: payload.due_date || null,
              }
            : t
        ),
      }));
      fetchSummary();
      loadTasksFallback();
    } catch (err: any) {
      console.error("Error updating note:", err);
      alert(err?.message || "שגיאה בעדכון משימה");
    }
  };

  const statsCards = [
    { label: "סה״כ מתנדבים", value: summary.stats.total },
    { label: "פעילים", value: summary.stats.active },
    { label: "מאושרים", value: summary.stats.approved },
    { label: "ממתינים", value: summary.stats.pending },
    { label: "משויכים לקבוצות/פעילויות", value: summary.stats.grouped },
  ];

  const tabOptions: { id: TabId; label: string }[] = [
    { id: "home", label: "דף הבית" },
    { id: "list", label: "רשימת מתנדבים" },
    { id: "settings", label: "הגדרות" },
  ];

  const handleTabChange = (tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "home") {
      params.delete("view");
    } else {
      params.set("view", tab);
    }
    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  return (
    <div
      style={{
        padding: spacing.xl,
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
      }}
    >
      {activeTab === "home" && (
        <VolunteersHomeTab
          loading={summaryLoading}
          summary={summary}
          volunteers={volunteers}
          taskForm={taskForm}
          onTaskChange={setTaskForm}
          onCreateTask={handleCreateTask}
          submittingTask={taskSubmitting}
          onRefreshSummary={fetchSummary}
          tasksLoading={tasksLoading}
          onToggleTaskStatus={handleToggleTaskStatus}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {activeTab === "list" && (
        <VolunteersListTab
          loading={listLoading}
          error={error}
          volunteers={filteredVolunteers}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={fetchVolunteers}
          onAdd={openCreateModal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          drafts={drafts}
          onResumeDraft={handleResumeDraft}
          onDeleteDraft={handleDeleteDraftEntry}
        />
      )}

      {activeTab === "settings" && <SettingsTab />}

      <Modal
        open={showFormModal}
        onClose={requestCloseModal}
        width="min(640px, 95vw)"
        style={{ padding: spacing.xxl }}
        escEnabled={!draftPromptOpen}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 20 }}>
          {editingVolunteer ? "עריכת מתנדב" : "מתנדב חדש"}
        </h3>
        <Section
          title="פרטים אישיים"
          style={{ marginBottom: spacing.lg }}
          bodyStyle={{ gap: spacing.md }}
        >
          <FormGrid
            columns="repeat(auto-fit, minmax(240px, 1fr))"
            gap={spacing.md}
          >
            <div>
              <label style={labelStyle}>
                תעודת זהות <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                type="text"
                maxLength={9}
                style={inputStyle}
                value={formState.national_id}
                onChange={(e) =>
                  handleFormChange("national_id", e.target.value)
                }
                disabled={!!editingVolunteer}
              />
            </div>
            <div>
              <label style={labelStyle}>
                שם מלא <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                type="text"
                style={inputStyle}
                value={formState.full_name}
                onChange={(e) => handleFormChange("full_name", e.target.value)}
              />
            </div>
          </FormGrid>
          <FormGrid
            columns="repeat(auto-fit, minmax(220px, 1fr))"
            gap={spacing.md}
          >
            <div>
              <label style={labelStyle}>טלפון</label>
              <input
                type="tel"
                style={inputStyle}
                value={formState.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>אימייל</label>
              <input
                type="email"
                style={inputStyle}
                value={formState.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </div>
          </FormGrid>
        </Section>

        <Section
          title="שיוך וסטטוס"
          style={{ marginBottom: spacing.lg }}
          bodyStyle={{ gap: spacing.md }}
        >
          <FormGrid
            columns="repeat(auto-fit, minmax(220px, 1fr))"
            gap={spacing.md}
          >
            <div>
              <label style={labelStyle}>תוכנית</label>
              <select
                style={inputStyle}
                value={formState.program}
                onChange={(e) => handleFormChange("program", e.target.value)}
              >
                <option value="">בחר...</option>
                {PROGRAM_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>סטטוס</label>
              <select
                style={inputStyle}
                value={formState.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>קבוצה</label>
              <input
                style={inputStyle}
                value={formState.group_id}
                onChange={(e) => handleFormChange("group_id", e.target.value)}
                placeholder="מזהה קבוצה (אם קיים)"
              />
            </div>
          </FormGrid>
          <div>
            <label style={labelStyle}>הערות</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              value={formState.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
            />
          </div>
          <label
            style={{ display: "flex", alignItems: "center", gap: spacing.sm }}
          >
            <input
              type="checkbox"
              checked={formState.active}
              onChange={(e) => handleFormChange("active", e.target.checked)}
            />
            מתנדב פעיל
          </label>
        </Section>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
          }}
        >
          <Button variant="secondary" onClick={requestCloseModal}>
            ביטול
          </Button>
          <Button onClick={handleSubmit}>
            {editingVolunteer ? "עדכון מתנדב" : "שמור מתנדב"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={draftPromptOpen}
        onClose={() => setDraftPromptOpen(false)}
        width="min(420px, 90vw)"
      >
        <div style={{ ...sectionCardStyle, boxShadow: "none" }}>
          <h3 style={{ marginTop: 0 }}>לשמור את המתנדב כטיוטה?</h3>
          <p style={{ color: muted }}>
            ניתן לשמור את הנתונים כטיוטה אישית ולהמשיך מאוחר יותר או לסגור ללא
            שמירה.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: spacing.sm,
              marginTop: spacing.lg,
            }}
          >
            <SmallActionButton
              variant="ghost"
              onClick={() => setDraftPromptOpen(false)}
            >
              חזרה לעריכה
            </SmallActionButton>
            <SmallActionButton variant="secondary" onClick={handleDiscardDraft}>
              בטל וסגור
            </SmallActionButton>
            <SmallActionButton onClick={handleSaveDraft}>
              שמור כטיוטה
            </SmallActionButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(viewingVolunteer)}
        onClose={() => {
          setViewingVolunteer(null);
          setViewDetail(null);
        }}
        width="min(760px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingVolunteer && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing.lg,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{viewingVolunteer.full_name}</h3>
                <p style={{ margin: 0, color: muted, fontSize: 13 }}>
                  תעודת זהות: {viewingVolunteer.national_id}
                </p>
              </div>
              <SmallActionButton
                variant="secondary"
                onClick={() => {
                  setViewingVolunteer(null);
                  setViewDetail(null);
                }}
              >
                ✕ סגור
              </SmallActionButton>
            </div>

            <Section
              title="פרטים כלליים"
              style={{ background: colors.surface }}
              bodyStyle={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: spacing.md,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: muted }}>טלפון</div>
                <div>{formatPhoneNumber(viewingVolunteer.phone)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>אימייל</div>
                <div>{viewingVolunteer.email || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
                <StatusPill
                  tone={viewingVolunteer.active ? "active" : "inactive"}
                >
                  {viewingVolunteer.active ? "פעיל" : "לא פעיל"}
                </StatusPill>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>תוכנית</div>
                <div>{viewingVolunteer.program || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>קבוצה</div>
                <div>{viewingVolunteer.group_name || "—"}</div>
              </div>
            </Section>

            <Section
              title={`פעילויות (${viewDetail?.activities?.length || 0})`}
              style={{ background: colors.surface }}
            >
              {viewDetailLoading ? (
                <div style={{ textAlign: "center", color: muted }}>
                  טוען פעילויות...
                </div>
              ) : !viewDetail?.activities?.length ? (
                <div style={{ color: muted, fontSize: 13 }}>
                  אין פעילויות קודמות.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...tableStyle, minWidth: 520 }}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>תאריך</th>
                        <th style={tableHeaderStyle}>סוג</th>
                        <th style={tableHeaderStyle}>גולש</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewDetail.activities.map((a) => (
                        <tr key={a.activity_id}>
                          <td style={tableCellStyle}>
                            {a.activity_date
                              ? new Date(a.activity_date).toLocaleDateString(
                                  "he-IL"
                                )
                              : "—"}
                          </td>
                          <td style={tableCellStyle}>{a.kind || "—"}</td>
                          <td style={tableCellStyle}>{a.surfer_name || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section
              title={`גולשים שסייע (${
                viewDetail?.supportedSurfers?.length || 0
              })`}
              style={{ background: colors.surface }}
            >
              {viewDetailLoading ? (
                <div style={{ textAlign: "center", color: muted }}>
                  טוען שיוכים...
                </div>
              ) : !viewDetail?.supportedSurfers?.length ? (
                <div style={{ color: muted, fontSize: 13 }}>
                  אין שיוכי צוות לגולשים.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...tableStyle, minWidth: 520 }}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>שם</th>
                        <th style={tableHeaderStyle}>תוכנית</th>
                        <th style={tableHeaderStyle}>סטטוס</th>
                        <th style={tableHeaderStyle}>קבוצה</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewDetail.supportedSurfers.map((s) => (
                        <tr key={s.national_id}>
                          <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                            {s.full_name}
                          </td>
                          <td style={tableCellStyle}>{s.program || "—"}</td>
                          <td style={tableCellStyle}>{s.status || "—"}</td>
                          <td style={tableCellStyle}>{s.group_name || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </>
        )}
      </Modal>
    </div>
  );
}

function VolunteersHomeTab({
  loading,
  summary,
  volunteers,
  taskForm,
  onTaskChange,
  onCreateTask,
  submittingTask,
  onRefreshSummary,
  tasksLoading,
  onToggleTaskStatus,
  onDeleteTask,
  onUpdateTask,
}: {
  loading: boolean;
  summary: VolunteerSummaryData;
  volunteers: Volunteer[];
  taskForm: TaskFormState;
  onTaskChange: (next: TaskFormState) => void;
  onCreateTask: () => void;
  submittingTask: boolean;
  onRefreshSummary: () => void;
  tasksLoading: boolean;
  onToggleTaskStatus: (task: VolunteerNote, nextStatus: NoteStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (
    taskId: string,
    payload: { title: string; body: string; due_date: string }
  ) => void;
}) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskEditDraft, setTaskEditDraft] = useState<{
    title: string;
    body: string;
    due_date: string;
  }>({ title: "", body: "", due_date: "" });

  const startEdit = (task: VolunteerNote) => {
    setEditingTaskId(task.note_id);
    setTaskEditDraft({
      title: task.title || "",
      body: task.body || "",
      due_date: task.due_date || "",
    });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setTaskEditDraft({ title: "", body: "", due_date: "" });
  };

  const saveEdit = async () => {
    if (!editingTaskId) return;
    await onUpdateTask(editingTaskId, taskEditDraft);
    cancelEdit();
  };
  const statsCards = [
    { label: "סה״כ מתנדבים", value: summary.stats.total },
    { label: "פעילים", value: summary.stats.active },
    { label: "מאושרים", value: summary.stats.approved },
    { label: "ממתינים", value: summary.stats.pending },
    { label: "משויכים", value: summary.stats.grouped },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: spacing.sm,
            marginBottom: spacing.sm,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>מבט כללי · מתנדבים</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              סטטוסים ומדדים מרכזיים של צוות המתנדבים
            </p>
          </div>
          <SmallActionButton variant="secondary" onClick={onRefreshSummary}>
            רענן
          </SmallActionButton>
        </div>
        {loading ? (
          <div style={{ padding: spacing.lg, textAlign: "center" }}>
            טוען נתונים...
          </div>
        ) : (
          <StatCardGrid stats={statsCards} />
        )}
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: spacing.lg,
        }}
      >
        <Card style={{ padding: spacing.lg }}>
          <h4 style={{ margin: "0 0 12px 0" }}>משימות / פתקים</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: spacing.sm,
              }}
            >
              <div>
                <label style={labelStyle}>שיוך למתנדב</label>
                <select
                  style={inputStyle}
                  value={taskForm.volunteer_id}
                  onChange={(e) =>
                    onTaskChange({ ...taskForm, volunteer_id: e.target.value })
                  }
                >
                  <option value="">בחר מתנדב</option>
                  {volunteers.map((v) => (
                    <option key={v.national_id} value={v.national_id}>
                      {v.full_name} ({v.national_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>תאריך יעד</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={taskForm.due_date}
                  onChange={(e) =>
                    onTaskChange({ ...taskForm, due_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: spacing.sm,
              }}
            >
              <div>
                <label style={labelStyle}>כותרת</label>
                <input
                  style={inputStyle}
                  value={taskForm.title}
                  onChange={(e) =>
                    onTaskChange({ ...taskForm, title: e.target.value })
                  }
                  placeholder="למשל: לתאם הדרכה"
                />
              </div>
              <div>
                <label style={labelStyle}>תוכן</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 70 }}
                  value={taskForm.body}
                  onChange={(e) =>
                    onTaskChange({ ...taskForm, body: e.target.value })
                  }
                  placeholder="תיאור המשימה או הפתק"
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: spacing.sm,
              }}
            >
              <SmallActionButton
                variant="secondary"
                onClick={() => onTaskChange(createEmptyTaskForm())}
              >
                ניקוי
              </SmallActionButton>
              <SmallActionButton
                onClick={onCreateTask}
                disabled={submittingTask}
              >
                {submittingTask ? "שומר..." : "שמור פתק"}
              </SmallActionButton>
            </div>
          </div>
          <div
            style={{
              marginTop: spacing.lg,
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            {(tasksLoading || summary.tasks.length === 0) && (
              <div style={{ color: muted, fontSize: 13 }}>
                {tasksLoading ? "טוען משימות..." : "אין משימות. צור אחת חדשה."}
              </div>
            )}
            {summary.tasks.map((task) => (
              <div
                key={task.note_id}
                style={{
                  padding: spacing.sm,
                  borderRadius: radii.card,
                  border: `1px solid ${colors.borderMuted}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {editingTaskId === task.note_id ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: spacing.xs,
                    }}
                  >
                    <input
                      style={inputStyle}
                      value={taskEditDraft.title}
                      onChange={(e) =>
                        setTaskEditDraft((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="כותרת"
                    />
                    <textarea
                      style={{ ...inputStyle, minHeight: 70 }}
                      value={taskEditDraft.body}
                      onChange={(e) =>
                        setTaskEditDraft((prev) => ({
                          ...prev,
                          body: e.target.value,
                        }))
                      }
                      placeholder="תיאור המשימה"
                    />
                    <input
                      type="date"
                      style={inputStyle}
                      value={taskEditDraft.due_date || ""}
                      onChange={(e) =>
                        setTaskEditDraft((prev) => ({
                          ...prev,
                          due_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: spacing.sm,
                      }}
                    >
                      <strong>{task.title || "פתק ללא כותרת"}</strong>
                      <StatusPill
                        tone={
                          task.status === "done"
                            ? "success"
                            : task.status === "cancelled"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {task.status === "done"
                          ? "סגור"
                          : task.status === "cancelled"
                          ? "בוטל"
                          : task.status === "in_progress"
                          ? "בתהליך"
                          : "פתוח"}
                      </StatusPill>
                    </div>
                    <div style={{ color: muted, fontSize: 13 }}>
                      {task.body}
                    </div>
                    <div style={{ fontSize: 12, color: muted }}>
                      תאריך יעד:{" "}
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("he-IL")
                        : "—"}
                    </div>
                    <div style={{ fontSize: 11, color: muted }}>
                      נוצר ע"י {task.created_by || "—"} ·{" "}
                      {task.created_at
                        ? new Date(task.created_at).toLocaleString("he-IL")
                        : "—"}
                    </div>
                  </>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: spacing.xs,
                    marginTop: spacing.xs,
                  }}
                >
                  {editingTaskId === task.note_id ? (
                    <>
                      <SmallActionButton
                        variant="secondary"
                        onClick={saveEdit}
                        style={{ fontSize: 12 }}
                      >
                        שמור
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        onClick={cancelEdit}
                        style={{ fontSize: 12 }}
                      >
                        ביטול
                      </SmallActionButton>
                    </>
                  ) : (
                    <SmallActionButton
                      variant="secondary"
                      onClick={() => startEdit(task)}
                      style={{ fontSize: 12 }}
                    >
                      עריכה
                    </SmallActionButton>
                  )}
                  <SmallActionButton
                    variant="secondary"
                    onClick={() =>
                      onToggleTaskStatus(
                        task,
                        task.status === "done" ? "open" : "done"
                      )
                    }
                    style={{ fontSize: 12 }}
                  >
                    {task.status === "done" ? "פתח" : "סגור"}
                  </SmallActionButton>
                  <SmallActionButton
                    variant="secondary"
                    style={{ color: colors.danger, fontSize: 12 }}
                    onClick={() => onDeleteTask(task.note_id)}
                  >
                    מחיקה
                  </SmallActionButton>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: spacing.lg }}>
          <h4 style={{ margin: "0 0 12px 0" }}>פעילות אחרונה</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            {summary.recentActivity.length === 0 && (
              <div style={{ color: muted, fontSize: 13 }}>
                לא נמצאה פעילות אחרונה.
              </div>
            )}
            {summary.recentActivity.map((item) => (
              <div
                key={item.national_id}
                style={{
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: radii.card,
                  padding: spacing.sm,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ fontWeight: 700 }}>{item.full_name}</div>
                  <div style={{ color: muted, fontSize: 12 }}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("he-IL")
                      : "—"}
                  </div>
                </div>
                <div style={{ color: muted, fontSize: 13 }}>
                  {item.program || "ללא תוכנית"} · {item.status || "—"}
                </div>
                <div style={{ fontSize: 12, color: muted }}>
                  קבוצה: {item.group_name || "לא שויכה"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function VolunteersListTab({
  loading,
  error,
  volunteers,
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onView,
  drafts,
  onResumeDraft,
  onDeleteDraft,
}: {
  loading: boolean;
  error: string | null;
  volunteers: Volunteer[];
  filters: VolunteerFilters;
  onFilterChange: <K extends keyof VolunteerFilters>(
    key: K,
    value: VolunteerFilters[K]
  ) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (volunteer: Volunteer) => void;
  onDelete: (id: string) => void;
  onView: (volunteer: Volunteer) => void;
  drafts: DraftEntry<VolunteerFormState>[];
  onResumeDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
}) {
  return (
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
        <div>
          <h2 style={{ margin: 0 }}>רשימת מתנדבים</h2>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            ניהול ועריכת כל המתנדבים במערכת.
          </p>
          {error && (
            <p style={{ marginTop: 4, color: colors.danger, fontSize: 12 }}>
              {error}
            </p>
          )}
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
          <SmallActionButton variant="secondary" onClick={onRefresh}>
            רענן
          </SmallActionButton>
          <SmallActionButton variant="secondary" onClick={onClearFilters}>
            ניקוי פילטרים
          </SmallActionButton>
          <Button onClick={onAdd}>+ מתנדב חדש</Button>
        </div>
      </div>

      {drafts.length > 0 && (
        <DraftList
          drafts={drafts}
          title={`טיוטות שמורות (${drafts.length})`}
          description="טיוטות אלו זמינות עבורך בלבד עד לשמירה סופית."
          onResume={onResumeDraft}
          onDelete={onDeleteDraft}
          badgeLabel="טיוטה"
          getTitle={(draft) => draft.payload.full_name || "מתנדב ללא שם"}
          getSubtitle={(draft) =>
            `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
          }
        />
      )}

      <FilterToolbar columns="repeat(auto-fit, minmax(200px, 1fr))">
        <input
          style={filterControlStyle}
          placeholder="חיפוש לפי שם, ת.ז, טלפון או אימייל"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        <select
          style={filterControlStyle}
          value={filters.status}
          onChange={(e) =>
            onFilterChange(
              "status",
              e.target.value as VolunteerFilters["status"]
            )
          }
        >
          <option value="all">כל המצבים</option>
          <option value="active">פעילים</option>
          <option value="inactive">לא פעילים</option>
          <option value="approved">מאושרים</option>
          <option value="pending">ממתינים</option>
        </select>
        <select
          style={filterControlStyle}
          value={filters.program}
          onChange={(e) => onFilterChange("program", e.target.value)}
        >
          <option value="">כל התוכניות</option>
          {PROGRAM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </FilterToolbar>

      {loading ? (
        <div style={{ textAlign: "center" }}>טוען מתנדבים...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>ת.ז.</th>
                <th style={tableHeaderStyle}>שם מלא</th>
                <th style={tableHeaderStyle}>תוכנית</th>
                <th style={tableHeaderStyle}>קבוצה</th>
                <th style={tableHeaderStyle}>סטטוס</th>
                <th style={tableHeaderStyle}>טלפון</th>
                <th style={tableHeaderStyle}>פעיל</th>
                <th style={tableHeaderStyle}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.national_id}>
                  <td style={tableCellStyle}>{v.national_id}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 700 }}>
                    {v.full_name}
                  </td>
                  <td style={tableCellStyle}>{v.program || "—"}</td>
                  <td style={tableCellStyle}>{v.group_name || "לא שויכה"}</td>
                  <td style={tableCellStyle}>{v.status || "—"}</td>
                  <td style={tableCellStyle}>{formatPhoneNumber(v.phone)}</td>
                  <td style={tableCellStyle}>
                    <StatusPill tone={v.active ? "active" : "inactive"}>
                      {v.active ? "פעיל" : "לא פעיל"}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>
                    <SmallActionButton
                      variant="secondary"
                      onClick={() => onView(v)}
                      style={{ marginInlineEnd: spacing.xs }}
                    >
                      👁️
                    </SmallActionButton>
                    <SmallActionButton
                      variant="secondary"
                      onClick={() => onEdit(v)}
                      style={{ marginInlineEnd: spacing.xs }}
                    >
                      ✏️
                    </SmallActionButton>
                    <SmallActionButton
                      variant="secondary"
                      style={{ color: colors.danger }}
                      onClick={() => onDelete(v.national_id)}
                    >
                      🗑️
                    </SmallActionButton>
                  </td>
                </tr>
              ))}
              {volunteers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ ...tableCellStyle, textAlign: "center" }}
                  >
                    לא נמצאו מתנדבים. לחץ על "מתנדב חדש" כדי להתחיל.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function SettingsTab() {
  return (
    <Card>
      <Section title="הגדרות מתנדבים" subtitle="בקרוב">
        <div style={{ color: muted }}>תוכן ההגדרות יתווסף בהמשך.</div>
      </Section>
    </Card>
  );
}
