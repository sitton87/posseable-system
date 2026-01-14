"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SmallActionButton,
  StatusPill,
  StatusTone,
} from "@/app/components/shared";
import { Card, Modal, Button } from "@/app/components/ui";
import { task as taskPresets, cssVar, numericValues } from "@/app/styles/design-system";
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
  hideAddButton?: boolean;
  externalTrigger?: any;
};

// --- Helpers ---

const TASK_STATUSES: { value: NoteStatus; label: string; tone: StatusTone }[] =
  [
    { value: "not_started", label: "טרם התחיל", tone: "neutral" },
    { value: "open", label: "פתוח", tone: "warning" },
    { value: "in_progress", label: "בתהליך", tone: "info" },
    { value: "postponed", label: "נדחה", tone: "muted" },
    { value: "done", label: "הסתיים", tone: "success" },
    { value: "cancelled", label: "בוטל", tone: "danger" },
  ];

// Status class mapping for select dropdown
const getStatusClass = (status: NoteStatus) => {
  const map: Record<NoteStatus, string> = {
    not_started: taskPresets.statusNotStarted,
    open: taskPresets.statusOpen,
    in_progress: taskPresets.statusInProgress,
    postponed: taskPresets.statusPostponed,
    done: taskPresets.statusDone,
    cancelled: taskPresets.statusCancelled,
  };
  return map[status] || taskPresets.statusNotStarted;
};

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
  hideAddButton = false,
  externalTrigger,
}: TasksBoardProps) {
  // Split into active and completed lists
  const [activeTasks, setActiveTasks] = useState<TaskNote[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskNote[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle for showing all completed tasks
  const [showAllCompleted, setShowAllCompleted] = useState(false);

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

      const baseUrl = `/api/notes?entityType=${entityType}`;
      const entityParam = fixedEntityId ? `&entityId=${fixedEntityId}` : "";

      // 1. Load active tasks
      const activeRes = await fetch(
        `${baseUrl}${entityParam}&showArchived=false`
      );
      const activeData = await activeRes.json();

      // 2. Load completed tasks (limited to 10 or 100)
      const limit = showAllCompleted ? 100 : 10;
      const completedRes = await fetch(
        `${baseUrl}${entityParam}&showArchived=true&limit=${limit}`
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
  }, [entityType, fixedEntityId, showAllCompleted]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (
      externalTrigger &&
      typeof externalTrigger === "object" &&
      externalTrigger.action === "open_add_modal"
    ) {
      setIsEditing(true);
      setEditingId(null);
      // Reset form just in case
      setFormData({
        entity_id: fixedEntityId || "",
        title: "",
        body: "",
        due_date: "",
        status: "not_started" as NoteStatus,
        assigned_to: "",
      });
    }
  }, [externalTrigger, fixedEntityId]);

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

      const isUpdate = isEditing && !!editingId;
      const endpoint = isUpdate ? `/api/notes/${editingId}` : "/api/notes";
      const method = isUpdate ? "PATCH" : "POST";

      console.log(`Submitting task: ${method} ${endpoint}`, formData);

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
    // Optimistic update
    const isNowCompleted =
      newStatus === "done" ||
      newStatus === "cancelled" ||
      (newStatus as string) === "closed";
    const wasCompleted =
      task.status === "done" ||
      task.status === "cancelled" ||
      (task.status as string) === "closed";

    if (isNowCompleted && !wasCompleted) {
      // Move from active to completed
      setActiveTasks((prev) => prev.filter((t) => t.note_id !== task.note_id));
      setCompletedTasks((prev) =>
        [{ ...task, status: newStatus }, ...prev].slice(
          0,
          showAllCompleted ? 100 : 10
        )
      );
    } else if (!isNowCompleted && wasCompleted) {
      // Move from completed to active
      setCompletedTasks((prev) =>
        prev.filter((t) => t.note_id !== task.note_id)
      );
      setActiveTasks((prev) => [{ ...task, status: newStatus }, ...prev]);
    } else {
      // Update within same list
      if (wasCompleted) {
        setCompletedTasks((prev) =>
          prev.map((t) =>
            t.note_id === task.note_id ? { ...t, status: newStatus } : t
          )
        );
      } else {
        setActiveTasks((prev) =>
          prev.map((t) =>
            t.note_id === task.note_id ? { ...t, status: newStatus } : t
          )
        );
      }
    }

    try {
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
        entity_id: fixedEntityId || "",
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
    <div className={taskPresets.form}>
      <div className="flex flex-col gap-3">
        <div className={taskPresets.formGrid}>
          {!fixedEntityId && (
            <div>
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">שיוך</label>
              <select
                className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none"
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
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">אחריות (אופציונלי)</label>
              <select
                className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none"
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
            <label className="block text-sm font-medium text-ds-text-secondary mb-1">תאריך יעד</label>
            <input
              type="date"
              className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <div>
            <label className="block text-sm font-medium text-ds-text-secondary mb-1">כותרת</label>
            <input
              className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="נושא המשימה"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ds-text-secondary mb-1">תוכן</label>
            <input
              className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              placeholder="פירוט..."
            />
          </div>
        </div>

        <div className={taskPresets.formActions}>
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

  const renderGridView = (listTasks: TaskNote[]) => (
    <div className={taskPresets.cardList}>
      {listTasks.map((task) => {
        const entityName = entities.find((e) => e.id === task.entity_id)?.name;
        const statusObj = TASK_STATUSES.find((s) => s.value === task.status);
        const isCompleted =
          task.status === "done" ||
          task.status === "cancelled" ||
          (task.status as string) === "closed";
        const isOverdue =
          task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

        return (
          <div
            key={task.note_id}
            className={isCompleted ? taskPresets.cardCompleted : taskPresets.card}
          >
            {/* Header */}
            <div className={isCompleted ? taskPresets.cardHeaderCompleted : taskPresets.cardHeader}>
              <div className={isCompleted ? taskPresets.cardTitleCompleted : taskPresets.cardTitle}>
                {task.title}
              </div>

              <div className="flex items-center gap-2">
                {task.due_date && (
                  <div className={isOverdue ? taskPresets.dueDateOverdue : taskPresets.dueDate}>
                    <Calendar size={13} />
                    <span>
                      {new Date(task.due_date).toLocaleDateString("he-IL")}
                    </span>
                    {isOverdue && <AlertCircle size={13} />}
                  </div>
                )}

                <select
                  className={`${getStatusClass(task.status)} cursor-pointer outline-none border-none`}
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
            <div className={taskPresets.cardBody}>
              <p className={isCompleted ? taskPresets.cardTextCompleted : taskPresets.cardText}>
                {task.body}
              </p>

              {/* Metadata Grid */}
              <div className={taskPresets.metaGrid}>
                {!fixedEntityId && entityName && (
                  <div className={taskPresets.metaItem}>
                    <User size={14} />
                    <span>
                      עבור: <strong>{entityName}</strong>
                    </span>
                  </div>
                )}
                {task.assigned_to_name && (
                  <div className={taskPresets.metaItem}>
                    <User size={14} />
                    <span>
                      אחריות: <strong>{task.assigned_to_name}</strong>
                    </span>
                  </div>
                )}
                <div className={taskPresets.metaItem}>
                  <User size={14} />
                  <span>
                    נוצר ע"י:{" "}
                    <strong>
                      {task.created_by_name || task.created_by || "?"}
                    </strong>
                  </span>
                </div>
                <div className={taskPresets.metaItem}>
                  <Clock size={14} />
                  <span>נוצר: {formatDateTime(task.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={isCompleted ? taskPresets.cardFooterCompleted : taskPresets.cardFooter}>
              <button
                onClick={() => handleShowHistory(task)}
                className={taskPresets.actionPrimary}
              >
                <History size={14} /> היסטוריה
              </button>
              <button
                onClick={() => startEdit(task)}
                className={taskPresets.action}
              >
                <Edit2 size={14} /> ערוך
              </button>
              <button
                onClick={() => handleDelete(task.note_id)}
                className={taskPresets.actionDanger}
              >
                <Trash2 size={14} /> מחק
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTaskList = (listTasks: TaskNote[]) => (
    <div className={taskPresets.itemList}>
      {listTasks.map((task) => {
        const isCompleted =
          task.status === "done" ||
          task.status === "cancelled" ||
          (task.status as string) === "closed";
        const isOverdue =
          task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

        return (
          <div
            key={task.note_id}
            className={isCompleted ? taskPresets.listItemCompleted : taskPresets.listItem}
          >
            {/* 1. Checkbox */}
            <div
              onClick={() => handleToggleComplete(task)}
              className={isCompleted ? taskPresets.checkboxChecked : taskPresets.checkbox}
            >
              {isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
            </div>

            {/* 2. Title & Assignee */}
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              <span
                onClick={() => startEdit(task)}
                className={isCompleted ? taskPresets.listTitleCompleted : taskPresets.listTitle}
              >
                {task.title}
              </span>

              {task.assigned_to_name && (
                <span className={taskPresets.listAssignee}>
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
              <div className={isOverdue ? taskPresets.dueDateOverdue : taskPresets.dueDate}>
                <Calendar size={12} />
                {new Date(task.due_date).toLocaleDateString("he-IL", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
            )}

            {/* 4. Actions */}
            <div className="flex gap-1">
              <button
                onClick={() => handleShowHistory(task)}
                title="היסטוריה"
                className={taskPresets.actionIcon}
              >
                <History size={16} />
              </button>
              <button
                onClick={() => handleDelete(task.note_id)}
                title="מחק"
                className={taskPresets.actionIcon}
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
      padding={variant === "list" ? "none" : "lg"}
      style={{
        background: variant === "list" ? "transparent" : undefined,
        boxShadow: variant === "list" ? "none" : undefined,
        border: variant === "list" ? "none" : undefined,
      }}
    >
      <div
        style={{
          marginBottom: numericValues.spacing[6],
          display: variant === "list" ? "none" : "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 className="m-0 text-ds-text-primary font-semibold">{title}</h4>
      </div>

      {!isEditing && !hideAddButton && (
        <div style={{ marginBottom: 16 }}>
          {variant === "grid" ? (
            renderCreationForm()
          ) : (
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              style={{ width: "100%", justifyContent: "flex-start" }}
            >
              <Plus size={14} style={{ marginLeft: 6 }} /> הוסף משימה חדשה
            </Button>
          )}
        </div>
      )}

      {/* List Area */}
      {loading && activeTasks.length === 0 ? (
        <div className={taskPresets.empty}>
          טוען...
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Active Tasks */}
          {activeTasks.length > 0 ? (
            variant === "list" ? (
              renderTaskList(activeTasks)
            ) : (
              renderGridView(activeTasks)
            )
          ) : (
            <div className={taskPresets.empty}>
              אין משימות פתוחות
            </div>
          )}

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className={taskPresets.sectionDivider}>
              <h5 className={taskPresets.sectionTitle}>
                הושלמו לאחרונה
              </h5>
              {variant === "list"
                ? renderTaskList(completedTasks)
                : renderGridView(completedTasks)}

              {/* Show All Button */}
              {(completedTasks.length >= 10 || showAllCompleted) && (
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                    style={{ fontSize: 12 }}
                  >
                    {showAllCompleted
                      ? "הצג פחות"
                      : "הצג את כל המשימות שהסתיימו"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={isEditing}
        onClose={resetForm}
        size="sm"
      >
        <h3 className="mt-0 text-ds-text-primary font-semibold text-lg">
          {editingId ? "עריכת משימה" : "הוספת משימה חדשה"}
        </h3>
        <div className="flex flex-col gap-3 mt-4">
          <div>
            <label className="block text-sm font-medium text-ds-text-secondary mb-1">כותרת</label>
            <input
              className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              autoFocus
            />
          </div>

          {assignees.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">אחריות</label>
              <select
                className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none"
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
            <label className="block text-sm font-medium text-ds-text-secondary mb-1">תוכן (אופציונלי)</label>
            <textarea
              className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none min-h-[100px] resize-y"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
            />
          </div>
          <div className={taskPresets.formGrid}>
            <div>
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">סטטוס</label>
              <select
                className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none"
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
              <label className="block text-sm font-medium text-ds-text-secondary mb-1">תאריך יעד</label>
              <input
                type="date"
                className="w-full border border-ds-border rounded-ds-input p-2 bg-ds-bg-primary text-ds-text-primary focus:ring-2 focus:ring-ds-brand outline-none"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button variant="secondary" onClick={resetForm}>
              ביטול
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "שומר..." : "שמור"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        size="sm"
      >
        <h3 className="mt-0 mb-3 text-ds-text-primary font-semibold text-lg">
          היסטוריית שינויים
        </h3>
        <p className="m-0 mb-4 text-ds-text-muted text-sm">
          עבור: {currentHistoryTitle}
        </p>

        {historyLoading ? (
          <div className="text-center text-ds-text-muted">
            טוען נתונים...
          </div>
        ) : historyData.length === 0 ? (
          <div className="text-center text-ds-text-muted">
            אין היסטוריית שינויים.
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
            {historyData.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-ds-bg-secondary rounded-ds-md border border-ds-border text-sm"
              >
                <div className="flex justify-between mb-1">
                  <strong className="text-ds-text-primary">{entry.changed_by_name || entry.changed_by}</strong>
                  <span className="text-ds-text-muted">
                    {formatDateTime(entry.changed_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill tone="neutral">
                    {getStatusLabel(entry.old_status || "—")}
                  </StatusPill>
                  <span className="text-ds-text-muted">←</span>
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

        <div className="mt-4 text-right">
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
