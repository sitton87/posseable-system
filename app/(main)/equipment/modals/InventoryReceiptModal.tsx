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
        <div>
          <label style={labelStyle}>ספק*</label>
          <select
            style={inputStyle}
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
          {!suppliers.length && (
            <div style={{ color: colors.danger, fontSize: 12 }}>
              אין ספקים פעילים במערכת. יש להגדיר ספק לפני קליטת מלאי.
            </div>
          )}
        </div>
        {receiptLines.map((line, index) => (
          <div
            key={`receipt-modal-line-${index}`}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: radii.card,
              padding: px(spacing.md),
              display: "flex",
              flexWrap: "wrap",
              gap: spacing.sm,
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 200px" }}>
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
            </div>
            <div style={{ flex: "1 1 200px" }}>
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
            </div>
            <div style={{ width: 120 }}>
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
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <input
                type="text"
                style={inputStyle}
                placeholder="מספר תעודת ספק"
                value={line.supplier_document_number}
                onChange={(e) =>
                  onLineChange(index, "supplier_document_number", e.target.value)
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: spacing.xs,
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
