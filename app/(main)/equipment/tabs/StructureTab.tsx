"use client";

import { Card, Button } from "@/app/components/ui";
import {
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { StructureFormState } from "../types";
import type { Warehouse } from "@/type";
import { WarehouseManagementCard } from "../components/WarehouseManagementCard";

type SummaryEntry = {
  code: string;
  name: string;
  itemCount: number;
  equipment_type?: string | null;
  family_code?: string;
};

type StructureTabProps = {
  familiesWithCounts: SummaryEntry[];
  categoriesWithCounts: SummaryEntry[];
  canEdit: boolean;
  onOpenStructureModal: (mode: StructureFormState["entityType"]) => void;
  warehouses: Warehouse[];
  onCreateWarehouse: () => void;
  onEditWarehouse: (warehouse: Warehouse) => void;
  onManageWarehouse?: (warehouse: Warehouse) => void;
};

const muted = colors.textMuted;

export function StructureTab({
  familiesWithCounts,
  categoriesWithCounts,
  canEdit,
  onOpenStructureModal,
  warehouses,
  onCreateWarehouse,
  onEditWarehouse,
  onManageWarehouse,
}: StructureTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
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
          <h3 style={{ margin: 0 }}>ניהול משפחות וקטגוריות</h3>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            לא ניתן למחוק או לעדכן מבנים אליהם מקושרים פריטים פעילים
          </p>
        </div>
        <Button
          onClick={() => onOpenStructureModal("family")}
          disabled={!canEdit}
        >
          + משפחה / קטגוריה חדשה
        </Button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: spacing.md,
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>משפחות קיימות</h4>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.sm,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            <table style={{ ...tableStyle, margin: 0 }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>קוד</th>
                  <th style={tableHeaderStyle}>שם</th>
                  <th style={tableHeaderStyle}>סוג ציוד</th>
                  <th style={tableHeaderStyle}>פריטים</th>
                </tr>
              </thead>
              <tbody>
                {familiesWithCounts.map((family) => (
                  <tr key={family.code}>
                    <td style={tableCellStyle}>{family.code}</td>
                    <td style={tableCellStyle}>{family.name}</td>
                    <td style={tableCellStyle}>
                      {family.equipment_type === "sea"
                        ? "ציוד ים"
                        : family.equipment_type === "support"
                        ? "ציוד מסייע"
                        : "—"}
                    </td>
                    <td style={tableCellStyle}>{family.itemCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>קטגוריות קיימות</h4>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.sm,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            <table style={{ ...tableStyle, margin: 0 }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>משפחה</th>
                  <th style={tableHeaderStyle}>קוד</th>
                  <th style={tableHeaderStyle}>שם</th>
                  <th style={tableHeaderStyle}>פריטים</th>
                </tr>
              </thead>
              <tbody>
                {categoriesWithCounts.map((category) => (
                  <tr
                    key={`${category.family_code}-${category.code}`}
                  >
                    <td style={tableCellStyle}>{category.family_code}</td>
                    <td style={tableCellStyle}>{category.code}</td>
                    <td style={tableCellStyle}>{category.name}</td>
                    <td style={tableCellStyle}>{category.itemCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </Card>

      <WarehouseManagementCard
        warehouses={warehouses}
        onCreateWarehouse={onCreateWarehouse}
        onEditWarehouse={onEditWarehouse}
        onManageWarehouse={onManageWarehouse}
        canCreate={canEdit}
        canEditDetails={canEdit}
        canManage={canEdit}
      />
    </div>
  );
}

