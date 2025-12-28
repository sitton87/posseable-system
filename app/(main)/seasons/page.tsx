"use client";

import { useState } from "react";
import { colors, spacing } from "@/app/styles/foundations";
import SeasonsDashboardTab from "./tabs/SeasonsDashboardTab";
import SeasonsListTab from "./tabs/SeasonsListTab";
import SeriesListTab from "./tabs/SeriesListTab";

type Tab = "dashboard" | "seasons" | "series";

export default function SeasonsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div style={{ padding: spacing.xl, maxWidth: 1600, margin: "0 auto" }}>
      {/* Header & Tabs */}
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, marginBottom: spacing.lg }}>
          ניהול עונות ופעילויות
        </h1>
        
        <div style={{ 
            display: "flex",
            gap: spacing.md,
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: spacing.sm
        }}>
          <TabButton 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")}
            label="לוח בקרה"
            icon="📊"
          />
          <TabButton 
            active={activeTab === "seasons"} 
            onClick={() => setActiveTab("seasons")}
            label="ניהול עונות"
            icon="📅"
          />
          <TabButton 
            active={activeTab === "series"} 
            onClick={() => setActiveTab("series")}
            label="ניהול סדרות"
            icon="🏄"
              />
            </div>
          </div>

      {/* Content Area */}
      <div style={{ minHeight: 400 }}>
        {activeTab === "dashboard" && <SeasonsDashboardTab />}
        {activeTab === "seasons" && <SeasonsListTab />}
        {activeTab === "series" && <SeriesListTab />}
          </div>
        </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: string }) {
  return (
    <button
      onClick={onClick}
                style={{
                  display: "flex",
        alignItems: "center",
        gap: 8,
        padding: `${spacing.sm}px ${spacing.md}px`,
        background: active ? colors.primary + "15" : "transparent",
        color: active ? colors.primary : colors.textMuted,
        border: "none",
        borderRadius: 8,
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.2s"
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
