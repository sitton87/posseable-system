"use client";

import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Button,
  Flex,
} from "@tremor/react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { cssVar } from "@/app/styles/design-system";
import { Transaction } from "../types";

type TransactionTableProps = {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};

export default function TransactionTable({
  transactions,
  onView,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="text-center">תאריך</TableHeaderCell>
            <TableHeaderCell className="text-center">סוג</TableHeaderCell>
            <TableHeaderCell className="text-center">קטגוריה</TableHeaderCell>
            <TableHeaderCell className="text-center">פעילות משויכת</TableHeaderCell>
            <TableHeaderCell className="text-center">תיאור</TableHeaderCell>
            <TableHeaderCell className="text-center">סכום</TableHeaderCell>
            <TableHeaderCell className="text-center">פעולות</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((t) => (
            <TableRow
              key={t.id}
              className="transition-colors hover:bg-tremor-background-subtle"
            >
              <TableCell className="text-center text-sm" style={{ color: cssVar.text.muted }}>
                {new Date(t.transaction_date).toLocaleDateString("he-IL")}
              </TableCell>
              <TableCell className="text-center">
                <Badge color={t.type === "income" ? "emerald" : "rose"} size="sm">
                  {t.type === "income" ? "הכנסה" : "הוצאה"}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-sm">
                {t.category}
              </TableCell>
              <TableCell className="text-center text-sm">
                {t.activity_id ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">
                      {t.activity_kind || `פעילות #${t.activity_id}`}
                    </span>
                    <span className="text-xs" style={{ color: cssVar.text.muted }}>
                      {t.activity_date
                        ? new Date(t.activity_date).toLocaleDateString("he-IL")
                        : "—"}
                      {t.season_name ? ` · ${t.season_name}` : ""}
                    </span>
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="font-semibold">{t.description}</div>
                <div className="text-xs mt-1" style={{ color: cssVar.text.muted }}>
                  {t.paid_by && (
                    <span className="block">שולמה ע"י: {t.paid_by}</span>
                  )}
                  {t.has_invoice && (
                    <span className="block">
                      חשבונית {t.invoice_number ? `#${t.invoice_number}` : "✓"}
                    </span>
                  )}
                  {t.attachment_name && t.attachment_data && (
                    <a
                      href={`data:${
                        t.attachment_mime || "application/octet-stream"
                      };base64,${t.attachment_data}`}
                      download={t.attachment_name}
                      style={{ color: cssVar.brand.primary }}
                      className="text-xs"
                    >
                      הורדת קובץ
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell
                className="text-center font-bold text-lg"
                style={{
                  color: t.type === "income" ? cssVar.status.success : cssVar.status.danger,
                }}
              >
                {t.type === "income" ? "+" : "-"}₪{t.amount.toLocaleString()}
              </TableCell>
              <TableCell>
                <Flex justifyContent="center" className="gap-2">
                  <Button
                    size="xs"
                    variant="secondary"
                    color="indigo"
                    icon={EyeIcon}
                    onClick={() => onView(t)}
                    tooltip="צפייה"
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                  />
                  <Button
                    size="xs"
                    variant="secondary"
                    color="blue"
                    icon={PencilIcon}
                    onClick={() => onEdit(t)}
                    tooltip="עריכה"
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                  />
                  <Button
                    size="xs"
                    variant="secondary"
                    color="rose"
                    icon={TrashIcon}
                    onClick={() => onDelete(t.id)}
                    tooltip="מחיקה"
                    className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
                  />
                </Flex>
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-10"
                style={{ color: cssVar.text.muted }}
              >
                אין תנועות במערכת. לחץ על "הוסף תנועה" להתחיל.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
