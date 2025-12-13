"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/app/components/ui";
import { spacing } from "@/app/styles/foundations";
import { useDraftManager } from "@/app/hooks/useDraftManager";

import {
  createEmptyForm,
  defaultStats,
  deriveStatsFromVolunteers,
  tryParseJson,
  volunteerDraftType,
} from "./utils";

import {
  TabId,
  Volunteer,
  VolunteerDetail,
  VolunteerFilters,
  VolunteerFormState,
  VolunteerSummaryData,
} from "./types";

// Tabs
import VolunteersHomeTab from "./tabs/VolunteersHomeTab";
import VolunteersListTab from "./tabs/VolunteersListTab";
import SettingsTab from "./tabs/SettingsTab";

// Modals
import VolunteerFormModal from "./modals/VolunteerFormModal";
import VolunteerViewModal from "./modals/VolunteerViewModal";
import DraftPromptModal from "./modals/DraftPromptModal";

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
    classification: "all",
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

  const fetchVolunteers = useCallback(async () => {
    try {
      setListLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.program) params.append("program", filters.program);
      if (filters.classification && filters.classification !== "all") {
        params.append("classification", filters.classification);
      }
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
    } catch (err) {
      console.error("Error loading summary:", err);
    } finally {
      setSummaryLoading(false);
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
    setFilters({
      search: "",
      status: "all",
      program: "",
      classification: "all",
    });
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
      classification: volunteer.classification || "volunteer",
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
      classification: formState.classification || "volunteer",
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
          onRefreshSummary={fetchSummary}
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

      <VolunteerFormModal
        open={showFormModal}
        onClose={requestCloseModal}
        formState={formState}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        editing={!!editingVolunteer}
        draftPromptOpen={draftPromptOpen}
      />

      <DraftPromptModal
        open={draftPromptOpen}
        onClose={() => setDraftPromptOpen(false)}
        onSaveDraft={handleSaveDraft}
        onDiscard={handleDiscardDraft}
      />

      <VolunteerViewModal
        volunteer={viewingVolunteer}
        detail={viewDetail}
        loading={viewDetailLoading}
        onClose={() => {
          setViewingVolunteer(null);
          setViewDetail(null);
        }}
      />
    </div>
  );
}
