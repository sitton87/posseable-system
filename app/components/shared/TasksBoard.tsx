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

type TasksBoardProps = {
  entityType: string;
  entities?: TaskEntityOption[];
  assignees?: TaskAssigneeOption[];
  fixedEntityId?: string;
  title?: string;
  variant?: "grid" | "list";
};

// --- Helpers ---

// Map tone names to hex colors for inline styles if needed
const TONE_COLORS: Record<string, { bg: string; text: string }> = {
  neutral: { bg: "#f3f4f6", text: "#374151" },
  warning: { bg: "#fef3c7", text: "#92400e" },
  info: { bg: "#e0f2fe", text: "#075985" },
  purple: { bg: "#f3e8ff", text: "#6b21a8" },
  success: { bg: "#dcfce7", text: "#166534" },
  danger: { bg: "#fee2e2", text: "#991b1b" },
};

const TASK_STATUSES: { value: NoteStatus; label: string; tone: StatusTone }[] =
  [
    { value: "not_started", label: "טרם התחיל", tone: "neutral" },
    { value: "open", label: "פתוח", tone: "warning" },
    { value: "in_progress", label: "בתהליך", tone: "info" },
    { value: "postponed", label: "נדחה", tone: "muted" }, // mapped to muted as purple doesn't exist in StatusTone
    { value: "done", label: "הסתיים", tone: "success" },
    { value: "cancelled", label: "בוטל", tone: "danger" },
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

// --- Component ---

export function TasksBoard({
  entityType,
  entities = [],
  assignees = [],
  fixedEntityId,
  title = "משימות ופתקים",
  variant = "grid",
}: TasksBoardProps) {
  const [tasks, setTasks] = useState<TaskNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    entity_id: fixedEntityId || "",
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

  // --- Actions ---

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append("entityType", entityType);
      if (fixedEntityId) {
        params.append("entityId", fixedEntityId);
      }

      const res = await fetch(`/api/notes?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Failed to load tasks");

      const normalizedTasks = (data.notes || []).map((t: any) => ({
        ...t,
        status: normalizeStatus(t.status),
      }));
      setTasks(normalizedTasks);
    } catch (err: any) {
      console.error("Error loading tasks:", err);
      setError("שגיאה בטעינת המשימות");
    } finally {
      setLoading(false);
    }
  }, [entityType, fixedEntityId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async () => {
    if (!formData.entity_id && !fixedEntityId) {
      alert("יש לבחור למי משויכת המשימה");
      return;
    }
    if (!formData.title.trim()) {
      alert("כותרת היא שדה חובה");
      return;
    }

    try {
      setSubmitting(true);
      const endpoint =
        isEditing && editingId ? `/api/notes/${editingId}` : "/api/notes";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...formData,
        entity_type: entityType,
        entity_id: fixedEntityId || formData.entity_id,
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
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t.note_id === task.note_id ? { ...t, status: newStatus } : t
        )
      );

      const res = await fetch(`/api/notes/${task.note_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        fetchTasks(); // Revert on failure
      }
    } catch (err) {
      fetchTasks();
    }
  };

  const handleToggleComplete = async (task: TaskNote) => {
    const newStatus = task.status === "done" ? "open" : "done";
    handleStatusChange(task, newStatus);
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
      entity_id: fixedEntityId || "",
      title: "",
      body: "",
      due_date: "",
      status: "not_started",
      assigned_to: "",
    });
  };

  const clearFormContent = () => {
    if (confirm("לנקות את כל השדות בטופס?")) {
      setFormData({
        entity_id: fixedEntityId || "", // Reset to default or empty if not fixed
        title: "",
        body: "",
        due_date: "",
        status: "not_started",
        assigned_to: "",
      });
    }
  };

  // --- Render Helpers ---

  const renderCreationForm = () => (
    <div
      style={{
        background: colors.background,
        padding: spacing.md,
        borderRadius: radii.card,
        border: `1px solid ${colors.border}`,
        marginBottom: spacing.lg,
      }}
    >
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
            gap: spacing.md,
          }}
        >
          {!fixedEntityId && (
            <div>
              <label style={labelStyle}>שיוך</label>
              <select
                style={inputStyle}
                value={formData.entity_id}
                onChange={(e) =>
                  setFormData({ ...formData, entity_id: e.target.value })
                }
              >
                <option value="">בחר...</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} {e.subtitle ? `(${e.subtitle})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {assignees.length > 0 && (
            <div>
              <label style={labelStyle}>אחריות (אופציונלי)</label>
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
          )}

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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: spacing.md,
          }}
        >
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
            <label style={labelStyle}>תוכן</label>
            <input
              style={inputStyle}
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              placeholder="פירוט..."
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
            onClick={clearFormContent}
            title="נקה טופס"
          >
            <RotateCcw size={14} /> נקה תוכן
          </SmallActionButton>
          <SmallActionButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? "שומר..." : "צור משימה"}
          </SmallActionButton>
        </div>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
      {tasks.map((task) => {
        const entityName = entities.find((e) => e.id === task.entity_id)?.name;
        const statusObj = TASK_STATUSES.find((s) => s.value === task.status);
        const isOverdue =
          task.due_date &&
          new Date(task.due_date) < new Date() &&
          task.status !== "done" &&
          task.status !== "cancelled";

        return (
          <div
            key={task.note_id}
            style={{
              background: "#fff",
              borderRadius: radii.card,
              border: `1px solid ${colors.borderMuted}`,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                borderBottom: `1px solid ${colors.border}`,
                background: "rgba(249, 250, 251, 0.5)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {task.title}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {task.due_date && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      padding: "2px 8px",
                      background: isOverdue
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(0,0,0,0.04)",
                      borderRadius: radii.pill,
                      color: isOverdue ? colors.danger : colors.textMuted,
                    }}
                  >
                    <Calendar size={13} />
                    <span>
                      {new Date(task.due_date).toLocaleDateString("he-IL")}
                    </span>
                    {isOverdue && <AlertCircle size={13} />}
                  </div>
                )}

                <select
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: radii.pill,
                    border: "none",
                    background: TONE_COLORS[statusObj?.tone || "neutral"].bg,
                    color: TONE_COLORS[statusObj?.tone || "neutral"].text,
                    cursor: "pointer",
                    outline: "none",
                    fontWeight: 600,
                  }}
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task, e.target.value as NoteStatus)
                  }
                >
                  {TASK_STATUSES.map((s) => (
                    <option
                      key={s.value}
                      value={s.value}
                      style={{ backgroundColor: "#fff", color: "#000" }}
                    >
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: spacing.md }}>
              <p
                style={{
                  margin: "0 0 16px 0",
                  color: colors.textPrimary,
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {task.body}
              </p>

              {/* Metadata Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                  fontSize: 12,
                  color: colors.textMuted,
                }}
              >
                {!fixedEntityId && entityName && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <User size={14} />
                    <span>
                      עבור: <strong>{entityName}</strong>
                    </span>
                  </div>
                )}
                {task.assigned_to_name && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <User size={14} />
                    <span>
                      אחריות: <strong>{task.assigned_to_name}</strong>
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={14} />
                  <span>
                    נוצר ע"י:{" "}
                    <strong>
                      {task.created_by_name || task.created_by || "?"}
                    </strong>
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} />
                  <span>נוצר: {formatDateTime(task.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div
              style={{
                padding: `${spacing.xs} ${spacing.xl}`,
                borderTop: `1px solid ${colors.border}`,
                display: "flex",
                justifyContent: "flex-end",
                gap: spacing.md,
                background: "#fff",
              }}
            >
              <button
                onClick={() => handleShowHistory(task)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: colors.primary,
                }}
              >
                <History size={14} /> היסטוריה
              </button>
              <button
                onClick={() => startEdit(task)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: colors.textMuted,
                }}
              >
                <Edit2 size={14} /> ערוך
              </button>
              <button
                onClick={() => handleDelete(task.note_id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: colors.danger,
                }}
              >
                <Trash2 size={14} /> מחק
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Button
        variant="secondary"
        onClick={() => setIsEditing(true)}
        style={{ alignSelf: "flex-start", marginBottom: 8 }}
      >
        <Plus size={14} style={{ marginLeft: 6 }} /> הוסף משימה
      </Button>
      {tasks.map((task) => {
        const isCompleted = task.status === "done";
        const isOverdue =
          task.due_date &&
          new Date(task.due_date) < new Date() &&
          !isCompleted &&
          task.status !== "cancelled";

        return (
          <div
            key={task.note_id}
            style={{
              background: isCompleted ? colors.surfaceAlt : "#fff",
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: isCompleted ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            {/* 1. Checkbox */}
            <div
              onClick={() => handleToggleComplete(task)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: isCompleted ? colors.success : colors.textMuted,
              }}
            >
              {isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
            </div>

            {/* 2. Title & Assignee */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
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

              {task.assigned_to_name && (
                <span
                  style={{
                    fontSize: 11,
                    background: colors.surfaceAlt,
                    padding: "2px 6px",
                    borderRadius: 4,
                    color: colors.textMuted,
                    whiteSpace: "nowrap",
                  }}
                >
                  <User
                    size={10}
                    style={{ verticalAlign: "middle", marginLeft: 2 }}
                  />
                  {task.assigned_to_name}
                </span>
              )}
            </div>

            {/* 3. Due Date */}
            {task.due_date && (
              <div
                style={{
                  fontSize: 12,
                  color: isOverdue ? colors.danger : colors.textMuted,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Calendar size={12} />
                {new Date(task.due_date).toLocaleDateString("he-IL", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
            )}

            {/* 4. Actions */}
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => handleShowHistory(task)}
                title="היסטוריה"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.textMuted,
                  padding: 4,
                }}
              >
                <History size={16} />
              </button>
              <button
                onClick={() => handleDelete(task.note_id)}
                title="מחק"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.textMuted, // Using muted instead of danger for cleaner look until hover
                  padding: 4,
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

  // --- Render ---

  return (
    <Card
      style={{
        padding: spacing.lg,
        background: variant === "list" ? "transparent" : undefined,
        boxShadow: variant === "list" ? "none" : undefined,
        border: variant === "list" ? "none" : undefined,
      }}
    >
      <div
        style={{
          marginBottom: spacing.lg,
          display: variant === "list" ? "none" : "block",
        }}
      >
        <h4 style={{ margin: "0 0 16px 0" }}>{title}</h4>
      </div>

      {/* Creation Form - Only show if not editing (modal handles editing) and variant is grid OR if variant is list but we want inline? actually list uses modal for everything for simplicity now */}
      {!isEditing && variant === "grid" && renderCreationForm()}

      {/* List Area */}
      {loading && (
        <div
          style={{ color: colors.textMuted, textAlign: "center", padding: 20 }}
        >
          טוען...
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div
          style={{
            color: colors.textMuted,
            textAlign: "center",
            padding: spacing.lg,
          }}
        >
          אין משימות להצגה.
          {variant === "list" && (
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              style={{ marginTop: 8 }}
            >
              <Plus size={14} style={{ marginLeft: 6 }} /> הוסף משימה ראשונה
            </Button>
          )}
        </div>
      )}

      {!loading &&
        tasks.length > 0 &&
        (variant === "list" ? renderListView() : renderGridView())}

      {/* Edit Modal */}
      <Modal
        open={isEditing}
        onClose={resetForm}
        width="min(500px, 90vw)"
        style={{ padding: spacing.xl }}
      >
        <h3 style={{ marginTop: 0 }}>
          {editingId ? "עריכת משימה" : "הוספת משימה חדשה"}
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing.md,
            marginTop: spacing.lg,
          }}
        >
          <div>
            <label style={labelStyle}>כותרת</label>
            <input
              style={inputStyle}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              autoFocus
            />
          </div>

          {assignees.length > 0 && (
            <div>
              <label style={labelStyle}>אחריות</label>
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
          )}

          <div>
            <label style={labelStyle}>תוכן (אופציונלי)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
            />
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

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: spacing.sm,
              marginTop: spacing.md,
            }}
          >
            <Button variant="secondary" onClick={resetForm}>
              ביטול
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "שמור" : "שמור"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        width="min(500px, 90vw)"
        style={{ padding: spacing.xl }}
      >
        <h3 style={{ marginTop: 0, marginBottom: spacing.md }}>
          היסטוריית שינויים
        </h3>
        <p
          style={{
            margin: "0 0 16px 0",
            color: colors.textMuted,
            fontSize: 13,
          }}
        >
          עבור: {currentHistoryTitle}
        </p>

        {historyLoading ? (
          <div style={{ textAlign: "center", color: colors.textMuted }}>
            טוען נתונים...
          </div>
        ) : historyData.length === 0 ? (
          <div style={{ textAlign: "center", color: colors.textMuted }}>
            אין היסטוריית שינויים.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            {historyData.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: 12,
                  background: colors.background,
                  borderRadius: radii.button,
                  border: `1px solid ${colors.border}`,
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <strong>{entry.changed_by_name || entry.changed_by}</strong>
                  <span style={{ color: colors.textMuted }}>
                    {formatDateTime(entry.changed_at)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusPill tone="neutral">
                    {getStatusLabel(entry.old_status || "—")}
                  </StatusPill>
                  <span style={{ color: colors.textMuted }}>←</span>
                  <StatusPill
                    tone={
                      (TASK_STATUSES.find((s) => s.value === entry.new_status)
                        ?.tone as StatusTone) || "neutral"
                    }
                  >
                    {getStatusLabel(entry.new_status)}
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: spacing.lg, textAlign: "right" }}>
          <Button
            variant="secondary"
            onClick={() => setHistoryModalOpen(false)}
          >
            סגור
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
