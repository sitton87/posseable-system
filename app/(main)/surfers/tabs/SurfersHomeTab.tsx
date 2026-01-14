import {
  Card,
  Grid,
  Text,
  Metric,
  Flex,
  Icon,
  Title,
  List,
  ListItem,
} from "@tremor/react";
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { TasksBoard, TaskEntityOption } from "@/app/components/shared";
import { Surfer } from "@/type";
import { SurferSummaryData } from "../types";
import { cssVar, tw } from "@/app/styles/design-system";

type Props = {
  loading: boolean;
  summary: SurferSummaryData;
  surfers: Surfer[];
  onRefreshSummary: () => void;
};

export default function SurfersHomeTab({
  loading,
  summary,
  surfers,
  onRefreshSummary,
}: Props) {
  const surferEntities: TaskEntityOption[] = surfers.map((s) => ({
    id: s.national_id,
    name: s.full_name,
    subtitle: s.national_id,
  }));

  if (loading) {
    return (
      <div className="p-8 text-center" style={{ color: cssVar.text.muted }}>
        טוען נתונים...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                סה״כ גולשים
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {summary.stats.total}
              </Metric>
            </div>
            <Icon icon={UserGroupIcon} variant="light" size="lg" color="blue" />
          </Flex>
          <div className="mt-4">
            <Flex className="mt-2">
              <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                פעילים
              </Text>
              <Text className="font-bold" style={{ color: cssVar.status.success }}>
                {summary.stats.active}
              </Text>
            </Flex>
          </div>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                מאושרים
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {summary.stats.approved}
              </Metric>
            </div>
            <Icon
              icon={CheckCircleIcon}
              variant="light"
              size="lg"
              color="emerald"
            />
          </Flex>
          <div className="mt-4">
            <Flex className="mt-2">
              <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                אישור רפואי
              </Text>
              <Text className="font-bold" style={{ color: cssVar.status.success }}>
                {summary.stats.medicalApproved}
              </Text>
            </Flex>
          </div>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                ממתינים
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {summary.stats.pending}
              </Metric>
            </div>
            <Icon icon={ClockIcon} variant="light" size="lg" color="amber" />
          </Flex>
          <div className="mt-4">
            <Flex className="mt-2">
              <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                ללא קבוצה
              </Text>
              <Text className="font-bold" style={{ color: cssVar.status.warning }}>
                {summary.stats.total - summary.stats.grouped}
              </Text>
            </Flex>
          </div>
        </Card>

        <Card decoration="top" decorationColor="indigo">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                קבוצות
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {summary.stats.grouped}
              </Metric>
            </div>
            <Icon icon={UserPlusIcon} variant="light" size="lg" color="indigo" />
          </Flex>
          <div className="mt-4">
            <Flex className="mt-2">
              <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                משתמשי כיסא
              </Text>
              <Text className="font-bold" style={{ color: cssVar.status.info }}>
                {summary.stats.wheelchair}
              </Text>
            </Flex>
          </div>
        </Card>
      </Grid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: cssVar.bg.primary,
            boxShadow: cssVar.shadow.sm,
            border: `1px solid ${cssVar.border.primary}`,
          }}
        >
          <TasksBoard
            entityType="surfer"
            entities={surferEntities}
            title="משימות"
          />
        </div>

        <Card>
          <Title
            className="text-lg font-semibold mb-4"
            style={{ color: cssVar.text.primary }}
          >
            פעילות אחרונה
          </Title>
          {summary.recentActivity.length === 0 ? (
            <Text className="italic" style={{ color: cssVar.text.muted }}>
              לא נמצאה פעילות אחרונה.
            </Text>
          ) : (
            <List>
              {summary.recentActivity.map((item) => (
                <ListItem key={item.national_id}>
                  <div className="w-full">
                    <Flex>
                      <Text className="font-medium" style={{ color: cssVar.text.primary }}>
                        {item.full_name}
                      </Text>
                      <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("he-IL")
                          : "—"}
                      </Text>
                    </Flex>
                    <div className="mt-1 flex gap-2 text-xs">
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          background: cssVar.bg.tertiary,
                          color: cssVar.text.secondary,
                        }}
                      >
                        {item.program || "ללא תוכנית"}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          background: cssVar.bg.tertiary,
                          color: cssVar.text.secondary,
                        }}
                      >
                        {item.status || "—"}
                      </span>
                      {item.group_name && (
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            background: cssVar.brand.muted,
                            color: cssVar.brand.primary,
                          }}
                        >
                          {item.group_name}
                        </span>
                      )}
                    </div>
                  </div>
                </ListItem>
              ))}
            </List>
          )}
        </Card>
      </div>
    </div>
  );
}
