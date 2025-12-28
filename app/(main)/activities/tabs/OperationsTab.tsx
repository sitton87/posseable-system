"use client";

import { useState } from "react";
import ActivitiesListTab from "@/app/(main)/activities/tabs/ActivitiesListTab";
import ActivitiesGanttTab from "@/app/(main)/activities/tabs/ActivitiesGanttTab";
import { Button, Card } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
import { List, Calendar } from "lucide-react";

type View = "list" | "gantt";

export default function OperationsTab() {
  const [view, setView] = useState<View>("list");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      {/* Sub-Navigation */}
      <div style={{ display: "flex", gap: spacing.sm, borderBottom: `1px solid ${colors.borderMuted}`, paddingBottom: spacing.sm }}>
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
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: active ? colors.primary + "15" : "transparent",
                color: active ? colors.primary : colors.textMuted,
                border: "none",
                borderRadius: 6,
                fontWeight: active ? 600 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s"
            }}
        >
            {icon}
            {label}
        </button>
    )
}

