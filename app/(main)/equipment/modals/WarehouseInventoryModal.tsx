"use client";

import { useMemo, useState } from "react";
import {
  Title,
  Text,
  TextInput,
  Textarea,
  Select,
  SelectItem,
  Button,
  Card,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
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
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-4xl">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <Title>ניהול מלאי · {warehouseName}</Title>
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              צפייה בפריטים במחסן והעברה בין מחסנים.
            </Text>
          </div>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענון
          </Button>
        </div>

        <div className="mt-4">
          <Text className="font-semibold mb-2">פריטים במחסן</Text>
          {loading ? (
            <Card className="p-6 text-center">
              <Text style={{ color: cssVar.text.muted }}>טוען נתונים...</Text>
            </Card>
          ) : stock.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <Text style={{ color: cssVar.text.muted }}>אין מלאי משויך למחסן זה.</Text>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>פריט</TableHeaderCell>
                    <TableHeaderCell>מצב</TableHeaderCell>
                    <TableHeaderCell>סוג</TableHeaderCell>
                    <TableHeaderCell>כמות</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stock.map((entry) => (
                    <TableRow key={`${entry.item_id}-${entry.warehouse_id}`}>
                      <TableCell>{entry.item_name}</TableCell>
                      <TableCell>{entry.condition}</TableCell>
                      <TableCell>
                        {entry.equipment_type === "sea" ? "ציוד ים" : "ציוד מסייע"}
                      </TableCell>
                      <TableCell>{entry.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <Card className="mt-6">
          <Text className="font-semibold mb-3">העברת מלאי למחסן אחר</Text>
          <div className="flex flex-col gap-3">
            <Select
              value={transferForm.itemId || undefined}
              onValueChange={(val) =>
                setTransferForm((prev) => ({ ...prev, itemId: val || "" }))
              }
              placeholder="בחר פריט מקור"
              disabled={!canEdit || !availableTransferItems.length}
            >
              {availableTransferItems.map((entry) => (
                <SelectItem key={entry.item_id} value={entry.item_id}>
                  {entry.item_name} · כמות: {entry.quantity}
                </SelectItem>
              ))}
            </Select>
            <TextInput
              type="number"
              placeholder="כמות להעברה"
              disabled={!canEdit}
              value={transferForm.quantity}
              onChange={(e) =>
                setTransferForm((prev) => ({ ...prev, quantity: e.target.value }))
              }
            />
            <Select
              value={transferForm.targetWarehouseId || undefined}
              onValueChange={(val) =>
                setTransferForm((prev) => ({ ...prev, targetWarehouseId: val || "" }))
              }
              placeholder="בחר מחסן יעד"
              disabled={!canEdit}
            >
              {targetWarehouseOptions.map((target) => (
                <SelectItem key={target.id} value={target.id}>
                  {target.name}
                </SelectItem>
              ))}
            </Select>
            <Textarea
              placeholder="הערות (לא חובה)"
              disabled={!canEdit}
              value={transferForm.note}
              onChange={(e) =>
                setTransferForm((prev) => ({ ...prev, note: e.target.value }))
              }
              rows={2}
            />
            <Button
              onClick={handleTransferSubmit}
              disabled={!canEdit || transferForm.submitting}
            >
              {transferForm.submitting ? "מעביר..." : "העבר למחסן אחר"}
            </Button>
          </div>
          <Text className="text-xs mt-3" style={{ color: cssVar.text.muted }}>
            להוספת מלאי השתמשו במסך &quot;קליטת מלאי חדשה&quot;.
          </Text>
        </Card>
      </DialogPanel>
    </Dialog>
  );
}
