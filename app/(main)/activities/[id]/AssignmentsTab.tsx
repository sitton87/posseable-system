"use client";

import { useState, useEffect } from "react";
import { Activity, Surfer, Volunteer } from "@/type";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { Button, Select } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
import { toast } from "sonner";
import { User, Users, Shield, Trash2, Plus, ArrowRight, GripVertical, CheckCircle2 } from "lucide-react";

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

  // DnD State
  const [draggedVolunteerId, setDraggedVolunteerId] = useState<string | null>(null);

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
                // Normalize IDs for comparison
                const activityGroupId = String(activity.group_id).toLowerCase();
                const group = surfersData.groups.find((g: any) => 
                    String(g.id).toLowerCase() === activityGroupId
                );
                
                if (group) {
                    setGroupSurfers(group.surfers || []);
                } else {
                    console.warn("Group not found for activity", activityGroupId, surfersData.groups);
                }
            }
        }

        // 2. Load Registrations
        const regRes = await fetch(`/api/activities/registrations?activity_id=${activity.id}`);
        const regData = await regRes.json();
        if (regData.success) setRegistrations(regData.registrations);

        // 3. Load Assignments
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
              await fetch(`/api/activities/registrations?id=${currentRegId}`, { method: "DELETE" });
          } else {
              await fetch(`/api/activities/registrations`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ activity_id: activity.id, surfer_id: surferId, status: "Approved" })
              });
          }
          loadData(); 
      } catch (e) {
          toast.error("שגיאה בעדכון נוכחות");
      }
  };

  const handleAddAssignment = async (vId: string, role: string, sId: string) => {
      if (!sId || !vId) return;
      
      const isAssigned = assignments.some(a => a.volunteer_id === vId);
      if (isAssigned) {
          toast.error("המתנדב כבר משובץ לגולש אחר");
          return;
      }

      // Check lead role permission
      if (role === "lead") {
          const volunteer = volunteers.find(v => v.national_id === vId);
          // Optional: Add logic here to block if needed
      }

      try {
          await fetch("/api/activities/assignments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  activity_id: activity.id,
                  surfer_id: sId,
                  volunteer_id: vId,
                  role: role
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

  const onDragStart = (e: React.DragEvent, volunteerId: string) => {
      setDraggedVolunteerId(volunteerId);
      e.dataTransfer.effectAllowed = "copy";
  };

  const onDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (e: React.DragEvent, surferId: string) => {
      e.preventDefault();
      if (draggedVolunteerId) {
          handleAddAssignment(draggedVolunteerId, "support", surferId);
          setDraggedVolunteerId(null);
      }
  };

  const selectedSurfer = groupSurfers.find(s => s.national_id === selectedSurferId);
  const selectedSurferAssignments = assignments.filter(a => a.surfer_id === selectedSurferId);

  // Filter available volunteers
  const assignedVolunteerIds = new Set(assignments.map(a => a.volunteer_id));
  const availableVolunteers = volunteers.filter(v => !assignedVolunteerIds.has(v.national_id));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: spacing.lg, alignItems: "start", height: "calc(100vh - 200px)", minHeight: 600 }}>
      
      {/* Column 1 (Right): Surfers Attendance */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <Section title="נוכחות גולשים">
            <div style={{ overflowY: "auto", flex: 1, paddingRight: 4, display: "flex", flexDirection: "column", gap: spacing.sm }}>
                {groupSurfers.length === 0 && <div style={{ color: colors.textMuted }}>אין גולשים בקבוצה זו</div>}
                {groupSurfers.map(surfer => {
                    const reg = registrations.find(r => r.surfer_id === surfer.national_id);
                    const isAttending = !!reg;
                    const surferAssignments = assignments.filter(a => a.surfer_id === surfer.national_id);
                    const hasLead = surferAssignments.some(a => a.role === 'lead');
                    
                    return (
                        <div 
                            key={surfer.national_id}
                            onDragOver={isAttending ? onDragOver : undefined}
                            onDrop={isAttending ? (e) => onDrop(e, surfer.national_id) : undefined}
                            style={{
                                padding: spacing.sm,
                                border: `1px solid ${selectedSurferId === surfer.national_id ? colors.primary : (isAttending ? colors.border : "transparent")}`,
                                borderRadius: 6,
                                background: isAttending ? (selectedSurferId === surfer.national_id ? colors.surfaceAlt : "white") : "#f9fafb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: isAttending ? "pointer" : "default",
                                opacity: isAttending ? 1 : 0.7,
                                transition: "all 0.2s"
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
      </div>

      {/* Column 2 (Middle): Assignment Details */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {selectedSurfer ? (
            <Section title={`שיבוץ צוות ל${selectedSurfer.full_name}`}>
                <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.lg, alignItems: "flex-end" }}>
                    <div style={{ flex: 2 }}>
                        <Select 
                            label="מתנדב"
                            value={newVolunteerId}
                            onChange={(e) => setNewVolunteerId(e.target.value)}
                            options={[
                                { value: "", label: "בחר מתנדב..." },
                                ...availableVolunteers.map(v => ({ value: v.national_id, label: v.full_name }))
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
                    <Button onClick={() => handleAddAssignment(newVolunteerId, newRole, selectedSurfer.national_id)} disabled={!newVolunteerId}>
                        <Plus size={16} style={{ marginLeft: 6 }} /> הוסף
                    </Button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm, overflowY: "auto", maxHeight: 400 }}>
                    {selectedSurferAssignments.length === 0 && <div style={{ color: colors.textMuted }}>טרם שובצו מתנדבים (גרור מתנדב לכאן)</div>}
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
                
                <div style={{ marginTop: spacing.xl, paddingTop: spacing.lg, borderTop: `1px dashed ${colors.border}` }}>
                    <h4 style={{ fontSize: 14, margin: "0 0 8px 0" }}>ציוד אישי</h4>
                    <div style={{ color: colors.textMuted, fontStyle: "italic", fontSize: 13 }}>
                        כאן תהיה אפשרות להגדיר גלשן ואפוד ספציפיים לגולש זה.
                    </div>
                </div>
            </Section>
        ) : (
            <div style={{ 
                height: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: colors.textMuted, 
                border: `2px dashed ${colors.border}`,
                borderRadius: 8,
                textAlign: "center",
                padding: 20
            }}>
                בחר גולש מרשימת הנוכחות כדי לנהל את השיבוץ שלו, או גרור מתנדב על שם הגולש.
            </div>
        )}
      </div>

      {/* Column 3 (Left): Volunteers Bank */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <Section title={`מאגר מתנדבים זמינים (${availableVolunteers.length})`}>
              <div style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
                  <input 
                    type="text" 
                    placeholder="חיפוש מתנדב..." 
                    style={{ width: "100%", padding: 8, marginBottom: 8, borderRadius: 4, border: `1px solid ${colors.border}` }} 
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {availableVolunteers.map(v => {
                          const isTeamLead = v.classification === 'staff' || v.classification === 'management';
                          return (
                            <div
                                key={v.national_id}
                                draggable
                                onDragStart={(e) => onDragStart(e, v.national_id)}
                                style={{
                                    padding: 8,
                                    background: "white",
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 4,
                                    cursor: "grab",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    fontSize: 13
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <GripVertical size={14} color={colors.textMuted} />
                                    <div style={{ fontWeight: 500 }}>{v.full_name}</div>
                                </div>
                                {isTeamLead && (
                                    <span title="מנהל צוות" style={{ color: colors.primary, fontSize: 10, background: colors.primary+"10", padding: "1px 4px", borderRadius: 4 }}>
                                        Lead
                                    </span>
                                )}
                            </div>
                          );
                      })}
                      {availableVolunteers.length === 0 && (
                          <div style={{ textAlign: "center", color: colors.textMuted, padding: 20 }}>
                              אין מתנדבים זמינים
                          </div>
                      )}
                  </div>
              </div>
          </Section>
      </div>
    </div>
  );
}
