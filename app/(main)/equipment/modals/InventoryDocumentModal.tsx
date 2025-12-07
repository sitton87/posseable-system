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
import type { Donor, EquipmentItem, Supplier, Warehouse } from "@/type";
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
  donors: Donor[];
  initialState?: InventoryDocumentFormState | null;
  editingDocumentId?: string | null;
  editingDocumentNumber?: number | null;
  onClose: () => void;
  onSubmit: (
    form: InventoryDocumentFormState,
    options?: { documentId?: string | null }
  ) => void;
  onStateChange?: (state: InventoryDocumentFormState) => void;
  escEnabled?: boolean;
};

const muted = colors.textMuted;
const ACTION_OPTIONS: { value: InventoryDocumentAction; label: string }[] = [
  { value: "RECEIPT", label: "קליטת ספק" },
  { value: "DONATION", label: "תרומה נכנסת" },
  { value: "DISPOSAL", label: "השמדה" },
  { value: "TRANSFER", label: "העברת מלאי" },
  { value: "STOCKTAKE_ADJUST", label: "התאמת מלאי" },
];

const STOCK_ADJUST_LABELS: Record<
  InventoryDocumentFormLine["adjust_direction"],
  string
> = {
  increase: "הוספה למלאי",
  decrease: "הפחתה מהמלאי",
};

export function InventoryDocumentModal({
  open,
  submitting,
  items,
  warehouses,
  suppliers,
  donors,
  initialState,
  editingDocumentId,
  editingDocumentNumber,
  onClose,
  onSubmit,
  onStateChange,
  escEnabled = true,
}: InventoryDocumentModalProps) {
  const [formState, setFormState] = useState<InventoryDocumentFormState>(
    createEmptyInventoryDocumentForm()
  );

  useEffect(() => {
    if (open) {
      if (initialState) {
        setFormState(initialState);
      } else {
        setFormState(createEmptyInventoryDocumentForm());
      }
    }
  }, [open, initialState]);

  useEffect(() => {
    if (!open) return;
    onStateChange?.(formState);
  }, [formState, onStateChange, open]);

  const actionType = formState.action_type;
  const requiresSupplier = actionType === "RECEIPT";
  const allowsSupplier = actionType === "RECEIPT" || actionType === "DONATION";
  const requiresDonor = actionType === "DONATION";
  const requiresExternalParty = actionType === "DISPOSAL";
  const isStockAdjust = actionType === "STOCKTAKE_ADJUST";
  const hideSupplierDocField =
    actionType === "TRANSFER" || actionType === "STOCKTAKE_ADJUST";

  const handleFieldChange = <K extends keyof InventoryDocumentFormState>(
    key: K,
    value: InventoryDocumentFormState[K]
  ) => {
    setFormState((prev) => {
      const next = { ...prev, [key]: value };
      if (!allowsSupplier) {
        next.supplier_identifier = "";
      }
      if (!requiresDonor) {
        next.donor_national_id = "";
      }
      if (!requiresExternalParty) {
        next.external_party = "";
      }
      if (key === "action_type") {
        next.supplier_document_type = "";
        next.lines = next.lines.map((line) => ({
          ...line,
          supplier_document_number: "",
          adjust_direction: line.adjust_direction ?? "increase",
        }));
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

  const donorOptions = useMemo(
    () =>
      donors.map((donor) => ({
        value: donor.national_id,
        label: donor.full_name,
      })),
    [donors]
  );

  const handleSubmit = () => {
    onSubmit(formState, { documentId: editingDocumentId || null });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(980px, 96vw)"
      style={{ padding: spacing.xxl }}
      escEnabled={escEnabled}
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
          <h3 style={{ margin: 0 }}>
            {editingDocumentId
              ? `עריכת תעודה #${editingDocumentNumber ?? ""}`.trim()
              : "תעודת מלאי חדשה"}
          </h3>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            התאריך יירשם אוטומטית בעת השמירה – מלא רק את סוג הפעולה והפרטים
            הנדרשים.
          </p>
          <p style={{ margin: 0, color: muted, fontSize: 12 }}>
            לאחר יצירה לא ניתן למחוק תעודות, רק לעדכן אותן.
          </p>
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button variant="secondary" onClick={onClose}>
            ✖ סגור
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? "שומר..."
              : editingDocumentId
              ? "עדכון תעודה"
              : "שמירת תעודה"}
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

        {requiresDonor && (
          <label style={labelStyle}>
            תורם
            <select
              value={formState.donor_national_id}
              onChange={(event) =>
                handleFieldChange("donor_national_id", event.target.value)
              }
              style={{
                ...inputStyle,
                marginTop: spacing.xs,
                borderColor: colors.primary,
              }}
            >
              <option value="">בחר תורם</option>
              {donorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

        {actionType === "RECEIPT" && (
          <label style={labelStyle}>
            סוג תעודת ספק
            <input
              type="text"
              value={formState.supplier_document_type}
              onChange={(event) =>
                handleFieldChange("supplier_document_type", event.target.value)
              }
              style={{ ...inputStyle, marginTop: spacing.xs }}
              placeholder="לדוגמה: חשבונית / תעודת משלוח"
            />
          </label>
        )}

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
          הזן את ההפרש לספירת המלאי ובחר אם מדובר בהוספה או הפחתה מהמלאי במחסן.
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            ...tableStyle,
            minWidth: actionType === "TRANSFER" ? 920 : 720,
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>פריט</th>
              {actionType === "TRANSFER" && (
                <th style={tableHeaderStyle}>מחסן שולח</th>
              )}
              <th style={tableHeaderStyle}>
                {actionType === "DISPOSAL" ? "מחסן מקור" : "מחסן יעד"}
              </th>
              <th style={tableHeaderStyle}>כמות</th>
              {isStockAdjust && <th style={tableHeaderStyle}>כיוון התאמה</th>}
              {!hideSupplierDocField && (
                <th style={tableHeaderStyle}>מס' מסמך ספק</th>
              )}
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
                {isStockAdjust && (
                  <td style={tableCellStyle}>
                    <select
                      value={line.adjust_direction}
                      onChange={(event) =>
                        handleLineChange(
                          index,
                          "adjust_direction",
                          event.target
                            .value as InventoryDocumentFormLine["adjust_direction"]
                        )
                      }
                      style={inputStyle}
                    >
                      {Object.entries(STOCK_ADJUST_LABELS).map(
                        ([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                )}
                {!hideSupplierDocField && (
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
                )}
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
