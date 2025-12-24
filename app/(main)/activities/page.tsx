"use client";

import { useSearchParams } from "next/navigation";
import { colors, spacing } from "@/app/styles/foundations";
import { PagePermissionGate } from "@/app/components/PagePermissionGate";
import ActivitiesHomeTab from "./tabs/ActivitiesHomeTab";
import ActivitiesListTab from "./tabs/ActivitiesListTab";
import ActivitiesGanttTab from "./tabs/ActivitiesGanttTab";
import FieldStatusTab from "./tabs/FieldModeTab";

export default function ActivitiesPage() {
  const searchParams = useSearchParams();
  const view = searchParams?.get("view") || "home";

  return (
    <PagePermissionGate>
      <div style={{ padding: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.lg }}>
        {/* <h1 style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}>ניהול פעילות</h1> - Removed title as requested */}
        
        {view === "home" && <ActivitiesHomeTab />}
        {view === "list" && <ActivitiesListTab />}
        {view === "gantt" && <ActivitiesGanttTab />}
        {view === "field" && <FieldStatusTab />}
        
        {/* If view is unknown, default to home or list? currently home */}
        {!["home", "list", "gantt", "field"].includes(view) && <ActivitiesHomeTab />}
      </div>
    </PagePermissionGate>
  );
}
