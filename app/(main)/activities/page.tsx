"use client";

import { useSearchParams } from "next/navigation";
import { PagePermissionGate } from "@/app/components/PagePermissionGate";
import ActivitiesHomeTab from "./tabs/ActivitiesHomeTab";
import OperationsTab from "./tabs/OperationsTab";
import PlanningTab from "./tabs/PlanningTab";

export default function ActivitiesPage() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || "dashboard";

  return (
    <PagePermissionGate>
      <div className="p-ds-spacing-5 flex flex-col gap-ds-spacing-5">
        {tab === "dashboard" && <ActivitiesHomeTab />}
        {tab === "operations" && <OperationsTab />}
        {tab === "planning" && <PlanningTab />}

        {!["dashboard", "operations", "planning"].includes(tab) && (
          <ActivitiesHomeTab />
        )}
      </div>
    </PagePermissionGate>
  );
}
