"use client";

import { Button, Card } from "@/app/components/ui";
import {
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, radii, shadows, spacing } from "@/app/styles/foundations";
import type { EquipmentItem, Warehouse } from "@/type";
import type { InventoryDocumentSummary, StatSummary } from "../types";
import { getConditionLabel } from "../constants";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  px,
} from "../utils";

type HomeTabProps = {
  items: EquipmentItem[];
  warehouses: Warehouse[];
  documents: InventoryDocumentSummary[];
  documentsLoading: boolean;
  statSummary: StatSummary;
  onNavigate: (tab: "catalog" | "inventory" | "structure") => void;
};

const muted = colors.textMuted;
const ACTION_LABELS: Record<string, string> = {
  RECEIPT: "קליטת ספק",
  DONATION: "תרומה נכנסת",
  DISPOSAL: "השמדה",
  TRANSFER: "העברת מלאי",
  STOCKTAKE_ADJUST: "התאמת מלאי",
};

export function HomeTab({
  items,
  warehouses,
  documents,
  documentsLoading,
  statSummary,
  onNavigate,
}: HomeTabProps) {
  const activeWarehouses = warehouses.filter((warehouse) => warehouse.is_active);
  const repairItems = items
    .filter((item) => item.condition === "damaged")
    .slice(0, 5);
  const recentDocuments = documents.slice(0, 5);

  const kpis = [
    {
      label: "סה\"כ פריטים",
      value: formatNumber(statSummary.totalItems, "0"),
      hint: "כולל פריטים פעילים ולא פעילים",
    },
    {
      label: "סה\"כ יחידות במלאי",
      value: formatNumber(statSummary.totalUnits, "0"),
      hint: "היקף מלאי מדיווחים אחרונים",
    },
    {
      label: "פריטים בהשכרה",
      value: formatNumber(statSummary.rentals, "0"),
      hint: "כולל פריטים מסומנים להשכרה",
    },
    {
      label: "פריטים מתכלים",
      value: formatNumber(statSummary.consumables, "0"),
      hint: "פריטים עם מלאי מינימלי",
    },
    {
      label: "מחסנים פעילים",
      value: formatNumber(activeWarehouses.length, "0"),
      hint: "מחסנים הזמינים לקליטת מלאי",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.md,
        }}
      >
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            style={{
              padding: px(spacing.md),
              borderRadius: radii.card,
              boxShadow: shadows.card,
            }}
          >
            <div style={{ fontSize: 12, color: muted }}>{kpi.label}</div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                margin: `${spacing.xs}px 0`,
              }}
            >
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, color: muted }}>{kpi.hint}</div>
          </Card>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: spacing.lg,
        }}
      >
        <Card style={{ padding: px(spacing.md) }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.sm,
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>פריטים בתיקון</h3>
              <p style={{ margin: 0, color: muted, fontSize: 13 }}>
                מעקב אחרי פריטים במצב "דורש תיקון".
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => onNavigate("catalog")}
              style={{ whiteSpace: "nowrap" }}
            >
              כל הפריטים
            </Button>
          </div>
          {repairItems.length === 0 ? (
            <div
              style={{
                padding: px(spacing.md),
                textAlign: "center",
                color: muted,
              }}
            >
              אין פריטים שמסומנים לתיקון כרגע.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  ...tableStyle,
                  width: "100%",
                  tableLayout: "fixed",
                  minWidth: "100%",
                }}
              >
                <colgroup>
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "36%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "16%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>מקט</th>
                    <th style={tableHeaderStyle}>פריט</th>
                    <th style={tableHeaderStyle}>ספק</th>
                    <th style={tableHeaderStyle}>סטטוס</th>
                    <th style={tableHeaderStyle}>תאריך יעד</th>
                  </tr>
                </thead>
                <tbody>
                  {repairItems.map((item) => (
                    <tr key={item.id}>
                      <td style={tableCellStyle}>{item.internal_sku || "—"}</td>
                      <td style={{ ...tableCellStyle, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                        {item.supplier_name && (
                          <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                            ספק: {item.supplier_name}
                          </div>
                        )}
                      </td>
                      <td style={tableCellStyle}>{item.supplier_name || "—"}</td>
                      <td style={tableCellStyle}>
                        {getConditionLabel(item.condition)}
                      </td>
                      <td style={tableCellStyle}>
                        {item.updated_at
                          ? formatDate(item.updated_at.toString())
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card style={{ padding: px(spacing.md) }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.sm,
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>תעודות מלאי אחרונות</h3>
              <p style={{ margin: 0, color: muted, fontSize: 13 }}>
                חמש התעודות האחרונות שנרשמו במערכת.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => onNavigate("inventory")}
              style={{ whiteSpace: "nowrap" }}
            >
              ניהול מלאי
            </Button>
          </div>
          {documentsLoading ? (
            <div
              style={{
                padding: px(spacing.md),
                textAlign: "center",
                color: muted,
              }}
            >
              טוען תעודות...
            </div>
          ) : recentDocuments.length === 0 ? (
            <div
              style={{
                padding: px(spacing.md),
                textAlign: "center",
                color: muted,
              }}
            >
              אין תעודות להצגה.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
                <table style={{ ...tableStyle, minWidth: 520 }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>מספר תעודה</th>
                      <th style={tableHeaderStyle}>סוג פעולה</th>
                    <th style={tableHeaderStyle}>משתמש</th>
                    <th style={tableHeaderStyle}>ערך כספי</th>
                  </tr>
                </thead>
                <tbody>
                    {recentDocuments.map((entry) => (
                      <tr key={entry.id}>
                        <td style={tableCellStyle}>
                          {entry.document_number}
                        </td>
                        <td style={tableCellStyle}>
                          {ACTION_LABELS[entry.action_type] ||
                            entry.action_type}
                        </td>
                      <td style={tableCellStyle}>
                          {entry.created_by_name || entry.created_by || "—"}
                      </td>
                      <td style={tableCellStyle}>
                          {formatCurrency(entry.total_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}

