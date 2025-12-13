"use client";

import { Button, Modal } from "@/app/components/ui";
import { colors, radii, spacing } from "@/app/styles/foundations";
import { Transaction } from "../types";
import {
  formatCurrency,
  formatDate,
  muted,
  sectionBoxStyle,
  typePillStyle,
} from "../utils";

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
    <Modal
      open={open}
      onClose={onClose}
      width="min(700px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.md,
          gap: spacing.md,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
          פרטי תנועה – {transaction.description}
        </h3>
        <Button
          variant="secondary"
          onClick={onClose}
          type="button"
        >
          ✕ סגור
        </Button>
      </div>

      <div style={{ ...sectionBoxStyle, background: colors.surface }}>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: 14,
            color: muted,
            borderBottom: `2px solid ${colors.borderMuted}`,
            paddingBottom: spacing.xs,
          }}
        >
          יסודות
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: muted }}>תאריך</div>
            <div>{formatDate(transaction.transaction_date)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>סוג</div>
            <span
              style={{
                ...typePillStyle(transaction.type),
                marginTop: spacing.xs,
              }}
            >
              {transaction.type === "income" ? "הכנסה" : "הוצאה"}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>קטגוריה</div>
            <div style={{ fontWeight: 600 }}>{transaction.category}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>סכום</div>
            <div
              style={{
                fontWeight: 700,
                color:
                  transaction.type === "income"
                    ? colors.success
                    : colors.danger,
              }}
            >
              {formatCurrency(transaction.amount)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: spacing.md }}>
          <div style={{ fontSize: 12, color: muted }}>תיאור</div>
          <div style={{ fontWeight: 600 }}>{transaction.description}</div>
        </div>
      </div>

      <div style={{ ...sectionBoxStyle, background: colors.surface }}>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: 14,
            color: muted,
            borderBottom: `2px solid ${colors.borderMuted}`,
            paddingBottom: spacing.xs,
          }}
        >
          שיוך לפעילות
        </h4>
        {transaction.activity_id ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: muted }}>פעילות</div>
              <div style={{ fontWeight: 600 }}>
                {transaction.activity_kind ||
                  `פעילות #${transaction.activity_id}`}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>תאריך פעילות</div>
              <div>{formatDate(transaction.activity_date)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>עונה</div>
              <div>
                {transaction.season_name
                  ? `${transaction.season_name} · ${
                      transaction.season_year ?? ""
                    }`
                  : "—"}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: muted }}>לא משויכת לפעילות</div>
        )}
      </div>

      <div style={{ ...sectionBoxStyle, background: colors.surface }}>
        <h4
          style={{
            margin: "0 0 12px 0",
            fontSize: 14,
            color: muted,
            borderBottom: `2px solid ${colors.borderMuted}`,
            paddingBottom: spacing.xs,
          }}
        >
          פרטי תשלום
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: muted }}>שולם על ידי</div>
            <div>{transaction.paid_by || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>חשבונית</div>
            <div>
              {transaction.has_invoice
                ? transaction.invoice_number
                  ? `#${transaction.invoice_number}`
                  : "קיימת"
                : "—"}
            </div>
          </div>
        </div>
        <div style={{ marginTop: spacing.sm }}>
          <div style={{ fontSize: 12, color: muted }}>פרטי תשלום</div>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {transaction.payment_details || "—"}
          </div>
        </div>
      </div>

      {transaction.donor_shares?.length ? (
        <div style={{ ...sectionBoxStyle, background: colors.surface }}>
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: 14,
              color: muted,
              borderBottom: `2px solid ${colors.borderMuted}`,
              paddingBottom: spacing.xs,
            }}
          >
            תורמים משויכים
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            {transaction.donor_shares.map((share) => (
              <div
                key={share.donor_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: spacing.sm,
                  borderRadius: radii.card,
                  border: `1px solid ${colors.borderMuted}`,
                  background: colors.surfaceAlt,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {share.donor_name || "—"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: muted,
                      fontFamily: "monospace",
                    }}
                  >
                    {share.donor_id}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>
                  {formatCurrency(share.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {(transaction.attachment_name && transaction.attachment_data) ||
      transaction.notes ? (
        <div style={{ ...sectionBoxStyle, background: colors.surface }}>
          {transaction.notes && (
            <>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  color: muted,
                  borderBottom: `2px solid ${colors.borderMuted}`,
                  paddingBottom: spacing.xs,
                }}
              >
                הערות
              </h4>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  marginBottom: transaction.attachment_name ? spacing.md : 0,
                }}
              >
                {transaction.notes}
              </div>
            </>
          )}
          {transaction.attachment_name && transaction.attachment_data && (
            <a
              href={`data:${
                transaction.attachment_mime || "application/octet-stream"
              };base64,${transaction.attachment_data}`}
              download={transaction.attachment_name}
              style={{ color: colors.accent, fontSize: 13 }}
            >
              הורד/י קובץ מצורף ({transaction.attachment_name})
            </a>
          )}
        </div>
      ) : null}
    </Modal>
  );
}

