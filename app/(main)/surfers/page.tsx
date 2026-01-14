"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GroupsPage from "./groups/page";
import { usePagePermission } from "@/app/hooks/usePagePermission";
import { AccessDenied } from "@/app/components/AccessDenied";
import { Surfer } from "@/type";
import { numericValues } from "@/app/styles/design-system";
import { useDraftManager } from "@/app/hooks/useDraftManager";

import {
  calcAge,
  createEmptyForm,
  createEmptyTaskForm,
  defaultStats,
  generateDraftId,
  surferDraftType,
} from "./utils";

import {
  SurferDetail,
  SurferFilters,
  SurferFormState,
  SurferSummaryData,
  TabId,
  TaskFormState,
} from "./types";

// Tabs
import SurfersHomeTab from "./tabs/SurfersHomeTab";
import SurfersListTab from "./tabs/SurfersListTab";
import SettingsTab from "./tabs/SettingsTab";

// Modals
import SurferFormModal from "./modals/SurferFormDialog";
import SurferViewModal from "./modals/SurferViewModal";
import DraftPromptModal from "./modals/DraftPromptModal";

export default function SurfersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: TabId =
    searchParams?.get("view") === "list"
      ? "list"
      : searchParams?.get("view") === "groups"
      ? "groups"
      : searchParams?.get("view") === "settings"
      ? "settings"
      : "home";

  const [filters, setFilters] = useState<SurferFilters>({
    search: "",
    status: "all",
    program: "",
  });
  const [surfers, setSurfers] = useState<Surfer[]>([]);
  const [summary, setSummary] = useState<SurferSummaryData>({
    stats: defaultStats,
    tasks: [],
    recentActivity: [],
  });
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [formState, setFormState] = useState<SurferFormState>(
    createEmptyForm()
  );
  const [editingSurfer, setEditingSurfer] = useState<Surfer | null>(null);
  const [viewingSurfer, setViewingSurfer] = useState<Surfer | null>(null);
  const [viewDetail, setViewDetail] = useState<SurferDetail | null>(null);
  const [viewDetailLoading, setViewDetailLoading] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [draftPromptOpen, setDraftPromptOpen] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const {
    drafts,
    saveDraft: saveSurferDraft,
    deleteDraft: deleteSurferDraft,
  } = useDraftManager<SurferFormState>(surferDraftType);

  const [taskForm, setTaskForm] = useState<TaskFormState>(
    createEmptyTaskForm()
  );
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const { permission: listPermission, loading: listPermLoading } =
    usePagePermission("surfers-list");
  const { permission: groupsPermission, loading: groupsPermLoading } =
    usePagePermission("surfers-groups");
  const { permission: settingsPermission, loading: settingsPermLoading } =
    usePagePermission("surfers-settings");

  const fetchSurfers = useCallback(async () => {
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

      const res = await fetch(`/api/surfer?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "שגיאה בטעינת הנתונים");
      setSurfers(data.surfers || []);
    } catch (err: any) {
      console.error("Error loading surfers:", err);
      setError(err.message || "שגיאה בטעינת הנתונים");
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch("/api/surfers/summary", {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "שגיאה בטעינת הנתונים");
      setSummary({
        stats: data.stats || defaultStats,
        tasks: data.tasks || [],
        recentActivity: data.recentActivity || [],
      });
    } catch (err) {
      console.error("Error loading summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const res = await fetch("/api/groups", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const options = (data.groups || [])
          .filter((g: any) => g?.id && g?.name)
          .map((g: any) => ({ id: g.id, name: g.name }));
        setGroups(options);
      }
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurfers();
  }, [fetchSurfers]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const filteredSurfers = useMemo(() => surfers, [surfers]);

  const handleFilterChange = <K extends keyof SurferFilters>(
    key: K,
    value: SurferFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", status: "all", program: "" });
  };

  const handleFormChange = <K extends keyof SurferFormState>(
    key: K,
    value: SurferFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    // Mark as dirty when any field changes
    setFormDirty(true);
  };

  const openCreateModal = () => {
    setEditingSurfer(null);
    setFormState(createEmptyForm());
    setCurrentDraftId(null);
    setFormDirty(false);
    setShowFormModal(true);
  };

  const handleEdit = (surfer: Surfer) => {
    setEditingSurfer(surfer);
    setFormState({
      national_id: surfer.national_id,
      full_name: surfer.full_name,
      age: calcAge(surfer.date_of_birth)?.toString() || "",
      phone: surfer.phone || "",
      email: surfer.email || "",
      residence: surfer.residence || "",
      date_of_birth: surfer.date_of_birth || "",
      gender: surfer.gender || "",
      status: surfer.status || "בהמתנה",
      program: surfer.program || "",
      group_id: surfer.group_id || "",
      medical_approval: surfer.medical_approval || false,
      medical_condition: surfer.medical_condition || "",
      needs_wheelchair: surfer.needs_wheelchair || false,
      volunteers_needed: surfer.volunteers_needed
        ? String(surfer.volunteers_needed)
        : "",
      special_requirements: surfer.special_requirements || "",
      emergency_contact_name: surfer.emergency_contact_name || "",
      emergency_contact_phone: surfer.emergency_contact_phone || "",
      active: surfer.active,
      notes: surfer.notes || "",
    });
    setCurrentDraftId(surfer.national_id);
    setFormDirty(false);
    setShowFormModal(true);
  };

  const handleView = useCallback(async (surfer: Surfer) => {
    setViewingSurfer(surfer);
    setViewDetail(null);
    setViewDetailLoading(true);
    try {
      const res = await fetch(`/api/surfer/${surfer.national_id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setViewDetail({
          volunteerActivities: data.volunteerActivities || [],
        });
      }
    } catch (err) {
      console.error("Error loading surfer details:", err);
    } finally {
      setViewDetailLoading(false);
    }
  }, []);

  const handleResumeDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;
    setFormState(draft.payload);
    setCurrentDraftId(draft.id);
    setEditingSurfer(null);
    setFormDirty(false);
    setShowFormModal(true);
  };

  const handleSaveDraft = () => {
    const draftId =
      currentDraftId || editingSurfer?.national_id || generateDraftId();
    saveSurferDraft(draftId, formState);
    setCurrentDraftId(draftId);
    setFormDirty(false);
    setDraftPromptOpen(false);
    setShowFormModal(false);
  };

  const handleCloseDraftPrompt = () => {
    setDraftPromptOpen(false);
  };

  const closeForm = () => {
    setShowFormModal(false);
    setEditingSurfer(null);
    setFormState(createEmptyForm());
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

  const handleSubmitForm = async () => {
    if (!formState.national_id.trim() || !formState.full_name.trim()) {
      alert("תעודת זהות ושם מלא הם שדות חובה");
      return;
    }

    if (!/^\d{9}$/.test(formState.national_id)) {
      alert("תעודת זהות חייבת להכיל בדיוק 9 ספרות");
      return;
    }

    const payload = {
      ...formState,
      age: calcAge(formState.date_of_birth),
      volunteers_needed: formState.volunteers_needed
        ? Number(formState.volunteers_needed)
        : null,
      date_of_birth: formState.date_of_birth || null,
      group_id: formState.group_id || null,
      program: formState.program || null,
      status: formState.status || null,
      medical_condition: formState.medical_condition || null,
      special_requirements: formState.special_requirements || null,
      notes: formState.notes || null,
      emergency_contact_name: formState.emergency_contact_name || null,
      emergency_contact_phone: formState.emergency_contact_phone || null,
    };

    const url = editingSurfer ? "/api/surfer/update" : "/api/surfer/add";
    const method = editingSurfer ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "שמירה נכשלה");
      closeForm();
      fetchSurfers();
      fetchSummary();
    } catch (err: any) {
      console.error("Error saving surfer:", err);
      alert(err.message || "שגיאה בשמירת גולש");
    }
  };

  const handleDelete = async (national_id: string) => {
    if (!confirm("להפוך גולש ללא פעיל?")) return;
    try {
      const res = await fetch(`/api/surfer/update?national_id=${national_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "מחיקה נכשלה");
      fetchSurfers();
      fetchSummary();
    } catch (err: any) {
      console.error("Error deleting surfer:", err);
      alert(err.message || "שגיאה במחיקה");
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.surfer_id || !taskForm.body.trim()) {
      alert("בחר גולש והכנס תוכן למשימה/פתק");
      return;
    }
    setTaskSubmitting(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: "surfer",
          entity_id: taskForm.surfer_id,
          title: taskForm.title || "משימה",
          body: taskForm.body,
          due_date: taskForm.due_date || null,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "יצירת משימה נכשלה");
      setTaskForm(createEmptyTaskForm());
      fetchSummary();
    } catch (err: any) {
      console.error("Error creating task:", err);
      alert(err.message || "שגיאה ביצירת משימה");
    } finally {
      setTaskSubmitting(false);
    }
  };

  if (activeTab === "list" && !listPermLoading && listPermission === "none") {
    return (
      <div className="p-ds-spacing-lg">
        <AccessDenied title="אין לך הרשאה לצפות ברשימת הגולשים" />
      </div>
    );
  }

  if (
    activeTab === "groups" &&
    !groupsPermLoading &&
    groupsPermission === "none"
  ) {
    return (
      <div className="p-ds-spacing-lg">
        <AccessDenied title="אין לך הרשאה לצפות בקבוצות" />
      </div>
    );
  }

  if (
    activeTab === "settings" &&
    !settingsPermLoading &&
    settingsPermission === "none"
  ) {
    return (
      <div className="p-ds-spacing-lg">
        <AccessDenied title="אין לך הרשאה לצפות בהגדרות" />
      </div>
    );
  }

  return (
    <div className="p-ds-spacing-lg flex flex-col gap-ds-spacing-lg">
      {activeTab === "home" && (
        <SurfersHomeTab
          loading={summaryLoading}
          summary={summary}
          surfers={surfers}
          onRefreshSummary={fetchSummary}
        />
      )}

      {activeTab === "list" && (
        <SurfersListTab
          loading={listLoading}
          error={error}
          surfers={filteredSurfers}
          filters={filters}
          groups={groups}
          groupsLoading={groupsLoading}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={fetchSurfers}
          onAdd={openCreateModal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          drafts={drafts}
          onResumeDraft={handleResumeDraft}
          onDeleteDraft={deleteSurferDraft}
        />
      )}

      {activeTab === "groups" && <GroupsPage />}

      {activeTab === "settings" && <SettingsTab />}

      <SurferFormModal
        open={showFormModal}
        onClose={requestCloseForm}
        formState={formState}
        onChange={handleFormChange}
        onSubmit={handleSubmitForm}
        editing={!!editingSurfer}
        groups={groups}
        groupsLoading={groupsLoading}
      />

      <DraftPromptModal
        open={draftPromptOpen}
        onClose={handleCloseDraftPrompt}
        onSaveDraft={handleSaveDraft}
        onDiscard={() => {
          setDraftPromptOpen(false);
          closeForm();
        }}
      />

      <SurferViewModal
        surfer={viewingSurfer}
        detail={viewDetail}
        loading={viewDetailLoading}
        onClose={() => {
          setViewingSurfer(null);
          setViewDetail(null);
        }}
      />
    </div>
  );
}
