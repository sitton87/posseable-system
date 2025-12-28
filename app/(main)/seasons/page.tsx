"use client";

import { useSearchParams } from "next/navigation";
import { colors, spacing } from "@/app/styles/foundations";
import SeasonsDashboardTab from "./tabs/SeasonsDashboardTab";
import SeasonsListTab from "./tabs/SeasonsListTab";
import SeriesListTab from "./tabs/SeriesListTab";

export default function SeasonsPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  return (
    <div style={{ padding: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.lg }}>
      {/* Header is now handled by the specific tabs or a common header can be here if needed */}
      {(!view || view === "dashboard") && <SeasonsDashboardTab />}
      {view === "seasons-list" && <SeasonsListTab />}
      {view === "series-list" && <SeriesListTab />}
    </div>
  );
}
