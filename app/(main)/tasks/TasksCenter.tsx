"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SmallActionButton,
  StatusPill,
  StatusTone,
} from "@/app/components/shared";
import { Card, Modal, Button } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { NoteStatus } from "@/type";
import {
  Calendar,
  Clock,
  User,
  History,
  Trash2,
  Edit2,
  RotateCcw,
  AlertCircle,
  CheckSquare,
  Square,
  Plus,
  Filter,
} from "lucide-react";

// --- Types ---

export type TaskEntityOption = {
  id: string;
  name: string;
  subtitle?: string;
};

export type TaskAssigneeOption = {
  id: string;
  name: string;
};

type TaskNote = {
  note_id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  body: string;
  status: NoteStatus;
  priority?: string;
  due_date?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  created_by?: string | null;
  created_by_name?: string | null;
  created_at?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
};

type HistoryEntry = {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: string;
  changed_by_name: string | null;
};

// --- Helpers ---

const TONE_COLORS: Record<string, { bg: string; text: string }> = {
  neutral: { bg: "#f3f4f6", text: "#374151" },
  warning: { bg: "#fef3c7", text: "#92400e" },
  info: { bg: "#e0f2fe", text: "#075985" },
  purple: { bg: "#f3e8ff", text: "#6b21a8" },
  success: { bg: "#dcfce7", text: "#166534" },
  danger: { bg: "#fee2e2", text: "#991b1b" },
  muted: { bg: "#f3f4f6", text: "#6b7280" },
};

const TASK_STATUSES: { value: NoteStatus; label: string; tone: StatusTone }[] =
  [
    { value: "not_started", label: "טרם התחיל", tone: "neutral" },
    { value: "open", label: "פתוח", tone: "warning" },
    { value: "in_progress", label: "בתהליך", tone: "info" },
    { value: "postponed", label: "נדחה", tone: "muted" },
    { value: "done", label: "הסתיים", tone: "success" },
    { value: "cancelled", label: "בוטל", tone: "danger" },
  ];

const ENTITY_TYPES = [
  { value: "surfer", label: "גולש" },
  { value: "volunteer", label: "מתנדב/איש צוות" },
  { value: "activity", label: "פעילות" },
  { value: "donor", label: "תורם" },
  { value: "supplier", label: "ספק" },
  { value: "equipment", label: "ציוד" },
  { value: "general", label: "כללי" },
];

const normalizeStatus = (raw?: string | null): NoteStatus => {
  if (!raw) return "open";
  const v = raw.toLowerCase();
  if (v === "pending") return "open";
  if (v === "closed") return "done";
  return TASK_STATUSES.some((s) => s.value === v) ? (v as NoteStatus) : "open";
};

const formatDateTime = (isoString?: string | null) => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const getStatusLabel = (val: string) =>
  TASK_STATUSES.find((s) => s.value === val)?.label || val;

const getEntityTypeLabel = (val: string) =>
  ENTITY_TYPES.find((t) => t.value === val)?.label || val;

// --- Component ---

export function TasksCenter() {
  const [activeTasks, setActiveTasks] = useState<TaskNote[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<string>("all"); // week, month, season, all
  const [sortBy, setSortBy] = useState<string>("date_asc"); // date_asc, date_desc
  const [groupBy, setGroupBy] = useState<string>("none"); // none, assignee, type

  // Options
  const [assignees, setAssignees] = useState<TaskAssigneeOption[]>([]);
  const [entityOptions, setEntityOptions] = useState<TaskEntityOption[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);

  // Toggle for showing all completed tasks
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    entity_type: "",
    entity_id: "",
    title: "",
    body: "",
    due_date: "",
    status: "not_started" as NoteStatus,
    assigned_to: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // History State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [currentHistoryTitle, setCurrentHistoryTitle] = useState("");

  // Helper to fetch assignees (Volunteers)
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const res = await fetch("/api/volunteers?view=list"); // Assuming endpoint supports list
        const data = await res.json();
        if (data.success) {
          setAssignees(
            data.volunteers.map((v: any) => ({
              id: v.national_id,
              name: v.full_name,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch assignees", err);
      }
    };
    fetchAssignees();
  }, []);

  // Helper to fetch entities based on type
  const fetchEntitiesForType = async (type: string) => {
    if (!type || type === "general") {
      setEntityOptions([]);
      return;
    }
    setLoadingEntities(true);
    try {
      let url = "";
      let mapFn = (item: any) => ({ id: "", name: "" });

      switch (type) {
        case "surfer":
          url = "/api/surfer";
          mapFn = (s: any) => ({ id: s.national_id, name: s.full_name });
          break;
        case "volunteer":
          url = "/api/volunteers?view=list";
          mapFn = (v: any) => ({ id: v.national_id, name: v.full_name });
          break;
        case "donor":
          url = "/api/donors";
          mapFn = (d: any) => ({
            id: d.national_id,
            name: d.full_name,
            subtitle: d.organization,
          });
          break;
        case "supplier":
          url = "/api/suppliers";
          mapFn = (s: any) => ({ id: s.supplier_identifier, name: s.name });
          break;
        case "activity":
          // Ideally need a lightweight list endpoint. Assuming one exists or using generic GET
          url = "/api/activities";
          mapFn = (a: any) => {
            // Activity structure varies, trying best guess or standard fields
            const date = a.activity_date
              ? new Date(a.activity_date).toLocaleDateString("he-IL")
              : "";
            const name = `${a.kind || "פעילות"} - ${date}`;
            return { id: a.id.toString(), name: name, subtitle: a.group_name };
          };
          break;
        case "equipment":
          url = "/api/equipment"; // Need to check if this exists
          mapFn = (e: any) => ({ id: e.id, name: e.name });
          break;
        default:
          setEntityOptions([]);
          setLoadingEntities(false);
          return;
      }

      const res = await fetch(url);
      const data = await res.json();

      // Extract array based on structure
      let list = [];
      if (data.success) {
        if (data.surfers) list = data.surfers;
        else if (data.volunteers) list = data.volunteers;
        else if (data.donors) list = data.donors;
        else if (data.suppliers) list = data.suppliers;
        else if (data.activities) list = data.activities;
        else if (data.items) list = data.items; // for equipment?
      }

      setEntityOptions(list.map(mapFn));
    } catch (err) {
      console.error("Failed to fetch entities for type", type, err);
      setEntityOptions([]);
    } finally {
      setLoadingEntities(false);
    }
  };

  // Watch for form entity type change
  useEffect(() => {
    if (isEditing && formData.entity_type) {
      fetchEntitiesForType(formData.entity_type);
    }
  }, [isEditing, formData.entity_type]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all tasks
      const baseUrl = `/api/notes?entityType=all`;

      // 1. Load active tasks
      const activeRes = await fetch(`${baseUrl}&showArchived=false&limit=200`);
      const activeData = await activeRes.json();

      // 2. Load completed tasks
      const limit = showAllCompleted ? 100 : 7;
      const completedRes = await fetch(
        `${baseUrl}&showArchived=true&limit=${limit}`
      );
      const completedData = await completedRes.json();

      const normalize = (t: any) => ({
        ...t,
        status: normalizeStatus(t.status),
      });

      if (activeData.success)
        setActiveTasks((activeData.notes || []).map(normalize));
      if (completedData.success)
        setCompletedTasks((completedData.notes || []).map(normalize));
    } catch (err: any) {
      console.error("Error loading tasks:", err);
      setError("שגיאה בטעינת המשימות");
    } finally {
      setLoading(false);
    }
  }, [showAllCompleted]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async () => {
    if (!formData.entity_type) {
      alert("יש לבחור סוג יישות");
      return;
    }
    if (formData.entity_type !== "general" && !formData.entity_id) {
      alert("יש לבחור למי משויכת המשימה");
      return;
    }
    if (!formData.title.trim()) {
      alert("כותרת היא שדה חובה");
      return;
    }

    try {
      setSubmitting(true);

      const isUpdate = isEditing && !!editingId;
      const endpoint = isUpdate ? `/api/notes/${editingId}` : "/api/notes";
      const method = isUpdate ? "PATCH" : "POST";

      const payload = {
        ...formData,
        entity_id:
          formData.entity_type === "general" ? "general" : formData.entity_id,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to || null,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Action failed");

      if (isEditing) {
        setIsEditing(false);
        setEditingId(null);
      }
      resetForm();
      fetchTasks();
    } catch (err: any) {
      alert(err.message || "שגיאה בשמירה");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק משימה זו? הפעולה אינה הפיכה."))
      return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      fetchTasks();
    } catch (err) {
      alert("שגיאה במחיקה");
    }
  };

  const handleStatusChange = async (task: TaskNote, newStatus: NoteStatus) => {
    // Optimistic update logic (simplified for brevity, identical to TasksBoard)
    const isNowCompleted = newStatus === "done" || newStatus === "cancelled";
    const wasCompleted = task.status === "done" || task.status === "cancelled";

    if (isNowCompleted && !wasCompleted) {
      setActiveTasks((prev) => prev.filter((t) => t.note_id !== task.note_id));
      setCompletedTasks((prev) => [{ ...task, status: newStatus }, ...prev]);
    } else if (!isNowCompleted && wasCompleted) {
      setCompletedTasks((prev) =>
        prev.filter((t) => t.note_id !== task.note_id)
      );
      setActiveTasks((prev) => [{ ...task, status: newStatus }, ...prev]);
    } else {
      setActiveTasks((prev) =>
        prev.map((t) =>
          t.note_id === task.note_id ? { ...t, status: newStatus } : t
        )
      );
    }

    try {
      await fetch(`/api/notes/${task.note_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      fetchTasks();
    }
  };

  const handleShowHistory = async (task: TaskNote) => {
    setCurrentHistoryTitle(task.title);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    setHistoryData([]);

    try {
      const res = await fetch(`/api/notes/${task.note_id}/history`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setHistoryData(data.history);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const startEdit = (task: TaskNote) => {
    setEditingId(task.note_id);
    setIsEditing(true);
    setFormData({
      entity_type: task.entity_type,
      entity_id: task.entity_id,
      title: task.title,
      body: task.body,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      status: task.status,
      assigned_to: task.assigned_to || "",
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      entity_type: "",
      entity_id: "",
      title: "",
      body: "",
      due_date: "",
      status: "not_started",
      assigned_to: "",
    });
  };

  const clearFilters = () => {
    setFilterType("all");
    setFilterAssignee("all");
    setFilterTimeRange("all");
    setSortBy("date_asc");
    setGroupBy("none");
  };

  // --- Render Helpers ---

  const renderTaskList = (listTasks: TaskNote[]) => {
    // 1. Filtering
    let filtered = listTasks.filter((t) => {
      if (filterType !== "all" && t.entity_type !== filterType) return false;
      if (filterAssignee !== "all" && t.assigned_to !== filterAssignee)
        return false;

      if (filterTimeRange !== "all" && t.due_date) {
        const date = new Date(t.due_date);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Logic for future tasks or recent past
        if (filterTimeRange === "week" && (diffDays < 0 || diffDays > 7))
          return false;
        if (filterTimeRange === "month" && (diffDays < 0 || diffDays > 30))
          return false;
        if (filterTimeRange === "season" && (diffDays < 0 || diffDays > 90))
          return false;
      } else if (filterTimeRange !== "all" && !t.due_date) {
        return false;
      }

      return true;
    });

    // 2. Sorting
    filtered.sort((a, b) => {
      const dateA = a.due_date
        ? new Date(a.due_date).getTime()
        : sortBy === "date_asc"
        ? Infinity
        : -Infinity;
      const dateB = b.due_date
        ? new Date(b.due_date).getTime()
        : sortBy === "date_asc"
        ? Infinity
        : -Infinity;

      if (sortBy === "date_asc") return dateA - dateB;
      if (sortBy === "date_desc") return dateB - dateA;
      return 0;
    });

    // 3. Grouping
    if (groupBy !== "none") {
      const groups: Record<string, TaskNote[]> = {};
      filtered.forEach((t) => {
        let key = "";
        let label = "";

        if (groupBy === "assignee") {
          key = t.assigned_to || "unassigned";
          label = t.assigned_to_name || "ללא שיוך";
        } else if (groupBy === "type") {
          key = t.entity_type;
          label = getEntityTypeLabel(t.entity_type);
        }

        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
      });

      if (Object.keys(groups).length === 0)
        return <div style={{ color: colors.textMuted }}>אין משימות להצגה.</div>;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.entries(groups).map(([key, groupTasks]) => {
            // Find label for header
            let headerLabel = key;
            if (groupBy === "assignee")
              headerLabel = groupTasks[0]?.assigned_to_name || "ללא שיוך";
            if (groupBy === "type") headerLabel = getEntityTypeLabel(key);

            return (
              <div key={key}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    color: colors.textMuted,
                    borderBottom: `1px solid ${colors.border}`,
                    paddingBottom: 4,
                  }}
                >
                  {headerLabel} ({groupTasks.length})
                </h4>
                {renderFlatList(groupTasks)}
              </div>
            );
          })}
        </div>
      );
    }

    // Default Flat List
    return renderFlatList(filtered);
  };

  const renderFlatList = (tasks: TaskNote[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tasks.map((task) => {
        const isCompleted =
          task.status === "done" || task.status === "cancelled";
        const isOverdue =
          task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

        return (
          <div
            key={task.note_id}
            style={{
              background: isCompleted ? colors.surfaceAlt : "#fff",
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: "8px 12px",
              display: "grid",
              gridTemplateColumns: "30px 1fr 140px 140px 100px 80px", // Grid layout for better columnar view
              alignItems: "center",
              gap: 12,
              opacity: isCompleted ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            {/* 1. Status/Check */}
            <div
              onClick={() =>
                handleStatusChange(task, isCompleted ? "open" : "done")
              }
              style={{
                cursor: "pointer",
                color: isCompleted ? colors.success : colors.textMuted,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
            </div>

            {/* 2. Title & Type */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                overflow: "hidden",
              }}
            >
              <span
                onClick={() => startEdit(task)}
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: isCompleted ? "line-through" : "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {task.title}
              </span>
              <span style={{ fontSize: 11, color: colors.textMuted }}>
                {task.body && task.body.length > 50
                  ? task.body.substring(0, 50) + "..."
                  : task.body}
              </span>
            </div>

            {/* 3. Entity Info */}
            <div
              style={{
                fontSize: 12,
                color: colors.textMuted,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {getEntityTypeLabel(task.entity_type)}
              </span>
              <span style={{ fontSize: 11 }}>
                {task.entity_type === "general"
                  ? "כללי"
                  : `ID: ${task.entity_id}`}
                {/* Note: We don't have entity name here easily yet, would need lookup map or API join */}
              </span>
            </div>

            {/* 4. Assignee */}
            <div
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {task.assigned_to_name ? (
                <>
                  <User size={12} /> {task.assigned_to_name}
                </>
              ) : (
                <span style={{ color: colors.textMuted }}>-</span>
              )}
            </div>

            {/* 5. Due Date */}
            <div
              style={{
                fontSize: 12,
                color: isOverdue ? colors.danger : colors.textMuted,
              }}
            >
              {task.due_date
                ? new Date(task.due_date).toLocaleDateString("he-IL")
                : "-"}
            </div>

            {/* 6. Actions */}
            <div
              style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => startEdit(task)}
                title="ערוך"
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: colors.textMuted,
                }}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(task.note_id)}
                title="מחק"
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: colors.danger,
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card style={{ padding: spacing.lg }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.lg,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: spacing.md,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Type Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={16} color={colors.textMuted} />
            <select
              style={{ ...inputStyle, width: 140 }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">כל הסוגים</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Filter */}
          <select
            style={{ ...inputStyle, width: 140 }}
            value={filterTimeRange}
            onChange={(e) => setFilterTimeRange(e.target.value)}
          >
            <option value="all">כל הזמנים</option>
            <option value="week">השבוע הקרוב</option>
            <option value="month">החודש הקרוב</option>
            <option value="season">העונה הקרובה</option>
          </select>

          {/* Assignee Filter */}
          <select
            style={{ ...inputStyle, width: 140 }}
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="all">כל האחראים</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            style={{ ...inputStyle, width: 140 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_asc">מהקרוב לרחוק</option>
            <option value="date_desc">מהרחוק לקרוב</option>
          </select>

          {/* Group By */}
          <select
            style={{ ...inputStyle, width: 140 }}
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="none">ללא קיבוץ</option>
            <option value="assignee">קיבוץ לפי אחראי</option>
            <option value="type">קיבוץ לפי סוג</option>
          </select>

          <SmallActionButton variant="secondary" onClick={clearFilters}>
            נקה סינונים
          </SmallActionButton>
        </div>

        <Button
          onClick={() => {
            setIsEditing(true);
            setEditingId(null);
            setFormData((prev) => ({
              ...prev,
              entity_type: "",
              entity_id: "",
              title: "",
              body: "",
            }));
          }}
        >
          <Plus size={16} style={{ marginLeft: 8 }} /> משימה חדשה
        </Button>
      </div>

      {loading ? (
        <div
          style={{ padding: 40, textAlign: "center", color: colors.textMuted }}
        >
          טוען משימות...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>
              משימות לביצוע ({activeTasks.length})
            </h3>
            {activeTasks.length > 0 ? (
              renderTaskList(activeTasks)
            ) : (
              <div style={{ color: colors.textMuted }}>אין משימות פתוחות.</div>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: 16,
                  marginBottom: 16,
                  color: colors.textMuted,
                }}
              >
                הושלמו לאחרונה
              </h3>
              {renderTaskList(completedTasks)}
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Button
                  variant="ghost"
                  onClick={() => setShowAllCompleted(!showAllCompleted)}
                >
                  {showAllCompleted ? "הצג פחות" : "הצג עוד"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={isEditing} onClose={resetForm} width="600px">
        <h2 style={{ marginTop: 0 }}>
          {editingId ? "עריכת משימה" : "משימה חדשה"}
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 20,
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <label style={labelStyle}>סוג יישות</label>
              <select
                style={inputStyle}
                value={formData.entity_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    entity_type: e.target.value,
                    entity_id: "",
                  })
                }
                disabled={!!editingId} // Prevent changing type on edit for simplicity
              >
                <option value="">בחר סוג...</option>
                {ENTITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.entity_type && formData.entity_type !== "general" && (
              <div>
                <label style={labelStyle}>
                  שיוך ליישות {loadingEntities && "(טוען...)"}
                </label>
                <select
                  style={inputStyle}
                  value={formData.entity_id}
                  onChange={(e) =>
                    setFormData({ ...formData, entity_id: e.target.value })
                  }
                  disabled={loadingEntities || !!editingId}
                >
                  <option value="">בחר...</option>
                  {entityOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} {opt.subtitle ? `(${opt.subtitle})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>כותרת</label>
            <input
              style={inputStyle}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="נושא המשימה"
            />
          </div>

          <div>
            <label style={labelStyle}>פירוט</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <label style={labelStyle}>אחראי ביצוע</label>
              <select
                style={inputStyle}
                value={formData.assigned_to}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_to: e.target.value })
                }
              >
                <option value="">ללא שיוך</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>תאריך יעד</label>
              <input
                type="date"
                style={inputStyle}
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* Status - only in edit mode or advanced create */}
          <div>
            <label style={labelStyle}>סטטוס</label>
            <select
              style={inputStyle}
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as NoteStatus,
                })
              }
            >
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 16,
            }}
          >
            <Button variant="secondary" onClick={resetForm}>
              ביטול
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "שומר..." : "שמור משימה"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
