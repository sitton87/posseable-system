"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import clsx from "clsx";
import { AppUser, RoleGroupOption } from "../types";
import { Card } from "@/app/components/ui/Card";

const DEFAULT_ROLE_OPTIONS = ["admin", "staff", "viewer"];

const ROLE_LABELS: Record<string, string> = {
  admin: "מנהל מערכת",
  staff: "צוות תפעול",
  viewer: "קריאה בלבד",
};

type Props = {
  users: AppUser[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  onRefresh: () => Promise<void>;
};

export default function SystemUsersTab({
  users,
  loading,
  error,
  lastRefresh,
  onRefresh,
}: Props) {
  // --- Local State ---
  const [roleGroups, setRoleGroups] = useState<RoleGroupOption[]>([]);

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

  // --- Helpers ---
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

  const formatRoleLabel = (role: string) => ROLE_LABELS[role] ?? role;

  const roleOptions = useMemo(() => {
    const unique = new Set<string>([
      ...DEFAULT_ROLE_OPTIONS,
      ...users.map((user) => user.role),
    ]);
    return Array.from(unique).filter(Boolean);
  }, [users]);

  // --- Effects ---

  // Fetch role groups for dropdowns
  useEffect(() => {
    const fetchRoleGroups = async () => {
      try {
        // Using the existing endpoint to get role groups
        const res = await fetch("/api/system-settings/access", {
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          setRoleGroups(data.roleGroups ?? []);
        }
      } catch (err) {
        console.error("Failed to load role groups for users tab", err);
      }
    };
    fetchRoleGroups();
  }, []);

  // Update form sync
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

  // Set default role group for create form
  useEffect(() => {
    if (roleGroups.length && !createForm.role_group_code) {
      setCreateForm((prev) => ({
        ...prev,
        role_group_code: roleGroups[0].code,
      }));
    }
  }, [roleGroups, createForm.role_group_code]);

  // --- Handlers ---

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMessage(null);
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
      await onRefresh();
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
      await onRefresh();
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
      await onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "מחיקת המשתמש נכשלה";
      setUpdateMessage(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Render ---

  const renderUsersTable = () => {
    if (loading) {
      return <p className="text-sm text-gray-500">טוען משתמשים...</p>;
    }
    if (error) {
      return (
        <p className="text-sm text-red-600">
          {error} –{" "}
          <button className="underline" onClick={onRefresh}>
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

  return (
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

