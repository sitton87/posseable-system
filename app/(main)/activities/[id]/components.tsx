import { CSSProperties, ReactNode } from "react";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { Activity } from "@/type";
import { Button } from "@/app/components/ui";
import { useRouter } from "next/navigation";
import { Smartphone } from "lucide-react";

export function ActivityHeader({ activity }: { activity: Activity }) {
  const router = useRouter();

  return (
    <div
      style={{
        background: colors.white,
        padding: spacing.lg,
        borderRadius: radii.card,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: spacing.lg,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: "bold", color: colors.text, margin: 0 }}>
            {activity.group_name} - {activity.kind === "surf" ? "גלישה" : "פעילות"}
          </h1>
          <div style={{ display: "flex", gap: spacing.md, marginTop: spacing.sm, color: colors.textMuted }}>
            <span>📅 {new Date(activity.activity_date).toLocaleDateString("he-IL")}</span>
            <span>⏰ {activity.start_time?.slice(0, 5)} - {activity.end_time?.slice(0, 5)}</span>
            <span>📍 {activity.location}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: spacing.md, alignItems: "center" }}>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/activities/${activity.id}/field-mode`)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Smartphone size={16} />
            מצב שטח
          </Button>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: "bold", color: colors.primary }}>
              {activity.status}
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>
              {activity.participant_count || 0} משתתפים
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: `${spacing.sm}px ${spacing.lg}px`,
        background: active ? colors.primary : "transparent",
        color: active ? colors.white : colors.textMuted,
        border: "none",
        borderRadius: radii.pill,
        cursor: "pointer",
        fontWeight: 500,
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}

