"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { getPageKeyFromPath } from "@/lib/permissions/pageMap";
import { usePagePermission } from "@/app/hooks/usePagePermission";
import { AccessDenied } from "@/app/components/AccessDenied";

export function PagePermissionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageKey = getPageKeyFromPath(pathname);

  if (!pageKey) {
    return <>{children}</>;
  }

  const { permission, loading } = usePagePermission(pageKey);

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        טוען הרשאות...
      </div>
    );
  }

  if (permission === "none") {
    return (
      <AccessDenied
        title="אין לך הרשאה לדף זה"
        description="פנה למנהל המערכת כדי לקבל הרשאות מתאימות."
      />
    );
  }

  return <>{children}</>;
}

