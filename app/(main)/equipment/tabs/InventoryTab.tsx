"use client";

import { Card, Button } from "@/app/components/ui";
import {
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { DraftEntry } from "@/app/hooks/useDraftManager";
import type {
  InventoryDocumentFormState,
  InventoryDocumentSummary,
} from "../types";
import { formatCurrency, formatDate, px } from "../utils";

type InventoryTabProps = {
  documents: InventoryDocumentSummary[];
  documentsLoading: boolean;
  canEdit: boolean;
  drafts?: DraftEntry<InventoryDocumentFormState>[];
  onResumeDraft?: (draftId: string) => void;
  onDeleteDraft?: (draftId: string) => void;
  onOpenDocumentModal: () => void;
  onViewDocument: (documentId: string) => void;
  onEditDocument: (documentId: string) => void;
  onRefreshDocuments: () => void;
  onGoToStructure: () => void;
};

const muted = colors.textMuted;
const ACTION_LABELS: Record<string, string> = {
  RECEIPT: "קליטת ספק",
  DONATION: "תרומה נכנסת",
  DISPOSAL: "השמדה",
  TRANSFER: "העברה",
  STOCKTAKE_ADJUST: "התאמת מלאי",
};
const draftBorderColor = "#8bd4a1";
const draftSurfaceColor = "#e6f5ec";

const draftListContainer = {
  border: `1px solid ${draftBorderColor}`,
  borderRadius: spacing.md,
  padding: spacing.md,
  background: draftSurfaceColor,
};
const draftRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.md,
  padding: `${spacing.sm} 0`,
  borderBottom: `1px solid ${draftBorderColor}`,
};

export function InventoryTab({
  documents,
  documentsLoading,
  canEdit,
  drafts,
  onResumeDraft,
  onDeleteDraft,
  onOpenDocumentModal,
  onViewDocument,
  onEditDocument,
  onRefreshDocuments,
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
            <h3 style={{ margin: 0 }}>מסמכי מלאי</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              יצירת תעודה חדשה ותיעוד כל תנועות המלאי
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: spacing.sm,
              flexWrap: "wrap",
            }}
          >
            <Button onClick={onOpenDocumentModal} disabled={!canEdit}>
              + תעודת מלאי חדשה
            </Button>
            <Button variant="secondary" onClick={onRefreshDocuments}>
              רענן נתונים
            </Button>
            <Button variant="secondary" onClick={onGoToStructure}>
              הגדרות מחסנים
            </Button>
          </div>
        </div>
        {drafts && drafts.length > 0 && (
          <div style={{ ...draftListContainer, marginBottom: spacing.lg }}>
            <strong>טיוטות תעודות ({drafts.length})</strong>
            <p style={{ margin: "4px 0 0", color: muted, fontSize: 12 }}>
              טיוטות אלו זמינות רק לך עד להשלמה רשמית.
            </p>
            <div style={{ marginTop: spacing.sm }}>
              {drafts.map((draft, index) => (
                <div
                  key={draft.id}
                  style={{
                    ...draftRowStyle,
                    borderBottom:
                      index === drafts.length - 1
                        ? "none"
                        : draftRowStyle.borderBottom,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: spacing.sm,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          ...tableHeaderStyle,
                          background: colors.success,
                          color: "#fff",
                          borderRadius: spacing.sm,
                          padding: "2px 8px",
                          fontSize: 12,
                        }}
                      >
                        טיוטה
                      </span>
                      <strong style={{ fontSize: 14 }}>
                        {ACTION_LABELS[draft.payload.action_type] ||
                          draft.payload.action_type}
                      </strong>
                    </div>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: muted,
                        fontSize: 12,
                      }}
                    >
                      עודכן {new Date(draft.updatedAt).toLocaleString("he-IL")}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: spacing.sm,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      onClick={() => onResumeDraft?.(draft.id)}
                      aria-label="המשך עריכת טיוטה"
                      disabled={!canEdit}
                    >
                      המשך
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onDeleteDraft?.(draft.id)}
                      aria-label="מחיקת טיוטה"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
            {documentsLoading ? (
              <div
                style={{
                  padding: px(spacing.md),
                  textAlign: "center",
                  color: muted,
                }}
              >
                טוען נתונים...
              </div>
            ) : documents.length === 0 ? (
              <div
                style={{
                  padding: px(spacing.md),
                  textAlign: "center",
                  color: muted,
                }}
              >
                עדיין לא נרשמו תעודות במערכת.
              </div>
            ) : (
              <table style={{ ...tableStyle, width: "100%" }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>תעודה</th>
                    <th style={tableHeaderStyle}>תאריך</th>
                    <th style={tableHeaderStyle}>סוג פעולה</th>
                    <th style={tableHeaderStyle}>ספק / תורם</th>
                    <th style={tableHeaderStyle}>מחסן שולח</th>
                    <th style={tableHeaderStyle}>מחסן מקבל</th>
                    <th style={tableHeaderStyle}>סה"כ כמות</th>
                    <th style={tableHeaderStyle}>ערך כספי</th>
                    <th style={tableHeaderStyle}>משתמש</th>
                    <th style={tableHeaderStyle}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((entry) => (
                    <tr key={entry.id}>
                      <td style={tableCellStyle}>{entry.document_number}</td>
                      <td style={tableCellStyle}>
                        {formatDate(entry.document_date)}
                      </td>
                      <td style={tableCellStyle}>
                        {ACTION_LABELS[entry.action_type] || entry.action_type}
                      </td>
                      <td style={tableCellStyle}>
                        {entry.supplier_name ||
                          entry.donor_name ||
                          entry.external_party ||
                          "—"}
                        {entry.action_type === "RECEIPT" &&
                          entry.supplier_document_type && (
                            <div
                              style={{
                                fontSize: 12,
                                color: muted,
                                marginTop: 2,
                              }}
                            >
                              {entry.supplier_document_type}
                            </div>
                          )}
                      </td>
                      <td style={tableCellStyle}>
                        {entry.source_warehouse_name || "—"}
                      </td>
                      <td style={tableCellStyle}>
                        {entry.target_warehouse_name || "—"}
                      </td>
                      <td style={tableCellStyle}>
                        {entry.total_quantity?.toLocaleString("he-IL") || "0"}
                      </td>
                      <td style={tableCellStyle}>
                        {formatCurrency(entry.total_value)}
                      </td>
                      <td style={tableCellStyle}>
                        {entry.created_by_name || entry.created_by || "—"}
                      </td>
                      <td style={tableCellStyle}>
                        <Button
                          variant="secondary"
                          onClick={() => onViewDocument(entry.id)}
                          aria-label="צפייה בתעודה"
                        >
                          👁️
                        </Button>
                        {canEdit && (
                          <Button
                            variant="secondary"
                            style={{ marginInlineStart: spacing.xs }}
                            onClick={() => onEditDocument(entry.id)}
                            aria-label="עריכת תעודה"
                          >
                            ✏️
                          </Button>
                        )}
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
