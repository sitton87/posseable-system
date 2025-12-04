"use client";

import { Button, Card } from "@/app/components/ui";
import {
  badgeStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { Warehouse } from "@/type";

type WarehouseManagementCardProps = {
  warehouses: Warehouse[];
  onCreateWarehouse: () => void;
  canCreate?: boolean;
};

export function WarehouseManagementCard({
  warehouses,
  onCreateWarehouse,
  canCreate = true,
}: WarehouseManagementCardProps) {
  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>מחסנים ומיקומים</h3>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: 13 }}>
            ניהול מחסנים כולל פרטי קשר ועלויות שכירות
          </p>
        </div>
        <Button onClick={onCreateWarehouse} disabled={!canCreate}>
          + מחסן חדש
        </Button>
      </div>
      {warehouses.length === 0 ? (
        <div
          style={{
            padding: spacing.lg,
            background: colors.surfaceAlt,
            color: colors.textMuted,
            borderRadius: spacing.sm,
            textAlign: "center",
          }}
        >
          אין מחסנים פעילים במערכת. הוסף מחסן חדש כדי לאפשר קליטת מלאי.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>קוד</th>
                <th style={tableHeaderStyle}>שם</th>
                <th style={tableHeaderStyle}>עיר</th>
                <th style={tableHeaderStyle}>מנהל</th>
                <th style={tableHeaderStyle}>טלפון</th>
                <th style={tableHeaderStyle}>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id}>
                  <td style={tableCellStyle}>{warehouse.code}</td>
                  <td style={tableCellStyle}>{warehouse.name}</td>
                  <td style={tableCellStyle}>{warehouse.city || "—"}</td>
                  <td style={tableCellStyle}>
                    {warehouse.manager_name || warehouse.contact_name || "—"}
                  </td>
                  <td style={tableCellStyle}>
                    {warehouse.manager_phone || warehouse.contact_phone || "—"}
                  </td>
                  <td style={tableCellStyle}>
                    <span
                      style={badgeStyle(
                        warehouse.is_active
                          ? colors.successSoft
                          : colors.dangerSoft,
                        warehouse.is_active ? colors.success : colors.danger
                      )}
                    >
                      {warehouse.is_active ? "פעיל" : "לא פעיל"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
