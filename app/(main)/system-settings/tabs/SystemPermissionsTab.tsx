"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  Select,
  SelectItem,
  Flex,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";
import { AppPageRow, PermissionLevel, RoleGroupOption } from "../types";
import { PAGE_HIERARCHY, PageHierarchyNode } from "@/lib/permissions/pageHierarchy";
import { cssVar } from "@/app/styles/design-system";

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

export default function SystemPermissionsTab() {
  const [roleGroups, setRoleGroups] = useState<RoleGroupOption[]>([]);
  const [pages, setPages] = useState<AppPageRow[]>([]);
  const [selectedRoleGroup, setSelectedRoleGroup] = useState("");
  const [pagePermissions, setPagePermissions] = useState<Record<string, PermissionLevel>>({});
  const [initialPagePermissions, setInitialPagePermissions] = useState<
    Record<string, PermissionLevel>
  >({});
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsSaving, setPermissionsSaving] = useState(false);
  const [permissionsMessage, setPermissionsMessage] = useState<string | null>(null);

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
        data.roleGroups?.find((group: RoleGroupOption) => group.is_default)?.code ||
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
        permissionMap[page.page_key] = (record?.permission_level ?? "none") as PermissionLevel;
      });
      setPagePermissions(permissionMap);
      setInitialPagePermissions(permissionMap);
    } catch (err) {
      const message = err instanceof Error ? err.message : "שגיאה בטעינת ההרשאות";
      setPermissionsMessage(message);
      console.error("Failed to load permissions", err);
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    loadRoleGroupPermissions();
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

  const selectedRoleGroupInfo = useMemo(
    () => roleGroups.find((group) => group.code === selectedRoleGroup),
    [roleGroups, selectedRoleGroup]
  );

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
      const message = err instanceof Error ? err.message : "שגיאה בשמירת ההרשאות";
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

  const renderPermissionButton = (pageKey: string, level: PermissionLevel) => {
    const isSelected = (pagePermissions[pageKey] || "none") === level;
    return (
      <button
        type="button"
        onClick={() => handlePermissionChange(pageKey, level)}
        disabled={permissionsLoading || permissionsSaving}
        className={`w-full rounded-md border px-2 py-1 text-sm font-semibold transition ${
          isSelected
            ? "border-sky-500 bg-sky-50 text-sky-700"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
        title={PERMISSION_HELP[level]}
      >
        {PERMISSION_LABELS[level]}
      </button>
    );
  };

  const permissionSaveDisabled =
    !selectedRoleGroup || permissionsLoading || permissionsSaving || !hasPermissionChanges;

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Title className="text-xl font-semibold" style={{ color: cssVar.text.primary }}>
              הרשאות דפי מערכת
            </Title>
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              קבע אילו דפים זמינים לכל קבוצת ניהול ומה רמת הגישה שלהם.
            </Text>
          </div>
          <div className="flex w-full flex-col gap-2 lg:w-64">
            <Text className="text-sm font-medium" style={{ color: cssVar.text.secondary }}>
              קבוצת ניהול
            </Text>
            <Select
              value={selectedRoleGroup}
              onValueChange={(val) => loadRoleGroupPermissions(val)}
              disabled={!roleGroupOptionsMemo.length || permissionsLoading}
            >
              {roleGroupOptionsMemo.map((group) => (
                <SelectItem key={group.code} value={group.code}>
                  {group.name}
                </SelectItem>
              ))}
            </Select>
            {selectedRoleGroupInfo?.description && (
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                {selectedRoleGroupInfo.description}
              </Text>
            )}
          </div>
        </div>

        {permissionsMessage && (
          <Text
            className="text-sm"
            style={{
              color: permissionsMessage.includes("שגיאה")
                ? cssVar.status.danger
                : cssVar.status.success,
            }}
          >
            {permissionsMessage}
          </Text>
        )}

        <div className="overflow-x-auto">
          {permissionsLoading ? (
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              טוען הגדרות הרשאה...
            </Text>
          ) : !roleGroupOptionsMemo.length ? (
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              אין קבוצות ניהול זמינות. צור לפחות קבוצה אחת כדי להגדיר הרשאות.
            </Text>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>דף</TableHeaderCell>
                  <TableHeaderCell>קטגוריה</TableHeaderCell>
                  <TableHeaderCell className="text-center">ללא גישה</TableHeaderCell>
                  <TableHeaderCell className="text-center">קריאה</TableHeaderCell>
                  <TableHeaderCell className="text-center">עריכה</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderedPages.map(({ page, indent }) => (
                  <TableRow key={page.page_key}>
                    <TableCell>
                      <div
                        style={{ paddingRight: `${indent * 1.5}rem` }}
                        className="flex flex-col items-start"
                      >
                        <div className="font-semibold" style={{ color: cssVar.text.primary }}>
                          {page.display_name}
                        </div>
                        <div className="text-xs" style={{ color: cssVar.text.muted }}>
                          {page.route_path}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{page.category || "-"}</TableCell>
                    <TableCell className="text-center">
                      {renderPermissionButton(page.page_key, "none")}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderPermissionButton(page.page_key, "read")}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderPermissionButton(page.page_key, "write")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Text className="text-xs" style={{ color: cssVar.text.muted }}>
            בחירה ב"עריכה" כוללת גם הרשאות צפייה. "ללא גישה" מסתיר את הדף לחלוטין מהתפריט ומכל קיצור
            אחר.
          </Text>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={handleSyncPages}
              disabled={permissionsLoading || permissionsSaving}
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
            <Button type="button" onClick={handleSavePermissions} disabled={permissionSaveDisabled}>
              {permissionsSaving ? "שומר..." : "שמור הרשאות"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
