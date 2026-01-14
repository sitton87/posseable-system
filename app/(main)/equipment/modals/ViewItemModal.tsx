"use client";

import {
  Title,
  Text,
  Button,
  Badge,
  Card,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import type { EquipmentItem } from "@/type";
import { conditionBadgeMap, getConditionLabel, EQUIPMENT_TYPE_LABELS } from "../constants";
import { formatNumber } from "../utils";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ViewItemModalProps = {
  open: boolean;
  item: EquipmentItem | null;
  onClose: () => void;
};

export function ViewItemModal({ open, item, onClose }: ViewItemModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-2xl">
        {item && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <Title>{item.name}</Title>
                <Text className="text-sm mt-1">
                  SKU פנימי: {item.internal_sku || "—"}
                </Text>
              </div>
              <Button variant="secondary" icon={XMarkIcon} onClick={onClose}>
                סגור
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>משפחה</Text>
                <Text>{item.family_name || item.family_code}</Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>קטגוריה</Text>
                <Text>{item.category_name || item.category_code}</Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>מצב</Text>
                <Badge
                  size="sm"
                  style={{
                    background: conditionBadgeMap[item.condition]?.background || cssVar.border.secondary,
                    color: conditionBadgeMap[item.condition]?.color || cssVar.text.primary,
                  }}
                >
                  {getConditionLabel(item.condition)}
                </Badge>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>סוג ציוד</Text>
                <Text>
                  {EQUIPMENT_TYPE_LABELS[item.equipment_type] ||
                    item.equipment_type ||
                    "—"}
                </Text>
              </div>
            </div>

            <Card>
              <Text className="font-semibold mb-2">
                מלאי לפי מחסן
              </Text>
              {(!item.warehouse_stock || item.warehouse_stock.length === 0) && (
                <Text style={{ color: cssVar.text.muted }}>אין נתוני מלאי זמינים</Text>
              )}
              <div className="flex flex-wrap gap-2">
                {(item.warehouse_stock || []).map((stock) => (
                  <Badge
                    key={stock.warehouse_id}
                    size="sm"
                  >
                    {stock.warehouse_name}: {formatNumber(stock.quantity, "0")}
                  </Badge>
                ))}
              </div>
            </Card>

            {item.notes && (
              <div>
                <Text className="text-xs mb-1" style={{ color: cssVar.text.muted }}>
                  הערות
                </Text>
                <Text className="whitespace-pre-wrap">{item.notes}</Text>
              </div>
            )}
          </div>
        )}
      </DialogPanel>
    </Dialog>
  );
}
