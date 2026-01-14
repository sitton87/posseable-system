"use client";

import {
  Title,
  Text,
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
import type { InventoryDocumentDetail } from "../types";
import { formatCurrency, formatDate } from "../utils";

type InventoryDocumentDetailModalProps = {
  open: boolean;
  document: InventoryDocumentDetail | null;
  loading: boolean;
  onClose: () => void;
};

const ACTION_LABELS: Record<string, string> = {
  RECEIPT: "קליטת ספק",
  DONATION: "תרומה נכנסת",
  DISPOSAL: "השמדה",
  TRANSFER: "העברת מלאי",
  ACTIVITY_OUT: "שיוך לפעילות",
  ACTIVITY_RETURN: "החזרת פעילות",
  STOCKTAKE_ADJUST: "התאמת מלאי",
};

export function InventoryDocumentDetailModal({
  open,
  document,
  loading,
  onClose,
}: InventoryDocumentDetailModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title>פרטי תעודת מלאי</Title>
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              צפייה בפרטי התעודה והשורות שנרשמו במסמך.
            </Text>
          </div>
          <Button variant="secondary" onClick={onClose}>
            ✖ סגור
          </Button>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <Text style={{ color: cssVar.text.muted }}>טוען נתונים...</Text>
          </div>
        ) : !document ? (
          <div className="p-6 text-center">
            <Text style={{ color: cssVar.text.muted }}>לא נבחרה תעודה להצגה.</Text>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>מספר תעודה</Text>
                <Text className="font-semibold">{document.document_number}</Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>סוג פעולה</Text>
                <Text>
                  {ACTION_LABELS[document.action_type] || document.action_type}
                </Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>תאריך</Text>
                <Text>{formatDate(document.document_date)}</Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>משתמש מבצע</Text>
                <Text>
                  {document.created_by_name ||
                    document.created_by ||
                    "—"}
                </Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                  ספק / תורם / גורם
                </Text>
                <Text>
                  {document.supplier_name ||
                    document.donor_name ||
                    document.external_party ||
                    document.supplier_identifier ||
                    document.donor_national_id ||
                    "—"}
                </Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>שווי כולל</Text>
                <Text>{formatCurrency(document.total_value)}</Text>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>מחסן מקור</Text>
                <Text>{document.source_warehouse_name || "—"}</Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>מחסן יעד</Text>
                <Text>{document.target_warehouse_name || "—"}</Text>
              </div>
              {document.supplier_document_type && (
                <div>
                  <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                    סוג תעודת ספק
                  </Text>
                  <Text>{document.supplier_document_type}</Text>
                </div>
              )}
            </div>

            {document.notes && (
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>הערות</Text>
                <Text className="whitespace-pre-wrap">{document.notes}</Text>
              </div>
            )}

            <div>
              <Text className="font-semibold mb-2">שורות התעודה</Text>
              {document.lines.length === 0 ? (
                <Card className="p-4 text-center">
                  <Text style={{ color: cssVar.text.muted }}>לא נמצאו שורות לתעודה זו.</Text>
                </Card>
              ) : (
                <div className="overflow-x-auto">
                  <Table style={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>מקט</TableHeaderCell>
                        <TableHeaderCell>פריט</TableHeaderCell>
                        {document.action_type === "TRANSFER" && (
                          <TableHeaderCell>מחסן שולח</TableHeaderCell>
                        )}
                        <TableHeaderCell>מחסן יעד</TableHeaderCell>
                        <TableHeaderCell>כמות</TableHeaderCell>
                        <TableHeaderCell>מס' מסמך</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {document.lines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell>{line.internal_sku || "—"}</TableCell>
                          <TableCell>{line.item_name}</TableCell>
                          {document.action_type === "TRANSFER" && (
                            <TableCell>
                              {line.source_warehouse_name || "—"}
                            </TableCell>
                          )}
                          <TableCell>
                            {line.target_warehouse_name || "—"}
                          </TableCell>
                          <TableCell>
                            {line.quantity?.toLocaleString("he-IL") || "0"}
                          </TableCell>
                          <TableCell>
                            {line.supplier_document_number || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogPanel>
    </Dialog>
  );
}
