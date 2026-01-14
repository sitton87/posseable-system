"use client";

import {
  Card,
  Title,
  Text,
  Badge,
  Button,
  Flex,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { Transaction } from "../types";
import { formatCurrency, formatDate } from "../utils";

type TransactionViewModalProps = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
};

export default function TransactionViewModal({
  open,
  onClose,
  transaction,
}: TransactionViewModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-2xl">
        {/* Header */}
        <Flex justifyContent="between" alignItems="start" className="mb-6 flex-wrap gap-4">
          <Title>פרטי תנועה – {transaction.description}</Title>
          <Button variant="secondary" onClick={onClose}>
            ✕ סגור
          </Button>
        </Flex>

        {/* יסודות */}
        <Card className="mb-4">
          <Text
            className="text-sm font-semibold mb-3 pb-2 border-b"
            style={{ color: cssVar.text.muted, borderColor: cssVar.border.muted }}
          >
            יסודות
          </Text>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>תאריך</Text>
              <Text style={{ color: cssVar.text.primary }}>{formatDate(transaction.transaction_date)}</Text>
            </div>
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>סוג</Text>
              <Badge
                color={transaction.type === "income" ? "emerald" : "rose"}
                size="sm"
                className="mt-1"
              >
                {transaction.type === "income" ? "הכנסה" : "הוצאה"}
              </Badge>
            </div>
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>קטגוריה</Text>
              <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                {transaction.category}
              </Text>
            </div>
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>סכום</Text>
              <Text
                className="font-bold"
                style={{
                  color: transaction.type === "income"
                    ? cssVar.status.success
                    : cssVar.status.danger,
                }}
              >
                {formatCurrency(transaction.amount)}
              </Text>
            </div>
          </div>
          <div className="mt-4">
            <Text className="text-xs" style={{ color: cssVar.text.muted }}>תיאור</Text>
            <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
              {transaction.description}
            </Text>
          </div>
        </Card>

        {/* שיוך לפעילות */}
        <Card className="mb-4">
          <Text
            className="text-sm font-semibold mb-3 pb-2 border-b"
            style={{ color: cssVar.text.muted, borderColor: cssVar.border.muted }}
          >
            שיוך לפעילות
          </Text>
          {transaction.activity_id ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>פעילות</Text>
                <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                  {transaction.activity_kind || `פעילות #${transaction.activity_id}`}
                </Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>תאריך פעילות</Text>
                <Text style={{ color: cssVar.text.primary }}>
                  {formatDate(transaction.activity_date)}
                </Text>
              </div>
              <div>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>עונה</Text>
                <Text style={{ color: cssVar.text.primary }}>
                  {transaction.season_name
                    ? `${transaction.season_name} · ${transaction.season_year ?? ""}`
                    : "—"}
                </Text>
              </div>
            </div>
          ) : (
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              לא משויכת לפעילות
            </Text>
          )}
        </Card>

        {/* פרטי תשלום */}
        <Card className="mb-4">
          <Text
            className="text-sm font-semibold mb-3 pb-2 border-b"
            style={{ color: cssVar.text.muted, borderColor: cssVar.border.muted }}
          >
            פרטי תשלום
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>שולם על ידי</Text>
              <Text style={{ color: cssVar.text.primary }}>{transaction.paid_by || "—"}</Text>
            </div>
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>חשבונית</Text>
              <Text style={{ color: cssVar.text.primary }}>
                {transaction.has_invoice
                  ? transaction.invoice_number
                    ? `#${transaction.invoice_number}`
                    : "קיימת"
                  : "—"}
              </Text>
            </div>
          </div>
          <div className="mt-3">
            <Text className="text-xs" style={{ color: cssVar.text.muted }}>פרטי תשלום</Text>
            <Text className="whitespace-pre-wrap" style={{ color: cssVar.text.secondary }}>
              {transaction.payment_details || "—"}
            </Text>
          </div>
        </Card>

        {/* תורמים משויכים */}
        {transaction.donor_shares?.length ? (
          <Card className="mb-4">
            <Text
              className="text-sm font-semibold mb-3 pb-2 border-b"
              style={{ color: cssVar.text.muted, borderColor: cssVar.border.muted }}
            >
              תורמים משויכים
            </Text>
            <div className="space-y-2">
              {transaction.donor_shares.map((share) => (
                <div
                  key={share.donor_id}
                  className="flex justify-between items-center p-3 rounded-lg border"
                  style={{
                    borderColor: cssVar.border.muted,
                    backgroundColor: cssVar.bg.secondary,
                  }}
                >
                  <div>
                    <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                      {share.donor_name || "—"}
                    </Text>
                    <Text className="text-xs font-mono" style={{ color: cssVar.text.muted }}>
                      {share.donor_id}
                    </Text>
                  </div>
                  <Text className="font-bold" style={{ color: cssVar.text.primary }}>
                    {formatCurrency(share.amount)}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {/* הערות וקובץ */}
        {(transaction.attachment_name && transaction.attachment_data) ||
        transaction.notes ? (
          <Card>
            {transaction.notes && (
              <>
                <Text
                  className="text-sm font-semibold mb-3 pb-2 border-b"
                  style={{ color: cssVar.text.muted, borderColor: cssVar.border.muted }}
                >
                  הערות
                </Text>
                <Text
                  className="whitespace-pre-wrap mb-4"
                  style={{ color: cssVar.text.secondary }}
                >
                  {transaction.notes}
                </Text>
              </>
            )}
            {transaction.attachment_name && transaction.attachment_data && (
              <a
                href={`data:${
                  transaction.attachment_mime || "application/octet-stream"
                };base64,${transaction.attachment_data}`}
                download={transaction.attachment_name}
                style={{ color: cssVar.brand.primary }}
                className="text-sm"
              >
                הורד/י קובץ מצורף ({transaction.attachment_name})
              </a>
            )}
          </Card>
        ) : null}
      </DialogPanel>
    </Dialog>
  );
}
