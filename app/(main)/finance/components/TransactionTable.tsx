"use client";

import { Button, Card } from "@/app/components/ui";
import { colors } from "@/app/styles/foundations";
import { Transaction } from "../types";
import { muted, smallButtonStyle, typePillStyle } from "../utils";

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
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 8px",
          }}
        >
          <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
            <tr style={{ color: muted, fontSize: 13 }}>
              <th style={{ textAlign: "center", padding: 8 }}>תאריך</th>
              <th style={{ textAlign: "center", padding: 8 }}>סוג</th>
              <th style={{ textAlign: "center", padding: 8 }}>קטגוריה</th>
              <th style={{ textAlign: "center", padding: 8 }}>פעילות משויכת</th>
              <th style={{ textAlign: "center", padding: 8 }}>תיאור</th>
              <th style={{ textAlign: "center", padding: 8 }}>סכום</th>
              <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
              >
                <td
                  style={{
                    padding: 8,
                    fontSize: 13,
                    color: muted,
                    textAlign: "center",
                  }}
                >
                  {new Date(t.transaction_date).toLocaleDateString("he-IL")}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <span style={typePillStyle(t.type)}>
                    {t.type === "income" ? "הכנסה" : "הוצאה"}
                  </span>
                </td>
                <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                  {t.category}
                </td>
                <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                  {t.activity_id ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {t.activity_kind || `פעילות #${t.activity_id}`}
                      </span>
                      <span style={{ fontSize: 12, color: muted }}>
                        {t.activity_date
                          ? new Date(t.activity_date).toLocaleDateString(
                              "he-IL"
                            )
                          : "—"}
                        {t.season_name ? ` · ${t.season_name}` : ""}
                      </span>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td
                  style={{ padding: 8, fontWeight: 600, textAlign: "center" }}
                >
                  <div>{t.description}</div>
                  <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>
                    {t.paid_by && (
                      <span style={{ display: "block" }}>
                        שולמה ע"י: {t.paid_by}
                      </span>
                    )}
                    {t.has_invoice && (
                      <span style={{ display: "block" }}>
                        חשבונית{" "}
                        {t.invoice_number ? `#${t.invoice_number}` : "✓"}
                      </span>
                    )}
                    {t.attachment_name && t.attachment_data && (
                      <a
                        href={`data:${
                          t.attachment_mime || "application/octet-stream"
                        };base64,${t.attachment_data}`}
                        download={t.attachment_name}
                        style={{ color: colors.accent, fontSize: 12 }}
                      >
                        הורדת קובץ
                      </a>
                    )}
                  </div>
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: 8,
                    fontWeight: 700,
                    fontSize: 16,
                    color: t.type === "income" ? colors.success : colors.danger,
                  }}
                >
                  {t.type === "income" ? "+" : "-"}₪
                  {t.amount.toLocaleString()}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <Button
                    variant="secondary"
                    style={{ ...smallButtonStyle, marginLeft: 4 }}
                    onClick={() => onView(t)}
                  >
                    👁️
                  </Button>
                  <Button
                    variant="secondary"
                    style={{ ...smallButtonStyle, marginLeft: 4 }}
                    onClick={() => onEdit(t)}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="secondary"
                    style={{ ...smallButtonStyle, color: colors.danger }}
                    onClick={() => onDelete(t.id)}
                  >
                    🗑️
                  </Button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: 20, color: muted }}
                >
                  אין תנועות במערכת. לחץ על "הוסף תנועה" להתחיל.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

