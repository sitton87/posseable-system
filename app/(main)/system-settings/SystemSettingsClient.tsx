"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import clsx from "clsx";
import { Users, ShieldCheck } from "lucide-react"; // אייקונים לטאבים

import { spacing, colors } from "@/app/styles/foundations";
import { StatCardGrid, SmallActionButton } from "@/app/components/shared";
import SystemUsersTab from "./tabs/SystemUsersTab";
import SystemPermissionsTab from "./tabs/SystemPermissionsTab";
import { AppUser } from "./types";

// --- Constants ---

const ROLE_LABELS: Record<string, string> = {
  admin: "מנהל מערכת",
  staff: "צוות תפעול",
  viewer: "קריאה בלבד",
};

type TabId = "users" | "permissions";

type Props = {
  currentRole: string;
};

export default function SystemSettingsClient({ currentRole }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("users");

  // --- Users State (Lifted for KPI) ---
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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

  const stats = useMemo(() => {
    const total = users.length;
    const needsReset = users.filter((user) => user.must_reset).length;
    const admins = users.filter(
      (user) => user.role?.toLowerCase() === "admin"
    ).length;
    return { total, needsReset, admins };
  }, [users]);

  const currentRoleLabel = ROLE_LABELS[currentRole] || currentRole;

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
        <SystemUsersTab
          users={users}
          loading={loading}
          error={error}
          lastRefresh={lastRefresh}
          onRefresh={fetchUsers}
        />
      )}

      {/* Tab Content: Permissions */}
      {activeTab === "permissions" && <SystemPermissionsTab />}
    </div>
  );
}
