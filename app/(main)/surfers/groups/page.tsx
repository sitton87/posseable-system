"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Group, SeasonPlan, Surfer } from "@/type";
import { GROUP_STATUS_OPTIONS } from "@/type";
import {
  Card,
  Title,
  Text,
  TextInput,
  Select,
  SelectItem,
  Button,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Dialog,
  DialogPanel,
  Divider,
  Grid,
  Col,
  Flex,
  Switch,
  Textarea,
} from "@tremor/react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DraftList } from "@/app/components/shared";
import { useDraftManager, type DraftEntry } from "@/app/hooks/useDraftManager";
import { formatPhoneNumber } from "@/lib/utils/format";
import { cssVar, tw } from "@/app/styles/design-system";

type GroupWithSurfers = Group & { surfers?: Surfer[] };

type GroupFormState = {
  name: string;
  description: string;
  season_id: string;
  start_season_id: string;
  additional_seasons: string[];
  min_participants: string;
  max_participants: string;
  status: string;
  is_active: boolean;
  notes: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "פעיל":
      return "emerald";
    case "מלא":
      return "blue";
    case "סגור":
      return "red";
    case "הושהה":
      return "amber";
    default:
      return "slate";
  }
};

const createEmptyFormState = (): GroupFormState => ({
  name: "",
  description: "",
  season_id: "",
  start_season_id: "",
  additional_seasons: [],
  min_participants: "",
  max_participants: "",
  status: GROUP_STATUS_OPTIONS[0],
  is_active: true,
  notes: "",
});

const parseAdditionalSeasonsValue = (value?: string | null): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => item.toString());
    }
  } catch {
    // ignore and fallback to string parsing
  }
  return value
    .split(",")
    .map((val) => val.trim())
    .filter(Boolean);
};

const filterAdditionalSelection = (
  selected: string[],
  mainSeason: string
): string[] => selected.filter((value) => value !== mainSeason);

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithSurfers[]>([]);
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupWithSurfers | null>(null);
  const [viewingGroup, setViewingGroup] = useState<GroupWithSurfers | null>(null);
  const [formData, setFormData] = useState<GroupFormState>(createEmptyFormState());
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [formDirty, setFormDirty] = useState(false);
  const [draftPromptOpen, setDraftPromptOpen] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const { drafts, saveDraft, deleteDraft } = useDraftManager<GroupFormState>("group");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchGroups(), fetchSeasons()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups?includeSurfers=true", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups);
      } else {
        console.error(data.error || "Failed to load groups");
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
      alert("שגיאה בטעינת קבוצות");
    }
  };

  const fetchSeasons = async () => {
    try {
      setSeasonLoading(true);
      const res = await fetch("/api/seasons", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    } catch (err) {
      console.error("Error fetching seasons:", err);
    } finally {
      setSeasonLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGroup(null);
    setFormData(createEmptyFormState());
    setCurrentDraftId(null);
    setFormDirty(false);
    setShowModal(true);
  };

  const handleEdit = (group: GroupWithSurfers) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      season_id: group.season_id.toString(),
      start_season_id: group.start_season_id ? group.start_season_id.toString() : "",
      additional_seasons: parseAdditionalSeasonsValue(group.additional_seasons),
      min_participants: group.min_participants?.toString() || "",
      max_participants: group.max_participants?.toString() || "",
      status: group.status,
      is_active: group.is_active,
      notes: group.notes || "",
    });
    setCurrentDraftId(group.id);
    setFormDirty(false);
    setShowModal(true);
  };

  const handleView = (group: GroupWithSurfers) => {
    setViewingGroup(group);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingGroup(null);
  };

  const handleAdditionalSeasonsChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    setFormData((prev) => ({ ...prev, additional_seasons: selected }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.season_id) {
      alert("שם הקבוצה ומזהה העונה הם שדות חובה");
      return;
    }

    try {
      const url = editingGroup ? "/api/groups/update" : "/api/groups/add";
      const method = editingGroup ? "PUT" : "POST";

      const body: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        season_id: parseInt(formData.season_id, 10),
        start_season_id: formData.start_season_id
          ? parseInt(formData.start_season_id, 10)
          : null,
        additional_seasons: formData.additional_seasons.map((seasonId) =>
          parseInt(seasonId, 10)
        ),
        min_participants: parseInt(formData.min_participants || "0", 10),
        max_participants: parseInt(formData.max_participants || "0", 10),
        status: formData.status,
        is_active: formData.is_active,
        notes: formData.notes.trim() || null,
      };

      if (editingGroup) {
        body.id = editingGroup.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingGroup ? "קבוצה עודכנה בהצלחה!" : "קבוצה נוספה בהצלחה!");
        setShowModal(false);
        setFormDirty(false);
        setCurrentDraftId(null);
        await fetchGroups();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving group:", err);
      alert("שגיאה בשמירת קבוצה");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הקבוצה?")) return;

    try {
      const res = await fetch(`/api/groups/update?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        alert("קבוצה נמחקה בהצלחה!");
        fetchGroups();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("שגיאה במחיקת קבוצה");
    }
  };

  const getSeasonLabel = (group: GroupWithSurfers) => {
    if (group.season_name) {
      return `${group.season_name} · ${group.season_year || ""}`.trim();
    }
    const match = seasons.find((season) => season.id === group.season_id);
    if (match) {
      return `${match.name} · ${match.year}`;
    }
    return `עונה ${group.season_id}`;
  };

  const seasonOptions = useMemo(
    () =>
      seasons.map((season) => ({
        value: season.id.toString(),
        label: `${season.name} · ${season.year}`,
      })),
    [seasons]
  );

  const getSeasonLabelById = (id?: number | null) => {
    if (!id) return null;
    const match = seasons.find((season) => season.id === id);
    return match ? `${match.name} · ${match.year}` : `עונה ${id}`;
  };

  const getAdditionalSeasonLabels = (value?: string | null) => {
    const ids = parseAdditionalSeasonsValue(value).map((seasonId) =>
      parseInt(seasonId, 10)
    );
    return ids
      .map((seasonId) => getSeasonLabelById(seasonId))
      .filter((label): label is string => Boolean(label));
  };

  const viewingGroupStartSeasonLabel = viewingGroup
    ? getSeasonLabelById(viewingGroup.start_season_id)
    : null;

  const viewingGroupAdditionalSeasonLabels = viewingGroup
    ? getAdditionalSeasonLabels(viewingGroup.additional_seasons)
    : [];

  const filteredGroups = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return groups.filter((g) => {
      if (filters.status === "active" && !g.is_active) return false;
      if (filters.status === "inactive" && g.is_active) return false;
      if (term) {
        const haystack = [g.name, g.description]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        if (!haystack.some((v) => v.includes(term))) return false;
      }
      return true;
    });
  }, [groups, filters]);

  const handleFilterChange = (key: "search" | "status", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters({ search: "", status: "all" });

  const handleFormChange = <K extends keyof GroupFormState>(
    key: K,
    value: GroupFormState[K]
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (next !== prev) setFormDirty(true);
      return next;
    });
  };

  const handleResumeDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;
    setEditingGroup(null);
    setFormData(draft.payload);
    setCurrentDraftId(draft.id);
    setFormDirty(false);
    setShowModal(true);
  };

  const handleSaveDraft = () => {
    const draftId = currentDraftId || editingGroup?.id || `group-${Date.now()}`;
    saveDraft(draftId, formData);
    setCurrentDraftId(draftId);
    setFormDirty(false);
    setDraftPromptOpen(false);
    setShowModal(false);
  };

  const closeForm = () => {
    setShowModal(false);
    setEditingGroup(null);
    setFormData(createEmptyFormState());
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

  if (loading) {
    return (
      <div className="p-8 text-center" style={{ color: cssVar.text.muted }}>
        טוען קבוצות...
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
              ניהול קבוצות
            </Title>
            <span className="text-xl font-light" style={{ color: cssVar.border.primary }}>|</span>
            <Text style={{ color: cssVar.text.muted }}>ניהול שיוך קבוצות ותיאום משתתפים</Text>
          </div>
          <button
            onClick={handleAdd}
            className="h-[38px] flex items-center justify-center gap-2 px-4 rounded-lg transition-all active:scale-95 border-none outline-none"
            style={{
              background: cssVar.brand.primary,
              color: cssVar.text.inverted,
              boxShadow: cssVar.shadow.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cssVar.brand.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = cssVar.brand.primary;
            }}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm font-medium whitespace-nowrap">קבוצה חדשה</span>
          </button>
        </div>

        {/* Drafts */}
        {drafts.length > 0 && (
          <div className="mb-6">
            <DraftList
              drafts={drafts as DraftEntry<GroupFormState>[]}
              title={`טיוטות שמורות (${drafts.length})`}
              description="טיוטות זמינות עבורך בלבד עד לשמירה."
              onResume={handleResumeDraft}
              onDelete={(id) => deleteDraft(id)}
              badgeLabel="טיוטה"
              getTitle={(draft) => draft.payload.name || "קבוצה ללא שם"}
              getSubtitle={(draft) =>
                `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
              }
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
            <TextInput
              icon={MagnifyingGlassIcon}
              placeholder="חיפוש קבוצה או תיאור..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            <Select
              value={filters.status}
              onValueChange={(val) => handleFilterChange("status", val)}
              placeholder="סטטוס"
            >
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="active">פעילות</SelectItem>
              <SelectItem value="inactive">לא פעילות</SelectItem>
            </Select>
          </div>
          <Button
            variant="secondary"
            color="slate"
            onClick={clearFilters}
            className="whitespace-nowrap h-[38px]"
          >
            ניקוי פילטרים
          </Button>
        </div>

        {/* Table */}
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="text-center">שם הקבוצה</TableHeaderCell>
              <TableHeaderCell className="text-center">עונה</TableHeaderCell>
              <TableHeaderCell className="text-center">משתתפים</TableHeaderCell>
              <TableHeaderCell className="text-center">טווח</TableHeaderCell>
              <TableHeaderCell className="text-center">סטטוס</TableHeaderCell>
              <TableHeaderCell className="text-center">פעיל</TableHeaderCell>
              <TableHeaderCell className="text-center">פעולות</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGroups.map((group) => (
              <TableRow key={group.id} className="transition-colors hover:bg-ds-bg-secondary">
                <TableCell className="text-center font-semibold" style={{ color: cssVar.text.primary }}>
                  {group.name}
                </TableCell>
                <TableCell className="text-center" style={{ color: cssVar.text.muted }}>
                  {getSeasonLabel(group)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-bold" style={{ color: cssVar.brand.primary }}>
                    {group.current_participants ?? 0}
                  </span>
                </TableCell>
                <TableCell className="text-center" style={{ color: cssVar.text.muted }}>
                  {group.min_participants} - {group.max_participants}
                </TableCell>
                <TableCell className="text-center">
                  <Badge color={getStatusColor(group.status)} size="xs">
                    {group.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {group.is_active ? (
                    <CheckCircleIcon className="w-5 h-5 mx-auto" style={{ color: cssVar.status.success }} />
                  ) : (
                    <XCircleIcon className="w-5 h-5 mx-auto" style={{ color: cssVar.status.danger }} />
                  )}
                </TableCell>
                <TableCell>
                  <Flex justifyContent="center" className="gap-2">
                    <Button
                      size="xs"
                      variant="secondary"
                      color="indigo"
                      icon={EyeIcon}
                      onClick={() => handleView(group)}
                      tooltip="צפייה"
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                    />
                    <Button
                      size="xs"
                      variant="secondary"
                      color="blue"
                      icon={PencilIcon}
                      onClick={() => handleEdit(group)}
                      tooltip="עריכה"
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                    />
                    <Button
                      size="xs"
                      variant="secondary"
                      color="rose"
                      icon={TrashIcon}
                      onClick={() => handleDelete(group.id)}
                      tooltip="מחיקה"
                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
                    />
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
            {filteredGroups.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10" style={{ color: cssVar.text.muted }}>
                  {groups.length === 0
                    ? 'אין קבוצות במערכת. לחץ על "קבוצה חדשה" להתחיל.'
                    : "לא נמצאו קבוצות התואמות לחיפוש."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onClose={requestCloseForm} static={true} className="z-[100]">
        <DialogPanel
          className="max-w-3xl w-full p-0 overflow-hidden rounded-ds-modal-radius"
          style={{
            background: cssVar.bg.primary,
            boxShadow: cssVar.modal.shadow,
            border: `1px solid ${cssVar.border.primary}`,
          }}
          dir="rtl"
        >
          {/* Header */}
          <div
            className="flex justify-between items-center px-6 py-4"
            style={{
              borderBottom: `1px solid ${cssVar.border.primary}`,
              background: cssVar.bg.secondary,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: cssVar.status.infoLight }}
              >
                <UserGroupIcon className="w-5 h-5" style={{ color: cssVar.status.info }} />
              </div>
              <div>
                <Title style={{ color: cssVar.text.primary }} className="text-xl">
                  {editingGroup ? "עריכת קבוצה" : "קבוצה חדשה"}
                </Title>
                <Text style={{ color: cssVar.text.muted }} className="text-sm">
                  {editingGroup ? "עדכון פרטי הקבוצה במערכת" : "הוספת קבוצה חדשה למערכת"}
                </Text>
              </div>
            </div>
            <button
              onClick={requestCloseForm}
              className="p-2 rounded-full transition-colors"
              style={{ color: cssVar.text.muted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = cssVar.bg.tertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div
            className="p-6 max-h-[75vh] overflow-y-auto space-y-6"
            style={{ background: cssVar.bg.primary }}
          >
            {/* Basic Info */}
            <FormSection title="פרטי קבוצה" icon={UserGroupIcon} iconColor="info">
              <Grid numItems={1} numItemsSm={2} className="gap-4">
                <Col numColSpan={2}>
                  <FormField label="שם הקבוצה" required>
                    <TextInput
                      value={formData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="למשל: קבוצת ילדים א׳"
                    />
                  </FormField>
                </Col>
                <Col numColSpan={2}>
                  <FormField label="תיאור">
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      placeholder="תיאור הקבוצה..."
                      className="min-h-[60px]"
                    />
                  </FormField>
                </Col>
              </Grid>
            </FormSection>

            {/* Season & Participants */}
            <FormSection title="עונה ומשתתפים" icon={CalendarIcon} iconColor="brand">
              <Grid numItems={1} numItemsSm={3} className="gap-4">
                <FormField label="עונה" required>
                  <Select
                    value={formData.season_id}
                    onValueChange={(val) => {
                      handleFormChange("season_id", val);
                      setFormData((prev) => ({
                        ...prev,
                        additional_seasons: filterAdditionalSelection(
                          prev.additional_seasons,
                          val
                        ),
                      }));
                    }}
                    placeholder={seasonLoading ? "טוען עונות..." : "בחר עונה"}
                    disabled={seasonLoading}
                  >
                    {seasonOptions.map((season) => (
                      <SelectItem key={season.value} value={season.value}>
                        {season.label}
                      </SelectItem>
                    ))}
                  </Select>
                </FormField>
                <FormField label="מינימום משתתפים">
                  <TextInput
                    type="number"
                    value={formData.min_participants}
                    onChange={(e) => handleFormChange("min_participants", e.target.value)}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="מקסימום משתתפים">
                  <TextInput
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => handleFormChange("max_participants", e.target.value)}
                    placeholder="30"
                  />
                </FormField>
              </Grid>

              <Grid numItems={1} numItemsSm={2} className="gap-4 mt-4">
                <FormField label="עונת תחילת פעילות">
                  <Select
                    value={formData.start_season_id}
                    onValueChange={(val) => handleFormChange("start_season_id", val)}
                    placeholder="לא נבחר"
                  >
                    <SelectItem value="">לא נבחר</SelectItem>
                    {seasonOptions.map((season) => (
                      <SelectItem key={season.value} value={season.value}>
                        {season.label}
                      </SelectItem>
                    ))}
                  </Select>
                </FormField>
                <FormField label="עונות נוספות">
                  <select
                    multiple
                    className={tw.input.base}
                    style={{
                      minHeight: "80px",
                      background: cssVar.bg.primary,
                      color: cssVar.text.primary,
                    }}
                    value={formData.additional_seasons}
                    onChange={handleAdditionalSeasonsChange}
                  >
                    {seasonOptions
                      .filter((season) => season.value !== formData.season_id)
                      .map((season) => (
                        <option key={season.value} value={season.value}>
                          {season.label}
                        </option>
                      ))}
                  </select>
                  <Text className="text-xs mt-1" style={{ color: cssVar.text.muted }}>
                    ניתן לבחור כמה עונות (Ctrl / Cmd + קליק)
                  </Text>
                </FormField>
              </Grid>
            </FormSection>

            {/* Status */}
            <FormSection title="סטטוס" icon={Cog6ToothIcon} iconColor="warning">
              <div className="space-y-4">
                <Grid numItems={1} numItemsSm={2} className="gap-4">
                  <FormField label="סטטוס קבוצה">
                    <Select
                      value={formData.status}
                      onValueChange={(val) => handleFormChange("status", val)}
                    >
                      {GROUP_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </Select>
                  </FormField>
                </Grid>
                <label
                  className="flex items-center gap-3 cursor-pointer group px-4 py-3 rounded-lg transition-colors w-fit"
                  style={{
                    background: cssVar.bg.secondary,
                    border: `1px solid ${cssVar.border.primary}`,
                  }}
                >
                  <Switch
                    checked={formData.is_active}
                    onChange={(val) => handleFormChange("is_active", val)}
                    color="emerald"
                  />
                  <span className="text-sm font-medium" style={{ color: cssVar.text.secondary }}>
                    קבוצה פעילה
                  </span>
                </label>
              </div>
            </FormSection>

            {/* Notes */}
            <FormSection title="הערות" icon={DocumentTextIcon} iconColor="neutral">
              <Textarea
                value={formData.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                placeholder="הערות נוספות..."
                className="min-h-[80px]"
              />
            </FormSection>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-3 px-6 py-4"
            style={{
              background: cssVar.bg.secondary,
              borderTop: `1px solid ${cssVar.border.primary}`,
            }}
          >
            <Button variant="secondary" color="slate" onClick={requestCloseForm}>
              ביטול
            </Button>
            <Button variant="primary" color="blue" onClick={handleSubmit}>
              {editingGroup ? "עדכן קבוצה" : "צור קבוצה"}
            </Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Draft Prompt Modal */}
      <Dialog open={draftPromptOpen} onClose={() => setDraftPromptOpen(false)} className="z-[110]">
        <DialogPanel
          className="max-w-md w-full p-6 rounded-ds-modal-radius"
          style={{
            background: cssVar.bg.primary,
            boxShadow: cssVar.modal.shadow,
            border: `1px solid ${cssVar.border.primary}`,
          }}
          dir="rtl"
        >
          <Title className="text-lg mb-2" style={{ color: cssVar.text.primary }}>
            לשמור כטיוטה?
          </Title>
          <Text className="mb-6" style={{ color: cssVar.text.muted }}>
            זיהינו שינויים שלא נשמרו. האם לשמור כטיוטה לפני סגירה?
          </Text>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" color="slate" onClick={closeForm}>
              סגור בלי לשמור
            </Button>
            <Button variant="primary" color="blue" onClick={handleSaveDraft}>
              שמור טיוטה וסגור
            </Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal && !!viewingGroup} onClose={closeViewModal} static={true} className="z-[100]">
        <DialogPanel
          className="max-w-3xl w-full p-0 overflow-hidden rounded-ds-modal-radius"
          style={{
            background: cssVar.bg.primary,
            boxShadow: cssVar.modal.shadow,
            border: `1px solid ${cssVar.border.primary}`,
          }}
          dir="rtl"
        >
          {viewingGroup && (
            <>
              {/* Header */}
              <div
                className="flex justify-between items-center px-6 py-4"
                style={{
                  borderBottom: `1px solid ${cssVar.border.primary}`,
                  background: cssVar.bg.secondary,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: cssVar.status.infoLight }}
                  >
                    <UserGroupIcon className="w-5 h-5" style={{ color: cssVar.status.info }} />
                  </div>
                  <div>
                    <Title style={{ color: cssVar.text.primary }} className="text-xl">
                      {viewingGroup.name}
                    </Title>
                    <Text style={{ color: cssVar.text.muted }} className="text-sm">
                      פרטי קבוצה
                    </Text>
                  </div>
                </div>
                <button
                  onClick={closeViewModal}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: cssVar.text.muted }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = cssVar.bg.tertiary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div
                className="p-6 max-h-[75vh] overflow-y-auto space-y-6"
                style={{ background: cssVar.bg.primary }}
              >
                {/* General Info */}
                <ViewSection title="פרטים כלליים" icon={UserGroupIcon} iconColor="info">
                  <Grid numItems={2} numItemsSm={3} className="gap-4">
                    <ViewField label="עונה">
                      <Badge color="indigo" size="sm">{getSeasonLabel(viewingGroup)}</Badge>
                    </ViewField>
                    <ViewField label="סטטוס">
                      <Badge color={getStatusColor(viewingGroup.status)} size="sm">
                        {viewingGroup.status}
                      </Badge>
                    </ViewField>
                    <ViewField label="פעיל">
                      <Text className="font-medium" style={{ color: cssVar.text.primary }}>
                        {viewingGroup.is_active ? "✅ כן" : "❌ לא"}
                      </Text>
                    </ViewField>
                    <ViewField label="משתתפים נוכחיים">
                      <Text className="font-bold text-lg" style={{ color: cssVar.brand.primary }}>
                        {viewingGroup.current_participants ?? 0}
                      </Text>
                    </ViewField>
                    <ViewField label="טווח משתתפים">
                      <Text className="font-medium" style={{ color: cssVar.text.primary }}>
                        {viewingGroup.min_participants} - {viewingGroup.max_participants}
                      </Text>
                    </ViewField>
                    <ViewField label="עונת תחילה">
                      <Text className="font-medium" style={{ color: cssVar.text.primary }}>
                        {viewingGroupStartSeasonLabel || "—"}
                      </Text>
                    </ViewField>
                  </Grid>

                  {viewingGroupAdditionalSeasonLabels.length > 0 && (
                    <div className="mt-4">
                      <Text className="text-xs mb-2" style={{ color: cssVar.text.muted }}>
                        עונות נוספות
                      </Text>
                      <div className="flex flex-wrap gap-2">
                        {viewingGroupAdditionalSeasonLabels.map((label) => (
                          <Badge key={label} color="slate" size="xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewingGroup.description && (
                    <div
                      className="mt-4 rounded-lg p-3"
                      style={{
                        background: cssVar.bg.secondary,
                        border: `1px solid ${cssVar.border.primary}`,
                      }}
                    >
                      <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                        {viewingGroup.description}
                      </Text>
                    </div>
                  )}
                </ViewSection>

                {/* Surfers */}
                <ViewSection title={`גולשים משויכים (${viewingGroup.surfers?.length || 0})`} icon={UsersIcon} iconColor="brand">
                  {viewingGroup.surfers && viewingGroup.surfers.length > 0 ? (
                    <div className="space-y-2">
                      {viewingGroup.surfers.map((surfer) => (
                        <div
                          key={surfer.national_id}
                          className="flex justify-between items-center p-3 rounded-lg transition-colors"
                          style={{
                            background: cssVar.bg.secondary,
                            border: `1px solid ${cssVar.border.primary}`,
                          }}
                        >
                          <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                            {surfer.full_name}
                          </Text>
                          <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                            {formatPhoneNumber(surfer.phone)}
                          </Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="text-center py-6 rounded-lg"
                      style={{ background: cssVar.bg.secondary }}
                    >
                      <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                        אין גולשים משויכים לקבוצה זו.
                      </Text>
                    </div>
                  )}
                </ViewSection>
              </div>

              {/* Footer */}
              <div
                className="flex justify-end px-6 py-4"
                style={{
                  background: cssVar.bg.secondary,
                  borderTop: `1px solid ${cssVar.border.primary}`,
                }}
              >
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    background: cssVar.bg.tertiary,
                    color: cssVar.text.secondary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = cssVar.border.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = cssVar.bg.tertiary;
                  }}
                >
                  סגור
                </button>
              </div>
            </>
          )}
        </DialogPanel>
      </Dialog>
    </div>
  );
}

// Form Section Component
function FormSection({
  title,
  icon: IconComponent,
  iconColor = "brand",
  children,
}: {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: "brand" | "info" | "warning" | "neutral" | "success";
  children: ReactNode;
}) {
  const colorMap = {
    brand: cssVar.brand.primary,
    info: cssVar.status.info,
    warning: cssVar.status.warning,
    neutral: cssVar.text.muted,
    success: cssVar.status.success,
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <IconComponent className="w-4 h-4" style={{ color: colorMap[iconColor] }} />
        <Text
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: cssVar.text.secondary }}
        >
          {title}
        </Text>
      </div>
      <Divider className="my-2" />
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Form Field Component
function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <Text
        className="mb-1.5 text-sm font-medium block"
        style={{ color: cssVar.text.secondary }}
      >
        {label}
        {required && <span style={{ color: cssVar.status.danger }} className="mr-1">*</span>}
      </Text>
      {children}
    </div>
  );
}

// View Section Component
function ViewSection({
  title,
  icon: IconComponent,
  iconColor = "brand",
  children,
}: {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: "brand" | "info" | "warning" | "neutral" | "success";
  children: ReactNode;
}) {
  const colorMap = {
    brand: cssVar.brand.primary,
    info: cssVar.status.info,
    warning: cssVar.status.warning,
    neutral: cssVar.text.muted,
    success: cssVar.status.success,
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <IconComponent className="w-4 h-4" style={{ color: colorMap[iconColor] }} />
        <Text
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: cssVar.text.secondary }}
        >
          {title}
        </Text>
      </div>
      <Divider className="my-2" />
      <div className="mt-4">{children}</div>
    </section>
  );
}

// View Field Component
function ViewField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Text className="text-xs mb-1 block" style={{ color: cssVar.text.muted }}>
        {label}
      </Text>
      {children}
    </div>
  );
}
