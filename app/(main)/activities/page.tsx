"use client";

import { useSearchParams } from "next/navigation";
import { spacing } from "@/app/styles/foundations";
import { PagePermissionGate } from "@/app/components/PagePermissionGate";
import ActivitiesHomeTab from "./tabs/ActivitiesHomeTab";
import OperationsTab from "./tabs/OperationsTab";
import PlanningTab from "./tabs/PlanningTab";

export default function ActivitiesPage() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || "dashboard";

  // Map legacy 'view' param to 'tab' if necessary, but we are moving to 'tab'
  // If someone accesses /activities without params, they get dashboard.

  return (
    <PagePermissionGate>
      <div style={{ padding: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.lg }}>
        {tab === "dashboard" && <ActivitiesHomeTab />}
        {tab === "operations" && <OperationsTab />}
        {tab === "planning" && <PlanningTab />}
        
        {!["dashboard", "operations", "planning"].includes(tab) && <ActivitiesHomeTab />}
      </div>
    </PagePermissionGate>
  );
}
