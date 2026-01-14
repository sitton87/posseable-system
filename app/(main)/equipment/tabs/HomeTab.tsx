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
import { StatCardGrid } from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";
import type { EquipmentItem, Warehouse } from "@/type";
import type { InventoryDocumentSummary, StatSummary } from "../types";
import { getConditionLabel } from "../constants";
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "../utils";

type HomeTabProps = {
  items: EquipmentItem[];
  warehouses: Warehouse[];
  documents: InventoryDocumentSummary[];
  documentsLoading: boolean;
  statSummary: StatSummary;
  onNavigate: (tab: "catalog" | "inventory" | "structure") => void;
};

const ACTION_LABELS: Record<string, string> = {
  RECEIPT: "קליטת ספק",
  DONATION: "תרומה נכנסת",
  DISPOSAL: "השמדה",
  TRANSFER: "העברת מלאי",
  STOCKTAKE_ADJUST: "התאמת מלאי",
};

export function HomeTab({
  items,
  warehouses,
  documents,
  documentsLoading,
  statSummary,
  onNavigate,
}: HomeTabProps) {
  const activeWarehouses = warehouses.filter((warehouse) => warehouse.is_active);
  const repairItems = items
    .filter((item) => item.condition === "damaged")
    .slice(0, 5);
  const recentDocuments = documents.slice(0, 5);

  const statCards = [
    {
      label: "סה\"כ פריטים",
      value: formatNumber(statSummary.totalItems, "0"),
      hint: "כולל פריטים פעילים ולא פעילים",
    },
    {
      label: "סה\"כ יחידות במלאי",
      value: formatNumber(statSummary.totalUnits, "0"),
      hint: "היקף מלאי מדיווחים אחרונים",
    },
    {
      label: "פריטים בהשכרה",
      value: formatNumber(statSummary.rentals, "0"),
      hint: "כולל פריטים מסומנים להשכרה",
    },
    {
      label: "פריטים מתכלים",
      value: formatNumber(statSummary.consumables, "0"),
      hint: "פריטים עם מלאי מינימלי",
    },
    {
      label: "מחסנים פעילים",
      value: formatNumber(activeWarehouses.length, "0"),
      hint: "מחסנים הזמינים לקליטת מלאי",
    },
  ];

  return (
    <div className="flex flex-col gap-ds-spacing-5">
      <StatCardGrid stats={statCards} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-spacing-5">
        <Card className="p-ds-spacing-4">
          <div className="flex justify-between items-center mb-ds-spacing-3">
            <div>
              <Title>פריטים בתיקון</Title>
              <Text className="text-sm mt-1">
                מעקב אחרי פריטים במצב "דורש תיקון".
              </Text>
            </div>
            <Button
              variant="secondary"
              onClick={() => onNavigate("catalog")}
            >
              כל הפריטים
            </Button>
          </div>
          {repairItems.length === 0 ? (
            <div className="p-ds-spacing-4 text-center" style={{ color: cssVar.text.muted }}>
              אין פריטים שמסומנים לתיקון כרגע.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>מקט</TableHeaderCell>
                  <TableHeaderCell>פריט</TableHeaderCell>
                  <TableHeaderCell>ספק</TableHeaderCell>
                  <TableHeaderCell>סטטוס</TableHeaderCell>
                  <TableHeaderCell>תאריך יעד</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {repairItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.internal_sku || "—"}</TableCell>
                    <TableCell>
                      {item.name}
                      {item.supplier_name && (
                        <Text className="text-xs mt-0.5">
                          ספק: {item.supplier_name}
                        </Text>
                      )}
                    </TableCell>
                    <TableCell>{item.supplier_name || "—"}</TableCell>
                    <TableCell>
                      {getConditionLabel(item.condition)}
                    </TableCell>
                    <TableCell>
                      {item.updated_at
                        ? formatDate(item.updated_at.toString())
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="p-ds-spacing-4">
          <div className="flex justify-between items-center mb-ds-spacing-3">
            <div>
              <Title>תעודות מלאי אחרונות</Title>
              <Text className="text-sm mt-1">
                חמש התעודות האחרונות שנרשמו במערכת.
              </Text>
            </div>
            <Button
              variant="secondary"
              onClick={() => onNavigate("inventory")}
            >
              ניהול מלאי
            </Button>
          </div>
          {documentsLoading ? (
            <div className="p-ds-spacing-4 text-center" style={{ color: cssVar.text.muted }}>
              טוען תעודות...
            </div>
          ) : recentDocuments.length === 0 ? (
            <div className="p-ds-spacing-4 text-center" style={{ color: cssVar.text.muted }}>
              אין תעודות להצגה.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>מספר תעודה</TableHeaderCell>
                  <TableHeaderCell>סוג פעולה</TableHeaderCell>
                  <TableHeaderCell>משתמש</TableHeaderCell>
                  <TableHeaderCell>ערך כספי</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentDocuments.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {entry.document_number}
                    </TableCell>
                    <TableCell>
                      {ACTION_LABELS[entry.action_type] ||
                        entry.action_type}
                    </TableCell>
                    <TableCell>
                      {entry.created_by_name || entry.created_by || "—"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(entry.total_value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
