"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Title,
  Text,
  TextInput,
  Textarea,
  Select,
  SelectItem,
  Button,
} from "@tremor/react";
import { PagePermissionGate } from "@/app/components/PagePermissionGate";
import { Section, FormGrid } from "@/app/components/shared/layoutPrimitives";
import { cssVar } from "@/app/styles/design-system";
import { toast } from "sonner";

export default function NewActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    season_id: "",
    series_id: "",
    group_id: "",
    kind: "surf",
    activity_date: new Date().toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "12:00",
    location: "חוף הים",
    capacity: "20",
    status: "Planned",
    notes: "",
    activity_manager_id: "",
    safety_manager_id: ""
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupsRes, seriesRes, staffRes] = await Promise.all([
          fetch("/api/groups"),
          fetch("/api/series"),
          fetch("/api/volunteers?classification=staff"),
        ]);

        const managementRes = await fetch("/api/volunteers?classification=management");
        
        const groupsData = await groupsRes.json();
        const seriesData = await seriesRes.json();
        const staffData = await staffRes.json();
        const managementData = await managementRes.json();

        if (groupsData.success) setGroups(groupsData.groups);
        if (seriesData.success) setSeries(seriesData.series);
        
        const allStaff = [
            ...(staffData.success ? staffData.volunteers : []),
            ...(managementData.success ? managementData.volunteers : [])
        ];
        const uniqueStaff = Array.from(new Map(allStaff.map(item => [item.national_id, item])).values());
        setStaff(uniqueStaff);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("שגיאה בטעינת נתונים");
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!formData.series_id || !formData.activity_date) {
      toast.error("יש למלא שדות חובה");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/activities/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("הפעילות נוצרה בהצלחה");
        router.push("/activities");
      } else {
        toast.error(data.error || "שגיאה ביצירת הפעילות");
      }
    } catch (error) {
      toast.error("שגיאה בשרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PagePermissionGate>
      <div className="p-5 max-w-3xl mx-auto">
        <Title className="text-2xl mb-5">יצירת פעילות חדשה</Title>
        
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                סדרת פעילות <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <Select
                value={formData.series_id || undefined}
                onValueChange={(val) => {
                  const selectedSeries = series.find(s => s.id.toString() === val);
                  setFormData({ 
                    ...formData, 
                    series_id: val || "",
                    season_id: selectedSeries?.season_id?.toString() || ""
                  });
                }}
                placeholder="בחר סדרה..."
              >
                {series.map(s => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                ))}
              </Select>
            </div>
            
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>קבוצה</Text>
              <Select
                value={formData.group_id || undefined}
                onValueChange={(val) => setFormData({ ...formData, group_id: val || "" })}
                placeholder="ללא קבוצה / כללי"
              >
                {groups.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </Select>
            </div>
            
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                סוג פעילות <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <Select
                value={formData.kind}
                onValueChange={(val) => setFormData({ ...formData, kind: val })}
              >
                <SelectItem value="surf">גלישה</SelectItem>
                <SelectItem value="social">חברתי</SelectItem>
                <SelectItem value="lecture">הדרכה/הרצאה</SelectItem>
                <SelectItem value="preparation">הכנה</SelectItem>
                <SelectItem value="special">אירוע מיוחד</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </Select>
            </div>
            
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                תאריך <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <input
                type="date"
                className="w-full rounded-md border px-3 py-2"
                style={{ borderColor: cssVar.border.primary }}
                value={formData.activity_date}
                onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
              />
            </div>
            
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>שעת התחלה</Text>
              <input
                type="time"
                className="w-full rounded-md border px-3 py-2"
                style={{ borderColor: cssVar.border.primary }}
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>שעת סיום</Text>
              <input
                type="time"
                className="w-full rounded-md border px-3 py-2"
                style={{ borderColor: cssVar.border.primary }}
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
            
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>מיקום</Text>
              <TextInput
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>קיבולת מקסימלית</Text>
              <TextInput
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>

            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>מנהל פעילות</Text>
              <Select 
                value={formData.activity_manager_id || undefined}
                onValueChange={(val) => setFormData({ ...formData, activity_manager_id: val || "" })}
                placeholder="בחר מהרשימה..."
              >
                {staff.map(v => (
                  <SelectItem key={v.national_id} value={v.national_id}>{v.full_name}</SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>מנהל בטיחות</Text>
              <Select 
                value={formData.safety_manager_id || undefined}
                onValueChange={(val) => setFormData({ ...formData, safety_manager_id: val || "" })}
                placeholder="בחר מהרשימה..."
              >
                {staff.map(v => (
                  <SelectItem key={v.national_id} value={v.national_id}>{v.full_name}</SelectItem>
                ))}
              </Select>
            </div>

          </div>
          
          <div className="mt-4">
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>הערות</Text>
            <Textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          
          <div className="flex gap-4 mt-6 justify-end">
            <Button variant="secondary" onClick={() => router.back()}>ביטול</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "יוצר..." : "צור פעילות"}
            </Button>
          </div>
        </Card>
      </div>
    </PagePermissionGate>
  );
}
