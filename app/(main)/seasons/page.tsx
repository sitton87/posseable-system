"use client";

import { useSearchParams } from "next/navigation";
import SeasonsDashboardTab from "./tabs/SeasonsDashboardTab";
import SeasonsListTab from "./tabs/SeasonsListTab";
import SeriesListTab from "./tabs/SeriesListTab";

export default function SeasonsPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  return (
    <div className="p-ds-spacing-lg sm:p-ds-spacing-xl flex flex-col gap-ds-spacing-lg">
      {(!view || view === "dashboard") && <SeasonsDashboardTab />}
      {view === "seasons-list" && <SeasonsListTab />}
      {view === "series-list" && <SeriesListTab />}
    </div>
  );
}
