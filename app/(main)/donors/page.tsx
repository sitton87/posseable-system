"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Donor } from "@/type";
import { useDraftManager } from "@/app/hooks/useDraftManager";
import { spacing } from "@/app/styles/foundations";
import {
  DonorFormState,
  DonorStats,
  DonorTask,
  DonationRecord,
  DonorTabId,
  DonorFilters,
} from "./types";
import {
  createEmptyDonorForm,
  defaultStats,
  buildTasks,
} from "./utils";
import DonorsHomeTab from "./tabs/DonorsHomeTab";
import DonorListTab from "./tabs/DonorListTab";
import DonorFormModal from "./modals/DonorFormModal";
import DonorViewModal from "./modals/DonorViewModal";
import DraftPromptModal from "./modals/DraftPromptModal";

export default function DonorsPage() {
  const searchParams = useSearchParams();
  const activeTab: DonorTabId =
    searchParams?.get("view") === "list" ? "list" : "home";

  const [donors, setDonors] = useState<Donor[]>([]);
  const [stats, setStats] = useState<DonorStats>(defaultStats);
  const [tasks, setTasks] = useState<DonorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DonorFilters>({
    search: "",
    status: "all",
  });

  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState<DonorFormState>(
    createEmptyDonorForm()
  );
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [draftPromptOpen, setDraftPromptOpen] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const {
    drafts: donorDrafts,
    saveDraft: saveDonorDraft,
    deleteDraft: deleteDonorDraft,
  } = useDraftManager<DonorFormState>("donor");

  const [viewingDonor, setViewingDonor] = useState<Donor | null>(null);
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/donors", { credentials: "include" });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "שגיאה בטעינת הנתונים");
      }
      setDonors(data.donors || []);
      setStats(data.stats || defaultStats);
      setTasks(buildTasks(data.donors || []));
    } catch (err: any) {
      console.error("Error loading donors:", err);
      setError(err.message || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const filteredDonors = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return donors.filter((donor) => {
      if (filters.status === "active" && !donor.is_active) return false;
      if (filters.status === "inactive" && donor.is_active) return false;
      if (term) {
        const haystack = [
          donor.full_name,
          donor.national_id,
          donor.organization,
          donor.email,
          donor.phone,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());
        const matches = haystack.some((value) => value.includes(term));
        if (!matches) return false;
      }
      return true;
    });
  }, [donors, filters]);

  const handleFilterChange = <K extends keyof DonorFilters>(
    key: K,
    value: DonorFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", status: "all" });
  };

  const handleInputChange = <K extends keyof DonorFormState>(
    key: K,
    value: DonorFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setFormDirty(true);
  };

  const openCreateModal = () => {
    setEditingDonor(null);
    setFormState(createEmptyDonorForm());
    setFormDirty(false);
    setCurrentDraftId(null);
    setDraftPromptOpen(false);
    setShowModal(true);
  };

  const openEditModal = (donor: Donor) => {
    setEditingDonor(donor);
    setFormState({
      national_id: donor.national_id,
      full_name: donor.full_name,
      organization: donor.organization || "",
      phone: donor.phone || "",
      email: donor.email || "",
      notes: donor.notes || "",
      is_active: donor.is_active,
    });
    setFormDirty(false);
    setCurrentDraftId(null);
    setDraftPromptOpen(false);
    setShowModal(true);
  };

  const requestCloseModal = () => {
    if (formDirty) {
      setDraftPromptOpen(true);
      return;
    }
    closeFormModal();
  };

  const closeFormModal = () => {
    setShowModal(false);
    setFormState(createEmptyDonorForm());
    setEditingDonor(null);
    setFormDirty(false);
    setCurrentDraftId(null);
    setDraftPromptOpen(false);
  };

  const handleSaveDonorDraft = () => {
    const draftId =
      currentDraftId ||
      (typeof window !== "undefined" && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    saveDonorDraft(draftId, formState);
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

  const handleSubmit = async () => {
    if (!/^\d{9}$/.test(formState.national_id)) {
      alert("תעודת זהות חייבת להכיל 9 ספרות");
      return;
    }
    if (!formState.full_name.trim()) {
      alert("שם התורם הוא שדה חובה");
      return;
    }

    try {
      const url = editingDonor ? "/api/donors/update" : "/api/donors/add";
      const method = editingDonor ? "PUT" : "POST";
      const body = {
        national_id: formState.national_id,
        full_name: formState.full_name,
        organization: formState.organization || null,
        phone: formState.phone || null,
        email: formState.email || null,
        notes: formState.notes || null,
        is_active: formState.is_active,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "שמירת תורם נכשלה");
      }

      if (currentDraftId) {
        deleteDonorDraft(currentDraftId);
        setCurrentDraftId(null);
      }

      closeFormModal();
      fetchDonors();
    } catch (err: any) {
      console.error("Error saving donor:", err);
      alert(err.message || "שגיאה בשמירת תורם");
    }
  };

  const handleDeleteDonor = async (id: string) => {
    if (!confirm("האם למחוק את התורם?")) return;
    try {
      const res = await fetch(
        `/api/donors/update?national_id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "מחיקת תורם נכשלה");
      }
      fetchDonors();
    } catch (err: any) {
      console.error("Error removing donor:", err);
      alert(err.message || "שגיאה במחיקת התורם");
    }
  };

  const loadDonorHistory = useCallback(async (nationalId: string) => {
    try {
      setHistoryLoading(true);
      const res = await fetch(
        `/api/donors/history?national_id=${encodeURIComponent(nationalId)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "שגיאה בטעינת היסטוריה");
      }
      setDonationHistory(data.donations || []);
    } catch (err: any) {
      console.error("Error loading donor history:", err);
      setDonationHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const openViewModal = (donor: Donor) => {
    setViewingDonor(donor);
    setDonationHistory([]);
    setHistoryLoading(true);
    loadDonorHistory(donor.national_id);
  };

  const closeViewModal = () => {
    setViewingDonor(null);
    setDonationHistory([]);
    setHistoryLoading(false);
  };

  const handleResumeDraft = (draftId: string) => {
    const draft = donorDrafts.find((entry) => entry.id === draftId);
    if (!draft) return;
    setFormState(draft.payload);
    setEditingDonor(null);
    setCurrentDraftId(draftId);
    setFormDirty(false);
    setDraftPromptOpen(false);
    setShowModal(true);
  };

  // Note: tasks state is set but not directly used for toggling in the refactored main page.
  // The TasksBoard component handles its own state internally via API.
  // We keep it here if we want to pass initial tasks or refresh them.
  // However, TasksBoard fetches its own data now.
  // But wait, in the original code, TasksBoard was passed `entities` and a `title`, but handled tasks internally.
  // The `tasks` state in `DonorsPage` was calculated using `buildTasks` but seemingly not passed to `TasksBoard`.
  // Wait, let me check the original code for `TasksBoard` usage.
  // <TasksBoard entityType="donor" entities={donorEntities} title="משימות ופתקים (תורמים)" />
  // It seems `tasks` state in `DonorsPage` was actually UNUSED in the JSX!
  // It was set in `fetchDonors` but not passed anywhere.
  // `TasksBoard` fetches its own data.
  // The `buildTasks` function returns "suggested" tasks based on logic, but `TasksBoard` displays notes from DB.
  // It seems `buildTasks` was logic for "smart tasks" that maybe should be created in the DB?
  // Or maybe it was a leftover.
  // I will keep `buildTasks` and the state just to be safe and match original logic, but it seems unused for rendering.

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
        <DonorsHomeTab
          stats={stats}
          donors={donors}
          onRefresh={fetchDonors}
          loading={loading}
        />
      )}

      {activeTab === "list" && (
        <DonorListTab
          donors={filteredDonors}
          loading={loading}
          error={error}
          onAdd={openCreateModal}
          onEdit={openEditModal}
          onDelete={handleDeleteDonor}
          onView={openViewModal}
          onRefresh={fetchDonors}
          drafts={donorDrafts}
          onResumeDraft={handleResumeDraft}
          onDeleteDraft={deleteDonorDraft}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      <DonorFormModal
        open={showModal}
        onClose={requestCloseModal}
        onSubmit={handleSubmit}
        formState={formState}
        onInputChange={handleInputChange}
        editing={!!editingDonor}
        draftPromptOpen={draftPromptOpen}
      />

      <DonorViewModal
        donor={viewingDonor}
        onClose={closeViewModal}
        donationHistory={donationHistory}
        historyLoading={historyLoading}
      />

      <DraftPromptModal
        open={draftPromptOpen}
        onClose={() => setDraftPromptOpen(false)}
        onContinue={() => setDraftPromptOpen(false)}
        onDiscard={handleDiscardDraft}
        onSave={handleSaveDonorDraft}
      />
    </div>
  );
}
