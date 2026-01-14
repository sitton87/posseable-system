"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Select,
  SelectItem,
  Flex,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { AppUser, RoleGroupOption } from "../types";
import { cssVar, tw } from "@/app/styles/design-system";

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
    return roleGroupOptionsMemo.find((group) => group.code === code)?.name || code;
  };

  const formatRoleLabel = (role: string) => ROLE_LABELS[role] ?? role;

  const roleOptions = useMemo(() => {
    const unique = new Set<string>([...DEFAULT_ROLE_OPTIONS, ...users.map((user) => user.role)]);
    return Array.from(unique).filter(Boolean);
  }, [users]);

  // --- Effects ---

  // Fetch role groups for dropdowns
  useEffect(() => {
    const fetchRoleGroups = async () => {
      try {
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
        selected.role_group_code || roleGroupOptionsMemo[0]?.code || "management";
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
          createForm.role_group_code || roleGroupOptionsMemo[0]?.code || "management",
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
          updateForm.role_group_code || roleGroupOptionsMemo[0]?.code || "management",
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

    if (deleteConfirmationText.trim() !== `כן, מחק את ${selected.full_name} מהמערכת`) {
      alert("טקסט האישור שגוי");
      return;
    }

    setDeleteLoading(true);
    setUpdateMessage(null);
    try {
      const res = await fetch(`/api/system-users?national_id=${selectedUserId}`, {
        method: "DELETE",
      });
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
      return (
        <Text className="text-sm" style={{ color: cssVar.text.muted }}>
          טוען משתמשים...
        </Text>
      );
    }
    if (error) {
      return (
        <Text className="text-sm" style={{ color: cssVar.status.danger }}>
          {error} –{" "}
          <button className="underline" onClick={onRefresh}>
            נסה שוב
          </button>
        </Text>
      );
    }
    if (!users.length) {
      return (
        <Text className="text-sm" style={{ color: cssVar.text.muted }}>
          אין משתמשים במערכת עדיין.
        </Text>
      );
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>שם מלא</TableHeaderCell>
            <TableHeaderCell>דוא&quot;ל</TableHeaderCell>
            <TableHeaderCell>תפקיד</TableHeaderCell>
            <TableHeaderCell>קבוצת ניהול</TableHeaderCell>
            <TableHeaderCell>חובת החלפת סיסמה</TableHeaderCell>
            <TableHeaderCell>סטטוס</TableHeaderCell>
            <TableHeaderCell>נוצר בתאריך</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.national_id}>
              <TableCell>
                <div className="font-medium" style={{ color: cssVar.text.primary }}>
                  {user.full_name}
                </div>
                <div className="text-xs" style={{ color: cssVar.text.muted }}>
                  {user.national_id}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{formatRoleLabel(user.role)}</TableCell>
              <TableCell>{formatRoleGroupLabel(user.role_group_code)}</TableCell>
              <TableCell>
                <Badge color={user.must_reset ? "amber" : "emerald"} size="sm">
                  {user.must_reset ? "נדרש" : "לא נדרש"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge color={user.is_active !== false ? "emerald" : "rose"} size="sm">
                  {user.is_active !== false ? "פעיל" : "חסום"}
                </Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString("he-IL")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* List Card */}
      <Card className="p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Title className="text-xl font-semibold" style={{ color: cssVar.text.primary }}>
              משתמשים קיימים
            </Title>
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              רשימת כל חשבונות המשתמש במערכת.
            </Text>
          </div>
          {lastRefresh && (
            <Text className="text-xs" style={{ color: cssVar.text.muted }}>
              עודכן לאחרונה: {lastRefresh.toLocaleString("he-IL")}
            </Text>
          )}
        </div>
        {renderUsersTable()}
      </Card>

      {/* Create User */}
      <Card className="space-y-4 p-6">
        <div>
          <Title className="text-xl font-semibold" style={{ color: cssVar.text.primary }}>
            יצירת משתמש חדש
          </Title>
          <Text className="text-sm" style={{ color: cssVar.text.muted }}>
            הגדרת משתמש חדש במערכת (סיסמה זמנית תישלח במייל).
          </Text>
        </div>
        <form className="space-y-4" onSubmit={handleCreateUser}>
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              תעודת זהות (9 ספרות)
            </Text>
            <TextInput
              value={createForm.national_id}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  national_id: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              שם מלא
            </Text>
            <TextInput
              value={createForm.full_name}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  full_name: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              דוא&quot;ל
            </Text>
            <TextInput
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              תפקיד במערכת
            </Text>
            <Select
              value={createForm.role}
              onValueChange={(val) =>
                setCreateForm((prev) => ({
                  ...prev,
                  role: val,
                }))
              }
            >
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {formatRoleLabel(role)}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              קבוצת ניהול
            </Text>
            <Select
              value={createForm.role_group_code}
              onValueChange={(val) =>
                setCreateForm((prev) => ({
                  ...prev,
                  role_group_code: val,
                }))
              }
              disabled={!roleGroupOptionsMemo.length}
            >
              {roleGroupOptionsMemo.map((group) => (
                <SelectItem key={group.code} value={group.code}>
                  {group.name}
                </SelectItem>
              ))}
            </Select>
            <Text className="text-xs mt-1" style={{ color: cssVar.text.muted }}>
              {formatRoleGroupLabel(createForm.role_group_code)}
            </Text>
          </div>
          {createMessage && (
            <Text
              className="text-sm"
              style={{
                color: createMessage.includes("נכשלה")
                  ? cssVar.status.danger
                  : cssVar.status.success,
              }}
            >
              {createMessage}
            </Text>
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
            <Title className="text-xl font-semibold" style={{ color: cssVar.text.primary }}>
              עדכון משתמש קיים
            </Title>
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              עריכת פרטים, חסימה או מחיקה.
            </Text>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleUpdateUser}>
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              בחירת משתמש לעריכה
            </Text>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              placeholder="בחר משתמש..."
            >
              <SelectItem value="">בחר משתמש...</SelectItem>
              {users.map((user) => (
                <SelectItem value={user.national_id} key={user.national_id}>
                  {user.full_name} ({user.role})
                </SelectItem>
              ))}
            </Select>
          </div>
          {selectedUserId && (
            <>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  שם מלא
                </Text>
                <TextInput
                  value={updateForm.full_name}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  דוא&quot;ל
                </Text>
                <TextInput
                  type="email"
                  value={updateForm.email}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תפקיד
                </Text>
                <Select
                  value={updateForm.role}
                  onValueChange={(val) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      role: val,
                    }))
                  }
                >
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatRoleLabel(role)}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  קבוצת ניהול
                </Text>
                <Select
                  value={updateForm.role_group_code}
                  onValueChange={(val) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      role_group_code: val,
                    }))
                  }
                  disabled={!roleGroupOptionsMemo.length}
                  placeholder="בחר..."
                >
                  <SelectItem value="">בחר...</SelectItem>
                  {roleGroupOptionsMemo.map((group) => (
                    <SelectItem key={group.code} value={group.code}>
                      {group.name}
                    </SelectItem>
                  ))}
                </Select>
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
                <label htmlFor="must-reset" className="text-sm" style={{ color: cssVar.text.primary }}>
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
                <label htmlFor="is-active" className="text-sm" style={{ color: cssVar.text.primary }}>
                  משתמש פעיל (בטל סימון כדי לחסום)
                </label>
              </div>

              {updateMessage && (
                <Text
                  className="text-sm"
                  style={{
                    color: updateMessage.includes("נכשל")
                      ? cssVar.status.danger
                      : cssVar.status.success,
                  }}
                >
                  {updateMessage}
                </Text>
              )}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={updateLoading} className="flex-1">
                  {updateLoading ? "שומר..." : "שמור שינויים"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  color="rose"
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
      <Dialog open={deleteConfirmationOpen && !!selectedUserId} onClose={() => setDeleteConfirmationOpen(false)}>
        <DialogPanel className="max-w-md">
          <Title className="text-lg font-bold" style={{ color: cssVar.status.danger }}>
            אזהרה: מחיקת משתמש
          </Title>
          <Text className="text-sm mt-2" style={{ color: cssVar.text.primary }}>
            פעולה זו תמחק לצמיתות את המשתמש{" "}
            <strong>{users.find((u) => u.national_id === selectedUserId)?.full_name}</strong> מהמערכת. לא ניתן
            לשחזר פעולה זו.
          </Text>
          <Text className="text-sm mt-2" style={{ color: cssVar.text.secondary }}>
            כדי לאשר, אנא הקלד את המשפט הבא בדיוק:
            <br />
            <span
              className="font-mono px-1 select-all"
              style={{ backgroundColor: cssVar.bg.secondary }}
            >
              כן, מחק את {users.find((u) => u.national_id === selectedUserId)?.full_name} מהמערכת
            </span>
          </Text>
          <div className="mt-4">
            <TextInput
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="הקלד כאן..."
            />
          </div>
          <Flex justifyContent="end" className="gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmationOpen(false)}
              disabled={deleteLoading}
            >
              ביטול
            </Button>
            <Button
              color="rose"
              onClick={handleDeleteUser}
              disabled={
                deleteLoading ||
                deleteConfirmationText !==
                  `כן, מחק את ${users.find((u) => u.national_id === selectedUserId)?.full_name} מהמערכת`
              }
            >
              {deleteLoading ? "מוחק..." : "אשר מחיקה"}
            </Button>
          </Flex>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
