"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import clsx from "clsx";
import {
  AppPageRow,
  PermissionLevel,
  RoleGroupOption,
} from "../types";
import { Card } from "@/app/components/ui/Card";
import {
  PAGE_HIERARCHY,
  PageHierarchyNode,
} from "@/lib/permissions/pageHierarchy";

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

  const permissionSaveDisabled =
    !selectedRoleGroup ||
    permissionsLoading ||
    permissionsSaving ||
    !hasPermissionChanges;

  return (
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
              אין קבוצות ניהול זמינות. צור לפחות קבוצה אחת כדי להגדיר הרשאות.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 font-semibold text-gray-600">דף</th>
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
            בחירה ב"עריכה" כוללת גם הרשאות צפייה. "ללא גישה" מסתיר את הדף לחלוטין
            מהתפריט ומכל קיצור אחר.
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
  );
}

