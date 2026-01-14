"use client";

import {
  Card,
  Grid,
  Text,
  Metric,
  Flex,
  Icon,
} from "@tremor/react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { cssVar } from "@/app/styles/design-system";
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
      <Text className="mb-4" style={{ color: cssVar.text.muted }}>
        סה״כ {transactionCount} תנועות במערכת
      </Text>

      <Grid numItems={1} numItemsSm={3} className="gap-4">
        <Card decoration="top" decorationColor="emerald">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                סה״כ הכנסות
              </Text>
              <Metric
                className="text-2xl font-bold mt-1"
                style={{ color: cssVar.status.success }}
              >
                ₪{totalIncome.toLocaleString()}
              </Metric>
            </div>
            <Icon icon={ArrowTrendingUpIcon} variant="light" size="lg" color="emerald" />
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="rose">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                סה״כ הוצאות
              </Text>
              <Metric
                className="text-2xl font-bold mt-1"
                style={{ color: cssVar.status.danger }}
              >
                ₪{totalExpense.toLocaleString()}
              </Metric>
            </div>
            <Icon icon={ArrowTrendingDownIcon} variant="light" size="lg" color="rose" />
          </Flex>
        </Card>

        <Card decoration="top" decorationColor={balance >= 0 ? "blue" : "amber"}>
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                יתרה
              </Text>
              <Metric
                className="text-2xl font-bold mt-1"
                style={{ color: balance >= 0 ? cssVar.status.info : cssVar.status.warning }}
              >
                ₪{balance.toLocaleString()}
              </Metric>
            </div>
            <Icon
              icon={ScaleIcon}
              variant="light"
              size="lg"
              color={balance >= 0 ? "blue" : "amber"}
            />
          </Flex>
        </Card>
      </Grid>
    </div>
  );
}
