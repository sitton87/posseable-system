"use client";

import { useState, useEffect } from "react";
import { Activity } from "@/type";
import { Section, FormGrid } from "@/app/components/shared/layoutPrimitives";
import { Button, Input, Select } from "@/app/components/ui";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { toast } from "sonner";
import { Users, UserCheck, ShieldCheck } from "lucide-react";

function AdditionalRolesSection({ activityId, staff }: { activityId: number, staff: any[] }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [newRole, setNewRole] = useState("");
  const [newPerson, setNewPerson] = useState("");

  useEffect(() => {
    fetchRoles();
    fetch("/api/volunteers/roles").then(r => r.json()).then(d => {
        if(d.success) setAvailableRoles(d.roles);
    });
  }, []);

  const fetchRoles = async () => {
    const res = await fetch(`/api/activities/roles?activity_id=${activityId}`);
    const data = await res.json();
    if (data.success) setRoles(data.roles);
  };

  const handleAdd = async () => {
    if (!newPerson) return;
    try {
      await fetch("/api/activities/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_id: activityId,
          volunteer_id: newPerson,
          role_id: newRole || null
        })
      });
      setNewPerson("");
      setNewRole("");
      fetchRoles();
      toast.success("תפקיד נוסף");
    } catch (e) {
      toast.error("שגיאה");
    }
  };

  const handleRemove = async (vid: string) => {
    try {
      await fetch(`/api/activities/roles?activity_id=${activityId}&volunteer_id=${vid}`, { method: "DELETE" });
      fetchRoles();
    } catch (e) { toast.error("שגיאה"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h5 style={{ margin: "16px 0 8px 0", fontSize: 14 }}>בעלי תפקידים נוספים</h5>
        {roles.map(r => (
            <div key={r.volunteer_national_id} style={{ display: "flex", justifyContent: "space-between", padding: 8, background: colors.surfaceAlt, borderRadius: 4, alignItems: "center", fontSize: 13 }}>
                <div>
                    <strong>{r.volunteer_name}</strong>
                    {r.role_name && <span style={{ marginRight: 8, color: colors.textMuted }}>({r.role_name})</span>}
                </div>
                <button onClick={() => handleRemove(r.volunteer_national_id)} style={{ border: "none", background: "none", color: colors.danger, cursor: "pointer" }}>הסר</button>
            </div>
        ))}
        
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            <select 
                style={{ flex: 1, padding: 6, borderRadius: 4, border: `1px solid ${colors.border}`, fontSize: 13 }}
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
            >
                <option value="">בחר איש צוות...</option>
                {staff.map(s => <option key={s.national_id} value={s.national_id}>{s.full_name}</option>)}
            </select>
            <select 
                style={{ flex: 1, padding: 6, borderRadius: 4, border: `1px solid ${colors.border}`, fontSize: 13 }}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
            >
                <option value="">תפקיד...</option>
                {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <Button onClick={handleAdd} disabled={!newPerson} style={{ padding: "4px 8px", fontSize: 12 }}>+</Button>
        </div>
    </div>
  );
}

export function OverviewTab({ 
  activity, 
  onUpdate 
}: { 
  activity: Activity; 
  onUpdate: (data: Partial<Activity>) => Promise<void>; 
}) {
  const [formData, setFormData] = useState({
    activity_manager_id: activity.activity_manager_id || "",
    safety_manager_id: activity.safety_manager_id || "",
    activity_date: activity.activity_date ? new Date(activity.activity_date).toISOString().split('T')[0] : "",
    start_time: activity.start_time || "",
    end_time: activity.end_time || "",
    location: activity.location || "",
    notes: activity.notes || "",
    group_id: activity.group_id ? String(activity.group_id).toLowerCase() : "",
  });
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  
  // KPI Data
  const [kpiData, setKpiData] = useState({
      surfers: 0,
      volunteers: 0,
      staff: 0 // If needed distinct from volunteers
  });

  useEffect(() => {
    // Fetch staff volunteers and groups
    async function fetchData() {
      try {
        const [staffRes, managementRes, groupsRes] = await Promise.all([
           fetch("/api/volunteers?classification=staff"),
           fetch("/api/volunteers?classification=management"),
           fetch("/api/groups")
        ]);
        const sData = await staffRes.json();
        const mData = await managementRes.json();
        const gData = await groupsRes.json();
        
        const allStaff = [
            ...(sData.success ? sData.volunteers : []),
            ...(mData.success ? mData.volunteers : [])
        ];
         const uniqueStaff = Array.from(new Map(allStaff.map(item => [item.national_id, item])).values());
         setStaff(uniqueStaff);

         if(gData.success) setGroups(gData.groups);

         // Calculate KPIs from activity object if available or fetch fresh
         // Assuming activity.assignments contains all approved assignments
         // If assignments is not populated in props, we might need to fetch it.
         // Props `activity` usually comes from parent which fetches detailed activity.
         // Let's rely on activity props if it has `assignments` array, otherwise 0.
         // The parent component fetches `activity` which includes `assignments` in the recent update.
         // Let's verify type. Assuming `activity` has `assignments`.
         const assignments = (activity as any).assignments || [];
         const uniqueSurfers = new Set(assignments.map((a: any) => a.surfer_id)).size;
         const uniqueVolunteers = new Set(assignments.map((a: any) => a.volunteer_id)).size;
         
         setKpiData({
             surfers: uniqueSurfers,
             volunteers: uniqueVolunteers,
             staff: 0 // Placeholder or specific logic
         });

      } catch (err) {
        console.error("Failed to load data", err);
      }
    }
    fetchData();
  }, [activity]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
          ...formData,
          group_id: formData.group_id || null // Ensure it is passed as string or null
      });
      toast.success("השינויים נשמרו בהצלחה");
    } catch (error) {
      toast.error("שגיאה בשמירת השינויים");
    } finally {
      setSaving(false);
    }
  };

  const staffOptions = [
    { value: "", label: "בחר מהרשימה..." },
    ...staff.map(v => ({ value: v.national_id, label: v.full_name }))
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      
      {/* KPIs Header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: spacing.md }}>
          <div style={{ background: colors.surfaceAlt, padding: spacing.md, borderRadius: radii.card, display: "flex", alignItems: "center", gap: spacing.md }}>
              <div style={{ padding: 10, background: colors.primary + "20", borderRadius: "50%", color: colors.primary }}>
                  <Users size={24} />
              </div>
              <div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{kpiData.surfers}</div>
                  <div style={{ fontSize: 13, color: colors.textMuted }}>גולשים משובצים</div>
              </div>
          </div>
          <div style={{ background: colors.surfaceAlt, padding: spacing.md, borderRadius: radii.card, display: "flex", alignItems: "center", gap: spacing.md }}>
              <div style={{ padding: 10, background: colors.success + "20", borderRadius: "50%", color: colors.success }}>
                  <ShieldCheck size={24} />
              </div>
              <div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{kpiData.volunteers}</div>
                  <div style={{ fontSize: 13, color: colors.textMuted }}>אנשי צוות משובצים</div>
              </div>
          </div>
          {/* Third KPI placeholder or remove if only 2 needed */}
          <div style={{ background: colors.surfaceAlt, padding: spacing.md, borderRadius: radii.card, display: "flex", alignItems: "center", gap: spacing.md }}>
              <div style={{ padding: 10, background: colors.warning + "20", borderRadius: "50%", color: colors.warning }}>
                  <UserCheck size={24} />
              </div>
              <div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>-</div>
                  <div style={{ fontSize: 13, color: colors.textMuted }}>סטטוס נוכחות</div>
              </div>
          </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: spacing.lg, alignItems: "start" }}>
          
          {/* Right Column: Activity Details */}
          <Section title="פרטי הפעילות">
            <FormGrid columns="1fr">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: spacing.md }}>
                  <Input
                    type="date"
                    label="תאריך"
                    value={formData.activity_date}
                    onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                  />
                  <Input
                    type="time"
                    label="התחלה"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                  <Input
                    type="time"
                    label="סיום"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
                  <Input
                    label="מיקום"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                  <Select 
                    label="קבוצה משויכת"
                    value={formData.group_id}
                    onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                    options={[
                        { value: "", label: "בחר קבוצה..." },
                        ...groups.map(g => ({ value: String(g.id).toLowerCase(), label: g.name }))
                    ]}
                    disabled={!!activity.series_id} // Disable if part of a series
                  />
                  {activity.series_id && (
                      <div style={{ fontSize: 12, color: colors.textMuted, marginTop: -12 }}>
                          לא ניתן לשנות קבוצה לפעילות שהיא חלק מסדרה.
                      </div>
                  )}
              </div>

              <div style={{ marginTop: spacing.xs }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 500, fontSize: 13 }}>הערות כלליות</label>
                <textarea
                    style={{ 
                    width: "100%", 
                    padding: 8, 
                    borderRadius: radii.button, 
                    border: `1px solid ${colors.border}`,
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: 80
                    }}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </FormGrid>
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: spacing.md }}>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? "שומר..." : "שמור שינויים"}
                </Button>
            </div>
          </Section>

          {/* Left Column: Roles */}
          <Section title="בעלי תפקידים">
             <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                 <div>
                     <Select 
                        label="מנהל פעילות"
                        value={formData.activity_manager_id}
                        onChange={(e) => setFormData({ ...formData, activity_manager_id: e.target.value })}
                        options={staffOptions}
                     />
                 </div>
                 <div>
                     <Select 
                        label="מנהל בטיחות"
                        value={formData.safety_manager_id}
                        onChange={(e) => setFormData({ ...formData, safety_manager_id: e.target.value })}
                        options={staffOptions}
                     />
                 </div>
                 
                 <div style={{ borderTop: `1px dashed ${colors.border}`, margin: "8px 0" }} />
                 
                 <AdditionalRolesSection activityId={activity.id} staff={staff} />
             </div>
          </Section>
      </div>

      {/* Bottom Placeholder */}
      <Section title="רשימות מיוחדות" style={{ opacity: 0.7 }}>
          <div style={{ color: colors.textMuted, fontStyle: "italic", textAlign: "center", padding: spacing.md }}>
              כאן יופיעו רשימות דינמיות בהתאם לתוכנית הפעילות (בפיתוח)
          </div>
      </Section>
    </div>
  );
}
