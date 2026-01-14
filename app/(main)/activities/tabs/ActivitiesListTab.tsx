"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Select,
  SelectItem,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
} from "@tremor/react";
import { Activity } from "@/type";
import { FilterToolbar } from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const formatTime = (timeStr?: string) => {
  if (!timeStr) return "-";
  return timeStr.slice(0, 5);
};

export default function ActivitiesListTab() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    kind: "",
    search: "",
    sort: "date_desc"
  });

  useEffect(() => {
    fetchActivities();
  }, [filters.status, filters.kind, filters.sort]);

  async function fetchActivities() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.kind) params.set("kind", filters.kind);
      params.set("sort", filters.sort || "date_desc");
      
      const res = await fetch(`/api/activities?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("האם אתה בטוח שברצונך למחוק פעילות זו?")) return;

    try {
      const res = await fetch(`/api/activities/update?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("פעילות נמחקה בהצלחה");
        fetchActivities();
      } else {
        toast.error("שגיאה במחיקת הפעילות");
      }
    } catch (err) {
      toast.error("שגיאה במחיקת הפעילות");
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      activity.group_name?.toLowerCase().includes(searchLower) ||
      activity.location?.toLowerCase().includes(searchLower) ||
      activity.lead_name?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string): "emerald" | "amber" | "rose" | "blue" | "gray" => {
    switch (status) {
      case "Completed":
        return "emerald";
      case "Cancelled":
        return "rose";
      case "In Progress":
        return "blue";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      Planned: "מתוכנן",
      Completed: "הושלם",
      Cancelled: "בוטל",
      "In Progress": "בביצוע",
    };
    return map[status] || status;
  };

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div>
          <Title>רשימת פעילויות</Title>
          <Text style={{ color: cssVar.text.muted }}>
            ניהול ומעקב אחר פעילויות העמותה
          </Text>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          <Button variant="secondary" size="sm" icon={ArrowPathIcon} onClick={fetchActivities}>
            רענן
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            icon={XMarkIcon}
            onClick={() => setFilters({ status: "", kind: "", search: "", sort: "date_desc" })}
          >
            ניקוי פילטרים
          </Button>
          <Button icon={PlusIcon} onClick={() => router.push("/activities/new")}>
            פעילות חדשה
          </Button>
        </div>
      </div>

      <FilterToolbar columns="repeat(auto-fit, minmax(200px, 1fr))">
        <TextInput
          placeholder="חיפוש לפי קבוצה, מיקום או מנהל..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          value={filters.status || undefined}
          onValueChange={(val) => setFilters({ ...filters, status: val || "" })}
          placeholder="כל הסטטוסים"
        >
          <SelectItem value="Planned">מתוכנן</SelectItem>
          <SelectItem value="Completed">הושלם</SelectItem>
          <SelectItem value="Cancelled">בוטל</SelectItem>
        </Select>
        <Select
          value={filters.kind || undefined}
          onValueChange={(val) => setFilters({ ...filters, kind: val || "" })}
          placeholder="כל הסוגים"
        >
          <SelectItem value="surf">גלישה</SelectItem>
          <SelectItem value="social">חברתי</SelectItem>
          <SelectItem value="special">אירוע מיוחד</SelectItem>
          <SelectItem value="training">הכשרה והדרכה</SelectItem>
        </Select>
        <Select
          value={filters.sort}
          onValueChange={(val) => setFilters({ ...filters, sort: val })}
        >
          <SelectItem value="date_desc">תאריך (מהחדש לישן)</SelectItem>
          <SelectItem value="date_asc">תאריך (מהישן לחדש)</SelectItem>
        </Select>
      </FilterToolbar>

      {loading ? (
        <div className="text-center p-6">
          <Text style={{ color: cssVar.text.muted }}>טוען פעילויות...</Text>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center p-6">
          <Text style={{ color: cssVar.text.muted }}>לא נמצאו פעילויות</Text>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>תאריך</TableHeaderCell>
                <TableHeaderCell>שעה</TableHeaderCell>
                <TableHeaderCell>קבוצה</TableHeaderCell>
                <TableHeaderCell>סדרה</TableHeaderCell>
                <TableHeaderCell>סוג</TableHeaderCell>
                <TableHeaderCell>מיקום</TableHeaderCell>
                <TableHeaderCell>מנהל</TableHeaderCell>
                <TableHeaderCell>משתתפים</TableHeaderCell>
                <TableHeaderCell>סטטוס</TableHeaderCell>
                <TableHeaderCell>פעולות</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow 
                    key={activity.id} 
                    onClick={() => router.push(`/activities/${activity.id}`)}
                    className="cursor-pointer transition-colors hover:bg-tremor-background-subtle"
                >
                  <TableCell>
                    {format(new Date(activity.activity_date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {formatTime(activity.start_time)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {activity.group_name || "-"}
                  </TableCell>
                  <TableCell>
                    {activity.series_name || "-"}
                  </TableCell>
                  <TableCell>{
                    activity.kind === "surf" ? "גלישה" :
                    activity.kind === "social" ? "חברתי" :
                    activity.kind === "special" ? "אירוע מיוחד" :
                    activity.kind === "training" ? "הכשרה והדרכה" :
                    activity.kind === "lecture" ? "הכשרה והדרכה" :
                    activity.kind === "preparation" ? "הכנה" :
                    activity.kind
                  }</TableCell>
                  <TableCell>{activity.location || "-"}</TableCell>
                  <TableCell>
                    {activity.activity_manager_name || activity.lead_name || "-"}
                  </TableCell>
                  <TableCell>{activity.participant_count || 0}</TableCell>
                  <TableCell>
                    <Badge color={getStatusColor(activity.status)}>
                      {getStatusLabel(activity.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={(e) => { e.stopPropagation(); router.push(`/activities/${activity.id}`); }}
                      >
                        ניהול
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        color="rose"
                        icon={TrashIcon}
                        onClick={(e) => handleDelete(activity.id, e)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
