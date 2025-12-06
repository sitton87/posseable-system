"use client";

import { Card, Button } from "@/app/components/ui";
import {
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { ReceiptHistoryEntry } from "../types";
import { formatCurrency, formatDate, px } from "../utils";

type InventoryTabProps = {
  historyEntries: ReceiptHistoryEntry[];
  historyLoading: boolean;
  canEdit: boolean;
  onOpenInventoryModal: () => void;
  onOpenHistoryModal: (entry: ReceiptHistoryEntry | null) => void;
  onEditReceipt: (entry: ReceiptHistoryEntry) => void;
  onGoToStructure: () => void;
};

const muted = colors.textMuted;

export function InventoryTab({
  historyEntries,
  historyLoading,
  canEdit,
  onOpenInventoryModal,
  onOpenHistoryModal,
  onEditReceipt,
  onGoToStructure,
}: InventoryTabProps) {
  return (
    <>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>ניהול קליטת מלאי</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              פתיחת תעודת קליטה חדשה או צפייה בתעודות קיימות
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: spacing.sm,
              flexWrap: "wrap",
            }}
          >
            <Button onClick={onOpenInventoryModal} disabled={!canEdit}>
              + קליטת מלאי חדשה
            </Button>
            <Button variant="secondary" onClick={() => onOpenHistoryModal(null)}>
              היסטוריית תעודות
            </Button>
            <Button variant="secondary" onClick={onGoToStructure}>
              הגדרות מחסנים
            </Button>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>תעודות אחרונות</strong>
          </div>
          <div style={{ marginTop: spacing.sm }}>
            {historyLoading ? (
              <div
                style={{
                  padding: px(spacing.md),
                  textAlign: "center",
                  color: muted,
                }}
              >
                טוען נתונים...
              </div>
            ) : historyEntries.length === 0 ? (
              <div
                style={{
                  padding: px(spacing.md),
                  textAlign: "center",
                  color: muted,
                }}
              >
                טרם נקלטו תעודות במערכת.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>תעודה</th>
                    <th style={tableHeaderStyle}>תאריך</th>
                    <th style={tableHeaderStyle}>ספק</th>
                    <th style={tableHeaderStyle}>ערך כספי</th>
                    <th style={tableHeaderStyle}>משתמש</th>
                    <th style={tableHeaderStyle}>פריטים</th>
                    <th style={tableHeaderStyle}>סטטוס</th>
                    <th style={tableHeaderStyle}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {historyEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td style={tableCellStyle}>{entry.document_code}</td>
                      <td style={tableCellStyle}>
                        {formatDate(entry.receipt_date)}
                      </td>
                      <td style={tableCellStyle}>
                        {entry.supplier_name || "—"}
                      </td>
                    <td style={tableCellStyle}>
                      {formatCurrency(entry.total_value)}
                    </td>
                    <td style={tableCellStyle}>
                      {entry.created_by_name ||
                        entry.created_by ||
                        "—"}
                    </td>
                      <td style={tableCellStyle}>{entry.total_items}</td>
                      <td style={tableCellStyle}>{entry.status}</td>
                      <td style={tableCellStyle}>
                        <Button
                          variant="secondary"
                          onClick={() => onOpenHistoryModal(entry)}
                          aria-label="צפייה בתעודה"
                        >
                          👁️
                        </Button>
                        <Button
                          variant="secondary"
                          style={{ marginInlineStart: spacing.xs }}
                          onClick={() => onEditReceipt(entry)}
                          disabled={!canEdit}
                          aria-label="עריכת תעודה"
                        >
                          ✏️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Card>
      <p style={{ color: muted, fontSize: 13, marginTop: spacing.md }}>
        ניהול המחסנים מתבצע דרך &quot;הגדרות מחסנים&quot; בטאב "הגדרות מבנה".
      </p>
    </>
  );
}

