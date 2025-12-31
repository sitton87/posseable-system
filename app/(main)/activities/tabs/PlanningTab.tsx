"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PlanningSeasonsTab from "./PlanningSeasonsTab";
import PlanningSeriesTab from "./PlanningSeriesTab";
import { colors, spacing } from "@/app/styles/foundations";
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
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
       <div style={{ display: "flex", gap: spacing.sm, borderBottom: `1px solid ${colors.borderMuted}`, paddingBottom: spacing.sm }}>
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

