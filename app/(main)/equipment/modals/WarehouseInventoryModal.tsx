"use client";

import { useMemo, useState } from "react";
import { Modal, Button } from "@/app/components/ui";
import {
  inputStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { Warehouse } from "@/type";
import type { WarehouseStockEntry } from "../types";

type WarehouseInventoryModalProps = {
  open: boolean;
  warehouse: Warehouse | null;
  stock: WarehouseStockEntry[];
  loading: boolean;
  warehouses: Warehouse[];
  onClose: () => void;
  onRefresh: () => void;
  onTransferStock: (payload: {
    itemId: string;
    quantity: number;
    targetWarehouseId: string;
    note?: string;
  }) => Promise<void>;
  canEdit: boolean;
};

const muted = colors.textMuted;

export function WarehouseInventoryModal({
  open,
  warehouse,
  stock,
  loading,
  warehouses,
  onClose,
  onRefresh,
  onTransferStock,
  canEdit,
}: WarehouseInventoryModalProps) {
  const [transferForm, setTransferForm] = useState({
    itemId: "",
    quantity: "",
    targetWarehouseId: "",
    note: "",
    submitting: false,
  });

  const availableTransferItems = useMemo(
    () => stock.filter((entry) => entry.quantity > 0),
    [stock]
  );
  const targetWarehouseOptions = useMemo(
    () => warehouses.filter((w) => w.id !== warehouse?.id && w.is_active),
    [warehouses, warehouse?.id]
  );

  const handleTransferSubmit = async () => {
    if (!canEdit || !warehouse) return;
    if (!transferForm.itemId || !transferForm.quantity || !transferForm.targetWarehouseId) {
      alert("בחר פריט, כמות ומחסן יעד להעברה.");
      return;
    }
    const quantity = Number(transferForm.quantity);
    if (Number.isNaN(quantity) || quantity <= 0) {
      alert("כמות חייבת להיות מספר חיובי.");
      return;
    }
    const sourceEntry = stock.find((entry) => entry.item_id === transferForm.itemId);
    if (!sourceEntry || sourceEntry.quantity < quantity) {
      alert("אין מספיק מלאי להעברה.");
      return;
    }
    try {
      setTransferForm((prev) => ({ ...prev, submitting: true }));
      await onTransferStock({
        itemId: transferForm.itemId,
        quantity,
        targetWarehouseId: transferForm.targetWarehouseId,
        note: transferForm.note?.trim() || undefined,
      });
      setTransferForm({
        itemId: "",
        quantity: "",
        targetWarehouseId: "",
        note: "",
        submitting: false,
      });
      onRefresh();
    } catch (err: any) {
      console.error("Error transferring stock:", err);
      alert(err?.message || "שגיאה בהעברת מלאי.");
    } finally {
      setTransferForm((prev) => ({ ...prev, submitting: false }));
    }
  };

  const warehouseName = warehouse?.name || "מחסן";

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(900px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: spacing.sm,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>ניהול מלאי · {warehouseName}</h3>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            צפייה בפריטים במחסן והעברה בין מחסנים.
          </p>
        </div>
        <Button variant="secondary" onClick={onRefresh} disabled={loading}>
          רענון
        </Button>
      </div>

      <div style={{ marginTop: spacing.md }}>
        <h4 style={{ marginBottom: spacing.xs }}>פריטים במחסן</h4>
        {loading ? (
          <div
            style={{
              padding: spacing.lg,
              textAlign: "center",
              color: muted,
            }}
          >
            טוען נתונים...
          </div>
        ) : stock.length === 0 ? (
          <div
            style={{
              padding: spacing.lg,
              textAlign: "center",
              color: muted,
              border: `1px dashed ${colors.border}`,
              borderRadius: spacing.sm,
            }}
          >
            אין מלאי משויך למחסן זה.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>פריט</th>
                  <th style={tableHeaderStyle}>מצב</th>
                  <th style={tableHeaderStyle}>סוג</th>
                  <th style={tableHeaderStyle}>כמות</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((entry) => (
                  <tr key={`${entry.item_id}-${entry.warehouse_id}`}>
                    <td style={tableCellStyle}>{entry.item_name}</td>
                    <td style={tableCellStyle}>{entry.condition}</td>
                    <td style={tableCellStyle}>
                      {entry.equipment_type === "sea" ? "ציוד ים" : "ציוד מסייע"}
                    </td>
                    <td style={tableCellStyle}>{entry.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: spacing.xl }}>
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: spacing.sm,
            padding: spacing.md,
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm,
          }}
        >
          <h4 style={{ margin: 0 }}>העברת מלאי למחסן אחר</h4>
          <select
            style={inputStyle}
            value={transferForm.itemId}
            disabled={!canEdit || !availableTransferItems.length}
            onChange={(e) =>
              setTransferForm((prev) => ({ ...prev, itemId: e.target.value }))
            }
          >
            <option value="">בחר פריט מקור</option>
            {availableTransferItems.map((entry) => (
              <option key={entry.item_id} value={entry.item_id}>
                {entry.item_name} · כמות: {entry.quantity}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            style={inputStyle}
            disabled={!canEdit}
            value={transferForm.quantity}
            onChange={(e) =>
              setTransferForm((prev) => ({ ...prev, quantity: e.target.value }))
            }
            placeholder="כמות להעברה"
          />
          <select
            style={inputStyle}
            value={transferForm.targetWarehouseId}
            disabled={!canEdit}
            onChange={(e) =>
              setTransferForm((prev) => ({ ...prev, targetWarehouseId: e.target.value }))
            }
          >
            <option value="">בחר מחסן יעד</option>
            {targetWarehouseOptions.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name}
              </option>
            ))}
          </select>
          <textarea
            style={{ ...inputStyle, minHeight: 70 }}
            disabled={!canEdit}
            value={transferForm.note}
            onChange={(e) => setTransferForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="הערות (לא חובה)"
          />
          <Button
            onClick={handleTransferSubmit}
            disabled={!canEdit || transferForm.submitting}
          >
            {transferForm.submitting ? "מעביר..." : "העבר למחסן אחר"}
          </Button>
        </div>
        <p style={{ color: muted, fontSize: 12, marginTop: spacing.sm }}>
          להוספת מלאי השתמשו במסך &quot;קליטת מלאי חדשה&quot;.
        </p>
      </div>
    </Modal>
  );
}

