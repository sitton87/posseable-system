"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import clsx from "clsx";

type AppUser = {
  national_id: string;
  full_name: string;
  email: string;
  role: string;
  must_reset: boolean;
  created_at: string;
};

type FieldAccessRule = {
  field: keyof AppUser | "password";
  label: string;
  description: string;
  viewableBy: string[];
  editableBy: string[];
};

const DEFAULT_ROLE_OPTIONS = ["admin", "staff", "viewer"];

const ROLE_LABELS: Record<string, string> = {
  admin: "מנהל מערכת",
  staff: "צוות תפעול",
  viewer: "קריאה בלבד",
};

const FIELD_RULES: FieldAccessRule[] = [
  {
    field: "national_id",
    label: "תעודת זהות",
    description: "מזהה ייחודי במערכת, לא ניתן לשינוי לאחר יצירת המשתמש.",
    viewableBy: ["admin", "staff"],
    editableBy: ["admin"],
  },
  {
    field: "full_name",
    label: "שם מלא",
    description: "השם שמוצג למשתמשים אחרים במערכת ובדוחות.",
    viewableBy: ["admin", "staff", "viewer"],
    editableBy: ["admin", "staff"],
  },
  {
    field: "email",
    label: 'דוא"ל',
    description: "ישמש לזיהוי בעת התחברות ושליחת התראות.",
    viewableBy: ["admin", "staff"],
    editableBy: ["admin"],
  },
  {
    field: "role",
    label: "תפקיד",
    description: "קובע אילו מודולים זמינים למשתמש במערכת.",
    viewableBy: ["admin", "staff"],
    editableBy: ["admin"],
  },
  {
    field: "must_reset",
    label: "חובת החלפת סיסמה",
    description: "אם פעיל, המשתמש יופנה אוטומטית להחלפת סיסמה בכניסה הבאה.",
    viewableBy: ["admin"],
    editableBy: ["admin"],
  },
  {
    field: "password",
    label: "סיסמה",
    description: "סיסמאות נשמרות כמחרוזות מוצפנות; ניתן לאפס אותן בלבד.",
    viewableBy: ["admin"],
    editableBy: ["admin"],
  },
];

type Props = {
  currentRole: string;
};

export default function SystemSettingsClient({ currentRole }: Props) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [createForm, setCreateForm] = useState({
    national_id: "",
    full_name: "",
    email: "",
    role: "staff",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [updateForm, setUpdateForm] = useState({
    full_name: "",
    email: "",
    role: "",
    must_reset: false,
    reset_password: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("Posseable123!");
  const [testStatus, setTestStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

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

  useEffect(() => {
    if (!selectedUserId) {
      setUpdateForm({
        full_name: "",
        email: "",
        role: "",
        must_reset: false,
        reset_password: "",
      });
      return;
    }
    const selected = users.find((user) => user.national_id === selectedUserId);
    if (selected) {
      setUpdateForm({
        full_name: selected.full_name,
        email: selected.email,
        role: selected.role,
        must_reset: selected.must_reset,
        reset_password: "",
      });
    }
  }, [selectedUserId, users]);

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

  const formatRoleLabel = (role: string) => ROLE_LABELS[role] ?? role;
  const normalizedCurrentRole =
    currentRole?.trim().toLowerCase() || "admin";
  const currentRoleLabel =
    ROLE_LABELS[normalizedCurrentRole] || currentRole || normalizedCurrentRole;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/system-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
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
      });
      await fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "יצירת המשתמש נכשלה";
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
      setUpdateForm((prev) => ({ ...prev, reset_password: "" }));
      await fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "עדכון המשתמש נכשל";
      setUpdateMessage(message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) {
      setTestStatus({ type: "error", message: "אנא הזן כתובת דוא\"ל" });
      return;
    }
    setTestLoading(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/system-users/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail.trim(),
          temporaryPassword: testPassword.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "שליחת מייל הבדיקה נכשלה");
      }
      setTestStatus({ type: "success", message: "מייל הבדיקה נשלח בהצלחה" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "שליחת מייל הבדיקה נכשלה";
      setTestStatus({ type: "error", message });
    } finally {
      setTestLoading(false);
    }
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
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-right font-semibold text-gray-600">
                שם מלא
              </th>
              <th className="px-4 py-2 text-right font-semibold text-gray-600">
                דוא&quot;ל
              </th>
              <th className="px-4 py-2 text-right font-semibold text-gray-600">
                תפקיד
              </th>
              <th className="px-4 py-2 text-right font-semibold text-gray-600">
                חובת החלפת סיסמה
              </th>
              <th className="px-4 py-2 text-right font-semibold text-gray-600">
                נוצר בתאריך
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((user) => (
              <tr key={user.national_id}>
                <td className="px-4 py-2 font-medium text-gray-900">
                  <div>{user.full_name}</div>
                  <div className="text-xs text-gray-500">{user.national_id}</div>
                </td>
                <td className="px-4 py-2 text-gray-700">{user.email}</td>
                <td className="px-4 py-2 text-gray-700">
                  {formatRoleLabel(user.role)}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={clsx(
                      "rounded-full px-2 py-1 text-xs font-semibold",
                      user.must_reset
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {user.must_reset ? "נדרש" : "לא נדרש"}
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
    <div className="space-y-6">
      <div className="rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-900">
        מחובר בתפקיד: {currentRoleLabel}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-gray-500">סה&quot;כ משתמשים</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">מנהלי מערכת פעילים</p>
          <p className="text-3xl font-bold text-gray-900">{stats.admins}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">ממתינים להחלפת סיסמה</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.needsReset}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              יצירת משתמש חדש
            </h2>
            <p className="text-sm text-gray-500">
              הגדר משתמש חדש במערכת. סיסמה זמנית תופק ותישלח אוטומטית.
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
            <div className="rounded-md bg-sky-50 p-3 text-sm text-sky-900">
              לאחר יצירת המשתמש המערכת תשלח אליו מייל עם שם המשתמש והסיסמה
              הזמנית שנוצרה עבורו.
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

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                עדכון משתמש קיים
              </h2>
              <p className="text-sm text-gray-500">
                עדכן פרטי משתמש, הרשאות או אפס לו סיסמה.
              </p>
            </div>
            <Button variant="secondary" type="button" onClick={fetchUsers}>
              טען מחדש
            </Button>
          </div>
          <form className="space-y-4" onSubmit={handleUpdateUser}>
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm text-gray-700">
                בחירת משתמש
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
                  <label htmlFor="must-reset" className="text-sm text-gray-700">
                    חייב בהחלפת סיסמה בכניסה הבאה
                  </label>
                </div>
                <Input
                  label="איפוס סיסמה (אופציונלי)"
                  type="password"
                  value={updateForm.reset_password}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      reset_password: e.target.value,
                    }))
                  }
                />
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
                <Button type="submit" disabled={updateLoading}>
                  {updateLoading ? "שומר..." : "שמור שינויים"}
                </Button>
              </>
            )}
          </form>
        </Card>
      </div>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            שליחת מייל בדיקה
          </h2>
          <p className="text-sm text-gray-500">
            בדוק שהחיבור ל-Gmail פעיל על ידי שליחת הודעה לכתובת שלך.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSendTestEmail}>
          <Input
            label='דוא"ל לבדיקה'
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            type="email"
          />
          <Input
            label="סיסמה זמנית שתופיע במייל"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
          />
          {testStatus && (
            <p
              className={clsx(
                "text-sm",
                testStatus.type === "success"
                  ? "text-emerald-700"
                  : "text-red-600"
              )}
            >
              {testStatus.message}
            </p>
          )}
          <Button type="submit" disabled={testLoading}>
            {testLoading ? "שולח..." : "שלח מייל בדיקה"}
          </Button>
        </form>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              מדיניות שדות והרשאות
            </h2>
            <p className="text-sm text-gray-500">
              הגדרה ברורה של אילו תפקידים מורשים לצפות או לערוך כל שדה.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">
                  שדה
                </th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">
                  תיאור
                </th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">
                  צפייה
                </th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">
                  עריכה
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {FIELD_RULES.map((rule) => (
                <tr key={rule.field}>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {rule.label}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.description}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {rule.viewableBy.map(formatRoleLabel).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {rule.editableBy.map(formatRoleLabel).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              משתמשים קיימים
            </h2>
            <p className="text-sm text-gray-500">
              רשימת כל חשבונות המשתמש במערכת. ניתן לייצא בקלות ל-CSV.
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
    </div>
  );
}

