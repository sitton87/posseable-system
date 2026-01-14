"use client";

import { useState } from "react";
import ActivitiesListTab from "@/app/(main)/activities/tabs/ActivitiesListTab";
import ActivitiesGanttTab from "@/app/(main)/activities/tabs/ActivitiesGanttTab";
import { tw, cssVar } from "@/app/styles/design-system";
import { List, Calendar } from "lucide-react";

type View = "list" | "gantt";

export default function OperationsTab() {
  const [view, setView] = useState<View>("list");

  return (
    <div className="flex flex-col gap-ds-spacing-5">
      {/* Sub-Navigation */}
      <div className={`flex gap-ds-spacing-2 border-b ${tw.border.primary} pb-ds-spacing-2`}>
        <SubTabButton 
            active={view === "list"} 
            onClick={() => setView("list")} 
            label="רשימת פעילויות" 
            icon={<List size={16} />} 
        />
        <SubTabButton 
            active={view === "gantt"} 
            onClick={() => setView("gantt")} 
            label="תצוגת יומן (גאנט)" 
            icon={<Calendar size={16} />} 
        />
      </div>

      {view === "list" && <ActivitiesListTab />}
      {view === "gantt" && <ActivitiesGanttTab />}
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

