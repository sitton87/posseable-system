"use client";

import { Button, Card } from "@/app/components/ui";
import { tableCellStyle, tableHeaderStyle, tableStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { ReceiptHistoryEntry } from "../types";
import { formatDate } from "../utils";

type InventoryManagementCardProps = {
  historyEntries: ReceiptHistoryEntry[];
  onOpenInventoryModal: () => void;
  onOpenHistoryModal: (entry?: ReceiptHistoryEntry | null) => void;
};

export function InventoryManagementCard({
  historyEntries,
  onOpenInventoryModal,
  onOpenHistoryModal,
}: InventoryManagementCardProps) {
  return (
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
          <p style={{ margin: 0, color: colors.textMuted, fontSize: 13 }}>
            פתיחת תעודת קליטה חדשה או צפייה בתעודות קיימות
          </p>
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button onClick={onOpenInventoryModal}>+ קליטת מלאי חדשה</Button>
          <Button variant="secondary" onClick={() => onOpenHistoryModal(null)}>
            היסטוריית תעודות
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
          <strong>תעודות אחרונות (נתוני הדגמה)</strong>
          <Button variant="secondary" onClick={() => onOpenHistoryModal(null)}>
            הצג הכל
          </Button>
        </div>
        <div style={{ marginTop: spacing.sm }}>
          {historyEntries.length === 0 ? (
            <div
              style={{
                padding: spacing.md,
                textAlign: "center",
                color: colors.textMuted,
                background: colors.surfaceAlt,
                borderRadius: spacing.sm,
              }}
            >
              טרם נקלטו תעודות במערכת.
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>תעודה</th>
                  <th style={tableHeaderStyle}>תאריך</th>
                  <th style={tableHeaderStyle}>ספק</th>
                  <th style={tableHeaderStyle}>פריטים</th>
                  <th style={tableHeaderStyle}>סטטוס</th>
                  <th style={tableHeaderStyle}>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {historyEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={tableCellStyle}>{entry.document_code}</td>
                    <td style={tableCellStyle}>{formatDate(entry.receipt_date)}</td>
                    <td style={tableCellStyle}>{entry.supplier_name || "—"}</td>
                    <td style={tableCellStyle}>{entry.total_items}</td>
                    <td style={tableCellStyle}>{entry.status}</td>
                    <td style={tableCellStyle}>
                      <Button variant="secondary" onClick={() => onOpenHistoryModal(entry)}>
                        👁️
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
  );
}



