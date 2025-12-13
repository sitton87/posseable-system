"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import clsx from "clsx";
import { Users, ShieldCheck } from "lucide-react"; // אייקונים לטאבים

import {
  PAGE_HIERARCHY,
  PageHierarchyNode,
} from "@/lib/permissions/pageHierarchy";
import { spacing, colors } from "@/app/styles/foundations";
import { StatCardGrid, SmallActionButton } from "@/app/components/shared";

// --- Types ---

type PermissionLevel = "none" | "read" | "write";

type AppUser = {
  national_id: string;
  full_name: string;
  email: string;
  role: string;
  role_group_code?: string | null;
  must_reset: boolean;
  created_at: string;
  is_active?: boolean;
};

type RoleGroupOption = {
  code: string;
  name: string;
  description?: string | null;
  is_default?: boolean;
};

type AppPageRow = {
  page_key: string;
  display_name: string;
  route_path: string;
  category?: string | null;
};

// --- Constants ---

const DEFAULT_ROLE_OPTIONS = ["admin", "staff", "viewer"];

const ROLE_LABELS: Record<string, string> = {
  admin: "מנהל מערכת",
  staff: "צוות תפעול",
  viewer: "קריאה בלבד",
};

const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  none: "ללא גישה",
  read: "קריאה",
  write: "עריכה",
};

const PERMISSION_HELP: Record<PermissionLevel, string> = {
  none: "הדף מוסתר לחלוטין מהמשתמשים בקבוצה זו.",
  read: "המשתמשים יכולים לצפות בדף אך לא לבצע שינויים.",
  write: "המשתמשים יכולים גם לערוך ולמחוק מידע בדף.",
};

type TabId = "users" | "permissions";

type Props = {
  currentRole: string;
};

export default function SystemSettingsClient({ currentRole }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("users");

  // --- Users State ---
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [createForm, setCreateForm] = useState({
    national_id: "",
    full_name: "",
    email: "",
    role: "staff",
    role_group_code: "management",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [updateForm, setUpdateForm] = useState({
    full_name: "",
    email: "",
    role: "",
    role_group_code: "",
    must_reset: false,
    is_active: true,
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- Permissions State ---
  const [roleGroups, setRoleGroups] = useState<RoleGroupOption[]>([]);
  const [pages, setPages] = useState<AppPageRow[]>([]);
  const [selectedRoleGroup, setSelectedRoleGroup] = useState("");
  const [pagePermissions, setPagePermissions] = useState<
    Record<string, PermissionLevel>
  >({});
  const [initialPagePermissions, setInitialPagePermissions] = useState<
    Record<string, PermissionLevel>
  >({});
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsSaving, setPermissionsSaving] = useState(false);
  const [permissionsMessage, setPermissionsMessage] = useState<string | null>(
    null
  );

  // --- Logic: Users ---

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/system-users", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to load users");
      }
      const data = await res.json();
      setUsers(data?.users ?? []);
      setLastRefresh(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "שגיאה בטעינת המשתמשים";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roleGroupOptionsMemo = useMemo(
    () =>
      roleGroups.map((group) => ({
        code: group.code,
        name: group.name,
        description: group.description,
      })),
    [roleGroups]
  );

  const formatRoleGroupLabel = (code?: string | null) => {
    if (!code) return "ללא";
    return (
      roleGroupOptionsMemo.find((group) => group.code === code)?.name || code
    );
  };

  useEffect(() => {
    if (!selectedUserId) {
      setUpdateForm({
        full_name: "",
        email: "",
        role: "",
        role_group_code: roleGroupOptionsMemo[0]?.code || "management",
        must_reset: false,
        is_active: true,
      });
      return;
    }
    const selected = users.find((user) => user.national_id === selectedUserId);
    if (selected) {
      const fallbackRoleGroup =
        selected.role_group_code ||
        roleGroupOptionsMemo[0]?.code ||
        "management";
      setUpdateForm({
        full_name: selected.full_name,
        email: selected.email,
        role: selected.role,
        role_group_code: fallbackRoleGroup,
        must_reset: selected.must_reset,
        is_active: selected.is_active ?? true,
      });
    }
  }, [selectedUserId, users, roleGroupOptionsMemo]);

  const roleOptions = useMemo(() => {
    const unique = new Set<string>([
      ...DEFAULT_ROLE_OPTIONS,
      ...users.map((user) => user.role),
    ]);
    return Array.from(unique).filter(Boolean);
  }, [users]);

  const stats = useMemo(() => {
    const total = users.length;
    const needsReset = users.filter((user) => user.must_reset).length;
    const admins = users.filter(
      (user) => user.role?.toLowerCase() === "admin"
    ).length;
    return { total, needsReset, admins };
  }, [users]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMessage(null);
    setError(null);
    try {
      const payload = {
        ...createForm,
        role_group_code:
          createForm.role_group_code ||
          roleGroupOptionsMemo[0]?.code ||
          "management",
      };
      const res = await fetch("/api/system-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "יצירת המשתמש נכשלה");
      }
      setCreateMessage("המשתמש נוצר בהצלחה");
      setCreateForm({
        national_id: "",
        full_name: "",
        email: "",
        role: createForm.role,
        role_group_code: payload.role_group_code,
      });
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "יצירת המשתמש נכשלה";
      setCreateMessage(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setUpdateMessage("בחר משתמש לעדכון");
      return;
    }
    setUpdateLoading(true);
    setUpdateMessage(null);
    try {
      const payload = {
        national_id: selectedUserId,
        ...updateForm,
        role_group_code:
          updateForm.role_group_code ||
          roleGroupOptionsMemo[0]?.code ||
          "management",
      };
      const res = await fetch("/api/system-users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "עדכון המשתמש נכשל");
      }
      setUpdateMessage("פרטי המשתמש עודכנו");
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "עדכון המשתמש נכשל";
      setUpdateMessage(message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    const selected = users.find((user) => user.national_id === selectedUserId);
    if (!selected) return;

    if (
      deleteConfirmationText.trim() !==
      `כן, מחק את ${selected.full_name} מהמערכת`
    ) {
      alert("טקסט האישור שגוי");
      return;
    }

    setDeleteLoading(true);
    setUpdateMessage(null);
    try {
      const res = await fetch(
        `/api/system-users?national_id=${selectedUserId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "מחיקת המשתמש נכשלה");
      }
      setUpdateMessage("המשתמש נמחק בהצלחה");
      setSelectedUserId("");
      setDeleteConfirmationOpen(false);
      setDeleteConfirmationText("");
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "מחיקת המשתמש נכשלה";
      setUpdateMessage(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatRoleLabel = (role: string) => ROLE_LABELS[role] ?? role;
  const currentRoleLabel = ROLE_LABELS[currentRole] || currentRole;

  // --- Logic: Permissions ---

  const loadRoleGroupPermissions = async (roleGroupCode?: string) => {
    setPermissionsLoading(true);
    setPermissionsMessage(null);
    try {
      const params = new URLSearchParams();
      if (roleGroupCode) {
        params.set("roleGroupCode", roleGroupCode);
      }
      const queryString = params.toString();
      const res = await fetch(
        `/api/system-settings/access${queryString ? `?${queryString}` : ""}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "שגיאה בטעינת ההרשאות");
      }
      const nextRoleGroup =
        data.roleGroupCode ||
        roleGroupCode ||
        data.roleGroups?.find((group: RoleGroupOption) => group.is_default)
          ?.code ||
        data.roleGroups?.[0]?.code ||
        "";

      setRoleGroups(data.roleGroups ?? []);
      setPages(data.pages ?? []);
      setSelectedRoleGroup(nextRoleGroup);

      const permissionMap: Record<string, PermissionLevel> = {};
      (data.pages ?? []).forEach((page: AppPageRow) => {
        const record = (data.permissions ?? []).find(
          (permission: {
            page_key: string;
            permission_level: PermissionLevel;
          }) => permission.page_key === page.page_key
        );
        permissionMap[page.page_key] = (record?.permission_level ??
          "none") as PermissionLevel;
      });
      setPagePermissions(permissionMap);
      setInitialPagePermissions(permissionMap);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "שגיאה בטעינת ההרשאות";
      setPermissionsMessage(message);
      console.error("Failed to load permissions", err);
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    loadRoleGroupPermissions();
  }, []);

  useEffect(() => {
    if (roleGroups.length && activeTab === "users") {
      setCreateForm((prev) => ({
        ...prev,
        role_group_code: prev.role_group_code || roleGroups[0].code,
      }));
    }
  }, [roleGroups, activeTab]);

  const hasPermissionChanges = useMemo(() => {
    if (!pages.length) return false;
    return pages.some((page) => {
      const current = pagePermissions[page.page_key] || "none";
      const initial = initialPagePermissions[page.page_key] || "none";
      return current !== initial;
    });
  }, [pages, pagePermissions, initialPagePermissions]);

  const handlePermissionChange = (pageKey: string, level: PermissionLevel) => {
    setPermissionsMessage(null);
    setPagePermissions((prev) => ({
      ...prev,
      [pageKey]: level,
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleGroup) return;
    setPermissionsSaving(true);
    setPermissionsMessage(null);
    try {
      const payload = {
        roleGroupCode: selectedRoleGroup,
        permissions: pages.map((page) => ({
          page_key: page.page_key,
          permission_level: pagePermissions[page.page_key] || "none",
        })),
      };
      const res = await fetch("/api/system-settings/access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "שגיאה בשמירת ההרשאות");
      }
      setInitialPagePermissions(pagePermissions);
      setPermissionsMessage("ההרשאות נשמרו בהצלחה");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "שגיאה בשמירת ההרשאות";
      setPermissionsMessage(message);
      console.error("Failed to save permissions", err);
    } finally {
      setPermissionsSaving(false);
    }
  };

  const handleSyncPages = async () => {
    setPermissionsLoading(true);
    setPermissionsMessage(null);
    try {
      const res = await fetch("/api/system-settings/sync-pages", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "סנכרון נכשל");
      }
      setPermissionsMessage(`סוכנרנו ${data.count} דפים בהצלחה`);
      await loadRoleGroupPermissions(selectedRoleGroup);
    } catch (err) {
      const message = err instanceof Error ? err.message : "שגיאה בסנכרון דפים";
      setPermissionsMessage(message);
      console.error(err);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const orderedPages = useMemo(() => {
    const pageMap = new Map(pages.map((p) => [p.page_key, p]));
    const result: Array<{ page: AppPageRow; indent: number }> = [];
    const visited = new Set<string>();

    const traverse = (nodes: PageHierarchyNode[], indent: number) => {
      for (const node of nodes) {
        const page = pageMap.get(node.key);
        if (page) {
          result.push({ page, indent });
          visited.add(node.key);
        }
        if (node.children) {
          traverse(node.children, indent + 1);
        }
      }
    };

    traverse(PAGE_HIERARCHY, 0);

    pages.forEach((p) => {
      if (!visited.has(p.page_key)) {
        result.push({ page: p, indent: 0 });
      }
    });

    return result;
  }, [pages]);

  const selectedRoleGroupInfo = useMemo(
    () => roleGroups.find((group) => group.code === selectedRoleGroup),
    [roleGroups, selectedRoleGroup]
  );

  const permissionSaveDisabled =
    !selectedRoleGroup ||
    permissionsLoading ||
    permissionsSaving ||
    !hasPermissionChanges;

  const renderPermissionButton = (pageKey: string, level: PermissionLevel) => {
    const isSelected = (pagePermissions[pageKey] || "none") === level;
    return (
      <button
        type="button"
        onClick={() => handlePermissionChange(pageKey, level)}
        disabled={permissionsLoading || permissionsSaving}
        className={clsx(
          "w-full rounded-md border px-2 py-1 text-sm font-semibold transition",
          isSelected
            ? "border-sky-500 bg-sky-50 text-sky-700"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        )}
        title={PERMISSION_HELP[level]}
      >
        {PERMISSION_LABELS[level]}
      </button>
    );
  };

  const renderUsersTable = () => {
    if (loading) {
      return <p className="text-sm text-gray-500">טוען משתמשים...</p>;
    }
    if (error) {
      return (
        <p className="text-sm text-red-600">
          {error} –{" "}
          <button className="underline" onClick={fetchUsers}>
            נסה שוב
          </button>
        </p>
      );
    }
    if (!users.length) {
      return <p className="text-sm text-gray-500">אין משתמשים במערכת עדיין.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-semibold text-gray-600">שם מלא</th>
              <th className="px-4 py-2 font-semibold text-gray-600">
                דוא&quot;ל
              </th>
              <th className="px-4 py-2 font-semibold text-gray-600">תפקיד</th>
              <th className="px-4 py-2 font-semibold text-gray-600">
                קבוצת ניהול
              </th>
              <th className="px-4 py-2 font-semibold text-gray-600">
                חובת החלפת סיסמה
              </th>
              <th className="px-4 py-2 font-semibold text-gray-600">סטטוס</th>
              <th className="px-4 py-2 font-semibold text-gray-600">
                נוצר בתאריך
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((user) => (
              <tr key={user.national_id}>
                <td className="px-4 py-2 font-medium text-gray-900">
                  <div>{user.full_name}</div>
                  <div className="text-xs text-gray-500">
                    {user.national_id}
                  </div>
                </td>
                <td className="px-4 py-2 text-gray-700">{user.email}</td>
                <td className="px-4 py-2 text-gray-700">
                  {formatRoleLabel(user.role)}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {formatRoleGroupLabel(user.role_group_code)}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={clsx(
                      "rounded-full px-2 py-1 text-xs font-semibold inline-flex justify-center",
                      user.must_reset
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {user.must_reset ? "נדרש" : "לא נדרש"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={clsx(
                      "rounded-full px-2 py-1 text-xs font-semibold inline-flex justify-center",
                      user.is_active !== false
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {user.is_active !== false ? "פעיל" : "חסום"}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {new Date(user.created_at).toLocaleDateString("he-IL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const kpiCards = [
    { label: "סה״כ משתמשים", value: stats.total },
    { label: "מנהלים פעילים", value: stats.admins },
    { label: "ממתינים להחלפת סיסמה", value: stats.needsReset },
  ];

  return (
    <div
      style={{
        padding: spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
      }}
    >
      {/* KPI Section */}
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
            <h3 style={{ margin: 0 }}>מבט כללי · משתמשי מערכת</h3>
            <p style={{ margin: 0, color: colors.textMuted, fontSize: 13 }}>
              סטטוס משתמשים וניהול הרשאות
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-gray-500">
              מחובר בתפקיד:{" "}
              <span className="font-semibold">{currentRoleLabel}</span>
            </span>
            <SmallActionButton variant="secondary" onClick={fetchUsers}>
              רענן נתונים
            </SmallActionButton>
          </div>
        </div>
        {loading && users.length === 0 ? (
          <div style={{ padding: spacing.lg, textAlign: "center" }}>
            טוען נתונים...
          </div>
        ) : (
          <StatCardGrid stats={kpiCards} />
        )}
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("users")}
          className={clsx(
            "group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium transition-colors",
            activeTab === "users"
              ? "border-sky-500 text-sky-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          )}
        >
          <Users
            className={clsx(
              "-ml-0.5 ml-2 h-5 w-5",
              activeTab === "users"
                ? "text-sky-500"
                : "text-gray-400 group-hover:text-gray-500"
            )}
          />
          <span>ניהול משתמשים</span>
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={clsx(
            "group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium transition-colors",
            activeTab === "permissions"
              ? "border-sky-500 text-sky-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          )}
        >
          <ShieldCheck
            className={clsx(
              "-ml-0.5 ml-2 h-5 w-5",
              activeTab === "permissions"
                ? "text-sky-500"
                : "text-gray-400 group-hover:text-gray-500"
            )}
          />
          <span>הרשאות ותפקידים</span>
        </button>
      </div>

      {/* Tab Content: Users */}
      {activeTab === "users" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid gap-6 lg:grid-cols-2">
          {/* List Card */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  משתמשים קיימים
                </h2>
                <p className="text-sm text-gray-500">
                  רשימת כל חשבונות המשתמש במערכת.
                </p>
              </div>
              {lastRefresh && (
                <p className="text-xs text-gray-500">
                  עודכן לאחרונה: {lastRefresh.toLocaleString("he-IL")}
                </p>
              )}
            </div>
            {renderUsersTable()}
          </Card>

          {/* Create User */}
          <Card className="space-y-4 p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                יצירת משתמש חדש
              </h2>
              <p className="text-sm text-gray-500">
                הגדרת משתמש חדש במערכת (סיסמה זמנית תישלח במייל).
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleCreateUser}>
              <Input
                label="תעודת זהות (9 ספרות)"
                value={createForm.national_id}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    national_id: e.target.value,
                  }))
                }
              />
              <Input
                label="שם מלא"
                value={createForm.full_name}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
              />
              <Input
                label='דוא"ל'
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                type="email"
              />
              <div className="flex flex-col gap-1">
                <label className="font-medium text-sm text-gray-700">
                  תפקיד במערכת
                </label>
                <select
                  className="rounded-md border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {formatRoleLabel(role)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-sm text-gray-700">
                  קבוצת ניהול
                </label>
                <select
                  className="rounded-md border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                  value={createForm.role_group_code}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      role_group_code: e.target.value,
                    }))
                  }
                  disabled={!roleGroupOptionsMemo.length}
                >
                  {roleGroupOptionsMemo.map((group) => (
                    <option key={group.code} value={group.code}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {formatRoleGroupLabel(createForm.role_group_code)}
                </p>
              </div>
              {createMessage && (
                <p
                  className={clsx(
                    "text-sm",
                    createMessage.includes("נכשלה")
                      ? "text-red-600"
                      : "text-emerald-700"
                  )}
                >
                  {createMessage}
                </p>
              )}
              <Button type="submit" disabled={createLoading}>
                {createLoading ? "שומר..." : "צור משתמש"}
              </Button>
            </form>
          </Card>

          {/* Update User */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  עדכון משתמש קיים
                </h2>
                <p className="text-sm text-gray-500">
                  עריכת פרטים, חסימה או מחיקה.
                </p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleUpdateUser}>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-sm text-gray-700">
                  בחירת משתמש לעריכה
                </label>
                <select
                  className="rounded-md border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">בחר משתמש...</option>
                  {users.map((user) => (
                    <option value={user.national_id} key={user.national_id}>
                      {user.full_name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              {selectedUserId && (
                <>
                  <Input
                    label="שם מלא"
                    value={updateForm.full_name}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label='דוא"ל'
                    type="email"
                    value={updateForm.email}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-sm text-gray-700">
                      תפקיד
                    </label>
                    <select
                      className="rounded-md border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                      value={updateForm.role}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {formatRoleLabel(role)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-sm text-gray-700">
                      קבוצת ניהול
                    </label>
                    <select
                      className="rounded-md border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                      value={updateForm.role_group_code}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          role_group_code: e.target.value,
                        }))
                      }
                      disabled={!roleGroupOptionsMemo.length}
                    >
                      <option value="">בחר...</option>
                      {roleGroupOptionsMemo.map((group) => (
                        <option key={group.code} value={group.code}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="must-reset"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      checked={updateForm.must_reset}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          must_reset: e.target.checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="must-reset"
                      className="text-sm text-gray-700"
                    >
                      חייב בהחלפת סיסמה בכניסה הבאה
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="is-active"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      checked={updateForm.is_active}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({
                          ...prev,
                          is_active: e.target.checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="is-active"
                      className="text-sm text-gray-700"
                    >
                      משתמש פעיל (בטל סימון כדי לחסום)
                    </label>
                  </div>

                  {updateMessage && (
                    <p
                      className={clsx(
                        "text-sm",
                        updateMessage.includes("נכשל")
                          ? "text-red-600"
                          : "text-emerald-700"
                      )}
                    >
                      {updateMessage}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={updateLoading}
                      className="flex-1"
                    >
                      {updateLoading ? "שומר..." : "שמור שינויים"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="!bg-red-50 !text-red-600 hover:!bg-red-100"
                      onClick={() => {
                        setDeleteConfirmationOpen(true);
                        setDeleteConfirmationText("");
                      }}
                    >
                      מחק משתמש
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* Tab Content: Permissions */}
      {activeTab === "permissions" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="space-y-4 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  הרשאות דפי מערכת
                </h2>
                <p className="text-sm text-gray-500">
                  קבע אילו דפים זמינים לכל קבוצת ניהול ומה רמת הגישה שלהם.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 lg:w-64">
                <label className="text-sm font-medium text-gray-700">
                  קבוצת ניהול
                </label>
                <select
                  className="rounded-md border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                  value={selectedRoleGroup}
                  onChange={(e) => loadRoleGroupPermissions(e.target.value)}
                  disabled={!roleGroupOptionsMemo.length || permissionsLoading}
                >
                  {roleGroupOptionsMemo.map((group) => (
                    <option key={group.code} value={group.code}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {selectedRoleGroupInfo?.description && (
                  <p className="text-xs text-gray-500">
                    {selectedRoleGroupInfo.description}
                  </p>
                )}
              </div>
            </div>

            {permissionsMessage && (
              <p
                className={clsx(
                  "text-sm",
                  permissionsMessage.includes("שגיאה")
                    ? "text-red-600"
                    : "text-emerald-700"
                )}
              >
                {permissionsMessage}
              </p>
            )}

            <div className="overflow-x-auto">
              {permissionsLoading ? (
                <p className="text-sm text-gray-500">טוען הגדרות הרשאה...</p>
              ) : !roleGroupOptionsMemo.length ? (
                <p className="text-sm text-gray-500">
                  אין קבוצות ניהול זמינות. צור לפחות קבוצה אחת כדי להגדיר
                  הרשאות.
                </p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-gray-600">
                        דף
                      </th>
                      <th className="px-4 py-2 font-semibold text-gray-600">
                        קטגוריה
                      </th>
                      <th className="px-4 py-2 font-semibold text-gray-600">
                        ללא גישה
                      </th>
                      <th className="px-4 py-2 font-semibold text-gray-600">
                        קריאה
                      </th>
                      <th className="px-4 py-2 font-semibold text-gray-600">
                        עריכה
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {orderedPages.map(({ page, indent }) => (
                      <tr key={page.page_key}>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          <div
                            style={{ paddingRight: `${indent * 1.5}rem` }}
                            className="flex flex-col items-start"
                          >
                            <div>{page.display_name}</div>
                            <div className="text-xs text-gray-500">
                              {page.route_path}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {page.category || "-"}
                        </td>
                        <td className="px-2 py-3 text-center">
                          {renderPermissionButton(page.page_key, "none")}
                        </td>
                        <td className="px-2 py-3 text-center">
                          {renderPermissionButton(page.page_key, "read")}
                        </td>
                        <td className="px-2 py-3 text-center">
                          {renderPermissionButton(page.page_key, "write")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-xs text-gray-500">
                בחירה ב"עריכה" כוללת גם הרשאות צפייה. "ללא גישה" מסתיר את הדף
                לחלוטין מהתפריט ומכל קיצור אחר.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleSyncPages}
                  disabled={permissionsLoading || permissionsSaving}
                  className="ml-auto sm:ml-0"
                >
                  סנכרן דפים
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => loadRoleGroupPermissions(selectedRoleGroup)}
                  disabled={permissionsLoading || permissionsSaving}
                >
                  אפס שינויים
                </Button>
                <Button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={permissionSaveDisabled}
                >
                  {permissionsSaving ? "שומר..." : "שמור הרשאות"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationOpen && selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-600">
              אזהרה: מחיקת משתמש
            </h3>
            <p className="text-sm text-gray-700">
              פעולה זו תמחק לצמיתות את המשתמש{" "}
              <strong>
                {users.find((u) => u.national_id === selectedUserId)?.full_name}
              </strong>{" "}
              מהמערכת. לא ניתן לשחזר פעולה זו.
            </p>
            <p className="text-sm text-gray-600">
              כדי לאשר, אנא הקלד את המשפט הבא בדיוק:
              <br />
              <span className="font-mono bg-gray-100 px-1 select-all">
                כן, מחק את{" "}
                {users.find((u) => u.national_id === selectedUserId)?.full_name}{" "}
                מהמערכת
              </span>
            </p>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="הקלד כאן..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmationOpen(false)}
                disabled={deleteLoading}
              >
                ביטול
              </Button>
              <Button
                className="!bg-red-600 hover:!bg-red-700 text-white"
                onClick={handleDeleteUser}
                disabled={
                  deleteLoading ||
                  deleteConfirmationText !==
                    `כן, מחק את ${
                      users.find((u) => u.national_id === selectedUserId)
                        ?.full_name
                    } מהמערכת`
                }
              >
                {deleteLoading ? "מוחק..." : "אשר מחיקה"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
