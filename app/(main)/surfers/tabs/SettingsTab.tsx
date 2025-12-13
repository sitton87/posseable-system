import { Card } from "@/app/components/ui";
import { spacing, colors } from "@/app/styles/foundations";

const muted = colors.textMuted;

export default function SettingsTab() {
  return (
    <Card style={{ padding: spacing.lg }}>
      <h4 style={{ margin: 0 }}>הגדרות עתידיות</h4>
      <div style={{ color: muted, marginTop: spacing.sm, fontSize: 14 }}>
        כאן נוסיף הגדרות ייעודיות לגולשים (אוטומציה, ברירות מחדל, תבניות פתקים)
        בהמשך.
      </div>
    </Card>
  );
}

