"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GroupsPage from "./groups/page";
import { usePagePermission } from "@/app/hooks/usePagePermission";
import { AccessDenied } from "@/app/components/AccessDenied";
import {
  Surfer,
  SurferStats,
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  PROGRAM_OPTIONS,
} from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import {
  DraftList,
  FilterToolbar,
  StatCardGrid,
  FormGrid,
  Section,
  SmallActionButton,
  StatusPill,
  sectionCardStyle,
  TasksBoard,
  TaskEntityOption,
} from "@/app/components/shared";
import {
  filterControlStyle,
  inputStyle,
  labelStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, radii, spacing } from "@/app/styles/foundations";
import {
  useDraftManager,
  type DraftEntry,
  type DraftType,
} from "@/app/hooks/useDraftManager";
import { formatPhoneNumber } from "@/lib/utils/format";

type SurferFilters = {
  search: string;
  status: "all" | "active" | "inactive" | "approved" | "pending";
  program: string;
};

type SurferNote = {
  note_id: string;
  entity_id: string;
  title: string;
  body: string;
  status: string;
  priority?: string;
  due_date?: string | null;
  created_at?: string | null;
};

type SurferSummaryData = {
  stats: SurferStats;
  tasks: SurferNote[];
  recentActivity: {
    national_id: string;
    full_name: string;
    status?: string | null;
    program?: string | null;
    group_name?: string | null;
    created_at?: string | null;
  }[];
};

type VolunteerActivityRow = {
  activity_id: number;
  activity_date?: string | null;
  kind?: string | null;
  volunteer_national_id: string;
  volunteer_name?: string | null;
};

type SurferDetail = {
  volunteerActivities: VolunteerActivityRow[];
};

type SurferFormState = {
  national_id: string;
  full_name: string;
  phone: string;
  email: string;
  residence: string;
  age: string;
  date_of_birth: string;
  gender: string;
  status: string;
  program: string;
  group_id: string;
  medical_approval: boolean;
  medical_condition: string;
  needs_wheelchair: boolean;
  volunteers_needed: string;
  special_requirements: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  active: boolean;
  notes: string;
};

type TaskFormState = {
  surfer_id: string;
  title: string;
  body: string;
  due_date: string;
};

type TabId = "home" | "list" | "groups" | "settings";

const muted = colors.textMuted;
const warningSoft = "rgba(217,119,6,0.15)";
const surferDraftType: DraftType = "surfer";

const calcAge = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const dob = new Date(dateStr);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : null;
};

const defaultStats: SurferStats = {
  total: 0,
  active: 0,
  approved: 0,
  pending: 0,
  medicalApproved: 0,
  wheelchair: 0,
  grouped: 0,
};

const createEmptyForm = (): SurferFormState => ({
  national_id: "",
  full_name: "",
  phone: "",
  email: "",
  residence: "",
  age: "",
  date_of_birth: "",
  gender: "",
  status: "בהמתנה",
  program: "",
  group_id: "",
  medical_approval: false,
  medical_condition: "",
  needs_wheelchair: false,
  volunteers_needed: "",
  special_requirements: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  active: true,
  notes: "",
});

const createEmptyTaskForm = (): TaskFormState => ({
  surfer_id: "",
  title: "",
  body: "",
  due_date: "",
});

const sectionStyle = {
  ...sectionCardStyle,
  marginBottom: spacing.lg,
};

const generateDraftId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `surfer-${window.crypto.randomUUID()}`;
  }
  return `surfer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

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
    setFormState((prev) => {
      const next = { ...prev, [key]: value };
      if (next !== prev) setFormDirty(true);
      return next;
    });
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
      <div style={{ padding: spacing.lg }}>
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
      <div style={{ padding: spacing.lg }}>
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
      <div style={{ padding: spacing.lg }}>
        <AccessDenied title="אין לך הרשאה לצפות בהגדרות" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
      }}
    >
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

function SurfersHomeTab({
  loading,
  summary,
  surfers,
  onRefreshSummary,
}: {
  loading: boolean;
  summary: SurferSummaryData;
  surfers: Surfer[];
  onRefreshSummary: () => void;
}) {
  const statsCards = [
    { label: "סה״כ גולשים", value: summary.stats.total },
    { label: "פעילים", value: summary.stats.active },
    { label: "מאושרים", value: summary.stats.approved },
    { label: "ממתינים", value: summary.stats.pending },
    { label: "עם אישור רפואי", value: summary.stats.medicalApproved },
    { label: "זקוקים לכיסא גלגלים", value: summary.stats.wheelchair },
    { label: "משויכים לקבוצות", value: summary.stats.grouped },
  ];

  const surferEntities: TaskEntityOption[] = surfers.map((s) => ({
    id: s.national_id,
    name: s.full_name,
    subtitle: s.national_id,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: spacing.sm,
            marginBottom: spacing.sm,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>מבט כללי · גולשים</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              סטטוסים ומדדים מרכזיים של משתתפים
            </p>
          </div>
          <SmallActionButton variant="secondary" onClick={onRefreshSummary}>
            רענן
          </SmallActionButton>
        </div>
        {loading ? (
          <div style={{ padding: spacing.lg, textAlign: "center" }}>
            טוען נתונים...
          </div>
        ) : (
          <StatCardGrid stats={statsCards} />
        )}
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: spacing.lg,
        }}
      >
        <TasksBoard
          entityType="surfer"
          entities={surferEntities}
          title="משימות"
        />

        <Card style={{ padding: spacing.lg }}>
          <h4 style={{ margin: "0 0 12px 0" }}>פעילות אחרונה</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            {summary.recentActivity.length === 0 && (
              <div style={{ color: muted, fontSize: 13 }}>
                לא נמצאה פעילות אחרונה.
              </div>
            )}
            {summary.recentActivity.map((item) => (
              <div
                key={item.national_id}
                style={{
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: radii.card,
                  padding: spacing.sm,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ fontWeight: 700 }}>{item.full_name}</div>
                  <div style={{ color: muted, fontSize: 12 }}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("he-IL")
                      : "—"}
                  </div>
                </div>
                <div style={{ color: muted, fontSize: 13 }}>
                  {item.program || "ללא תוכנית"} · {item.status || "—"}
                </div>
                <div style={{ fontSize: 12, color: muted }}>
                  קבוצה: {item.group_name || "לא שויכה"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SurfersListTab({
  loading,
  error,
  surfers,
  filters,
  groups,
  groupsLoading,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onView,
  drafts,
  onResumeDraft,
  onDeleteDraft,
}: {
  loading: boolean;
  error: string | null;
  surfers: Surfer[];
  filters: SurferFilters;
  groups: { id: string; name: string }[];
  groupsLoading: boolean;
  onFilterChange: <K extends keyof SurferFilters>(
    key: K,
    value: SurferFilters[K]
  ) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (surfer: Surfer) => void;
  onDelete: (id: string) => void;
  onView: (surfer: Surfer) => void;
  drafts: DraftEntry<SurferFormState>[];
  onResumeDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
}) {
  return (
    <Card
      style={{
        padding: spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
      }}
    >
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
          <h2 style={{ margin: 0 }}>רשימת גולשים</h2>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            ניהול ועריכת כל הגולשים במערכת.
          </p>
          {error && (
            <p style={{ marginTop: 4, color: colors.danger, fontSize: 12 }}>
              {error}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: spacing.sm,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <SmallActionButton variant="secondary" onClick={onRefresh}>
            רענן
          </SmallActionButton>
          <SmallActionButton variant="secondary" onClick={onClearFilters}>
            ניקוי פילטרים
          </SmallActionButton>
          <Button onClick={onAdd}>+ גולש חדש</Button>
        </div>
      </div>

      {drafts.length > 0 && (
        <DraftList
          drafts={drafts}
          title={`טיוטות שמורות (${drafts.length})`}
          description="טיוטות אלו זמינות עבורך בלבד עד לשמירה סופית."
          onResume={onResumeDraft}
          onDelete={onDeleteDraft}
          badgeLabel="טיוטה"
          getTitle={(draft) => draft.payload.full_name || "גולש ללא שם"}
          getSubtitle={(draft) =>
            `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
          }
        />
      )}

      <FilterToolbar columns="repeat(auto-fit, minmax(200px, 1fr))">
        <input
          style={filterControlStyle}
          placeholder="חיפוש לפי שם, ת.ז, טלפון או אימייל"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        <select
          style={filterControlStyle}
          value={filters.status}
          onChange={(e) =>
            onFilterChange("status", e.target.value as SurferFilters["status"])
          }
        >
          <option value="all">כל המצבים</option>
          <option value="active">פעילים</option>
          <option value="inactive">לא פעילים</option>
          <option value="approved">מאושרים</option>
          <option value="pending">ממתינים</option>
        </select>
        <select
          style={filterControlStyle}
          value={filters.program}
          onChange={(e) => onFilterChange("program", e.target.value)}
        >
          <option value="">כל התוכניות</option>
          {PROGRAM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          style={filterControlStyle}
          value=""
          onChange={() => {}}
          disabled
        >
          <option>
            {groupsLoading ? "טוען קבוצות..." : "קבוצה (לצפייה בלבד)"}
          </option>
        </select>
      </FilterToolbar>

      {loading ? (
        <div style={{ textAlign: "center" }}>טוען גולשים...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>ת.ז.</th>
                <th style={tableHeaderStyle}>שם מלא</th>
                <th style={tableHeaderStyle}>תוכנית</th>
                <th style={tableHeaderStyle}>קבוצה</th>
                <th style={tableHeaderStyle}>סטטוס</th>
                <th style={tableHeaderStyle}>טלפון</th>
                <th style={tableHeaderStyle}>אישור רפואי</th>
                <th style={tableHeaderStyle}>מתנדבים</th>
                <th style={tableHeaderStyle}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {surfers.map((s) => (
                <tr key={s.national_id}>
                  <td style={tableCellStyle}>{s.national_id}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 700 }}>
                    {s.full_name}
                    {s.needs_wheelchair && (
                      <span style={{ marginRight: 6 }}>♿</span>
                    )}
                  </td>
                  <td style={tableCellStyle}>{s.program || "—"}</td>
                  <td style={tableCellStyle}>{s.group_name || "לא שויכה"}</td>
                  <td style={tableCellStyle}>
                    <StatusPill
                      tone={
                        s.status === "מאושר"
                          ? "success"
                          : s.status === "בהמתנה"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {s.status || "—"}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>{formatPhoneNumber(s.phone)}</td>
                  <td style={tableCellStyle}>
                    {s.medical_approval ? "✅" : "❌"}
                  </td>
                  <td style={tableCellStyle}>{s.volunteers_needed ?? "—"}</td>
                  <td style={tableCellStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <SmallActionButton
                        variant="secondary"
                        onClick={() => onView(s)}
                      >
                        👁️
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        onClick={() => onEdit(s)}
                      >
                        ✏️
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        style={{ color: colors.danger }}
                        onClick={() => onDelete(s.national_id)}
                      >
                        🗑️
                      </SmallActionButton>
                    </div>
                  </td>
                </tr>
              ))}
              {surfers.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      ...tableCellStyle,
                      textAlign: "center",
                      color: muted,
                    }}
                  >
                    אין גולשים להצגה
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function SettingsTab() {
  return (
    <Card style={{ padding: spacing.lg }}>
      <h4 style={{ margin: 0 }}>הגדרות עתידיות</h4>
      <div style={{ color: muted, marginTop: spacing.sm, fontSize: 14 }}>
        כאן נוסיף הגדרות ייעודיות לגולשים (אוטומציה, ברירות מחדל, תבניות פתקים)
        בהמשך.
      </div>
    </Card>
  );
}

function SurferFormModal({
  open,
  onClose,
  formState,
  onChange,
  onSubmit,
  editing,
  groups,
  groupsLoading,
}: {
  open: boolean;
  onClose: () => void;
  formState: SurferFormState;
  onChange: <K extends keyof SurferFormState>(
    key: K,
    value: SurferFormState[K]
  ) => void;
  onSubmit: () => void;
  editing: boolean;
  groups: { id: string; name: string }[];
  groupsLoading: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(960px, 95vw)"
      style={{ padding: spacing.lg }}
      overlayStyle={{ padding: `${spacing.xl}px 0` }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>{editing ? "עריכת גולש" : "גולש חדש"}</h3>
          <SmallActionButton variant="secondary" onClick={onClose}>
            ✕ סגור
          </SmallActionButton>
        </div>

        <Section
          title="📋 פרטים אישיים"
          subtitle="מידע בסיסי על הגולש"
          style={{ marginBottom: spacing.lg }}
        >
          <FormGrid
            columns="repeat(auto-fit, minmax(240px, 1fr))"
            gap={spacing.sm}
          >
            <div>
              <label style={labelStyle}>
                תעודת זהות <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                style={inputStyle}
                value={formState.national_id}
                onChange={(e) => onChange("national_id", e.target.value)}
                disabled={editing}
                maxLength={9}
                placeholder="9 ספרות"
              />
            </div>
            <div>
              <label style={labelStyle}>
                שם מלא <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                style={inputStyle}
                value={formState.full_name}
                onChange={(e) => onChange("full_name", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>טלפון</label>
              <input
                style={inputStyle}
                value={formState.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>אימייל</label>
              <input
                style={inputStyle}
                type="email"
                value={formState.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>מקום מגורים</label>
              <input
                style={inputStyle}
                value={formState.residence}
                onChange={(e) => onChange("residence", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>תאריך לידה</label>
              <input
                style={inputStyle}
                type="date"
                value={formState.date_of_birth}
                onChange={(e) => onChange("date_of_birth", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>מגדר</label>
              <select
                style={inputStyle}
                value={formState.gender}
                onChange={(e) => onChange("gender", e.target.value)}
              >
                <option value="">בחר...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </FormGrid>
        </Section>

        <div style={sectionStyle}>
          <h4 style={{ margin: "0 0 12px 0", color: muted }}>
            🎯 תוכנית וסטטוס
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: spacing.sm,
            }}
          >
            <div>
              <label style={labelStyle}>תוכנית</label>
              <select
                style={inputStyle}
                value={formState.program}
                onChange={(e) => onChange("program", e.target.value)}
              >
                <option value="">בחר...</option>
                {PROGRAM_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>סטטוס</label>
              <select
                style={inputStyle}
                value={formState.status}
                onChange={(e) => onChange("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>קבוצה</label>
              <select
                style={inputStyle}
                value={formState.group_id}
                onChange={(e) => onChange("group_id", e.target.value)}
              >
                <option value="">
                  {groupsLoading ? "טוען קבוצות..." : "לא שויכה"}
                </option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>מספר מתנדבים נדרש</label>
              <input
                style={inputStyle}
                type="number"
                value={formState.volunteers_needed}
                onChange={(e) => onChange("volunteers_needed", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h4 style={{ margin: "0 0 12px 0", color: muted }}>🏥 מצב רפואי</h4>
          <div style={{ display: "flex", gap: spacing.lg, flexWrap: "wrap" }}>
            <label
              style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
            >
              <input
                type="checkbox"
                checked={formState.medical_approval}
                onChange={(e) => onChange("medical_approval", e.target.checked)}
              />
              אישור רפואי קיים
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
            >
              <input
                type="checkbox"
                checked={formState.needs_wheelchair}
                onChange={(e) => onChange("needs_wheelchair", e.target.checked)}
              />
              זקוק לכיסא גלגלים
            </label>
          </div>
          <div style={{ marginTop: spacing.sm }}>
            <label style={labelStyle}>מצב רפואי / הערות</label>
            <textarea
              style={{ ...inputStyle, minHeight: 70 }}
              value={formState.medical_condition}
              onChange={(e) => onChange("medical_condition", e.target.value)}
            />
          </div>
        </div>

        <div style={sectionStyle}>
          <h4 style={{ margin: "0 0 12px 0", color: muted }}>
            🚨 איש קשר לחירום
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: spacing.sm,
            }}
          >
            <div>
              <label style={labelStyle}>שם איש קשר</label>
              <input
                style={inputStyle}
                value={formState.emergency_contact_name}
                onChange={(e) =>
                  onChange("emergency_contact_name", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>טלפון</label>
              <input
                style={inputStyle}
                value={formState.emergency_contact_phone}
                onChange={(e) =>
                  onChange("emergency_contact_phone", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h4 style={{ margin: "0 0 12px 0", color: muted }}>
            📝 דרישות והערות
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: spacing.sm,
            }}
          >
            <div>
              <label style={labelStyle}>דרישות מיוחדות</label>
              <textarea
                style={{ ...inputStyle, minHeight: 70 }}
                value={formState.special_requirements}
                onChange={(e) =>
                  onChange("special_requirements", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>הערות</label>
              <textarea
                style={{ ...inputStyle, minHeight: 70 }}
                value={formState.notes}
                onChange={(e) => onChange("notes", e.target.value)}
              />
            </div>
          </div>
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
          <Button onClick={onSubmit}>{editing ? "עדכון" : "שמור"}</Button>
        </div>
      </div>
    </Modal>
  );
}

function DraftPromptModal({
  open,
  onClose,
  onSaveDraft,
  onDiscard,
}: {
  open: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={400}
      style={{ padding: spacing.lg }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
      >
        <h4 style={{ margin: 0 }}>לשמור כטיוטה?</h4>
        <div style={{ color: muted, fontSize: 14 }}>
          זיהינו שינויים שלא נשמרו. האם לשמור כטיוטה לפני סגירה?
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
          }}
        >
          <Button variant="secondary" onClick={onDiscard}>
            סגור בלי לשמור
          </Button>
          <Button onClick={onSaveDraft}>שמור טיוטה וסגור</Button>
        </div>
      </div>
    </Modal>
  );
}

function SurferViewModal({
  surfer,
  detail,
  loading,
  onClose,
}: {
  surfer: Surfer | null;
  detail: SurferDetail | null;
  loading: boolean;
  onClose: () => void;
}) {
  if (!surfer) return null;
  const derivedAge = calcAge(surfer.date_of_birth) ?? surfer.age ?? null;
  return (
    <Modal
      open={!!surfer}
      onClose={onClose}
      width="min(720px, 90vw)"
      style={{ padding: spacing.lg }}
      overlayStyle={{ padding: `${spacing.lg}px 0` }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>פרטי גולש</h3>
          <SmallActionButton variant="secondary" onClick={onClose}>
            ✕ סגור
          </SmallActionButton>
        </div>

        <InfoSection title="📋 פרטים אישיים">
          <InfoRow label="שם מלא" value={surfer.full_name} />
          <InfoRow label="ת.ז" value={surfer.national_id} />
          <InfoRow label="טלפון" value={formatPhoneNumber(surfer.phone)} />
          <InfoRow label="אימייל" value={surfer.email || "—"} />
          <InfoRow label="מגורים" value={surfer.residence || "—"} />
          <InfoRow
            label="גיל"
            value={derivedAge !== null ? `${derivedAge} שנים` : "—"}
          />
          <InfoRow label="מגדר" value={surfer.gender || "—"} />
        </InfoSection>

        <InfoSection title="🎯 שיוך וסטטוס">
          <InfoRow label="תוכנית" value={surfer.program || "—"} />
          <InfoRow label="סטטוס" value={surfer.status || "—"} />
          <InfoRow label="קבוצה" value={surfer.group_name || "לא שויכה"} />
          <InfoRow
            label="מתנדבים נדרשים"
            value={surfer.volunteers_needed?.toString() || "לא הוגדר"}
          />
        </InfoSection>

        <InfoSection title="🏥 מצב רפואי">
          <InfoRow
            label="אישור רפואי"
            value={surfer.medical_approval ? "כן" : "לא"}
          />
          <InfoRow
            label="זקוק לכיסא גלגלים"
            value={surfer.needs_wheelchair ? "כן" : "לא"}
          />
          <InfoRow label="מצב רפואי" value={surfer.medical_condition || "—"} />
        </InfoSection>

        <InfoSection title="🚨 איש קשר לחירום">
          <InfoRow
            label="שם איש קשר"
            value={surfer.emergency_contact_name || "—"}
          />
          <InfoRow
            label="טלפון חירום"
            value={formatPhoneNumber(surfer.emergency_contact_phone)}
          />
        </InfoSection>

        {surfer.special_requirements && (
          <InfoSection title="דרישות מיוחדות">
            <div>{surfer.special_requirements}</div>
          </InfoSection>
        )}
        {surfer.notes && (
          <InfoSection title="הערות">
            <div>{surfer.notes}</div>
          </InfoSection>
        )}

        <InfoSection title="👥 מתנדבים לפי פעילות">
          {loading ? (
            <div style={{ color: muted, fontSize: 13 }}>טוען מתנדבים...</div>
          ) : detail?.volunteerActivities?.length ? (
            detail.volunteerActivities.map((row) => (
              <div
                key={`${row.activity_id}-${row.volunteer_national_id}-${row.activity_date}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: `1px solid ${colors.borderMuted}`,
                  paddingBottom: spacing.xs,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {row.volunteer_name || row.volunteer_national_id}
                  </div>
                  <div style={{ fontSize: 12, color: muted }}>
                    פעילות #{row.activity_id} · {row.kind || "—"}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: muted }}>
                  {row.activity_date
                    ? new Date(row.activity_date).toLocaleDateString("he-IL")
                    : "—"}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: muted, fontSize: 13 }}>
              אין מתנדבים משויכים לפעילויות של הגולש.
            </div>
          )}
        </InfoSection>
      </div>
    </Modal>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: colors.surfaceAlt,
        borderRadius: radii.card,
        padding: spacing.md,
      }}
    >
      <div style={{ color: muted, fontWeight: 700, marginBottom: spacing.sm }}>
        {title}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.sm,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: muted }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value || "—"}</div>
    </div>
  );
}
