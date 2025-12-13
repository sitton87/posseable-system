import { Button, Card } from "@/app/components/ui";
import { StatCardGrid, TasksBoard, TaskEntityOption } from "@/app/components/shared";
import { colors, radii, spacing } from "@/app/styles/foundations";
import { Supplier } from "@/type";
import { SupplierSummaryData } from "../types";

const muted = colors.textMuted;

type Props = {
  suppliers: Supplier[];
  summary: SupplierSummaryData | null;
  loading: boolean;
  onRefresh: () => void;
};

export default function SupplierHomeTab({
  suppliers,
  summary,
  loading,
  onRefresh,
}: Props) {
  const stats = summary?.stats || {
    totalSuppliers: 0,
    activeSuppliers: 0,
    serviceSuppliers: 0,
    activeContracts: 0,
  };

  const supplierEntities: TaskEntityOption[] = suppliers.map((s) => ({
    id: s.supplier_identifier,
    name: s.name,
    subtitle: s.contact_name || undefined,
  }));

  const statsCards = [
    {
      label: 'סה"כ ספקים',
      value: stats.totalSuppliers,
      hint: "כל הספקים במערכת",
    },
    {
      label: "ספקים פעילים",
      value: stats.activeSuppliers,
      hint: "זמינים לשיוך עבודות",
    },
    {
      label: "בעלי מקצוע",
      value: stats.serviceSuppliers,
      hint: "ספקים המסווגים לשירות",
    },
    {
      label: "חוזים פעילים",
      value: stats.activeContracts,
      hint: "חוזים בתוקף",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: spacing.sm,
            alignItems: "center",
            marginBottom: spacing.md,
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>סקירת ספקים</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              תמונת מצב של המערך והפעילות האחרונה.
            </p>
          </div>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענן נתונים
          </Button>
        </div>
        <StatCardGrid stats={statsCards} />
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: spacing.lg,
        }}
      >
        <TasksBoard
          entityType="supplier"
          entities={supplierEntities}
          title="משימות"
        />

        <Card style={{ padding: spacing.lg }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4 style={{ margin: 0 }}>פעילות אחרונה</h4>
            {loading && (
              <span style={{ fontSize: 12, color: muted }}>טוען...</span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
              marginTop: spacing.md,
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            {(summary?.recentActivity || []).map((activity) => {
              const supplierName =
                suppliers.find(
                  (s) => s.supplier_identifier === activity.supplier_identifier
                )?.name || activity.supplier_identifier;
              return (
                <div
                  key={activity.activity_id}
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.card,
                    padding: spacing.sm,
                    background: colors.surface,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: spacing.sm,
                    }}
                  >
                    <strong>{supplierName}</strong>
                    <span style={{ fontSize: 12, color: muted }}>
                      {new Date(activity.occurred_at).toLocaleString("he-IL")}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: muted }}>
                    סוג פעילות: {activity.activity_type}
                  </div>
                  {activity.description && (
                    <div style={{ fontSize: 13 }}>{activity.description}</div>
                  )}
                  {(activity.amount || activity.quantity) && (
                    <div style={{ fontSize: 12, color: muted }}>
                      {activity.quantity && `כמות: ${activity.quantity} `}
                      {activity.amount && `· עלות: ₪${activity.amount}`}
                    </div>
                  )}
                  {activity.related_document_id && (
                    <div style={{ fontSize: 11, color: muted }}>
                      מסמך: {activity.related_document_id}
                    </div>
                  )}
                </div>
              );
            })}
            {!summary?.recentActivity?.length && (
              <div
                style={{
                  color: muted,
                  fontSize: 13,
                  textAlign: "center",
                  border: `1px dashed ${colors.border}`,
                  borderRadius: radii.card,
                  padding: spacing.md,
                }}
              >
                אין פעילות רשומה עדיין.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

