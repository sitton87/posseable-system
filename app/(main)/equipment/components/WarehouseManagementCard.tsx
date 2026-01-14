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
  Badge,
} from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { formatPhoneNumber } from "@/lib/utils/format";
import { formatCurrency } from "../utils";
import type { Warehouse } from "@/type";
import { PlusIcon, PencilIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

type WarehouseManagementCardProps = {
  warehouses: Warehouse[];
  onCreateWarehouse: () => void;
  canCreate?: boolean;
  onManageWarehouse?: (warehouse: Warehouse) => void;
  canManage?: boolean;
  onEditWarehouse?: (warehouse: Warehouse) => void;
  canEditDetails?: boolean;
};

export function WarehouseManagementCard({
  warehouses,
  onCreateWarehouse,
  canCreate = true,
  onManageWarehouse,
  canManage = true,
  onEditWarehouse,
  canEditDetails = true,
}: WarehouseManagementCardProps) {
  const showActions = Boolean(onManageWarehouse || onEditWarehouse);

  return (
    <Card>
      <div className="flex justify-between items-center flex-wrap gap-ds-spacing-2 mb-ds-spacing-4">
        <div>
          <Title>מחסנים ומיקומים</Title>
          <Text className="mt-1">
            ניהול מחסנים כולל פרטי קשר ועלויות שכירות
          </Text>
        </div>
        <Button icon={PlusIcon} onClick={onCreateWarehouse} disabled={!canCreate}>
          מחסן חדש
        </Button>
      </div>

      {warehouses.length === 0 ? (
        <div className="p-5 rounded-lg text-center" style={{ backgroundColor: cssVar.bg.secondary, color: cssVar.text.muted }}>
          אין מחסנים פעילים במערכת. הוסף מחסן חדש כדי לאפשר קליטת מלאי.
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>קוד</TableHeaderCell>
              <TableHeaderCell>שם</TableHeaderCell>
              <TableHeaderCell>עיר</TableHeaderCell>
              <TableHeaderCell>מנהל</TableHeaderCell>
              <TableHeaderCell>טלפון</TableHeaderCell>
              <TableHeaderCell>סטטוס</TableHeaderCell>
              <TableHeaderCell>שווי מלאי</TableHeaderCell>
              {showActions && (
                <TableHeaderCell className="text-center">
                  פעולות
                </TableHeaderCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell>{warehouse.code}</TableCell>
                <TableCell>{warehouse.name}</TableCell>
                <TableCell>{warehouse.city || "—"}</TableCell>
                <TableCell>
                  {warehouse.manager_name || warehouse.contact_name || "—"}
                </TableCell>
                <TableCell>
                  {formatPhoneNumber(
                    warehouse.manager_phone || warehouse.contact_phone || ""
                  )}
                </TableCell>
                <TableCell>
                  <Badge color={warehouse.is_active ? "emerald" : "gray"} size="sm">
                    {warehouse.is_active ? "פעיל" : "לא פעיל"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatCurrency(warehouse.total_value)}
                </TableCell>
                {showActions && (
                  <TableCell className="text-center">
                    <div className="inline-flex gap-1 flex-wrap justify-center">
                      {onManageWarehouse && (
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Cog6ToothIcon}
                          onClick={() => onManageWarehouse(warehouse)}
                          disabled={!canManage}
                        >
                          ניהול מלאי
                        </Button>
                      )}
                      {onEditWarehouse && (
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={PencilIcon}
                          onClick={() => onEditWarehouse(warehouse)}
                          disabled={!canEditDetails}
                        >
                          עריכת פרטים
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
