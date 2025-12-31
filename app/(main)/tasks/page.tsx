"use client";

import { useState } from "react";
import { TasksCenter } from "./TasksCenter";
import { colors, spacing } from "@/app/styles/foundations";

export default function TasksPage() {
  return (
    <div
      style={{
        padding: spacing.xl,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: spacing.xl }}>
        <h2 style={{ fontSize: 18, color: colors.textMuted, marginTop: 0 }}>
          ריכוז כל משימות המערכת במקום אחד
        </h2>
      </header>

      <TasksCenter />
    </div>
  );
}
