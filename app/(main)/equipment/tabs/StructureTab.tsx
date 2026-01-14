"use client";

import {
  Card,
  Title,
  Text,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import type { StructureFormState } from "../types";
import type { Warehouse } from "@/type";
import { WarehouseManagementCard } from "../components/WarehouseManagementCard";
import { PlusIcon } from "@heroicons/react/24/outline";

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
    <div className="flex flex-col gap-ds-spacing-5">
      <Card>
        <div className="flex justify-between items-center flex-wrap gap-ds-spacing-2 mb-ds-spacing-4">
          <div>
            <Title>ניהול משפחות וקטגוריות</Title>
            <Text className="mt-1">
              לא ניתן למחוק או לעדכן מבנים אליהם מקושרים פריטים פעילים
            </Text>
          </div>
          <Button
            icon={PlusIcon}
            onClick={() => onOpenStructureModal("family")}
            disabled={!canEdit}
          >
            משפחה / קטגוריה חדשה
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-spacing-4">
          <div>
            <Text className="font-semibold mb-2">משפחות קיימות</Text>
            <div className="border rounded-lg max-h-[260px] overflow-y-auto" style={{ borderColor: cssVar.border.primary }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>קוד</TableHeaderCell>
                    <TableHeaderCell>שם</TableHeaderCell>
                    <TableHeaderCell>סוג ציוד</TableHeaderCell>
                    <TableHeaderCell>פריטים</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {familiesWithCounts.map((family) => (
                    <TableRow key={family.code}>
                      <TableCell>{family.code}</TableCell>
                      <TableCell>{family.name}</TableCell>
                      <TableCell>
                        {family.equipment_type === "sea"
                          ? "ציוד ים"
                          : family.equipment_type === "support"
                          ? "ציוד מסייע"
                          : "—"}
                      </TableCell>
                      <TableCell>{family.itemCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <Text className="font-semibold mb-2">קטגוריות קיימות</Text>
            <div className="border rounded-lg max-h-[260px] overflow-y-auto" style={{ borderColor: cssVar.border.primary }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>משפחה</TableHeaderCell>
                    <TableHeaderCell>קוד</TableHeaderCell>
                    <TableHeaderCell>שם</TableHeaderCell>
                    <TableHeaderCell>פריטים</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoriesWithCounts.map((category) => (
                    <TableRow key={`${category.family_code}-${category.code}`}>
                      <TableCell>{category.family_code}</TableCell>
                      <TableCell>{category.code}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.itemCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
