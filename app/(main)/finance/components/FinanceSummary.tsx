"use client";

import { colors, spacing } from "@/app/styles/foundations";
import { muted, summaryCardStyle } from "../utils";
import { FinanceStats } from "../types";

type FinanceSummaryProps = {
  stats: FinanceStats;
  transactionCount: number;
};

export default function FinanceSummary({
  stats,
  transactionCount,
}: FinanceSummaryProps) {
  const { totalIncome, totalExpense, balance } = stats;

  return (
    <div>
      <div style={{ color: muted, fontSize: 13, marginTop: 4, marginBottom: spacing.md }}>
        סה״כ {transactionCount} תנועות במערכת
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: spacing.md,
        }}
      >
        <div style={summaryCardStyle(colors.successSoft, colors.success)}>
          <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
            סה״כ הכנסות
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            ₪{totalIncome.toLocaleString()}
          </div>
        </div>
        <div style={summaryCardStyle(colors.dangerSoft, colors.danger)}>
          <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
            סה״כ הוצאות
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            ₪{totalExpense.toLocaleString()}
          </div>
        </div>
        <div
          style={summaryCardStyle(
            balance >= 0 ? colors.primarySoft : "rgba(251, 191, 36, 0.2)",
            balance >= 0 ? colors.primary : "#d97706"
          )}
        >
          <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
            יתרה
          </div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            ₪{balance.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

