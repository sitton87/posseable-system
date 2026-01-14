"use client";

import {
  Card,
  Text,
  TextInput,
  Select,
  SelectItem,
  Button,
} from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { Activity, SeasonPlan } from "@/type";

type TransactionFiltersProps = {
  filterType: string;
  setFilterType: (value: string) => void;
  filterFromDate: string;
  setFilterFromDate: (value: string) => void;
  filterToDate: string;
  setFilterToDate: (value: string) => void;
  filterSeasonId: string;
  setFilterSeasonId: (value: string) => void;
  filterActivityId: string;
  setFilterActivityId: (value: string) => void;
  seasons: SeasonPlan[];
  seasonActivities: Activity[];
  onReset: () => void;
};

export default function TransactionFilters({
  filterType,
  setFilterType,
  filterFromDate,
  setFilterFromDate,
  filterToDate,
  setFilterToDate,
  filterSeasonId,
  setFilterSeasonId,
  filterActivityId,
  setFilterActivityId,
  seasons,
  seasonActivities,
  onReset,
}: TransactionFiltersProps) {
  // Convert empty string to undefined for Tremor Select
  const typeValue = filterType || undefined;
  const seasonValue = filterSeasonId || undefined;
  const activityValue = filterActivityId || undefined;

  return (
    <Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
            סוג תנועה
          </Text>
          <Select
            value={typeValue}
            onValueChange={(val) => setFilterType(val || "")}
            placeholder="כל התנועות"
          >
            <SelectItem value="income">הכנסות בלבד</SelectItem>
            <SelectItem value="expense">הוצאות בלבד</SelectItem>
          </Select>
        </div>

        <div>
          <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
            מתאריך
          </Text>
          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            style={{ 
              borderColor: cssVar.border.primary, 
              backgroundColor: cssVar.bg.primary,
              color: cssVar.text.primary 
            }}
          />
        </div>

        <div>
          <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
            עד תאריך
          </Text>
          <input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            style={{ 
              borderColor: cssVar.border.primary, 
              backgroundColor: cssVar.bg.primary,
              color: cssVar.text.primary 
            }}
          />
        </div>

        <div>
          <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
            עונה
          </Text>
          <Select
            value={seasonValue}
            onValueChange={(val) => {
              setFilterSeasonId(val || "");
              setFilterActivityId("");
            }}
            placeholder="כל העונות"
          >
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.id.toString()}>
                {season.name} · {season.year}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
            פעילות
          </Text>
          <Select
            value={activityValue}
            onValueChange={(val) => setFilterActivityId(val || "")}
            disabled={!filterSeasonId || seasonActivities.length === 0}
            placeholder={
              !filterSeasonId
                ? "בחר עונה קודם"
                : seasonActivities.length
                ? "כל הפעילויות"
                : "אין פעילויות לעונה"
            }
          >
            {seasonActivities.map((activity) => (
              <SelectItem key={activity.id} value={activity.id.toString()}>
                {activity.kind} ·{" "}
                {new Date(activity.activity_date).toLocaleDateString("he-IL")}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="secondary"
            className="w-full"
            onClick={onReset}
          >
            איפוס סינונים
          </Button>
        </div>
      </div>
    </Card>
  );
}
