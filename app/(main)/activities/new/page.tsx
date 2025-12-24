"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors, spacing } from "@/app/styles/foundations";
import { Button, Input, Select } from "@/app/components/ui";
import { PagePermissionGate } from "@/app/components/PagePermissionGate";
import { Section, FormGrid } from "@/app/components/shared/layoutPrimitives";
import { toast } from "sonner";

export default function NewActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]); // Only staff/management
  
  const [formData, setFormData] = useState({
    season_id: "", // Will be auto-filled from series
    series_id: "",
    group_id: "",
    kind: "surf",
    activity_date: new Date().toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "12:00",
    location: "חוף הים",
    capacity: 20,
    status: "Planned",
    notes: "",
    activity_manager_id: "",
    safety_manager_id: ""
  });

  useEffect(() => {
    // Fetch necessary data (groups, series, volunteers filtered by role)
    async function fetchData() {
      try {
        const [groupsRes, seriesRes, staffRes] = await Promise.all([
          fetch("/api/groups"),
          fetch("/api/series"),
          fetch("/api/volunteers?classification=staff"), // Fetch staff
          // Note: In real app we might want to fetch management too or use a combined query
        ]);

        const managementRes = await fetch("/api/volunteers?classification=management"); // Also fetch management
        
        const groupsData = await groupsRes.json();
        const seriesData = await seriesRes.json();
        const staffData = await staffRes.json();
        const managementData = await managementRes.json();

        if (groupsData.success) setGroups(groupsData.groups);
        if (seriesData.success) setSeries(seriesData.series);
        
        // Combine staff and management
        const allStaff = [
            ...(staffData.success ? staffData.volunteers : []),
            ...(managementData.success ? managementData.volunteers : [])
        ];
        // Remove duplicates if any (though classifications are usually mutually exclusive)
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
        body: JSON.stringify(formData),
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

  const staffOptions = [
    { value: "", label: "בחר מהרשימה..." },
    ...staff.map(v => ({ value: v.national_id, label: v.full_name }))
  ];

  return (
    <PagePermissionGate>
      <div style={{ padding: spacing.lg, maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: spacing.lg }}>יצירת פעילות חדשה</h1>
        
        <Section>
          <FormGrid>
            <Select
              label="סדרת פעילות"
              value={formData.series_id}
              onChange={(e) => {
                const selectedSeries = series.find(s => s.id.toString() === e.target.value);
                setFormData({ 
                  ...formData, 
                  series_id: e.target.value,
                  season_id: selectedSeries?.season_id?.toString() || ""
                });
              }}
              options={[
                { value: "", label: "בחר סדרה..." },
                ...series.map(s => ({ value: s.id, label: s.name }))
              ]}
              required
            />
            
            <Select
              label="קבוצה"
              value={formData.group_id}
              onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
              options={[
                { value: "", label: "ללא קבוצה / כללי" },
                ...groups.map(g => ({ value: g.id, label: g.name }))
              ]}
            />
            
            <Select
              label="סוג פעילות"
              value={formData.kind}
              onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
              options={[
                { value: "surf", label: "גלישה" },
                { value: "social", label: "חברתי" },
                { value: "lecture", label: "הרצאה" },
              ]}
              required
            />
            
            <Input
              type="date"
              label="תאריך"
              value={formData.activity_date}
              onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
              required
            />
            
            <Input
              type="time"
              label="שעת התחלה"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
            
            <Input
              type="time"
              label="שעת סיום"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
            
            <Input
              label="מיקום"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            
            <Input
              type="number"
              label="קיבולת מקסימלית"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />

            <Select 
              label="מנהל פעילות"
              value={formData.activity_manager_id}
              onChange={(e) => setFormData({ ...formData, activity_manager_id: e.target.value })}
              options={staffOptions}
            />

            <Select 
              label="מנהל בטיחות"
              value={formData.safety_manager_id}
              onChange={(e) => setFormData({ ...formData, safety_manager_id: e.target.value })}
              options={staffOptions}
            />

          </FormGrid>
          
          <div style={{ marginTop: spacing.md }}>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>הערות</label>
            <textarea
              style={{ 
                width: "100%", 
                minHeight: 100, 
                padding: 8, 
                borderRadius: 4, 
                border: `1px solid ${colors.border}`,
                fontFamily: "inherit"
              }}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          
          <div style={{ display: "flex", gap: spacing.md, marginTop: spacing.xl, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => router.back()}>ביטול</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "יוצר..." : "צור פעילות"}
            </Button>
          </div>
        </Section>
      </div>
    </PagePermissionGate>
  );
}
