"use client";

import { useState, useEffect } from "react";
import { Activity, Surfer, Volunteer } from "@/type";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { Button, Select } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
import { toast } from "sonner";
import { User, Users, Shield, Trash2, Plus, ArrowRight } from "lucide-react";

interface AssignmentsTabProps {
  activity: Activity;
}

interface Registration {
    id: number;
    surfer_id: string;
    surfer_name: string;
    status: string;
}

interface Assignment {
    id: string;
    surfer_id: string;
    volunteer_id: string;
    volunteer_name: string;
    role: string;
}

export function AssignmentsTab({ activity }: AssignmentsTabProps) {
  const [groupSurfers, setGroupSurfers] = useState<Surfer[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  // Assignment selection state
  const [selectedSurferId, setSelectedSurferId] = useState<string | null>(null);
  const [newVolunteerId, setNewVolunteerId] = useState("");
  const [newRole, setNewRole] = useState("support"); // support, lead

  useEffect(() => {
    loadData();
  }, [activity.id, activity.group_id]);

  const loadData = async () => {
    setLoading(true);
    try {
        // 1. Load Group Surfers
        if (activity.group_id) {
            const surfersRes = await fetch(`/api/groups?includeSurfers=true`);
            const surfersData = await surfersRes.json();
            if (surfersData.success) {
                const group = surfersData.groups.find((g: any) => g.id === activity.group_id);
                if (group) setGroupSurfers(group.surfers || []);
            }
        }

        // 2. Load Registrations
        const regRes = await fetch(`/api/activities/registrations?activity_id=${activity.id}`);
        const regData = await regRes.json();
        if (regData.success) setRegistrations(regData.registrations);

        // 3. Load Assignments
        // Note: We need a way to get all assignments for the activity. 
        // Existing endpoint /api/activities/[id] returns them in `assignments` prop, but let's fetch fresh if needed or use what we have.
        // Actually, let's use a dedicated endpoint or the main one. I'll use the main one logic but client-side filtered?
        // Better to fetch fresh assignments from a new endpoint or existing one.
        // Let's create/use a GET endpoint for assignments.
        // For now, I'll fetch the activity details again to get fresh assignments
        const actRes = await fetch(`/api/activities/${activity.id}`);
        const actData = await actRes.json();
        if(actData.success && actData.activity.assignments) {
            setAssignments(actData.activity.assignments);
        }

        // 4. Load Volunteers
        const volRes = await fetch("/api/volunteers?active=true");
        const volData = await volRes.json();
        if (volData.success) setVolunteers(volData.volunteers);

    } catch (error) {
        console.error("Error loading assignment data", error);
    } finally {
        setLoading(false);
    }
  };

  const toggleAttendance = async (surferId: string, currentRegId?: number) => {
      try {
          if (currentRegId) {
              // Remove registration
              await fetch(`/api/activities/registrations?id=${currentRegId}`, { method: "DELETE" });
          } else {
              // Add registration
              await fetch(`/api/activities/registrations`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ activity_id: activity.id, surfer_id: surferId, status: "Approved" })
              });
          }
          loadData(); // Refresh all
      } catch (e) {
          toast.error("שגיאה בעדכון נוכחות");
      }
  };

  const handleAddAssignment = async () => {
      if (!selectedSurferId || !newVolunteerId) return;
      try {
          await fetch("/api/activities/assignments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  activity_id: activity.id,
                  surfer_id: selectedSurferId,
                  volunteer_id: newVolunteerId,
                  role: newRole
              })
          });
          toast.success("מתנדב שובץ בהצלחה");
          setNewVolunteerId("");
          loadData();
      } catch (e) {
          toast.error("שגיאה בשיבוץ");
      }
  };

  const handleRemoveAssignment = async (id: string) => {
      try {
          await fetch(`/api/activities/assignments?id=${id}`, { method: "DELETE" });
          loadData();
      } catch (e) { toast.error("שגיאה"); }
  };

  const attendingSurfers = groupSurfers.filter(s => registrations.some(r => r.surfer_id === s.national_id));
  const selectedSurfer = groupSurfers.find(s => s.national_id === selectedSurferId);
  const selectedSurferAssignments = assignments.filter(a => a.surfer_id === selectedSurferId);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: spacing.lg, alignItems: "start" }}>
      
      {/* Left Column: Attendance List */}
      <Section title="נוכחות גולשים">
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
            {groupSurfers.length === 0 && <div style={{ color: colors.textMuted }}>אין גולשים בקבוצה זו</div>}
            {groupSurfers.map(surfer => {
                const reg = registrations.find(r => r.surfer_id === surfer.national_id);
                const isAttending = !!reg;
                const surferAssignments = assignments.filter(a => a.surfer_id === surfer.national_id);
                const hasLead = surferAssignments.some(a => a.role === 'lead');
                
                return (
                    <div 
                        key={surfer.national_id}
                        style={{
                            padding: spacing.sm,
                            border: `1px solid ${selectedSurferId === surfer.national_id ? colors.primary : colors.border}`,
                            borderRadius: 6,
                            background: isAttending ? (selectedSurferId === surfer.national_id ? colors.surfaceAlt : "white") : "#f9fafb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: isAttending ? "pointer" : "default",
                            opacity: isAttending ? 1 : 0.7
                        }}
                        onClick={() => isAttending && setSelectedSurferId(surfer.national_id)}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                            <input 
                                type="checkbox" 
                                checked={isAttending}
                                onChange={(e) => {
                                    e.stopPropagation(); // Prevent row click
                                    toggleAttendance(surfer.national_id, reg?.id);
                                }}
                                style={{ width: 18, height: 18, cursor: "pointer" }}
                            />
                            <div>
                                <div style={{ fontWeight: 500 }}>{surfer.full_name}</div>
                                {isAttending && (
                                    <div style={{ fontSize: 12, color: colors.textMuted, display: "flex", gap: 4 }}>
                                        <Users size={12} /> {surferAssignments.length} מתנדבים
                                        {!hasLead && <span style={{ color: colors.warning }}> (חסר מוביל)</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                        {isAttending && <ArrowRight size={16} color={colors.textMuted} />}
                    </div>
                );
            })}
        </div>
      </Section>

      {/* Right Column: Assignment Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
        {selectedSurfer ? (
            <>
                <Section title={`שיבוץ צוות ל${selectedSurfer.full_name}`}>
                    <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.lg, alignItems: "flex-end" }}>
                        <div style={{ flex: 2 }}>
                            <Select 
                                label="מתנדב"
                                value={newVolunteerId}
                                onChange={(e) => setNewVolunteerId(e.target.value)}
                                options={[
                                    { value: "", label: "בחר מתנדב..." },
                                    ...volunteers.map(v => ({ value: v.national_id, label: v.full_name }))
                                ]}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Select 
                                label="תפקיד"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                options={[
                                    { value: "support", label: "תומך" },
                                    { value: "lead", label: "מוביל צוות" },
                                ]}
                            />
                        </div>
                        <Button onClick={handleAddAssignment} disabled={!newVolunteerId}>
                            <Plus size={16} style={{ marginLeft: 6 }} /> הוסף
                        </Button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                        {selectedSurferAssignments.length === 0 && <div style={{ color: colors.textMuted }}>טרם שובצו מתנדבים</div>}
                        {selectedSurferAssignments.map(assign => (
                            <div key={assign.id} style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center",
                                padding: spacing.sm,
                                background: "white",
                                border: `1px solid ${colors.border}`,
                                borderRadius: 6
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                                    {assign.role === 'lead' ? <Shield size={18} color={colors.primary} /> : <User size={18} color={colors.textMuted} />}
                                    <span style={{ fontWeight: assign.role === 'lead' ? 600 : 400 }}>{assign.volunteer_name}</span>
                                    <span style={{ fontSize: 12, color: colors.textMuted, background: colors.surfaceAlt, padding: "2px 6px", borderRadius: 4 }}>
                                        {assign.role === 'lead' ? 'מוביל' : 'תומך'}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => handleRemoveAssignment(assign.id)}
                                    style={{ border: "none", background: "none", color: colors.danger, cursor: "pointer" }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="ציוד אישי (פיתוח עתידי)">
                    <div style={{ color: colors.textMuted, fontStyle: "italic" }}>
                        כאן תהיה אפשרות להגדיר גלשן ואפוד ספציפיים לגולש זה.
                    </div>
                </Section>
            </>
        ) : (
            <div style={{ 
                height: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: colors.textMuted, 
                border: `2px dashed ${colors.border}`,
                borderRadius: 8,
                minHeight: 300
            }}>
                בחר גולש מרשימת הנוכחות כדי לנהל את השיבוץ שלו
            </div>
        )}
      </div>
    </div>
  );
}

