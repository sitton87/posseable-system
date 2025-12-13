import { Card } from "@/app/components/ui";
import {
  SmallActionButton,
  StatCardGrid,
  TasksBoard,
  TaskEntityOption,
} from "@/app/components/shared";
import { spacing, colors, radii } from "@/app/styles/foundations";
import { Surfer } from "@/type";
import { SurferSummaryData } from "../types";

const muted = colors.textMuted;

type Props = {
  loading: boolean;
  summary: SurferSummaryData;
  surfers: Surfer[];
  onRefreshSummary: () => void;
};

export default function SurfersHomeTab({
  loading,
  summary,
  surfers,
  onRefreshSummary,
}: Props) {
  const statsCards = [
    { label: "סה״כ גולשים", value: summary.stats.total },
    { label: "פעילים", value: summary.stats.active },
    { label: "מאושרים", value: summary.stats.approved },
    { label: "ממתינים", value: summary.stats.pending },
    { label: "עם אישור רפואי", value: summary.stats.medicalApproved },
    { label: "זקוקים לכיסא גלגלים", value: summary.stats.wheelchair },
    { label: "משויכים לקבוצות", value: summary.stats.grouped },
  ];

  const surferEntities: TaskEntityOption[] = surfers.map((s) => ({
    id: s.national_id,
    name: s.full_name,
    subtitle: s.national_id,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: spacing.sm,
            marginBottom: spacing.sm,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>מבט כללי · גולשים</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              סטטוסים ומדדים מרכזיים של משתתפים
            </p>
          </div>
          <SmallActionButton variant="secondary" onClick={onRefreshSummary}>
            רענן
          </SmallActionButton>
        </div>
        {loading ? (
          <div style={{ padding: spacing.lg, textAlign: "center" }}>
            טוען נתונים...
          </div>
        ) : (
          <StatCardGrid stats={statsCards} />
        )}
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: spacing.lg,
        }}
      >
        <TasksBoard
          entityType="surfer"
          entities={surferEntities}
          title="משימות"
        />

        <Card style={{ padding: spacing.lg }}>
          <h4 style={{ margin: "0 0 12px 0" }}>פעילות אחרונה</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            {summary.recentActivity.length === 0 && (
              <div style={{ color: muted, fontSize: 13 }}>
                לא נמצאה פעילות אחרונה.
              </div>
            )}
            {summary.recentActivity.map((item) => (
              <div
                key={item.national_id}
                style={{
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: radii.card,
                  padding: spacing.sm,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ fontWeight: 700 }}>{item.full_name}</div>
                  <div style={{ color: muted, fontSize: 12 }}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("he-IL")
                      : "—"}
                  </div>
                </div>
                <div style={{ color: muted, fontSize: 13 }}>
                  {item.program || "ללא תוכנית"} · {item.status || "—"}
                </div>
                <div style={{ fontSize: 12, color: muted }}>
                  קבוצה: {item.group_name || "לא שויכה"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

