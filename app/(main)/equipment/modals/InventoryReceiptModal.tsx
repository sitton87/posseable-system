"use client";

import { Modal, Button } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, radii, spacing } from "@/app/styles/foundations";
import type { EquipmentItem, Warehouse } from "@/type";
import type { ReceiptLine } from "../types";
import { px } from "../utils";

type InventoryReceiptModalProps = {
  open: boolean;
  onClose: () => void;
  documentCode?: string | null;
  receiptLines: ReceiptLine[];
  inventoryNote: string;
  activeWarehouses: Warehouse[];
  items: EquipmentItem[];
  onInventoryNoteChange: (value: string) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onLineChange: <K extends keyof ReceiptLine>(
    index: number,
    key: K,
    value: ReceiptLine[K]
  ) => void;
  onSubmit: () => void;
  onReset: () => void;
};

const muted = colors.textMuted;

export function InventoryReceiptModal({
  open,
  onClose,
  documentCode,
  receiptLines,
  inventoryNote,
  activeWarehouses,
  items,
  onInventoryNoteChange,
  onAddLine,
  onRemoveLine,
  onLineChange,
  onSubmit,
  onReset,
}: InventoryReceiptModalProps) {
  const isEdit = Boolean(documentCode);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(820px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>
            {isEdit ? `עריכת תעודה ${documentCode}` : "קליטת מלאי חדשה"}
          </h3>
          {isEdit && (
            <div style={{ color: muted, fontSize: 13 }}>
              העדכון יחליף את השורות הקיימות בתעודה הזו.
            </div>
          )}
        </div>
        <Button variant="secondary" onClick={onAddLine}>
          + שורה חדשה
        </Button>
      </div>
      <p style={{ marginTop: spacing.xs, color: muted, fontSize: 13 }}>
        הזן את שורות הקליטה, כולל מחסן, ספק וכמות. החיבור למסד יתבצע בשמירה.
      </p>
      {!activeWarehouses.length && (
        <div
          style={{
            marginTop: spacing.sm,
            padding: px(spacing.sm),
            borderRadius: radii.card,
            background: colors.primarySoft,
            color: colors.warning,
            textAlign: "center",
          }}
        >
          כדי לקלוט מלאי יש ליצור לפחות מחסן פעיל. לחץ על &quot;+ מחסן חדש&quot;
          בחלק המחסנים.
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.md,
          marginTop: spacing.md,
        }}
      >
        {receiptLines.map((line, index) => (
          <div
            key={`receipt-modal-line-${index}`}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: radii.card,
              padding: px(spacing.md),
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: spacing.sm,
            }}
          >
            <select
              style={inputStyle}
              value={line.item_id}
              onChange={(e) => onLineChange(index, "item_id", e.target.value)}
            >
              <option value="">בחר פריט</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.internal_sku} · {item.name}
                </option>
              ))}
            </select>
            <select
              style={inputStyle}
              value={line.warehouse_id}
              onChange={(e) =>
                onLineChange(index, "warehouse_id", e.target.value)
              }
              disabled={!activeWarehouses.length}
            >
              <option value="">בחר מחסן</option>
              {activeWarehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.code} · {warehouse.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              style={inputStyle}
              placeholder="כמות"
              value={line.quantity}
              onChange={(e) => onLineChange(index, "quantity", e.target.value)}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              style={inputStyle}
              placeholder="עלות ליחידה"
              value={line.unit_cost}
              onChange={(e) => onLineChange(index, "unit_cost", e.target.value)}
            />
            <input
              type="text"
              style={inputStyle}
              placeholder="מספר ספק"
              value={line.supplier_identifier}
              onChange={(e) =>
                onLineChange(index, "supplier_identifier", e.target.value)
              }
            />
            <Button
              variant="secondary"
              onClick={() => onRemoveLine(index)}
              disabled={receiptLines.length === 1}
            >
              ✖ הסר
            </Button>
          </div>
        ))}
        <div>
          <label style={labelStyle}>הערות לתעודה</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={inventoryNote}
            onChange={(e) => onInventoryNoteChange(e.target.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button variant="secondary" onClick={onReset}>
            ניקוי טופס
          </Button>
          <Button onClick={onSubmit}>שמור קליטה</Button>
        </div>
      </div>
    </Modal>
  );
}
