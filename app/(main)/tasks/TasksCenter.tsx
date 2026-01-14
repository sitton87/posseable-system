"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Select,
  SelectItem,
  Flex,
  Badge,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import {
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { NoteStatus } from "@/type";
import { cssVar, tw } from "@/app/styles/design-system";

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

type StatusTone = "neutral" | "warning" | "info" | "purple" | "success" | "danger" | "muted";

const TASK_STATUSES: { value: NoteStatus; label: string; tone: StatusTone }[] = [
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

const getStatusLabel = (val: string) =>
  TASK_STATUSES.find((s) => s.value === val)?.label || val;

const getEntityTypeLabel = (val: string) =>
  ENTITY_TYPES.find((t) => t.value === val)?.label || val;

const getStatusBadgeColor = (status: NoteStatus) => {
  switch (status) {
    case "not_started":
      return "slate";
    case "open":
      return "amber";
    case "in_progress":
      return "blue";
    case "postponed":
      return "gray";
    case "done":
      return "emerald";
    case "cancelled":
      return "rose";
    default:
      return "slate";
  }
};

// --- Component ---

export function TasksCenter() {
  const [activeTasks, setActiveTasks] = useState<TaskNote[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_asc");
  const [groupBy, setGroupBy] = useState<string>("none");

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

  // Helper to fetch assignees (Volunteers)
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const res = await fetch("/api/volunteers?view=list");
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
          url = "/api/activities";
          mapFn = (a: any) => {
            const date = a.activity_date
              ? new Date(a.activity_date).toLocaleDateString("he-IL")
              : "";
            const name = `${a.kind || "פעילות"} - ${date}`;
            return { id: a.id.toString(), name: name, subtitle: a.group_name };
          };
          break;
        case "equipment":
          url = "/api/equipment";
          mapFn = (e: any) => ({ id: e.id, name: e.name });
          break;
        default:
          setEntityOptions([]);
          setLoadingEntities(false);
          return;
      }

      const res = await fetch(url);
      const data = await res.json();

      let list = [];
      if (data.success) {
        if (data.surfers) list = data.surfers;
        else if (data.volunteers) list = data.volunteers;
        else if (data.donors) list = data.donors;
        else if (data.suppliers) list = data.suppliers;
        else if (data.activities) list = data.activities;
        else if (data.items) list = data.items;
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

      const baseUrl = `/api/notes?entityType=all`;

      // 1. Load active tasks
      const activeRes = await fetch(`${baseUrl}&showArchived=false&limit=200`);
      const activeData = await activeRes.json();

      // 2. Load completed tasks
      const limit = showAllCompleted ? 100 : 7;
      const completedRes = await fetch(`${baseUrl}&showArchived=true&limit=${limit}`);
      const completedData = await completedRes.json();

      const normalize = (t: any) => ({
        ...t,
        status: normalizeStatus(t.status),
      });

      if (activeData.success) setActiveTasks((activeData.notes || []).map(normalize));
      if (completedData.success) setCompletedTasks((completedData.notes || []).map(normalize));
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
        entity_id: formData.entity_type === "general" ? "general" : formData.entity_id,
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
    if (!confirm("האם אתה בטוח שברצונך למחוק משימה זו? הפעולה אינה הפיכה.")) return;
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
    const isNowCompleted = newStatus === "done" || newStatus === "cancelled";
    const wasCompleted = task.status === "done" || task.status === "cancelled";

    if (isNowCompleted && !wasCompleted) {
      setActiveTasks((prev) => prev.filter((t) => t.note_id !== task.note_id));
      setCompletedTasks((prev) => [{ ...task, status: newStatus }, ...prev]);
    } else if (!isNowCompleted && wasCompleted) {
      setCompletedTasks((prev) => prev.filter((t) => t.note_id !== task.note_id));
      setActiveTasks((prev) => [{ ...task, status: newStatus }, ...prev]);
    } else {
      setActiveTasks((prev) =>
        prev.map((t) => (t.note_id === task.note_id ? { ...t, status: newStatus } : t))
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
      if (filterAssignee !== "all" && t.assigned_to !== filterAssignee) return false;

      if (filterTimeRange !== "all" && t.due_date) {
        const date = new Date(t.due_date);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterTimeRange === "week" && (diffDays < 0 || diffDays > 7)) return false;
        if (filterTimeRange === "month" && (diffDays < 0 || diffDays > 30)) return false;
        if (filterTimeRange === "season" && (diffDays < 0 || diffDays > 90)) return false;
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
        if (groupBy === "assignee") {
          key = t.assigned_to || "unassigned";
        } else if (groupBy === "type") {
          key = t.entity_type;
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
      });

      if (Object.keys(groups).length === 0)
        return (
          <Text className="py-4 text-center" style={{ color: cssVar.text.muted }}>
            אין משימות להצגה.
          </Text>
        );

      return (
        <div className="space-y-6">
          {Object.entries(groups).map(([key, groupTasks]) => {
            let headerLabel = key;
            if (groupBy === "assignee") headerLabel = groupTasks[0]?.assigned_to_name || "ללא שיוך";
            if (groupBy === "type") headerLabel = getEntityTypeLabel(key);

            return (
              <div key={key}>
                <h4
                  className="text-sm mb-3 pb-1 border-b"
                  style={{ color: cssVar.text.muted, borderColor: cssVar.border.muted }}
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

    return renderFlatList(filtered);
  };

  const renderFlatList = (tasks: TaskNote[]) => (
    <div className="space-y-2">
      {tasks.map((task) => {
        const isCompleted = task.status === "done" || task.status === "cancelled";
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

        return (
          <div
            key={task.note_id}
            className="p-3 rounded-lg border transition-all hover:shadow-sm"
            style={{
              backgroundColor: isCompleted ? cssVar.bg.secondary : cssVar.bg.primary,
              borderColor: cssVar.border.muted,
              opacity: isCompleted ? 0.6 : 1,
            }}
          >
            <div className="grid grid-cols-[30px_1fr_140px_140px_100px_80px] items-center gap-3">
              {/* 1. Status/Check */}
              <div
                onClick={() => handleStatusChange(task, isCompleted ? "open" : "done")}
                className="cursor-pointer flex justify-center"
                style={{ color: isCompleted ? cssVar.status.success : cssVar.text.muted }}
              >
                {isCompleted ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <div
                    className="w-5 h-5 rounded border-2"
                    style={{ borderColor: cssVar.border.primary }}
                  />
                )}
              </div>

              {/* 2. Title & Body */}
              <div className="overflow-hidden">
                <span
                  onClick={() => startEdit(task)}
                  className={`font-medium text-sm cursor-pointer truncate block ${
                    isCompleted ? "line-through" : ""
                  }`}
                  style={{ color: cssVar.text.primary }}
                >
                  {task.title}
                </span>
                {task.body && (
                  <span className="text-xs truncate block" style={{ color: cssVar.text.muted }}>
                    {task.body.length > 50 ? task.body.substring(0, 50) + "..." : task.body}
                  </span>
                )}
              </div>

              {/* 3. Entity Info */}
              <div className="text-xs" style={{ color: cssVar.text.muted }}>
                <span className="font-semibold block">{getEntityTypeLabel(task.entity_type)}</span>
                <span className="text-xs">
                  {task.entity_type === "general" ? "כללי" : `ID: ${task.entity_id}`}
                </span>
              </div>

              {/* 4. Assignee */}
              <div className="text-xs flex items-center gap-1">
                {task.assigned_to_name ? (
                  <>
                    <UserIcon className="w-3 h-3" /> {task.assigned_to_name}
                  </>
                ) : (
                  <span style={{ color: cssVar.text.muted }}>-</span>
                )}
              </div>

              {/* 5. Due Date */}
              <div
                className="text-xs"
                style={{ color: isOverdue ? cssVar.status.danger : cssVar.text.muted }}
              >
                {task.due_date ? new Date(task.due_date).toLocaleDateString("he-IL") : "-"}
              </div>

              {/* 6. Actions */}
              <Flex justifyContent="end" className="gap-1">
                <Button
                  size="xs"
                  variant="light"
                  icon={PencilIcon}
                  onClick={() => startEdit(task)}
                  tooltip="ערוך"
                />
                <Button
                  size="xs"
                  variant="light"
                  color="rose"
                  icon={TrashIcon}
                  onClick={() => handleDelete(task.note_id)}
                  tooltip="מחק"
                />
              </Flex>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card className="p-ds-spacing-lg">
      {/* Header with Filters */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex gap-3 items-center flex-wrap">
          <FunnelIcon className="w-4 h-4" style={{ color: cssVar.text.muted }} />

          <Select value={filterType} onValueChange={setFilterType} className="w-36">
            <SelectItem value="all">כל הסוגים</SelectItem>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </Select>

          <Select value={filterTimeRange} onValueChange={setFilterTimeRange} className="w-36">
            <SelectItem value="all">כל הזמנים</SelectItem>
            <SelectItem value="week">השבוע הקרוב</SelectItem>
            <SelectItem value="month">החודש הקרוב</SelectItem>
            <SelectItem value="season">העונה הקרובה</SelectItem>
          </Select>

          <Select value={filterAssignee} onValueChange={setFilterAssignee} className="w-36">
            <SelectItem value="all">כל האחראים</SelectItem>
            {assignees.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </Select>

          <Select value={sortBy} onValueChange={setSortBy} className="w-36">
            <SelectItem value="date_asc">מהקרוב לרחוק</SelectItem>
            <SelectItem value="date_desc">מהרחוק לקרוב</SelectItem>
          </Select>

          <Select value={groupBy} onValueChange={setGroupBy} className="w-36">
            <SelectItem value="none">ללא קיבוץ</SelectItem>
            <SelectItem value="assignee">קיבוץ לפי אחראי</SelectItem>
            <SelectItem value="type">קיבוץ לפי סוג</SelectItem>
          </Select>

          <Button variant="secondary" size="xs" onClick={clearFilters}>
            נקה סינונים
          </Button>
        </div>

        <Button
          icon={PlusIcon}
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
          משימה חדשה
        </Button>
      </div>

      {/* Tasks Lists */}
      {loading ? (
        <div className="py-10 text-center" style={{ color: cssVar.text.muted }}>
          טוען משימות...
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <Title className="text-base mb-4">משימות לביצוע ({activeTasks.length})</Title>
            {activeTasks.length > 0 ? (
              renderTaskList(activeTasks)
            ) : (
              <Text style={{ color: cssVar.text.muted }}>אין משימות פתוחות.</Text>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div>
              <Title className="text-base mb-4" style={{ color: cssVar.text.muted }}>
                הושלמו לאחרונה
              </Title>
              {renderTaskList(completedTasks)}
              <div className="mt-4 text-center">
                <Button variant="light" onClick={() => setShowAllCompleted(!showAllCompleted)}>
                  {showAllCompleted ? "הצג פחות" : "הצג עוד"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditing} onClose={resetForm}>
        <DialogPanel className="max-w-xl">
          <Title className="mb-6">{editingId ? "עריכת משימה" : "משימה חדשה"}</Title>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  סוג יישות
                </Text>
                <Select
                  value={formData.entity_type}
                  onValueChange={(val) =>
                    setFormData({ ...formData, entity_type: val, entity_id: "" })
                  }
                  disabled={!!editingId}
                  placeholder="בחר סוג..."
                >
                  <SelectItem value="">בחר סוג...</SelectItem>
                  {ENTITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {formData.entity_type && formData.entity_type !== "general" && (
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                    שיוך ליישות {loadingEntities && "(טוען...)"}
                  </Text>
                  <Select
                    value={formData.entity_id}
                    onValueChange={(val) => setFormData({ ...formData, entity_id: val })}
                    disabled={loadingEntities || !!editingId}
                    placeholder="בחר..."
                  >
                    <SelectItem value="">בחר...</SelectItem>
                    {entityOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name} {opt.subtitle ? `(${opt.subtitle})` : ""}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                כותרת
              </Text>
              <TextInput
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="נושא המשימה"
              />
            </div>

            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                פירוט
              </Text>
              <textarea
                className="w-full min-h-[80px] p-3 border rounded-lg resize-y text-sm"
                style={{
                  borderColor: cssVar.border.primary,
                  backgroundColor: cssVar.bg.primary,
                  color: cssVar.text.primary,
                }}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  אחראי ביצוע
                </Text>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(val) => setFormData({ ...formData, assigned_to: val })}
                  placeholder="ללא שיוך"
                >
                  <SelectItem value="">ללא שיוך</SelectItem>
                  {assignees.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תאריך יעד
                </Text>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={{ 
                    borderColor: cssVar.border.primary, 
                    backgroundColor: cssVar.bg.primary,
                    color: cssVar.text.primary 
                  }}
                />
              </div>
            </div>

            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                סטטוס
              </Text>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val as NoteStatus })}
              >
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Flex justifyContent="end" className="gap-3 mt-6">
              <Button variant="secondary" onClick={resetForm}>
                ביטול
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "שומר..." : "שמור משימה"}
              </Button>
            </Flex>
          </div>
        </DialogPanel>
      </Dialog>
    </Card>
  );
}
