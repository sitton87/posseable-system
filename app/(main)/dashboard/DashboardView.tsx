"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui";
import { colors, spacing, radii, shadows } from "@/app/styles/foundations";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;

const layoutStyle: CSSProperties = {
  padding: spacing.xl,
  display: "flex",
  flexDirection: "column",
  gap: spacing.lg,
};

const headerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: px(spacing.xs),
};

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: px(28),
  fontWeight: 800,
  color: colors.textPrimary,
};

const statGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: spacing.lg,
};

const detailGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: spacing.lg,
};

const statCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
  padding: spacing.lg,
};

const statValueStyle: CSSProperties = {
  fontSize: px(28),
  fontWeight: 800,
};

const statMetaStyle: CSSProperties = {
  fontSize: px(13),
  color: muted,
  display: "flex",
  justifyContent: "space-between",
  marginBottom: px(4),
};

const detailListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.sm,
};

const detailItemStyle: CSSProperties = {
  padding: spacing.md,
  borderRadius: radii.card,
  border: `1px solid ${colors.borderMuted}`,
  background: colors.surfaceAlt,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const quickActionsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: spacing.md,
  marginTop: spacing.md,
};

const quickActionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: px(spacing.xs),
  padding: spacing.lg,
  borderRadius: radii.card,
  border: `1px solid ${colors.borderMuted}`,
  textDecoration: "none",
  fontWeight: 600,
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
};

type DashboardStats = {
  volunteers: { total: number; active: number };
  surfers: { total: number; active: number; byProgram: Record<string, number> };
  activities: {
    total: number;
    upcoming: number;
    byKind: Record<string, number>;
  };
  equipment: { total: number; needsRepair: number };
  donors: { total: number; active: number };
  suppliers: { total: number; active: number };
};

const ACTIVITY_KIND_LABELS: Record<string, string> = {
  surf: "גלישה",
  social: "חברתי",
  special: "אירוע מיוחד",
  training: "הכשרה והדרכה",
  lecture: "הכשרה והדרכה", // Legacy
  preparation: "הכנה", // Legacy
  other: "אחר",
};

export default function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      href: "/volunteers",
      label: "הוסף מתנדב",
      icon: "👥",
      background: colors.primarySoft,
      color: colors.primary,
    },
    {
      href: "/surfers",
      label: "הוסף גולש",
      icon: "🏄",
      background: colors.surfaceAlt,
      color: colors.accent,
    },
    {
      href: "/activities",
      label: "תזמן פעילות",
      icon: "📅",
      background: colors.primarySoft,
      color: colors.primary,
    },
    {
      href: "/equipment",
      label: "נהל ציוד",
      icon: "🛠️",
      background: colors.successSoft,
      color: colors.success,
    },
  ];

  if (loading) {
    return (
      <div style={layoutStyle}>
        <div style={{ textAlign: "center", color: muted }}>טוען נתונים...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={layoutStyle}>
        <div style={{ textAlign: "center", color: colors.danger }}>
          שגיאה בטעינת נתונים
        </div>
      </div>
    );
  }

  return (
    <div style={layoutStyle}>
      <div style={headerStyle}>
        <h1 style={headingStyle}>ברוך הבא למערכת PosSEAble</h1>
        <p style={{ margin: 0, color: muted }}>סקירה כללית של המערכת</p>
      </div>

      <div style={statGridStyle}>
        <Card style={statCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h3 style={{ margin: 0, fontSize: px(16), fontWeight: 700 }}>
              🏃 מתנדבים
            </h3>
            <span style={{ ...statValueStyle, color: colors.primary }}>
              {stats.volunteers.total}
            </span>
          </div>
          <div>
            <div style={statMetaStyle}>
              <span>פעילים:</span>
              <span style={{ color: colors.success, fontWeight: 700 }}>
                {stats.volunteers.active}
              </span>
            </div>
            <div style={statMetaStyle}>
              <span>לא פעילים:</span>
              <span>{stats.volunteers.total - stats.volunteers.active}</span>
            </div>
          </div>
        </Card>

        <Card style={statCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h3 style={{ margin: 0, fontSize: px(16), fontWeight: 700 }}>
              🏄 גולשים
            </h3>
            <span style={{ ...statValueStyle, color: colors.accent }}>
              {stats.surfers.total}
            </span>
          </div>
          <div>
            <div style={statMetaStyle}>
              <span>פעילים:</span>
              <span style={{ color: colors.success, fontWeight: 700 }}>
                {stats.surfers.active}
              </span>
            </div>
            <div style={statMetaStyle}>
              <span>לא פעילים:</span>
              <span>{stats.surfers.total - stats.surfers.active}</span>
            </div>
          </div>
        </Card>

        <Card style={statCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h3 style={{ margin: 0, fontSize: px(16), fontWeight: 700 }}>
              📅 פעילויות
            </h3>
            <span style={{ ...statValueStyle, color: colors.primary }}>
              {stats.activities.total}
            </span>
          </div>
          <div>
            <div style={statMetaStyle}>
              <span>קרובות:</span>
              <span style={{ color: colors.warning, fontWeight: 700 }}>
                {stats.activities.upcoming}
              </span>
            </div>
            <div style={statMetaStyle}>
              <span>סה&quot;כ:</span>
              <span>{stats.activities.total}</span>
            </div>
          </div>
        </Card>

        <Card style={statCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h3 style={{ margin: 0, fontSize: px(16), fontWeight: 700 }}>
              🛠️ ציוד
            </h3>
            <span style={{ ...statValueStyle, color: colors.success }}>
              {stats.equipment.total}
            </span>
          </div>
          <div>
            <div style={statMetaStyle}>
              <span>תקין:</span>
              <span style={{ color: colors.success, fontWeight: 700 }}>
                {stats.equipment.total - stats.equipment.needsRepair}
              </span>
            </div>
            <div style={statMetaStyle}>
              <span>דורש תיקון:</span>
              <span style={{ color: colors.danger }}>
                {stats.equipment.needsRepair}
              </span>
            </div>
          </div>
        </Card>

        <Card style={statCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h3 style={{ margin: 0, fontSize: px(16), fontWeight: 700 }}>
              ❤️ תורמים
            </h3>
            <span style={{ ...statValueStyle, color: colors.danger }}>
              {stats.donors.total}
            </span>
          </div>
          <div>
            <div style={statMetaStyle}>
              <span>פעילים:</span>
              <span style={{ color: colors.success, fontWeight: 700 }}>
                {stats.donors.active}
              </span>
            </div>
            <div style={statMetaStyle}>
              <span>לא פעילים:</span>
              <span>{stats.donors.total - stats.donors.active}</span>
            </div>
          </div>
        </Card>

        <Card style={statCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h3 style={{ margin: 0, fontSize: px(16), fontWeight: 700 }}>
              🤝 ספקים
            </h3>
            <span style={{ ...statValueStyle, color: colors.primary }}>
              {stats.suppliers.total}
            </span>
          </div>
          <div>
            <div style={statMetaStyle}>
              <span>פעילים:</span>
              <span style={{ color: colors.success, fontWeight: 700 }}>
                {stats.suppliers.active}
              </span>
            </div>
            <div style={statMetaStyle}>
              <span>לא פעילים:</span>
              <span>{stats.suppliers.total - stats.suppliers.active}</span>
            </div>
          </div>
        </Card>
      </div>

      <div style={detailGridStyle}>
        <Card
          style={{
            padding: spacing.lg,
            display: "flex",
            flexDirection: "column",
            gap: spacing.md,
          }}
        >
          <h3 style={{ margin: 0, fontSize: px(16), fontWeight: 800 }}>
            גולשים לפי תוכנית
          </h3>
          <div style={detailListStyle}>
            {Object.entries(stats.surfers.byProgram).map(([program, count]) => (
              <div key={program} style={detailItemStyle}>
                <span style={{ fontWeight: 600, color: colors.textPrimary }}>
                  {program}
                </span>
                <span
                  style={{
                    fontSize: px(18),
                    fontWeight: 800,
                    color: colors.accent,
                  }}
                >
                  {count}
                </span>
              </div>
            ))}
            {Object.keys(stats.surfers.byProgram).length === 0 && (
              <div style={{ textAlign: "center", color: muted }}>
                אין נתונים זמינים
              </div>
            )}
          </div>
        </Card>

        <Card
          style={{
            padding: spacing.lg,
            display: "flex",
            flexDirection: "column",
            gap: spacing.md,
          }}
        >
          <h3 style={{ margin: 0, fontSize: px(16), fontWeight: 800 }}>
            פעילויות לפי סוג
          </h3>
          <div style={detailListStyle}>
            {Object.entries(stats.activities.byKind).map(([kind, count]) => (
              <div key={kind} style={detailItemStyle}>
                <span style={{ fontWeight: 600, color: colors.textPrimary }}>
                  {ACTIVITY_KIND_LABELS[kind] || kind}
                </span>
                <span
                  style={{
                    fontSize: px(18),
                    fontWeight: 800,
                    color: colors.primary,
                  }}
                >
                  {count}
                </span>
              </div>
            ))}
            {Object.keys(stats.activities.byKind).length === 0 && (
              <div style={{ textAlign: "center", color: muted }}>
                אין נתונים זמינים
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card style={{ padding: spacing.lg }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: px(16), fontWeight: 800 }}>
          פעולות מהירות
        </h3>
        <p style={{ margin: 0, color: muted }}>
          גישה מהירה למסכים המרכזיים של המערכת
        </p>
        <div style={quickActionsGridStyle}>
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              style={{
                ...quickActionStyle,
                background: action.background,
                color: action.color,
                boxShadow: shadows.card,
              }}
            >
              <div style={{ fontSize: px(28) }}>{action.icon}</div>
              <div>{action.label}</div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
