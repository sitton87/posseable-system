"use client";

import { Button, Card } from "@/app/components/ui";
import { inputStyle, labelStyle, withCenteredControl } from "@/app/styles/components";
import { spacing } from "@/app/styles/foundations";
import { Activity, SeasonPlan } from "@/type";

const filterControlStyle = withCenteredControl(inputStyle);

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
  return (
    <Card>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.md,
        }}
      >
        <div>
          <label style={labelStyle}>סוג תנועה</label>
          <select
            style={filterControlStyle}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">כל התנועות</option>
            <option value="income">הכנסות בלבד</option>
            <option value="expense">הוצאות בלבד</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>מתאריך</label>
          <input
            type="date"
            style={filterControlStyle}
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>עד תאריך</label>
          <input
            type="date"
            style={filterControlStyle}
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>עונה</label>
          <select
            style={filterControlStyle}
            value={filterSeasonId}
            onChange={(e) => {
              setFilterSeasonId(e.target.value);
              setFilterActivityId("");
            }}
          >
            <option value="">כל העונות</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} · {season.year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>פעילות</label>
          <select
            style={filterControlStyle}
            value={filterActivityId}
            onChange={(e) => setFilterActivityId(e.target.value)}
            disabled={!filterSeasonId}
          >
            <option value="">
              {!filterSeasonId
                ? "בחר עונה קודם"
                : seasonActivities.length
                ? "בחר פעילות..."
                : "אין פעילויות לעונה"}
            </option>
            {filterSeasonId &&
              seasonActivities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.kind} ·{" "}
                  {new Date(activity.activity_date).toLocaleDateString("he-IL")}
                </option>
              ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <Button
            variant="secondary"
            style={{ width: "100%" }}
            onClick={onReset}
          >
            איפוס סינונים
          </Button>
        </div>
      </div>
    </Card>
  );
}

