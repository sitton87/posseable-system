"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, Button } from "@/app/components/ui";
import {
  inputStyle,
  labelStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { EquipmentItem, Supplier, Warehouse } from "@/type";
import type {
  InventoryDocumentAction,
  InventoryDocumentFormLine,
  InventoryDocumentFormState,
} from "../types";
import {
  createEmptyInventoryDocumentForm,
  createEmptyInventoryDocumentLine,
} from "../utils";

type InventoryDocumentModalProps = {
  open: boolean;
  submitting: boolean;
  items: EquipmentItem[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  onClose: () => void;
  onSubmit: (form: InventoryDocumentFormState) => void;
};

const muted = colors.textMuted;
const ACTION_OPTIONS: { value: InventoryDocumentAction; label: string }[] = [
  { value: "RECEIPT", label: "קליטת ספק" },
  { value: "DONATION", label: "תרומה נכנסת" },
  { value: "DISPOSAL", label: "השמדה" },
  { value: "TRANSFER", label: "העברת מלאי" },
  { value: "ACTIVITY_OUT", label: "שיוך לפעילות" },
  { value: "ACTIVITY_RETURN", label: "החזרת פעילות" },
  { value: "STOCKTAKE_ADJUST", label: "התאמת מלאי" },
];

export function InventoryDocumentModal({
  open,
  submitting,
  items,
  warehouses,
  suppliers,
  onClose,
  onSubmit,
}: InventoryDocumentModalProps) {
  const [formState, setFormState] = useState<InventoryDocumentFormState>(
    createEmptyInventoryDocumentForm()
  );

  useEffect(() => {
    if (open) {
      setFormState(createEmptyInventoryDocumentForm());
    }
  }, [open]);

  const actionType = formState.action_type;
  const requiresSupplier = actionType === "RECEIPT";
  const allowsSupplier = actionType === "RECEIPT" || actionType === "DONATION";
  const requiresActivity = ["ACTIVITY_OUT", "ACTIVITY_RETURN"].includes(
    actionType
  );
  const requiresExternalParty = ["DONATION", "DISPOSAL"].includes(actionType);
  const isStockAdjust = actionType === "STOCKTAKE_ADJUST";

  const handleFieldChange = <K extends keyof InventoryDocumentFormState>(
    key: K,
    value: InventoryDocumentFormState[K]
  ) => {
    setFormState((prev) => {
      const next = { ...prev, [key]: value };
      if (!allowsSupplier) {
        next.supplier_identifier = "";
      }
      if (!requiresActivity) {
        next.activity_id = "";
      }
      if (!requiresExternalParty) {
        next.external_party = "";
      }
      return next;
    });
  };

  const handleActionChange = (value: InventoryDocumentAction) => {
    setFormState((prev) => ({
      ...prev,
      action_type: value,
    }));
  };

  const handleLineChange = <K extends keyof InventoryDocumentFormLine>(
    index: number,
    key: K,
    value: InventoryDocumentFormLine[K]
  ) => {
    setFormState((prev) => {
      const nextLines = prev.lines.map((line, idx) =>
        idx === index ? { ...line, [key]: value } : line
      );
      return { ...prev, lines: nextLines };
    });
  };

  const addLine = () => {
    setFormState((prev) => ({
      ...prev,
      lines: [...prev.lines, createEmptyInventoryDocumentLine()],
    }));
  };

  const duplicateLine = (index: number) => {
    setFormState((prev) => {
      const source = prev.lines[index];
      if (!source) return prev;
      const cloned: InventoryDocumentFormLine = { ...source };
      return {
        ...prev,
        lines: [
          ...prev.lines.slice(0, index + 1),
          cloned,
          ...prev.lines.slice(index + 1),
        ],
      };
    });
  };

  const removeLine = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      lines:
        prev.lines.length <= 1
          ? prev.lines
          : prev.lines.filter((_, idx) => idx !== index),
    }));
  };

  const warehouseOptions = useMemo(
    () =>
      warehouses
        .filter((warehouse) => warehouse.is_active)
        .map((warehouse) => ({
          value: warehouse.id,
          label: warehouse.name,
        })),
    [warehouses]
  );

  const itemOptions = useMemo(
    () =>
      items.map((item) => ({
        value: item.id,
        label: `${item.internal_sku || "—"} · ${item.name}`,
      })),
    [items]
  );

  const supplierOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: supplier.supplier_identifier,
        label: `${supplier.name} (${supplier.supplier_identifier})`,
      })),
    [suppliers]
  );

  const handleSubmit = () => {
    onSubmit(formState);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(920px, 96vw)"
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
          <h3 style={{ margin: 0 }}>תעודת מלאי חדשה</h3>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            התאריך יירשם אוטומטית בעת השמירה – מלא רק את סוג הפעולה והפרטים
            הנדרשים.
          </p>
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button variant="secondary" onClick={onClose}>
            ✖ סגור
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "שומר..." : "שמירת תעודה"}
          </Button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <label style={labelStyle}>
          סוג פעולה
          <select
            value={formState.action_type}
            onChange={(event) =>
              handleActionChange(event.target.value as InventoryDocumentAction)
            }
            style={{ ...inputStyle, marginTop: spacing.xs }}
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {allowsSupplier && (
          <label style={labelStyle}>
            ספק
            <select
              value={formState.supplier_identifier}
              onChange={(event) =>
                handleFieldChange("supplier_identifier", event.target.value)
              }
              style={{
                ...inputStyle,
                marginTop: spacing.xs,
                borderColor: requiresSupplier ? colors.primary : undefined,
              }}
            >
              <option value="">בחר ספק</option>
              {supplierOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {requiresActivity && (
          <label style={labelStyle}>
            מזהה פעילות
            <input
              type="number"
              min={0}
              value={formState.activity_id}
              onChange={(event) =>
                handleFieldChange("activity_id", event.target.value)
              }
              style={{ ...inputStyle, marginTop: spacing.xs }}
              placeholder="לדוגמה: 1024"
            />
          </label>
        )}

        {requiresExternalParty && (
          <label style={labelStyle}>
            גורם חיצוני
            <input
              type="text"
              value={formState.external_party}
              onChange={(event) =>
                handleFieldChange("external_party", event.target.value)
              }
              style={{ ...inputStyle, marginTop: spacing.xs }}
              placeholder="שם הנתרם / הגוף המטפל"
            />
          </label>
        )}

        <label style={labelStyle}>
          מס' אסמכתא / מסמך
          <input
            type="text"
            value={formState.reference_number}
            onChange={(event) =>
              handleFieldChange("reference_number", event.target.value)
            }
            style={{ ...inputStyle, marginTop: spacing.xs }}
            placeholder="מספר פנימי, אסמכתא חיצונית וכד'"
          />
        </label>

        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
          הערות לתעודה
          <textarea
            value={formState.notes}
            onChange={(event) => handleFieldChange("notes", event.target.value)}
            style={{
              ...inputStyle,
              marginTop: spacing.xs,
              minHeight: 48,
              resize: "vertical",
            }}
            rows={2}
            placeholder="מידע נוסף שיופיע בתעודה"
          />
        </label>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.sm,
        }}
      >
        <strong>שורות התעודה</strong>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button variant="secondary" onClick={addLine}>
            + הוסף שורה
          </Button>
        </div>
      </div>

      {isStockAdjust && (
        <div style={{ color: muted, fontSize: 13, marginBottom: spacing.sm }}>
          בשורת התאמת מלאי יש להזין את הפרש הכמות (חיובי להוספה, שלילי להורדה)
          עבור המחסן שנבחר.
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            ...tableStyle,
            minWidth: actionType === "TRANSFER" ? 820 : 640,
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>פריט</th>
              {actionType === "TRANSFER" && (
                <th style={tableHeaderStyle}>מחסן שולח</th>
              )}
              <th style={tableHeaderStyle}>מחסן יעד</th>
              <th style={tableHeaderStyle}>כמות</th>
              <th style={tableHeaderStyle}>מס' מסמך ספק</th>
              <th style={tableHeaderStyle}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {formState.lines.map((line, index) => (
              <tr key={`document-line-${index}`}>
                <td style={tableCellStyle}>
                  <select
                    value={line.item_id}
                    onChange={(event) =>
                      handleLineChange(index, "item_id", event.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">בחר פריט</option>
                    {itemOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                {actionType === "TRANSFER" && (
                  <td style={tableCellStyle}>
                    <select
                      value={line.source_warehouse_id}
                      onChange={(event) =>
                        handleLineChange(
                          index,
                          "source_warehouse_id",
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">בחר מחסן</option>
                      {warehouseOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                <td style={tableCellStyle}>
                  <select
                    value={line.target_warehouse_id}
                    onChange={(event) =>
                      handleLineChange(
                        index,
                        "target_warehouse_id",
                        event.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">—</option>
                    {warehouseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={tableCellStyle}>
                  <input
                    type="number"
                    step="any"
                    value={line.quantity}
                    onChange={(event) =>
                      handleLineChange(index, "quantity", event.target.value)
                    }
                    style={inputStyle}
                  />
                </td>
                <td style={tableCellStyle}>
                  <input
                    type="text"
                    value={line.supplier_document_number}
                    onChange={(event) =>
                      handleLineChange(
                        index,
                        "supplier_document_number",
                        event.target.value
                      )
                    }
                    style={inputStyle}
                    placeholder="מס' חשבונית/מסמך"
                  />
                </td>
                <td style={tableCellStyle}>
                  <div
                    style={{
                      display: "flex",
                      gap: spacing.xs,
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      variant="secondary"
                      onClick={() => duplicateLine(index)}
                      aria-label="שכפל שורה"
                    >
                      📄
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => removeLine(index)}
                      disabled={formState.lines.length === 1}
                      aria-label="מחק שורה"
                    >
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
