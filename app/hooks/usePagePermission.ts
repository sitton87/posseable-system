"use client";

import { useEffect, useMemo, useState } from "react";
import type { PermissionLevel } from "@/type";

type PermissionMap = Record<string, PermissionLevel>;

let cachedPermissions: PermissionMap | null = null;
let pendingRequest: Promise<PermissionMap> | null = null;

async function loadPermissions(): Promise<PermissionMap> {
  const res = await fetch("/api/auth/permissions", {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    return {};
  }
  const data = await res.json().catch(() => null);
  if (!data?.success || !data?.permissions) {
    return {};
  }
  return data.permissions as PermissionMap;
}

function getPermission(pageKey: string, map: PermissionMap | null) {
  if (!map) return "none";
  return map[pageKey] ?? "none";
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionMap | null>(
    cachedPermissions
  );
  const [loading, setLoading] = useState(!cachedPermissions);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const ensurePermissions = async () => {
      if (!cachedPermissions && !pendingRequest) {
        pendingRequest = loadPermissions()
          .then((perms) => {
            cachedPermissions = perms;
            return perms;
          })
          .catch((err) => {
            console.error("Failed to load permissions", err);
            cachedPermissions = {};
            return {};
          })
          .finally(() => {
            pendingRequest = null;
          });
      }

      if (pendingRequest) {
        setLoading(true);
        const perms = await pendingRequest;
        if (!cancelled) {
          setPermissions(perms);
          setLoading(false);
        }
      } else if (!cancelled && cachedPermissions) {
        setPermissions(cachedPermissions);
        setLoading(false);
      }
    };

    ensurePermissions();

    return () => {
      cancelled = true;
    };
  }, []);

  return { permissions: permissions ?? {}, loading, error };
}

export function usePagePermission(pageKey: string) {
  const { permissions, loading } = usePermissions();
  const permission = useMemo(
    () => getPermission(pageKey, permissions),
    [pageKey, permissions]
  );

  return {
    permission,
    loading,
    canRead: permission !== "none",
    canEdit: permission === "write",
  };
}

export function resetPermissionCache() {
  cachedPermissions = null;
  pendingRequest = null;
}

