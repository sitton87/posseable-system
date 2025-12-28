import { CSSProperties, ReactNode } from "react";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { Activity } from "@/type";
import { Button } from "@/app/components/ui";
import { useRouter } from "next/navigation";

export function ActivityHeader({ activity }: { activity: Activity }) {
  const router = useRouter();

  return (
    <div
      style={{
        marginBottom: spacing.lg,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Group Name */}
          <h1 style={{ fontSize: 24, fontWeight: "bold", color: colors.textPrimary, margin: 0 }}>
            {activity.group_name}
          </h1>

          {/* Series Info */}
          {activity.series_name && (
            <>
                <span style={{ color: colors.border, fontSize: 20 }}>|</span>
                <span style={{ fontSize: 16, color: colors.textMuted, background: colors.surfaceAlt, padding: "2px 8px", borderRadius: 4 }}>
                    {activity.series_name} {(activity as any).series_index ? `(${(activity as any).series_index}/${(activity as any).series_total_count})` : ""}
                </span>
            </>
          )}

          {/* Location */}
          {activity.location && (
            <>
                <span style={{ color: colors.border, fontSize: 20 }}>|</span>
                <span style={{ fontSize: 16, color: colors.textMuted }}>{activity.location}</span>
            </>
          )}

          {/* Date */}
          <span style={{ color: colors.border, fontSize: 20 }}>|</span>
          <span style={{ fontSize: 16, color: colors.textMuted }}>
            {new Date(activity.activity_date).toLocaleDateString("he-IL")}
          </span>

          {/* Time */}
          {activity.start_time && (
            <>
                <span style={{ color: colors.border, fontSize: 20 }}>|</span>
                <span style={{ fontSize: 16, color: colors.textMuted }}>
                    {activity.start_time.slice(0, 5)} - {activity.end_time?.slice(0, 5)}
                </span>
            </>
          )}
        </div>
        
        <div style={{ display: "flex", gap: spacing.md, alignItems: "center" }}>
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
