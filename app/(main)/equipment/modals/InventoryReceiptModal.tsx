"use client";

import { Modal, Button } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, radii, spacing } from "@/app/styles/foundations";
import type { EquipmentItem, Supplier, Warehouse } from "@/type";
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
  suppliers: Supplier[];
  selectedSupplierId: string;
  onSupplierChange: (value: string) => void;
  onInventoryNoteChange: (value: string) => void;
  onAddLine: () => void;
  onDuplicateLine: (index: number) => void;
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
  suppliers,
  selectedSupplierId,
  onSupplierChange,
  onInventoryNoteChange,
  onAddLine,
  onDuplicateLine,
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
      width="min(980px, 95vw)"
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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: spacing.sm,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button onClick={onAddLine}>+ שורה חדשה</Button>
          <div
            style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
          >
            <label style={{ ...labelStyle, margin: 0 }}>ספק*</label>
            <select
              style={{ ...inputStyle, minWidth: 240 }}
              value={selectedSupplierId}
              onChange={(e) => onSupplierChange(e.target.value)}
              disabled={!suppliers.length}
            >
              <option value="">בחר ספק</option>
              {suppliers.map((supplier) => (
                <option
                  key={supplier.supplier_identifier}
                  value={supplier.supplier_identifier}
                >
                  {supplier.name} · {supplier.supplier_identifier}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <p style={{ marginTop: spacing.xs, color: muted, fontSize: 13 }}>
        הזן את שורות הקליטה, כולל מחסן, ספק וכמות.
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
        {!suppliers.length && (
          <div style={{ color: colors.danger, fontSize: 12 }}>
            אין ספקים פעילים במערכת. יש להגדיר ספק לפני קליטת מלאי.
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: px(spacing.sm),
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2.4fr 2fr 1fr 2fr auto",
              gap: spacing.sm,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 12, color: muted }}>פריט</div>
            <div style={{ fontSize: 12, color: muted }}>מחסן</div>
            <div style={{ fontSize: 12, color: muted }}>כמות</div>
            <div style={{ fontSize: 12, color: muted }}>מס' תעודת ספק</div>
            <div />
          </div>
          {receiptLines.map((line, index) => (
            <div
              key={`receipt-modal-line-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: "2.4fr 2fr 1fr 2fr auto",
                gap: spacing.sm,
                alignItems: "center",
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
                onChange={(e) =>
                  onLineChange(index, "quantity", e.target.value)
                }
              />
              <input
                type="text"
                style={inputStyle}
                placeholder="מספר תעודת ספק"
                value={line.supplier_document_number}
                onChange={(e) =>
                  onLineChange(
                    index,
                    "supplier_document_number",
                    e.target.value
                  )
                }
              />
              <div
                style={{
                  display: "flex",
                  gap: spacing.xs,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="secondary"
                  title="שכפול שורה"
                  aria-label="שכפול שורה"
                  onClick={() => onDuplicateLine(index)}
                >
                  ⧉
                </Button>
                <Button
                  variant="secondary"
                  title="הסר שורה"
                  aria-label="הסר שורה"
                  onClick={() => onRemoveLine(index)}
                  disabled={receiptLines.length === 1}
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <label style={labelStyle}>הערות לתעודה</label>
          <textarea
            rows={1}
            style={{ ...inputStyle, height: 44, resize: "none" }}
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
