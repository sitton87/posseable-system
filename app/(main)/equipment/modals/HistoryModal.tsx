"use client";

import { Modal, Button } from "@/app/components/ui";
import {
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { ReceiptDetail, ReceiptHistoryEntry } from "../types";
import { formatDate, px } from "../utils";

type HistoryModalProps = {
  open: boolean;
  selected: ReceiptHistoryEntry | null;
  entries: ReceiptHistoryEntry[];
  onClose: () => void;
  onSelect: (entry: ReceiptHistoryEntry | null) => void;
  detail: ReceiptDetail | null;
  detailLoading: boolean;
  onEdit: (entry: ReceiptHistoryEntry) => void;
  canEdit: boolean;
};

const muted = colors.textMuted;

export function HistoryModal({
  open,
  selected,
  entries,
  detail,
  detailLoading,
  onClose,
  onSelect,
  onEdit,
  canEdit,
}: HistoryModalProps) {
  const effectiveNote = detail?.note ?? selected?.note;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(720px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>היסטוריית תעודות</h3>
        <Button variant="secondary" onClick={onClose}>
          ✖ סגור
        </Button>
      </div>
      {selected ? (
        <div
          style={{
            marginTop: spacing.md,
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm,
          }}
        >
          <Button
            variant="secondary"
            onClick={() => onSelect(null)}
            style={{ alignSelf: "flex-start" }}
          >
            ← חזרה לרשימה
          </Button>
          <div>
            <div style={{ fontSize: 12, color: muted }}>מספר תעודה</div>
            <strong>{selected.document_code}</strong>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: muted }}>תאריך</div>
              <div>{formatDate(selected.receipt_date)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>ספק</div>
              <div>{selected.supplier_name || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
              <div>{selected.status}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>מספר פריטים</div>
              <div>{selected.total_items}</div>
            </div>
          </div>
          {effectiveNote && (
            <div>
              <div style={{ fontSize: 12, color: muted }}>הערות</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{effectiveNote}</div>
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, marginBottom: spacing.xs }}>
              פריטים בתעודה
            </div>
            {detailLoading ? (
              <div
                style={{
                  padding: px(spacing.md),
                  color: muted,
                }}
              >
                טוען שורות...
              </div>
            ) : !detail?.lines?.length ? (
              <div
                style={{
                  padding: px(spacing.md),
                  color: muted,
                }}
              >
                לא נמצאו שורות לתעודה זו.
              </div>
            ) : (
              <table style={{ ...tableStyle, width: "100%" }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>פריט</th>
                    <th style={tableHeaderStyle}>מחסן</th>
                    <th style={tableHeaderStyle}>כמות</th>
                    <th style={tableHeaderStyle}>עלות ליחידה</th>
                    <th style={tableHeaderStyle}>ספק</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.lines.map((line) => (
                    <tr key={`${line.item_id}-${line.warehouse_id}`}>
                      <td style={tableCellStyle}>{line.item_name}</td>
                      <td style={tableCellStyle}>{line.warehouse_name}</td>
                      <td style={tableCellStyle}>{line.quantity}</td>
                      <td style={tableCellStyle}>
                        {line.unit_cost === null || line.unit_cost === undefined
                          ? "—"
                          : line.unit_cost}
                      </td>
                      <td style={tableCellStyle}>
                        {line.supplier_identifier || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {canEdit && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="secondary"
                onClick={() => selected && onEdit(selected)}
                disabled={detailLoading}
              >
                עריכת תעודה
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: spacing.md }}>
          {entries.length === 0 ? (
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
            <table style={{ ...tableStyle, width: "100%" }}>
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
                {entries.map((entry) => (
                  <tr key={`modal-history-${entry.id}`}>
                    <td style={tableCellStyle}>{entry.document_code}</td>
                    <td style={tableCellStyle}>
                      {formatDate(entry.receipt_date)}
                    </td>
                    <td style={tableCellStyle}>{entry.supplier_name || "—"}</td>
                    <td style={tableCellStyle}>{entry.total_items}</td>
                    <td style={tableCellStyle}>{entry.status}</td>
                    <td style={tableCellStyle}>
                      <Button
                        variant="secondary"
                        onClick={() => onSelect(entry)}
                      >
                        👁️
                      </Button>
                      <Button
                        variant="secondary"
                        style={{ marginInlineStart: spacing.xs }}
                        onClick={() => onEdit(entry)}
                        disabled={!canEdit}
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
      )}
    </Modal>
  );
}
