"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Title,
  Text,
  TextInput,
  Textarea,
  Select,
  SelectItem,
  Button,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
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
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title>
              {editingDocumentId
                ? `עריכת תעודה #${editingDocumentNumber ?? ""}`.trim()
                : "תעודת מלאי חדשה"}
            </Title>
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              התאריך יירשם אוטומטית בעת השמירה – מלא רק את סוג הפעולה והפרטים
              הנדרשים.
            </Text>
            <Text className="text-xs" style={{ color: cssVar.text.muted }}>
              לאחר יצירה לא ניתן למחוק תעודות, רק לעדכן אותן.
            </Text>
          </div>
          <div className="flex gap-2">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              סוג פעולה
            </Text>
            <Select
              value={formState.action_type}
              onValueChange={(val) =>
                handleActionChange(val as InventoryDocumentAction)
              }
            >
              {ACTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {allowsSupplier && (
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                ספק {requiresSupplier && <span style={{ color: cssVar.status.danger }}>*</span>}
              </Text>
              <Select
                value={formState.supplier_identifier || undefined}
                onValueChange={(val) =>
                  handleFieldChange("supplier_identifier", val || "")
                }
                placeholder="בחר ספק"
              >
                {supplierOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}

          {requiresDonor && (
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                תורם <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <Select
                value={formState.donor_national_id || undefined}
                onValueChange={(val) =>
                  handleFieldChange("donor_national_id", val || "")
                }
                placeholder="בחר תורם"
              >
                {donorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}

          {requiresExternalParty && (
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                גורם חיצוני
              </Text>
              <TextInput
                value={formState.external_party}
                onChange={(e) =>
                  handleFieldChange("external_party", e.target.value)
                }
                placeholder="שם הנתרם / הגוף המטפל"
              />
            </div>
          )}

          {actionType === "RECEIPT" && (
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                סוג תעודת ספק
              </Text>
              <TextInput
                value={formState.supplier_document_type}
                onChange={(e) =>
                  handleFieldChange("supplier_document_type", e.target.value)
                }
                placeholder="לדוגמה: חשבונית / תעודת משלוח"
              />
            </div>
          )}

          <div className="col-span-full">
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              הערות לתעודה
            </Text>
            <Textarea
              value={formState.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              rows={2}
              placeholder="מידע נוסף שיופיע בתעודה"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <Text className="font-semibold">שורות התעודה</Text>
          <Button variant="secondary" size="sm" onClick={addLine}>
            + הוסף שורה
          </Button>
        </div>

        {isStockAdjust && (
          <Text className="text-sm mb-2" style={{ color: cssVar.text.muted }}>
            הזן את ההפרש לספירת המלאי ובחר אם מדובר בהוספה או הפחתה מהמלאי במחסן.
          </Text>
        )}

        <div className="overflow-x-auto">
          <Table style={{ minWidth: actionType === "TRANSFER" ? 920 : 720 }}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>פריט</TableHeaderCell>
                {actionType === "TRANSFER" && (
                  <TableHeaderCell>מחסן שולח</TableHeaderCell>
                )}
                <TableHeaderCell>
                  {actionType === "DISPOSAL" ? "מחסן מקור" : "מחסן יעד"}
                </TableHeaderCell>
                <TableHeaderCell>כמות</TableHeaderCell>
                {isStockAdjust && <TableHeaderCell>כיוון התאמה</TableHeaderCell>}
                {!hideSupplierDocField && (
                  <TableHeaderCell>מס' מסמך ספק</TableHeaderCell>
                )}
                <TableHeaderCell>פעולות</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formState.lines.map((line, index) => (
                <TableRow key={`document-line-${index}`}>
                  <TableCell>
                    <Select
                      value={line.item_id || undefined}
                      onValueChange={(val) =>
                        handleLineChange(index, "item_id", val || "")
                      }
                      placeholder="בחר פריט"
                    >
                      {itemOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </TableCell>
                  {actionType === "TRANSFER" && (
                    <TableCell>
                      <Select
                        value={line.source_warehouse_id || undefined}
                        onValueChange={(val) =>
                          handleLineChange(
                            index,
                            "source_warehouse_id",
                            val || ""
                          )
                        }
                        placeholder="בחר מחסן"
                      >
                        {warehouseOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </TableCell>
                  )}
                  <TableCell>
                    <Select
                      value={line.target_warehouse_id || undefined}
                      onValueChange={(val) =>
                        handleLineChange(
                          index,
                          "target_warehouse_id",
                          val || ""
                        )
                      }
                      placeholder="—"
                    >
                      {warehouseOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TextInput
                      type="number"
                      value={line.quantity}
                      onChange={(e) =>
                        handleLineChange(index, "quantity", e.target.value)
                      }
                    />
                  </TableCell>
                  {isStockAdjust && (
                    <TableCell>
                      <Select
                        value={line.adjust_direction}
                        onValueChange={(val) =>
                          handleLineChange(
                            index,
                            "adjust_direction",
                            val as InventoryDocumentFormLine["adjust_direction"]
                          )
                        }
                      >
                        {Object.entries(STOCK_ADJUST_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </Select>
                    </TableCell>
                  )}
                  {!hideSupplierDocField && (
                    <TableCell>
                      <TextInput
                        value={line.supplier_document_number}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "supplier_document_number",
                            e.target.value
                          )
                        }
                        placeholder="מס' חשבונית/מסמך"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => duplicateLine(index)}
                        aria-label="שכפל שורה"
                      >
                        📄
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => removeLine(index)}
                        disabled={formState.lines.length === 1}
                        aria-label="מחק שורה"
                      >
                        🗑️
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
