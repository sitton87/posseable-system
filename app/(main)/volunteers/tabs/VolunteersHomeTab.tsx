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
  Badge,
} from "@tremor/react";
import {
  UserGroupIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { TasksBoard, TaskEntityOption } from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";
import { useMemo } from "react";
import { Volunteer } from "../types";
import { VolunteerSummaryData } from "../types";

type Props = {
  loading: boolean;
  summary: VolunteerSummaryData;
  volunteers: Volunteer[];
  onRefreshSummary: () => void;
};

export default function VolunteersHomeTab({
  loading,
  summary,
  volunteers,
  onRefreshSummary,
}: Props) {
  const volunteerEntities: TaskEntityOption[] = useMemo(
    () =>
      volunteers.map((v) => ({
        id: v.national_id,
        name: v.full_name,
        subtitle: v.national_id,
      })),
    [volunteers]
  );

  const getClassificationLabel = (classification: string | undefined | null) => {
    switch (classification) {
      case "staff":
        return "איש צוות";
      case "management":
        return "הנהלה";
      default:
        return "מתנדב";
    }
  };

  const getClassificationColor = (classification: string | undefined | null) => {
    switch (classification) {
      case "staff":
        return "blue";
      case "management":
        return "purple";
      default:
        return "slate";
    }
  };

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
                סה״כ צוות ומתנדבים
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
                מתנדבים פעילים
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {summary.stats.active}
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
                לא פעילים
              </Text>
              <Text className="font-bold" style={{ color: cssVar.status.warning }}>
                {summary.stats.total - summary.stats.active}
              </Text>
            </Flex>
          </div>
        </Card>

        <Card decoration="top" decorationColor="sky">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                אנשי צוות
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {summary.stats.staff}
              </Metric>
            </div>
            <Icon icon={BriefcaseIcon} variant="light" size="lg" color="sky" />
          </Flex>
          <div className="mt-4">
            <Flex className="mt-2">
              <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                עובדים קבועים
              </Text>
              <Text className="font-bold" style={{ color: cssVar.status.info }}>
                {summary.stats.staff}
              </Text>
            </Flex>
          </div>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                הנהלה
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {summary.stats.management}
              </Metric>
            </div>
            <Icon icon={BuildingOfficeIcon} variant="light" size="lg" color="purple" />
          </Flex>
          <div className="mt-4">
            <Flex className="mt-2">
              <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                אחוז מהכלל
              </Text>
              <Text className="font-bold" style={{ color: cssVar.brand.primary }}>
                {summary.stats.total > 0
                  ? Math.round((summary.stats.management / summary.stats.total) * 100)
                  : 0}%
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
            entityType="volunteer"
            entities={volunteerEntities}
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
                      <Badge 
                        color={getClassificationColor(item.classification) as any} 
                        size="xs"
                      >
                        {getClassificationLabel(item.classification)}
                      </Badge>
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
