"use client";

import { useState, useEffect } from "react";
import { Activity } from "@/type";
import { Section, FormGrid } from "@/app/components/shared/layoutPrimitives";
import { Button, Input, Select } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
import { toast } from "sonner";


function AdditionalRolesSection({ activityId, staff }: { activityId: number, staff: any[] }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [newRole, setNewRole] = useState("");
  const [newPerson, setNewPerson] = useState("");

  useEffect(() => {
    fetchRoles();
    // Fetch available role types
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
    <Section title="בעלי תפקידים נוספים">
      <div style={{ marginBottom: spacing.md, display: "flex", gap: spacing.sm, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13 }}>איש צוות</label>
            <select 
                style={{ width: "100%", padding: 8, borderRadius: 4, border: `1px solid ${colors.border}` }}
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
            >
                <option value="">בחר איש צוות...</option>
                {staff.map(s => <option key={s.national_id} value={s.national_id}>{s.full_name}</option>)}
            </select>
        </div>
        <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13 }}>תפקיד (אופציונלי)</label>
            <select 
                style={{ width: "100%", padding: 8, borderRadius: 4, border: `1px solid ${colors.border}` }}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
            >
                <option value="">בחר תפקיד...</option>
                {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
        </div>
        <Button onClick={handleAdd} disabled={!newPerson}>הוסף</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {roles.map(r => (
            <div key={r.volunteer_national_id} style={{ display: "flex", justifyContent: "space-between", padding: 8, background: colors.surfaceAlt, borderRadius: 4, alignItems: "center" }}>
                <div>
                    <strong>{r.volunteer_name}</strong>
                    {r.role_name && <span style={{ marginRight: 8, color: colors.textMuted }}>({r.role_name})</span>}
                </div>
                <button onClick={() => handleRemove(r.volunteer_national_id)} style={{ border: "none", background: "none", color: colors.danger, cursor: "pointer" }}>הסר</button>
            </div>
        ))}
        {roles.length === 0 && <div style={{ color: colors.textMuted, fontSize: 13 }}>אין בעלי תפקידים נוספים</div>}
      </div>
    </Section>
  );
}

export function PlanningTab({ 
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
  });
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

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

      } catch (err) {
        console.error("Failed to load data", err);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(formData);
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
      <Section title="פרטי הפעילות">
        <FormGrid>
          <Input
            type="date"
            label="תאריך"
            value={formData.activity_date}
            onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
          />
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
                ...groups.map(g => ({ value: g.id, label: g.name }))
            ]}
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
        </FormGrid>
        <div style={{ marginTop: spacing.md }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>הערות כלליות</label>
          <textarea
            style={{ 
              width: "100%", 
              padding: 8, 
              borderRadius: 4, 
              border: `1px solid ${colors.border}`,
              fontFamily: "inherit",
              resize: "vertical",
              minHeight: 38
            }}
            rows={1}
            value={formData.notes}
            onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onFocus={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        </div>
      </Section>

      <AdditionalRolesSection activityId={activity.id} staff={staff} />

      <Section title="בעלי תפקידים ראשיים">
        <FormGrid>
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
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "שומר..." : "שמור שינויים"}
        </Button>
      </div>
    </div>
  );
}
