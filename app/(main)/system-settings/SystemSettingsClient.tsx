"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  Flex,
  Grid,
  Metric,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@tremor/react";
import { UserGroupIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { cssVar } from "@/app/styles/design-system";
import SystemUsersTab from "./tabs/SystemUsersTab";
import SystemPermissionsTab from "./tabs/SystemPermissionsTab";
import { AppUser } from "./types";

// --- Constants ---

const ROLE_LABELS: Record<string, string> = {
  admin: "מנהל מערכת",
  staff: "צוות תפעול",
  viewer: "קריאה בלבד",
};

type Props = {
  currentRole: string;
};

export default function SystemSettingsClient({ currentRole }: Props) {
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
      const message = err instanceof Error ? err.message : "שגיאה בטעינת המשתמשים";
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
    const admins = users.filter((user) => user.role?.toLowerCase() === "admin").length;
    return { total, needsReset, admins };
  }, [users]);

  const currentRoleLabel = ROLE_LABELS[currentRole] || currentRole;

  return (
    <div className="p-ds-spacing-lg flex flex-col gap-ds-spacing-lg">
      {/* KPI Section */}
      <Card>
        <Flex
          justifyContent="between"
          alignItems="center"
          className="gap-ds-spacing-sm mb-ds-spacing-md flex-wrap"
        >
          <div>
            <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
              מבט כללי · משתמשי מערכת
            </Title>
            <Text style={{ color: cssVar.text.muted }}>סטטוס משתמשים וניהול הרשאות</Text>
          </div>
          <div className="flex gap-ds-spacing-sm items-center">
            <Text className="text-xs" style={{ color: cssVar.text.muted }}>
              מחובר בתפקיד: <span className="font-semibold">{currentRoleLabel}</span>
            </Text>
            <Button variant="secondary" size="xs" onClick={fetchUsers}>
              רענן נתונים
            </Button>
          </div>
        </Flex>
        {loading && users.length === 0 ? (
          <div className="p-ds-spacing-lg text-center" style={{ color: cssVar.text.muted }}>
            טוען נתונים...
          </div>
        ) : (
          <Grid numItems={1} numItemsSm={3} className="gap-ds-spacing-md">
            <Card decoration="top" decorationColor="blue">
              <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                סה״כ משתמשים
              </Text>
              <Metric className="text-3xl font-bold mt-1" style={{ color: cssVar.text.primary }}>
                {stats.total}
              </Metric>
            </Card>
            <Card decoration="top" decorationColor="indigo">
              <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                מנהלים פעילים
              </Text>
              <Metric className="text-3xl font-bold mt-1" style={{ color: cssVar.text.primary }}>
                {stats.admins}
              </Metric>
            </Card>
            <Card decoration="top" decorationColor="amber">
              <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                ממתינים להחלפת סיסמה
              </Text>
              <Metric className="text-3xl font-bold mt-1" style={{ color: cssVar.text.primary }}>
                {stats.needsReset}
              </Metric>
            </Card>
          </Grid>
        )}
      </Card>

      {/* Tabs */}
      <TabGroup>
        <TabList className="mb-ds-spacing-md">
          <Tab icon={UserGroupIcon}>ניהול משתמשים</Tab>
          <Tab icon={ShieldCheckIcon}>הרשאות ותפקידים</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <SystemUsersTab
              users={users}
              loading={loading}
              error={error}
              lastRefresh={lastRefresh}
              onRefresh={fetchUsers}
            />
          </TabPanel>
          <TabPanel>
            <SystemPermissionsTab />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
