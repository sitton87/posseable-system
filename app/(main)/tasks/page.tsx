"use client";

import { TasksCenter } from "./TasksCenter";
import { Card, Title, Text } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";

export default function TasksPage() {
  return (
    <div className="p-ds-spacing-xl max-w-6xl mx-auto">
      <header className="mb-ds-spacing-xl">
        <Text className="text-lg" style={{ color: cssVar.text.muted }}>
          ריכוז כל משימות המערכת במקום אחד
        </Text>
      </header>

      <TasksCenter />
    </div>
  );
}
