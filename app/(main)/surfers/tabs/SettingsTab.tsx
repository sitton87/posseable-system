"use client";

import { Card, Title, Text } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";

export default function SettingsTab() {
  return (
    <Card>
      <Title>הגדרות עתידיות</Title>
      <Text style={{ color: cssVar.text.muted }}>
        כאן נוסיף הגדרות ייעודיות לגולשים (אוטומציה, ברירות מחדל, תבניות פתקים)
        בהמשך.
      </Text>
    </Card>
  );
}
