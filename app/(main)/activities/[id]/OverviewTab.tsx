"use client";

import { useState, useEffect } from "react";
import { Activity } from "@/type";
import { Section, FormGrid } from "@/app/components/shared/layoutPrimitives";
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
import { cssVar } from "@/app/styles/design-system";
import { toast } from "sonner";
import {
  UsersIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

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
    <div className="flex flex-col gap-1">
        <Text className="mt-4 mb-2 text-sm font-semibold">בעלי תפקידים נוספים</Text>
        {roles.map(r => (
            <Card key={r.volunteer_national_id} className="p-2 flex justify-between items-center text-sm">
                <div>
                    <Text className="font-semibold">{r.volunteer_name}</Text>
                    {r.role_name && <Text className="text-sm" style={{ color: cssVar.text.muted }}>({r.role_name})</Text>}
                </div>
                <button onClick={() => handleRemove(r.volunteer_national_id)} className="border-none bg-transparent cursor-pointer" style={{ color: cssVar.status.danger }}>הסר</button>
            </Card>
        ))}
        
        <div className="flex gap-1 mt-2">
            <Select 
                value={newPerson || undefined}
                onValueChange={(val) => setNewPerson(val || "")}
                placeholder="בחר איש צוות..."
                className="flex-1"
            >
                {staff.map(s => <SelectItem key={s.national_id} value={s.national_id}>{s.full_name}</SelectItem>)}
            </Select>
            <Select 
                value={newRole || undefined}
                onValueChange={(val) => setNewRole(val || "")}
                placeholder="תפקיד..."
                className="flex-1"
            >
                {availableRoles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </Select>
            <Button onClick={handleAdd} disabled={!newPerson} size="sm">+</Button>
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
  
  const [kpiData, setKpiData] = useState({
      surfers: 0,
      volunteers: 0,
      staff: 0
  });

  useEffect(() => {
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

         const assignments = (activity as any).assignments || [];
         const uniqueSurfers = new Set(assignments.map((a: any) => a.surfer_id)).size;
         const uniqueVolunteers = new Set(assignments.map((a: any) => a.volunteer_id)).size;
         
         setKpiData({
             surfers: uniqueSurfers,
             volunteers: uniqueVolunteers,
             staff: 0
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
          group_id: formData.group_id || null
      });
      toast.success("השינויים נשמרו בהצלחה");
    } catch (error) {
      toast.error("שגיאה בשמירת השינויים");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* KPIs Header */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Card className="p-4 flex items-center gap-4">
              <div
                className="p-2.5 rounded-full"
                style={{ backgroundColor: cssVar.status.infoLight, color: cssVar.brand.primary }}
              >
                  <UsersIcon className="w-6 h-6" />
              </div>
              <div>
                  <Title>{kpiData.surfers}</Title>
                  <Text style={{ color: cssVar.text.muted }}>גולשים משובצים</Text>
              </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
              <div
                className="p-2.5 rounded-full"
                style={{ backgroundColor: cssVar.status.successLight, color: cssVar.status.success }}
              >
                  <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                  <Title>{kpiData.volunteers}</Title>
                  <Text style={{ color: cssVar.text.muted }}>אנשי צוות משובצים</Text>
              </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
              <div
                className="p-2.5 rounded-full"
                style={{ backgroundColor: cssVar.status.warningLight, color: cssVar.status.warning }}
              >
                  <UserIcon className="w-6 h-6" />
              </div>
              <div>
                  <Title>-</Title>
                  <Text style={{ color: cssVar.text.muted }}>סטטוס נוכחות</Text>
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-5 items-start">
          
          {/* Right Column: Activity Details */}
          <Section title="פרטי הפעילות">
            <FormGrid columns="1fr">
              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>תאריך</Text>
                    <input
                      type="date"
                      className="w-full rounded-md border px-3 py-2"
                      style={{ borderColor: cssVar.border.primary }}
                      value={formData.activity_date}
                      onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>התחלה</Text>
                    <input
                      type="time"
                      className="w-full rounded-md border px-3 py-2"
                      style={{ borderColor: cssVar.border.primary }}
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>סיום</Text>
                    <input
                      type="time"
                      className="w-full rounded-md border px-3 py-2"
                      style={{ borderColor: cssVar.border.primary }}
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>מיקום</Text>
                    <TextInput
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>קבוצה משויכת</Text>
                    <Select 
                      value={formData.group_id || undefined}
                      onValueChange={(val) => setFormData({ ...formData, group_id: val || "" })}
                      placeholder="בחר קבוצה..."
                      disabled={!!activity.series_id}
                    >
                        {groups.map(g => (
                            <SelectItem key={g.id} value={String(g.id).toLowerCase()}>{g.name}</SelectItem>
                        ))}
                    </Select>
                  </div>
                  {activity.series_id && (
                      <Text className="text-xs -mt-3" style={{ color: cssVar.text.muted }}>
                          לא ניתן לשנות קבוצה לפעילות שהיא חלק מסדרה.
                      </Text>
                  )}
              </div>

              <div className="mt-1">
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>הערות כלליות</Text>
                <Textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </FormGrid>
            
            <div className="flex justify-end mt-4">
                <Button onClick={handleSave} disabled={saving}>
                {saving ? "שומר..." : "שמור שינויים"}
                </Button>
            </div>
          </Section>

          {/* Left Column: Roles */}
          <Section title="בעלי תפקידים">
             <div className="flex flex-col gap-4">
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
                 
                 <div className="border-t border-dashed my-2" style={{ borderColor: cssVar.border.primary }} />
                 
                 <AdditionalRolesSection activityId={activity.id} staff={staff} />
             </div>
          </Section>
      </div>

      {/* Bottom Placeholder */}
      <Section title="רשימות מיוחדות" style={{ opacity: 0.7 }}>
          <Text className="italic text-center p-4" style={{ color: cssVar.text.muted }}>
              כאן יופיעו רשימות דינמיות בהתאם לתוכנית הפעילות (בפיתוח)
          </Text>
      </Section>
    </div>
  );
}
