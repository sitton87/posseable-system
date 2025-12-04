"use client";

import { Modal, Button } from "@/app/components/ui";
import { badgeStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { EquipmentItem } from "@/type";
import { conditionBadgeMap, getConditionLabel, EQUIPMENT_TYPE_LABELS } from "../constants";
import { formatNumber } from "../utils";

type ViewItemModalProps = {
  open: boolean;
  item: EquipmentItem | null;
  onClose: () => void;
};

export function ViewItemModal({ open, item, onClose }: ViewItemModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(720px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      {item && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing.md,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>{item.name}</h3>
              <div style={{ color: colors.textMuted, fontSize: 13 }}>
                SKU פנימי: {item.internal_sku || "—"}
              </div>
            </div>
            <Button variant="secondary" onClick={onClose}>
              ✖ סגור
            </Button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>משפחה</div>
              <div>{item.family_name || item.family_code}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>קטגוריה</div>
              <div>{item.category_name || item.category_code}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>מצב</div>
              <span
                style={badgeStyle(
                  conditionBadgeMap[item.condition]?.background ||
                    colors.borderMuted,
                  conditionBadgeMap[item.condition]?.color ||
                    colors.textPrimary
                )}
              >
                {getConditionLabel(item.condition)}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>סוג ציוד</div>
              <div>
                {EQUIPMENT_TYPE_LABELS[item.equipment_type] ||
                  item.equipment_type ||
                  "—"}
              </div>
            </div>
          </div>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.sm,
              padding: spacing.md,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: spacing.xs }}>
              מלאי לפי מחסן
            </div>
            {(!item.warehouse_stock || item.warehouse_stock.length === 0) && (
              <div style={{ color: colors.textMuted }}>אין נתוני מלאי זמינים</div>
            )}
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: spacing.xs }}
            >
              {(item.warehouse_stock || []).map((stock) => (
                <span
                  key={stock.warehouse_id}
                  style={badgeStyle(colors.surfaceAlt, colors.textPrimary)}
                >
                  {stock.warehouse_name}: {formatNumber(stock.quantity, "0")}
                </span>
              ))}
            </div>
          </div>
          {item.notes && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                }}
              >
                הערות
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{item.notes}</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

