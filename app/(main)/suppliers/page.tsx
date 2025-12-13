"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  Supplier,
  SupplierStats,
  SupplierActivityLog,
  Note,
  NoteStatus,
} from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import {
  FilterToolbar,
  FormGrid,
  Section,
  SmallActionButton,
  StatCardGrid,
  StatusPill,
  sectionCardStyle,
  TasksBoard,
  TaskEntityOption,
} from "@/app/components/shared";
import { DraftList } from "@/app/components/shared/DraftList";
import {
  filterControlStyle,
  inputStyle,
  labelStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, radii, spacing } from "@/app/styles/foundations";
import { formatPhoneNumber } from "@/lib/utils/format";
import { useDraftManager, type DraftEntry } from "@/app/hooks/useDraftManager";
const muted = colors.textMuted;

const sectionBoxStyle = {
  ...sectionCardStyle,
  marginBottom: spacing.lg,
};

const identifierTypeOptions = [
  { value: "HP", label: "ח.פ" },
  { value: "OSEK", label: "עוסק מורשה" },
  { value: "ID", label: "ת.ז" },
  { value: "OTHER", label: "אחר" },
] as const;

const supplierTypeOptions = [
  { value: "goods", label: "ספק ציוד" },
  { value: "services", label: "בעל מקצוע" },
  { value: "both", label: "שירותים + ציוד" },
] as const;

type IdentifierType = (typeof identifierTypeOptions)[number]["value"];
type SupplierType = (typeof supplierTypeOptions)[number]["value"];

type FormState = {
  supplier_identifier: string;
  identifier_type: IdentifierType;
  supplier_type: SupplierType;
  services_offered: string;
  has_active_contract: boolean;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  notes: string;
  is_active: boolean;
};

type SupplierFilters = {
  search: string;
  status: "all" | "active" | "inactive";
  type: "all" | SupplierType;
};

type TaskFormState = {
  supplier_identifier: string;
  title: string;
  body: string;
  due_date: string;
};

type SupplierSummaryData = {
  stats: SupplierStats;
  tasks: Note[];
  recentActivity: SupplierActivityLog[];
};

const normalizeStatus = (value?: string | null): NoteStatus => {
  if (!value) return "open";
  const v = value.toLowerCase();
  if (v === "pending") return "open";
  if (v === "closed") return "done";
  return ["open", "in_progress", "done", "cancelled"].includes(v)
    ? (v as NoteStatus)
    : "open";
};

const createEmptyFormState = (): FormState => ({
  supplier_identifier: "",
  identifier_type: identifierTypeOptions[0].value,
  supplier_type: "goods",
  services_offered: "",
  has_active_contract: false,
  name: "",
  contact_name: "",
  phone: "",
  email: "",
  notes: "",
  is_active: true,
});

const createEmptyTaskForm = (): TaskFormState => ({
  supplier_identifier: "",
  title: "",
  body: "",
  due_date: "",
});

const generateDraftId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `supplier-${window.crypto.randomUUID()}`;
  }
  return `supplier-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function SuppliersPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get("view") === "list" ? "list" : "home";
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [summary, setSummary] = useState<SupplierSummaryData | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormState>(
    createEmptyTaskForm()
  );
  const [filters, setFilters] = useState<SupplierFilters>({
    search: "",
    status: "all",
    type: "all",
  });

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<FormState>(createEmptyFormState());
  const {
    drafts: supplierDrafts,
    saveDraft: saveSupplierDraft,
    deleteDraft: deleteSupplierDraft,
  } = useDraftManager<FormState>("supplier");
  const [formDirty, setFormDirty] = useState(false);
  const [draftPromptOpen, setDraftPromptOpen] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const closeFormModal = useCallback(() => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormData(createEmptyFormState());
    setFormDirty(false);
    setCurrentDraftId(null);
    setDraftPromptOpen(false);
  }, []);

  const requestCloseModal = useCallback(() => {
    if (formDirty) {
      setDraftPromptOpen(true);
      return;
    }
    closeFormModal();
  }, [closeFormModal, formDirty]);

  const handleFormChange = useCallback(
    (updater: (prev: FormState) => FormState) => {
      setFormData((prev) => {
        const next = updater(prev);
        if (next !== prev) {
          setFormDirty(true);
        }
        return next;
      });
    },
    []
  );

  const handleSaveDraft = useCallback(() => {
    const draftId =
      currentDraftId ||
      editingSupplier?.supplier_identifier ||
      generateDraftId();
    saveSupplierDraft(draftId, formData);
    setCurrentDraftId(draftId);
    setFormDirty(false);
    setDraftPromptOpen(false);
    closeFormModal();
  }, [
    closeFormModal,
    currentDraftId,
    editingSupplier?.supplier_identifier,
    formData,
    saveSupplierDraft,
  ]);

  const handleDiscardDraft = useCallback(() => {
    setDraftPromptOpen(false);
    setFormDirty(false);
    closeFormModal();
  }, [closeFormModal]);

  const handleResumeDraft = useCallback(
    (draftId: string) => {
      const draft = supplierDrafts.find((entry) => entry.id === draftId);
      if (!draft) return;
      setFormData(draft.payload);
      setEditingSupplier(null);
      setCurrentDraftId(draftId);
      setFormDirty(false);
      setDraftPromptOpen(false);
      setShowModal(true);
    },
    [supplierDrafts]
  );

  const handleDeleteDraftEntry = useCallback(
    (draftId: string) => {
      deleteSupplierDraft(draftId);
      if (currentDraftId === draftId) {
        setCurrentDraftId(null);
      }
    },
    [currentDraftId, deleteSupplierDraft]
  );

  const fetchSuppliers = useCallback(async () => {
    try {
      setListLoading(true);
      setError(null);
      const res = await fetch("/api/suppliers", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "שגיאה בטעינת ספקים");
      }
      setSuppliers(data.suppliers || []);
    } catch (err: any) {
      console.error("Error loading suppliers:", err);
      setError(err?.message || "שגיאה בטעינת ספקים");
    } finally {
      setListLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch("/api/suppliers/summary", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "שגיאה בטעינת נתוני דף הבית");
      }
      setSummary({
        stats: data.stats,
        tasks: (data.tasks || []).map((t: Note) => ({
          ...t,
          status: normalizeStatus(t.status),
        })),
        recentActivity: data.recentActivity,
      });
    } catch (err: any) {
      console.error("Error loading supplier summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
    fetchSummary();
  }, [fetchSuppliers, fetchSummary]);

  const handleTaskFormChange = <K extends keyof TaskFormState>(
    key: K,
    value: TaskFormState[K]
  ) => {
    setTaskForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateTask = async () => {
    if (!taskForm.supplier_identifier) {
      setTaskError("בחר ספק לשיוך הפתק.");
      return;
    }
    if (!taskForm.body.trim()) {
      setTaskError("תיאור המשימה הוא חובה.");
      return;
    }
    setTaskError(null);
    try {
      setTaskSubmitting(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          entity_type: "supplier",
          entity_id: taskForm.supplier_identifier,
          title: taskForm.title || null,
          body: taskForm.body.trim(),
          due_date: taskForm.due_date || null,
          status: "open",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "שגיאה בשמירת הפתק");
      }
      setTaskForm(createEmptyTaskForm());
      fetchSummary();
    } catch (err: any) {
      console.error("Error creating supplier note:", err);
      setTaskError(err?.message || "שגיאה בשמירת הפתק");
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (task: Note, nextStatus: NoteStatus) => {
    try {
      await fetch(`/api/notes/${task.note_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchSummary();
    } catch (err) {
      console.error("Error updating note status:", err);
      alert("שגיאה בעדכון המשימה");
    }
  };

  const filteredSuppliers = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      if (filters.status === "active" && !supplier.is_active) return false;
      if (filters.status === "inactive" && supplier.is_active) return false;
      if (filters.type !== "all") {
        const currentType = (supplier.supplier_type || "goods") as SupplierType;
        if (currentType !== filters.type) return false;
      }
      if (term) {
        const haystack = [
          supplier.name,
          supplier.supplier_identifier,
          supplier.contact_name,
          supplier.email,
          supplier.phone,
          supplier.services_offered,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());
        const matches = haystack.some((value) => value.includes(term));
        if (!matches) return false;
      }
      return true;
    });
  }, [suppliers, filters]);

  const handleFilterChange = <K extends keyof SupplierFilters>(
    key: K,
    value: SupplierFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormData(createEmptyFormState());
    setFormDirty(false);
    setCurrentDraftId(null);
    setDraftPromptOpen(false);
    setShowModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplier_identifier: supplier.supplier_identifier,
      identifier_type:
        (identifierTypeOptions.find(
          (opt) => opt.value === supplier.identifier_type
        )?.value as IdentifierType) || identifierTypeOptions[0].value,
      supplier_type: (supplier.supplier_type as SupplierType) || "goods",
      services_offered: supplier.services_offered || "",
      has_active_contract: Boolean(supplier.has_active_contract),
      name: supplier.name,
      contact_name: supplier.contact_name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      notes: supplier.notes || "",
      is_active: supplier.is_active,
    });
    setFormDirty(false);
    setCurrentDraftId(null);
    setDraftPromptOpen(false);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const supplierId = formData.supplier_identifier.trim().toUpperCase();
    if (!supplierId) {
      alert("מספר הספק הוא שדה חובה");
      return;
    }
    if (!formData.name.trim()) {
      alert("שם הספק הוא שדה חובה");
      return;
    }
    try {
      const url = editingSupplier
        ? "/api/suppliers/update"
        : "/api/suppliers/add";
      const method = editingSupplier ? "PUT" : "POST";
      const payload = {
        supplier_identifier: supplierId,
        identifier_type: formData.identifier_type,
        supplier_type: formData.supplier_type,
        services_offered: formData.services_offered || null,
        has_active_contract: formData.has_active_contract,
        name: formData.name.trim(),
        contact_name: formData.contact_name.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        notes: formData.notes.trim() || null,
        is_active: formData.is_active,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "שגיאה בשמירת ספק");
      }
      if (currentDraftId) {
        deleteSupplierDraft(currentDraftId);
        setCurrentDraftId(null);
      }
      fetchSuppliers();
      fetchSummary();
      closeFormModal();
    } catch (err: any) {
      console.error("Error saving supplier:", err);
      alert(err?.message || "שגיאה בשמירת ספק");
    }
  };

  const handleDelete = async (supplier_identifier: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את הספק?")) return;
    try {
      const res = await fetch(
        `/api/suppliers/update?supplier_identifier=${encodeURIComponent(
          supplier_identifier
        )}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "שגיאה במחיקת ספק");
      }
      fetchSuppliers();
      fetchSummary();
    } catch (err: any) {
      console.error("Error deleting supplier:", err);
      alert(err?.message || "שגיאה במחיקת ספק");
    }
  };

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingSupplier(null);
  };

  return (
    <>
      <div
        style={{
          padding: spacing.xl,
          display: "flex",
          flexDirection: "column",
          gap: spacing.lg,
        }}
      >
        {activeTab === "home" && (
          <SupplierHomeTab
            suppliers={suppliers}
            summary={summary}
            loading={summaryLoading}
            onRefresh={() => {
              fetchSummary();
              fetchSuppliers();
            }}
          />
        )}

        {activeTab === "list" && (
          <SupplierListTab
            suppliers={filteredSuppliers}
            loading={listLoading}
            error={error}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={() =>
              setFilters({ search: "", status: "all", type: "all" })
            }
            onRefresh={fetchSuppliers}
            onCreate={handleAdd}
            drafts={supplierDrafts}
            onResumeDraft={handleResumeDraft}
            onDeleteDraft={handleDeleteDraftEntry}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <SupplierModal
        open={showModal}
        formData={formData}
        onChange={handleFormChange}
        onClose={requestCloseModal}
        onSubmit={handleSubmit}
        editing={Boolean(editingSupplier)}
        escEnabled={!draftPromptOpen}
      />

      <SupplierViewModal
        open={showViewModal && !!viewingSupplier}
        supplier={viewingSupplier}
        onClose={closeViewModal}
      />

      <Modal
        open={draftPromptOpen}
        onClose={() => setDraftPromptOpen(false)}
        width="min(420px, 90vw)"
      >
        <h3 style={{ marginTop: 0 }}>לשמור את הספק כטיוטה?</h3>
        <p style={{ color: muted }}>
          ניתן לשמור את הערכים כטיוטה אישית ולהמשיך לערוך במועד מאוחר יותר.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
            marginTop: spacing.lg,
          }}
        >
          <Button variant="ghost" onClick={() => setDraftPromptOpen(false)}>
            חזרה לעריכה
          </Button>
          <Button variant="secondary" onClick={handleDiscardDraft}>
            בטל וסגור
          </Button>
          <Button onClick={handleSaveDraft}>שמור כטיוטה</Button>
        </div>
      </Modal>
    </>
  );
}

type SupplierHomeTabProps = {
  suppliers: Supplier[];
  summary: SupplierSummaryData | null;
  loading: boolean;
  onRefresh: () => void;
};

function SupplierHomeTab({
  suppliers,
  summary,
  loading,
  onRefresh,
}: SupplierHomeTabProps) {
  const stats = summary?.stats || {
    totalSuppliers: 0,
    activeSuppliers: 0,
    serviceSuppliers: 0,
    activeContracts: 0,
  };

  const supplierEntities: TaskEntityOption[] = suppliers.map((s) => ({
    id: s.supplier_identifier,
    name: s.name,
    subtitle: s.contact_name || undefined,
  }));

  const statsCards = [
    {
      label: 'סה"כ ספקים',
      value: stats.totalSuppliers,
      hint: "כל הספקים במערכת",
    },
    {
      label: "ספקים פעילים",
      value: stats.activeSuppliers,
      hint: "זמינים לשיוך עבודות",
    },
    {
      label: "בעלי מקצוע",
      value: stats.serviceSuppliers,
      hint: "ספקים המסווגים לשירות",
    },
    {
      label: "חוזים פעילים",
      value: stats.activeContracts,
      hint: "חוזים בתוקף",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: spacing.sm,
            alignItems: "center",
            marginBottom: spacing.md,
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>סקירת ספקים</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              תמונת מצב של המערך והפעילות האחרונה.
            </p>
          </div>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענן נתונים
          </Button>
        </div>
        <StatCardGrid stats={statsCards} />
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: spacing.lg,
        }}
      >
        <TasksBoard
          entityType="supplier"
          entities={supplierEntities}
          title="משימות"
        />

        <Card style={{ padding: spacing.lg }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4 style={{ margin: 0 }}>פעילות אחרונה</h4>
            {loading && (
              <span style={{ fontSize: 12, color: muted }}>טוען...</span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
              marginTop: spacing.md,
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            {(summary?.recentActivity || []).map((activity) => {
              const supplierName =
                suppliers.find(
                  (s) => s.supplier_identifier === activity.supplier_identifier
                )?.name || activity.supplier_identifier;
              return (
                <div
                  key={activity.activity_id}
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.card,
                    padding: spacing.sm,
                    background: colors.surface,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: spacing.sm,
                    }}
                  >
                    <strong>{supplierName}</strong>
                    <span style={{ fontSize: 12, color: muted }}>
                      {new Date(activity.occurred_at).toLocaleString("he-IL")}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: muted }}>
                    סוג פעילות: {activity.activity_type}
                  </div>
                  {activity.description && (
                    <div style={{ fontSize: 13 }}>{activity.description}</div>
                  )}
                  {(activity.amount || activity.quantity) && (
                    <div style={{ fontSize: 12, color: muted }}>
                      {activity.quantity && `כמות: ${activity.quantity} `}
                      {activity.amount && `· עלות: ₪${activity.amount}`}
                    </div>
                  )}
                  {activity.related_document_id && (
                    <div style={{ fontSize: 11, color: muted }}>
                      מסמך: {activity.related_document_id}
                    </div>
                  )}
                </div>
              );
            })}
            {!summary?.recentActivity?.length && (
              <div
                style={{
                  color: muted,
                  fontSize: 13,
                  textAlign: "center",
                  border: `1px dashed ${colors.border}`,
                  borderRadius: radii.card,
                  padding: spacing.md,
                }}
              >
                אין פעילות רשומה עדיין.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

type SupplierListTabProps = {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  filters: SupplierFilters;
  onFilterChange: <K extends keyof SupplierFilters>(
    key: K,
    value: SupplierFilters[K]
  ) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onCreate: () => void;
  drafts: DraftEntry<FormState>[];
  onResumeDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
};

function SupplierListTab({
  suppliers,
  loading,
  error,
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onCreate,
  drafts,
  onResumeDraft,
  onDeleteDraft,
  onView,
  onEdit,
  onDelete,
}: SupplierListTabProps) {
  return (
    <Card style={{ padding: spacing.lg }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.md,
          flexWrap: "wrap",
          gap: spacing.sm,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>ניהול ספקים</h3>
          {error ? (
            <p style={{ margin: 0, color: colors.danger, fontSize: 13 }}>
              {error}
            </p>
          ) : (
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              הצג, ערוך והוסף ספקים למערכת.
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענון נתונים
          </Button>
          <Button variant="secondary" onClick={onClearFilters}>
            ניקוי פילטרים
          </Button>
          <Button onClick={onCreate}>+ ספק חדש</Button>
        </div>
      </div>

      {drafts.length > 0 && (
        <div style={{ marginBottom: spacing.md }}>
          <DraftList
            drafts={drafts}
            title={`טיוטות שמורות (${drafts.length})`}
            description="פתקים אלו זמינים רק לך עד לשמירה סופית."
            onResume={onResumeDraft}
            onDelete={onDeleteDraft}
            getTitle={(draft) => draft.payload.name || "ספק ללא שם"}
            getSubtitle={(draft) =>
              `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
            }
          />
        </div>
      )}

      <FilterToolbar
        columns="repeat(auto-fit, minmax(220px, 1fr))"
        style={{ marginBottom: spacing.md }}
      >
        <input
          type="text"
          style={filterControlStyle}
          placeholder="חיפוש לפי שם, מזהה או טלפון"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        <select
          style={filterControlStyle}
          value={filters.status}
          onChange={(e) =>
            onFilterChange(
              "status",
              e.target.value as SupplierFilters["status"]
            )
          }
        >
          <option value="all">כל הסטטוסים</option>
          <option value="active">פעילים בלבד</option>
          <option value="inactive">לא פעילים</option>
        </select>
        <select
          style={filterControlStyle}
          value={filters.type}
          onChange={(e) =>
            onFilterChange("type", e.target.value as SupplierFilters["type"])
          }
        >
          <option value="all">כל סוגי הספקים</option>
          {supplierTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FilterToolbar>
      <div style={{ overflowX: "auto" }}>
        <table style={{ ...tableStyle, width: "100%" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>מספר ספק</th>
              <th style={tableHeaderStyle}>שם</th>
              <th style={tableHeaderStyle}>סוג מזהה</th>
              <th style={tableHeaderStyle}>סוג ספק</th>
              <th style={tableHeaderStyle}>איש קשר</th>
              <th style={tableHeaderStyle}>טלפון</th>
              <th style={tableHeaderStyle}>אימייל</th>
              <th style={tableHeaderStyle}>חוזה</th>
              <th style={tableHeaderStyle}>סטטוס</th>
              <th style={tableHeaderStyle}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={tableCellStyle}>
                  טוען נתונים...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={10} style={tableCellStyle}>
                  אין ספקים להצגה. נסה לשנות את הסינון.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.supplier_identifier}>
                  <td style={tableCellStyle}>{supplier.supplier_identifier}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                    {supplier.name}
                  </td>
                  <td style={tableCellStyle}>
                    {
                      identifierTypeOptions.find(
                        (opt) => opt.value === supplier.identifier_type
                      )?.label
                    }
                  </td>
                  <td style={tableCellStyle}>
                    {
                      supplierTypeOptions.find(
                        (opt) =>
                          opt.value === (supplier.supplier_type || "goods")
                      )?.label
                    }
                  </td>
                  <td style={tableCellStyle}>{supplier.contact_name || "—"}</td>
                  <td style={tableCellStyle}>
                    {formatPhoneNumber(supplier.phone)}
                  </td>
                  <td style={tableCellStyle}>{supplier.email || "—"}</td>
                  <td style={tableCellStyle}>
                    <StatusPill
                      tone={
                        supplier.has_active_contract ? "active" : "inactive"
                      }
                    >
                      {supplier.has_active_contract ? "פעיל" : "אין"}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>
                    <StatusPill
                      tone={supplier.is_active ? "active" : "inactive"}
                    >
                      {supplier.is_active ? "פעיל" : "לא פעיל"}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: spacing.xs,
                      }}
                    >
                      <SmallActionButton
                        variant="secondary"
                        onClick={() => onView(supplier)}
                        title="צפייה"
                      >
                        👁️
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        onClick={() => onEdit(supplier)}
                        title="עריכה"
                      >
                        ✏️
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        style={{ color: colors.danger }}
                        onClick={() => onDelete(supplier.supplier_identifier)}
                        title="ביטול"
                      >
                        🗑️
                      </SmallActionButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

type SupplierModalProps = {
  open: boolean;
  formData: FormState;
  editing: boolean;
  onChange: (updater: (prev: FormState) => FormState) => void;
  onSubmit: () => void;
  onClose: () => void;
  escEnabled?: boolean;
};

function SupplierModal({
  open,
  formData,
  editing,
  onChange,
  onSubmit,
  onClose,
  escEnabled = true,
}: SupplierModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(700px, 95vw)"
      style={{ padding: spacing.xxl }}
      escEnabled={escEnabled}
    >
      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
        {editing ? "עריכת ספק" : "ספק חדש"}
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.md,
          marginTop: spacing.md,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div>
            <label style={labelStyle}>
              מספר ספק <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.supplier_identifier}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  supplier_identifier: event.target.value.toUpperCase(),
                }))
              }
              disabled={editing}
              maxLength={20}
            />
          </div>
          <div>
            <label style={labelStyle}>סוג מזהה</label>
            <select
              style={inputStyle}
              value={formData.identifier_type}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  identifier_type: event.target.value as IdentifierType,
                }))
              }
            >
              {identifierTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>סוג ספק</label>
            <select
              style={inputStyle}
              value={formData.supplier_type}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  supplier_type: event.target.value as SupplierType,
                }))
              }
            >
              {supplierTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Section
          title="פרטי ספק"
          subtitle="שם וסיווג ראשוני"
          style={{ marginBottom: spacing.lg }}
          bodyStyle={{ gap: spacing.sm }}
        >
          <div>
            <label style={labelStyle}>
              שם הספק <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.name}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div>
            <label style={labelStyle}>שירותים / תחומי התמחות</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              value={formData.services_offered}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  services_offered: event.target.value,
                }))
              }
            />
          </div>
        </Section>

        <Section
          title="פרטי קשר"
          subtitle="איש קשר וערוצים"
          style={{ marginBottom: spacing.lg }}
          bodyStyle={{ gap: spacing.md }}
        >
          <FormGrid
            columns="repeat(auto-fit, minmax(220px, 1fr))"
            gap={spacing.md}
          >
            <div>
              <label style={labelStyle}>איש קשר</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.contact_name}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    contact_name: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>טלפון</label>
              <input
                type="tel"
                style={inputStyle}
                value={formData.phone}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>אימייל</label>
              <input
                type="email"
                style={inputStyle}
                value={formData.email}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>
          </FormGrid>
        </Section>

        <Section
          title="הערות"
          subtitle="רקע נוסף"
          style={{ marginBottom: spacing.lg }}
        >
          <textarea
            style={{ ...inputStyle, minHeight: 80 }}
            value={formData.notes}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </Section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: spacing.md,
          }}
        >
          <label
            style={{ display: "flex", alignItems: "center", gap: spacing.sm }}
          >
            <input
              type="checkbox"
              checked={formData.has_active_contract}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  has_active_contract: event.target.checked,
                }))
              }
            />
            חוזה פעיל
          </label>
          <label
            style={{ display: "flex", alignItems: "center", gap: spacing.sm }}
          >
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  is_active: event.target.checked,
                }))
              }
            />
            ספק פעיל
          </label>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={onSubmit}>{editing ? "עדכן" : "שמור"}</Button>
        </div>
      </div>
    </Modal>
  );
}

type SupplierViewModalProps = {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
};

function SupplierViewModal({
  open,
  supplier,
  onClose,
}: SupplierViewModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(640px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      {supplier && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <h3 style={{ margin: 0 }}>{supplier.name}</h3>
            <Button variant="secondary" onClick={onClose}>
              ✕ סגור
            </Button>
          </div>
          <div style={{ ...sectionBoxStyle, background: colors.surface }}>
            <div style={{ fontSize: 12, color: muted }}>מספר ספק</div>
            <div style={{ fontFamily: "monospace" }}>
              {supplier.supplier_identifier}
            </div>
          </div>
          <div style={{ ...sectionBoxStyle, background: colors.surface }}>
            <div style={{ fontSize: 12, color: muted }}>סוג ספק</div>
            <div>
              {
                supplierTypeOptions.find(
                  (opt) => opt.value === (supplier.supplier_type || "goods")
                )?.label
              }
            </div>
          </div>
          {supplier.services_offered && (
            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <div style={{ fontSize: 12, color: muted }}>שירותים</div>
              <div>{supplier.services_offered}</div>
            </div>
          )}
          <div style={{ ...sectionBoxStyle, background: colors.surface }}>
            <div style={{ fontSize: 12, color: muted }}>איש קשר</div>
            <div>{supplier.contact_name || "—"}</div>
            <div style={{ fontSize: 12, color: muted }}>טלפון</div>
            <div>{formatPhoneNumber(supplier.phone)}</div>
            <div style={{ fontSize: 12, color: muted }}>אימייל</div>
            <div>{supplier.email || "—"}</div>
          </div>
          {supplier.notes && (
            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <div style={{ fontSize: 12, color: muted }}>הערות</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{supplier.notes}</div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
