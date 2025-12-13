"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Donor } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import {
  DraftList,
  FilterToolbar,
  StatCardGrid,
  TasksBoard,
  TaskEntityOption,
} from "@/app/components/shared";
import {
  inputStyle,
  labelStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
  filterControlStyle as baseFilterControlStyle,
} from "@/app/styles/components";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { formatPhoneNumber } from "@/lib/utils/format";
import { useDraftManager, type DraftEntry } from "@/app/hooks/useDraftManager";
import {
  FormGrid,
  Section,
  StatusPill,
  SmallActionButton,
  sectionCardStyle,
} from "@/app/components/shared";

type DonorFormState = {
  national_id: string;
  full_name: string;
  organization: string;
  phone: string;
  email: string;
  notes: string;
  is_active: boolean;
};

type DonorStats = {
  total_donors: number;
  active_donors: number;
  total_donation_events: number;
  total_donations: number;
  highest_donation: number;
  average_donation: number;
};

type DonorTask = {
  id: string;
  donorName: string;
  summary: string;
  dueDate?: string | null;
  status: string;
  emphasis: "call" | "meet" | "thank-you";
};

type DonationRecord = {
  id: string;
  transaction_date: string;
  amount: number;
  currency?: string | null;
  description?: string | null;
};

type DonorTabId = "home" | "list";

type DonorFilters = {
  search: string;
  status: "all" | "active" | "inactive";
};

type HomeTabProps = {
  stats: DonorStats;
  donors: Donor[];
  onRefresh: () => void;
  loading: boolean;
};

type DonorListTabProps = {
  donors: Donor[];
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (donor: Donor) => void;
  onDelete: (id: string) => void;
  onView: (donor: Donor) => void;
  onRefresh: () => void;
  drafts: DraftEntry<DonorFormState>[];
  onResumeDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  filters: DonorFilters;
  onFilterChange: <K extends keyof DonorFilters>(
    key: K,
    value: DonorFilters[K]
  ) => void;
  onClearFilters: () => void;
};

const muted = colors.textMuted;
const sectionBoxStyle = {
  ...sectionCardStyle,
  marginBottom: spacing.lg,
};

const createEmptyDonorForm = (): DonorFormState => ({
  national_id: "",
  full_name: "",
  organization: "",
  phone: "",
  email: "",
  notes: "",
  is_active: true,
});

const defaultStats: DonorStats = {
  total_donors: 0,
  active_donors: 0,
  total_donation_events: 0,
  total_donations: 0,
  highest_donation: 0,
  average_donation: 0,
};

const TASK_STATUSES = [
  { value: "not-started", label: "לא התחיל", tone: "warning" as const },
  { value: "in-progress", label: "בתהליך", tone: "info" as const },
  { value: "done", label: "הסתיים", tone: "success" as const },
  { value: "cancelled", label: "בוטל", tone: "danger" as const },
] as const;

const normalizeStatus = (value?: string | null) => {
  if (!value) return "not-started";
  if (value === "pending" || value === "open") return "not-started";
  return TASK_STATUSES.some((s) => s.value === value) ? value : "not-started";
};

const nextStatus = (current: string) => {
  const norm = normalizeStatus(current);
  const idx = TASK_STATUSES.findIndex((s) => s.value === norm);
  return TASK_STATUSES[(idx + 1) % TASK_STATUSES.length].value;
};

const formatCurrency = (value?: number | null) => {
  const num = typeof value === "number" ? value : 0;
  return `₪${num.toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const generateDraftId = () =>
  typeof window !== "undefined" && window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildTasks = (donors: Donor[]): DonorTask[] => {
  const tasks: DonorTask[] = [];

  donors
    .filter((donor) => (donor.total_donations || 0) === 0)
    .slice(0, 3)
    .forEach((donor) =>
      tasks.push({
        id: `new-${donor.national_id}`,
        donorName: donor.full_name,
        summary: "שיחת הכרות עם תורם חדש",
        dueDate: null,
        status: "pending",
        emphasis: "call",
      })
    );

  const staleDonors = donors.filter((donor) => {
    if (!donor.last_donation_date) return false;
    const last = new Date(donor.last_donation_date);
    if (Number.isNaN(last.getTime())) return false;
    const diffDays = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 180;
  });

  staleDonors.slice(0, 3).forEach((donor) => {
    let dueDate: string | null = null;
    const lastVal = donor.last_donation_date;
    if (lastVal) {
      const parsed =
        lastVal instanceof Date ? lastVal : new Date(lastVal as string);
      if (!Number.isNaN(parsed.getTime())) {
        dueDate = parsed.toISOString();
      }
    }

    tasks.push({
      id: `follow-${donor.national_id}`,
      donorName: donor.full_name,
      summary: "תיאום שיחת עדכון על פעילות הארגון",
      dueDate,
      status: "pending",
      emphasis: "meet",
    });
  });

  donors
    .filter((donor) => (donor.total_donations || 0) > 20000)
    .slice(0, 2)
    .forEach((donor) =>
      tasks.push({
        id: `thanks-${donor.national_id}`,
        donorName: donor.full_name,
        summary: "שליחת מכתב תודה אישי",
        dueDate: null,
        status: "pending",
        emphasis: "thank-you",
      })
    );

  return tasks;
};

function DonorsHomeTab({ stats, donors, onRefresh, loading }: HomeTabProps) {
  const statCards = [
    { label: 'סה"כ תורמים', value: stats.total_donors },
    {
      label: 'סה"כ תרומות',
      value: formatCurrency(stats.total_donations),
    },
    {
      label: "התרומה הגבוהה ביותר",
      value: formatCurrency(stats.highest_donation),
    },
    {
      label: "ממוצע תרומה",
      value: formatCurrency(stats.average_donation),
    },
  ];

  const donorEntities: TaskEntityOption[] = donors.map((d) => ({
    id: d.national_id,
    name: d.full_name,
    subtitle: d.organization || undefined,
  }));

  // נגזור את הפעילות האחרונה (תורמים שתרמו לאחרונה)
  const recentActivity = useMemo(() => {
    return [...donors]
      .filter((d) => d.last_donation_date)
      .sort((a, b) => {
        const dateA = new Date(a.last_donation_date!).getTime();
        const dateB = new Date(b.last_donation_date!).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [donors]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>דף הבית · תורמים</h3>
            <p style={{ margin: "4px 0 0", color: muted, fontSize: 13 }}>
              מבט על בריאות מערך התורמים ומעקב משימות.
            </p>
          </div>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענן נתונים
          </Button>
        </div>
        <StatCardGrid stats={statCards} />
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: spacing.lg,
        }}
      >
        <TasksBoard
          entityType="donor"
          entities={donorEntities}
          title="משימות ופתקים (תורמים)"
        />

        <Card style={{ padding: spacing.lg }}>
          <h4 style={{ margin: "0 0 16px 0" }}>תרומות אחרונות</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            {recentActivity.length === 0 ? (
              <div
                style={{
                  color: muted,
                  textAlign: "center",
                  padding: spacing.md,
                }}
              >
                אין פעילות תרומות רשומה.
              </div>
            ) : (
              recentActivity.map((donor) => (
                <div
                  key={donor.national_id}
                  style={{
                    padding: spacing.sm,
                    border: `1px solid ${colors.borderMuted}`,
                    borderRadius: radii.card,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {donor.full_name}
                    </div>
                    <div style={{ fontSize: 12, color: muted }}>
                      {donor.organization || "פרטי"}
                    </div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {formatDate(donor.last_donation_date)}
                    </div>
                    <div style={{ fontSize: 11, color: muted }}>
                      תאריך תרומה
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DonorListTab({
  donors,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  drafts,
  onResumeDraft,
  onDeleteDraft,
  filters,
  onFilterChange,
  onClearFilters,
}: DonorListTabProps) {
  const filterControlStyle = baseFilterControlStyle;

  return (
    <Card>
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
          <h2 style={{ margin: 0 }}>רשימת תורמים</h2>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            ניהול ועריכת כל התורמים במערכת.
          </p>
          {error && (
            <p style={{ marginTop: 4, color: colors.danger, fontSize: 12 }}>
              {error}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענון רשימה
          </Button>
          <Button onClick={onAdd}>+ תורם חדש</Button>
        </div>
      </div>
      {drafts.length > 0 && (
        <div style={{ marginTop: spacing.md }}>
          <DraftList
            drafts={drafts}
            title={`טיוטות אישיות (${drafts.length})`}
            description="טיוטות זמינות עבורך בלבד עד לשמירה סופית."
            onResume={onResumeDraft}
            onDelete={onDeleteDraft}
            getTitle={(draft) => draft.payload.full_name || "תורם ללא שם"}
            getSubtitle={(draft) =>
              `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
            }
          />
        </div>
      )}
      <FilterToolbar
        columns="repeat(auto-fit, minmax(220px, 1fr))"
        style={{ marginTop: spacing.md }}
      >
        <input
          type="text"
          style={filterControlStyle}
          placeholder="חיפוש לפי שם, ת.ז, ארגון או אימייל"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        <select
          style={filterControlStyle}
          value={filters.status}
          onChange={(e) =>
            onFilterChange("status", e.target.value as DonorFilters["status"])
          }
        >
          <option value="all">כל התורמים</option>
          <option value="active">תורמים פעילים</option>
          <option value="inactive">תורמים לא פעילים</option>
        </select>
      </FilterToolbar>
      <div
        style={{
          marginTop: spacing.sm,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button variant="ghost" onClick={onClearFilters}>
          ניקוי פילטרים
        </Button>
      </div>
      <div style={{ marginTop: spacing.lg }}>
        {loading ? (
          <div
            style={{ padding: spacing.lg, textAlign: "center", color: muted }}
          >
            טוען נתונים...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ ...tableStyle, width: "100%" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>ת.ז</th>
                  <th style={tableHeaderStyle}>שם</th>
                  <th style={tableHeaderStyle}>ארגון</th>
                  <th style={tableHeaderStyle}>טלפון</th>
                  <th style={tableHeaderStyle}>סה\"כ תרומות</th>
                  <th style={tableHeaderStyle}>כמות תרומות</th>
                  <th style={tableHeaderStyle}>תרומה אחרונה</th>
                  <th style={tableHeaderStyle}>סטטוס</th>
                  <th style={tableHeaderStyle}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr key={donor.national_id}>
                    <td style={tableCellStyle}>{donor.national_id}</td>
                    <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                      {donor.full_name}
                    </td>
                    <td style={tableCellStyle}>{donor.organization || "—"}</td>
                    <td style={tableCellStyle}>
                      {formatPhoneNumber(donor.phone)}
                    </td>
                    <td style={tableCellStyle}>
                      {formatCurrency(donor.total_donations)}
                    </td>
                    <td style={tableCellStyle}>{donor.donation_count || 0}</td>
                    <td style={tableCellStyle}>
                      {formatDate(donor.last_donation_date)}
                    </td>
                    <td style={tableCellStyle}>
                      <StatusPill
                        tone={donor.is_active ? "active" : "inactive"}
                      >
                        {donor.is_active ? "פעיל" : "לא פעיל"}
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
                          onClick={() => onView(donor)}
                        >
                          👁️
                        </SmallActionButton>
                        <SmallActionButton
                          variant="secondary"
                          onClick={() => onEdit(donor)}
                        >
                          ✏️
                        </SmallActionButton>
                        <SmallActionButton
                          variant="secondary"
                          style={{ color: colors.danger }}
                          onClick={() => onDelete(donor.national_id)}
                        >
                          🗑️
                        </SmallActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {donors.length === 0 && (
                  <tr>
                    <td colSpan={9} style={tableCellStyle}>
                      אין תורמים להצגה. לחץ על "תורם חדש" כדי להתחיל.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

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
  }, [setDonors]);

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
    const draftId = currentDraftId || generateDraftId();
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

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "done" ? "pending" : "done" }
          : task
      )
    );
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

      <Modal
        open={showModal}
        onClose={requestCloseModal}
        width="min(640px, 95vw)"
        style={{ padding: spacing.xxl }}
        escEnabled={!draftPromptOpen}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 20 }}>
          {editingDonor ? "עריכת תורם" : "תורם חדש"}
        </h3>
        <Section
          title="📋 פרטים אישיים"
          subtitle="מידע בסיסי על התורם"
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
                  handleInputChange("national_id", e.target.value)
                }
                disabled={!!editingDonor}
              />
            </div>
            <div>
              <label style={labelStyle}>
                שם התורם <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                type="text"
                style={inputStyle}
                value={formState.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
              />
            </div>
          </FormGrid>
        </Section>

        <Section
          title="🏢 פרטי התקשרות"
          subtitle="איך ניתן להשיג את התורם"
          style={{ marginBottom: spacing.lg }}
          bodyStyle={{ gap: spacing.md }}
        >
          <div>
            <label style={labelStyle}>ארגון / חברה</label>
            <input
              type="text"
              style={inputStyle}
              value={formState.organization}
              onChange={(e) =>
                handleInputChange("organization", e.target.value)
              }
            />
          </div>
          <FormGrid
            columns="repeat(auto-fit, minmax(240px, 1fr))"
            gap={spacing.md}
          >
            <div>
              <label style={labelStyle}>טלפון</label>
              <input
                type="tel"
                style={inputStyle}
                value={formState.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>אימייל</label>
              <input
                type="email"
                style={inputStyle}
                value={formState.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </FormGrid>
        </Section>

        <Section
          title="📝 הערות והעדפות"
          subtitle="תיעוד קצר ומשמעותי"
          style={{ marginBottom: spacing.lg }}
          bodyStyle={{ gap: spacing.sm }}
        >
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={formState.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
              marginTop: spacing.sm,
            }}
          >
            <input
              type="checkbox"
              checked={formState.is_active}
              onChange={(e) => handleInputChange("is_active", e.target.checked)}
              id="donor-active"
            />
            <label htmlFor="donor-active" style={{ fontWeight: 600 }}>
              תורם פעיל
            </label>
          </div>
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
            {editingDonor ? "עדכון תורם" : "שמור תורם"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(viewingDonor)}
        onClose={closeViewModal}
        width="min(680px, 96vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingDonor && (
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
                <h3 style={{ margin: 0 }}>{viewingDonor.full_name}</h3>
                <p style={{ margin: 0, color: muted, fontSize: 13 }}>
                  תעודת זהות: {viewingDonor.national_id}
                </p>
              </div>
              <Button variant="secondary" onClick={closeViewModal}>
                ✕ סגור
              </Button>
            </div>

            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>פרטים כלליים</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: spacing.md,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>ארגון</div>
                  <div>{viewingDonor.organization || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
                  <StatusPill
                    tone={viewingDonor.is_active ? "active" : "inactive"}
                  >
                    {viewingDonor.is_active ? "פעיל" : "לא פעיל"}
                  </StatusPill>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>טלפון</div>
                  <div>{formatPhoneNumber(viewingDonor.phone)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>אימייל</div>
                  <div>{viewingDonor.email || "—"}</div>
                </div>
              </div>
            </div>

            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>הערות</h4>
              <div style={{ whiteSpace: "pre-wrap", minHeight: 40 }}>
                {viewingDonor.notes || "—"}
              </div>
            </div>

            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>
                היסטוריית תרומות
              </h4>
              {historyLoading ? (
                <div style={{ textAlign: "center", color: muted }}>
                  טוען היסטוריה...
                </div>
              ) : donationHistory.length === 0 ? (
                <div style={{ textAlign: "center", color: muted }}>
                  לא נמצאו תרומות קודמות.
                </div>
              ) : (
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  <table style={{ width: "100%", fontSize: 13 }}>
                    <thead>
                      <tr style={{ textAlign: "right", color: muted }}>
                        <th>תאריך</th>
                        <th>תיאור</th>
                        <th>סכום</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationHistory.map((record) => (
                        <tr key={record.id}>
                          <td>{formatDate(record.transaction_date)}</td>
                          <td>{record.description || "—"}</td>
                          <td>{formatCurrency(record.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={draftPromptOpen}
        onClose={() => setDraftPromptOpen(false)}
        width="min(420px, 90vw)"
      >
        <h3 style={{ marginTop: 0 }}>לשמור את התורם כטיוטה?</h3>
        <p style={{ color: muted }}>
          הטיוטה תישמר עבורך בלבד ותאפשר לך לחזור בהמשך מבלי לאבד נתונים.
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
            המשך לערוך
          </Button>
          <Button variant="secondary" onClick={handleDiscardDraft}>
            בטל
          </Button>
          <Button onClick={handleSaveDonorDraft}>שמור כטיוטה</Button>
        </div>
      </Modal>
    </div>
  );
}
