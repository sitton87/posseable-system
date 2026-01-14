"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Supplier, NoteStatus } from "@/type";
import { useDraftManager } from "@/app/hooks/useDraftManager";
import {
  createEmptyFormState,
  createEmptyTaskForm,
  generateDraftId,
  normalizeStatus,
} from "./utils";
import {
  FormState,
  SupplierFilters,
  SupplierSummaryData,
  TaskFormState,
  identifierTypeOptions,
  supplierTypeOptions,
  IdentifierType,
  SupplierType,
} from "./types";

import SupplierHomeTab from "./tabs/SupplierHomeTab";
import SupplierListTab from "./tabs/SupplierListTab";
import SupplierModal from "./modals/SupplierModal";
import SupplierViewModal from "./modals/SupplierViewModal";
import DraftPromptModal from "./modals/DraftPromptModal";

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
        tasks: (data.tasks || []).map((t: any) => ({
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

  const filteredSuppliers = suppliers.filter((supplier) => {
    const term = filters.search.trim().toLowerCase();
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
      <div className="p-6 sm:p-10 flex flex-col gap-6">
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

      <DraftPromptModal
        open={draftPromptOpen}
        onClose={() => setDraftPromptOpen(false)}
        onSaveDraft={handleSaveDraft}
        onDiscard={handleDiscardDraft}
      />
    </>
  );
}
