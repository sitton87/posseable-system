"use client";

import { Modal, Button } from "@/app/components/ui";
import {
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { InventoryDocumentDetail } from "../types";
import { formatCurrency, formatDate, px } from "../utils";

type InventoryDocumentDetailModalProps = {
  open: boolean;
  document: InventoryDocumentDetail | null;
  loading: boolean;
  onClose: () => void;
};

const muted = colors.textMuted;
const ACTION_LABELS: Record<string, string> = {
  RECEIPT: "קליטת ספק",
  DONATION: "תרומה נכנסת",
  DISPOSAL: "השמדה",
  TRANSFER: "העברת מלאי",
  ACTIVITY_OUT: "שיוך לפעילות",
  ACTIVITY_RETURN: "החזרת פעילות",
  STOCKTAKE_ADJUST: "התאמת מלאי",
};

export function InventoryDocumentDetailModal({
  open,
  document,
  loading,
  onClose,
}: InventoryDocumentDetailModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(880px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.md,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>פרטי תעודת מלאי</h3>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            צפייה בפרטי התעודה והשורות שנרשמו במסמך.
          </p>
        </div>
        <Button variant="secondary" onClick={onClose}>
          ✖ סגור
        </Button>
      </div>

      {loading ? (
        <div
          style={{
            padding: px(spacing.lg),
            textAlign: "center",
            color: muted,
          }}
        >
          טוען נתונים...
        </div>
      ) : !document ? (
        <div
          style={{
            padding: px(spacing.lg),
            textAlign: "center",
            color: muted,
          }}
        >
          לא נבחרה תעודה להצגה.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: muted }}>מספר תעודה</div>
              <strong>{document.document_number}</strong>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>סוג פעולה</div>
              <div>
                {ACTION_LABELS[document.action_type] || document.action_type}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>תאריך</div>
              <div>{formatDate(document.document_date)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>משתמש מבצע</div>
              <div>
                {document.created_by_name ||
                  document.created_by ||
                  "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>ספק / גורם</div>
              <div>
                {document.supplier_name ||
                  document.external_party ||
                  document.supplier_identifier ||
                  "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>שווי כולל</div>
              <div>{formatCurrency(document.total_value)}</div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: muted }}>מחסן מקור</div>
              <div>{document.source_warehouse_name || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>מחסן יעד</div>
              <div>{document.target_warehouse_name || "—"}</div>
            </div>
            {document.reference_number && (
              <div>
                <div style={{ fontSize: 12, color: muted }}>מספר אסמכתא</div>
                <div>{document.reference_number}</div>
              </div>
            )}
          </div>

          {document.notes && (
            <div>
              <div style={{ fontSize: 12, color: muted }}>הערות</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{document.notes}</div>
            </div>
          )}

          <div>
            <div style={{ fontWeight: 600, marginBottom: spacing.sm }}>
              שורות התעודה
            </div>
            {document.lines.length === 0 ? (
              <div
                style={{
                  padding: px(spacing.md),
                  color: muted,
                  textAlign: "center",
                }}
              >
                לא נמצאו שורות לתעודה זו.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...tableStyle, minWidth: 720 }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>מקט</th>
                      <th style={tableHeaderStyle}>פריט</th>
                      {document.action_type === "TRANSFER" && (
                        <th style={tableHeaderStyle}>מחסן שולח</th>
                      )}
                      <th style={tableHeaderStyle}>מחסן יעד</th>
                      <th style={tableHeaderStyle}>כמות</th>
                      <th style={tableHeaderStyle}>מס' מסמך</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.lines.map((line) => (
                      <tr key={line.id}>
                        <td style={tableCellStyle}>{line.internal_sku || "—"}</td>
                        <td style={tableCellStyle}>{line.item_name}</td>
                        {document.action_type === "TRANSFER" && (
                          <td style={tableCellStyle}>
                            {line.source_warehouse_name || "—"}
                          </td>
                        )}
                        <td style={tableCellStyle}>
                          {line.target_warehouse_name || "—"}
                        </td>
                        <td style={tableCellStyle}>
                          {line.quantity?.toLocaleString("he-IL") || "0"}
                        </td>
                        <td style={tableCellStyle}>
                          {line.supplier_document_number || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

