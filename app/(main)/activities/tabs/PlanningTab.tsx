"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PlanningSeasonsTab from "./PlanningSeasonsTab";
import PlanningSeriesTab from "./PlanningSeriesTab";
import { tw, cssVar } from "@/app/styles/design-system";
import { CalendarRange, Layers } from "lucide-react";

export default function PlanningTab() {
  const searchParams = useSearchParams();
  const initialView = searchParams?.get("subtab") === "series" ? "series" : "seasons";
  const [view, setView] = useState<"seasons" | "series">(initialView);

  useEffect(() => {
    if (searchParams?.get("subtab") === "series") {
        setView("series");
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-ds-spacing-5">
       <div className={`flex gap-ds-spacing-2 border-b ${tw.border.primary} pb-ds-spacing-2`}>
            <SubTabButton 
                active={view === "seasons"} 
                onClick={() => setView("seasons")} 
                label="ניהול עונות" 
                icon={<CalendarRange size={16} />} 
            />
            <SubTabButton 
                active={view === "series"} 
                onClick={() => setView("series")} 
                label="ניהול סדרות" 
                icon={<Layers size={16} />} 
            />
       </div>
       
       {view === "seasons" && <PlanningSeasonsTab />}
       {view === "series" && <PlanningSeriesTab />}
    </div>
  );
}

function SubTabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-ds-spacing-2 px-ds-spacing-4 py-ds-spacing-2 border-none ${tw.rounded.md} text-ds-font-size-sm cursor-pointer transition-all ${
              active 
                ? `bg-ds-brand-light ${tw.text.brand} font-ds-font-weight-semibold` 
                : `bg-transparent ${tw.text.muted} font-ds-font-weight-medium`
            }`}
        >
            {icon}
            {label}
        </button>
    )
}

