"use client";

import { useState, useEffect } from "react";
import { Activity, Surfer, Volunteer } from "@/type";
import { Section } from "@/app/components/shared/layoutPrimitives";
import {
  Card,
  Title,
  Text,
  TextInput,
  Select,
  SelectItem,
  Button,
} from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { toast } from "sonner";
import {
  UserIcon,
  UsersIcon,
  ShieldCheckIcon,
  TrashIcon,
  PlusIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

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

  const [selectedSurferId, setSelectedSurferId] = useState<string | null>(null);
  const [newVolunteerId, setNewVolunteerId] = useState("");
  const [newRole, setNewRole] = useState("support");

  const [draggedVolunteerId, setDraggedVolunteerId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activity.id, activity.group_id]);

  const loadData = async () => {
    setLoading(true);
    try {
        if (activity.group_id) {
            const surfersRes = await fetch(`/api/groups?includeSurfers=true`);
            const surfersData = await surfersRes.json();
            if (surfersData.success) {
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

        const regRes = await fetch(`/api/activities/registrations?activity_id=${activity.id}`);
        const regData = await regRes.json();
        if (regData.success) setRegistrations(regData.registrations);

        const actRes = await fetch(`/api/activities/${activity.id}`);
        const actData = await actRes.json();
        if(actData.success && actData.activity.assignments) {
            setAssignments(actData.activity.assignments);
        }

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

  const assignedVolunteerIds = new Set(assignments.map(a => a.volunteer_id));
  const availableVolunteers = volunteers.filter(v => !assignedVolunteerIds.has(v.national_id));

  return (
    <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-5 items-start h-[calc(100vh-200px)] min-h-[600px]">
      
      {/* Column 1 (Right): Surfers Attendance */}
      <div className="flex flex-col h-full overflow-hidden">
        <Section title="נוכחות גולשים">
            <div className="overflow-y-auto flex-1 pr-1 flex flex-col gap-2">
                {groupSurfers.length === 0 && <Text style={{ color: cssVar.text.muted }}>אין גולשים בקבוצה זו</Text>}
                {groupSurfers.map(surfer => {
                    const reg = registrations.find(r => r.surfer_id === surfer.national_id);
                    const isAttending = !!reg;
                    const surferAssignments = assignments.filter(a => a.surfer_id === surfer.national_id);
                    const hasLead = surferAssignments.some(a => a.role === 'lead');
                    
                    return (
                        <Card 
                            key={surfer.national_id}
                            onDragOver={isAttending ? onDragOver : undefined}
                            onDrop={isAttending ? (e) => onDrop(e, surfer.national_id) : undefined}
                            className={`p-2 flex items-center justify-between transition-all ${
                              selectedSurferId === surfer.national_id 
                                ? 'ring-2 ring-tremor-brand' 
                                : ''
                            } ${isAttending ? 'cursor-pointer opacity-100' : 'cursor-default opacity-70'}`}
                            onClick={() => isAttending && setSelectedSurferId(surfer.national_id)}
                        >
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={isAttending}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        toggleAttendance(surfer.national_id, reg?.id);
                                    }}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <div>
                                    <Text className="font-medium">{surfer.full_name}</Text>
                                    {isAttending && (
                                        <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                                            <UsersIcon className="w-3 h-3 inline mr-1" /> {surferAssignments.length} מתנדבים
                                            {!hasLead && <span style={{ color: cssVar.status.warning }}> (חסר מוביל)</span>}
                                        </Text>
                                    )}
                                </div>
                            </div>
                            {isAttending && <ArrowRightIcon className="w-4 h-4" style={{ color: cssVar.text.muted }} />}
                        </Card>
                    );
                })}
            </div>
        </Section>
      </div>

      {/* Column 2 (Middle): Assignment Details */}
      <div className="flex flex-col h-full overflow-hidden">
        {selectedSurfer ? (
            <Section title={`שיבוץ צוות ל${selectedSurfer.full_name}`}>
                <div className="flex gap-4 mb-5 items-end">
                    <div className="flex-[2]">
                        <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>מתנדב</Text>
                        <Select
                            value={newVolunteerId || undefined}
                            onValueChange={(val) => setNewVolunteerId(val || "")}
                            placeholder="בחר מתנדב..."
                        >
                            {availableVolunteers.map(v => (
                                <SelectItem key={v.national_id} value={v.national_id}>{v.full_name}</SelectItem>
                            ))}
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>תפקיד</Text>
                        <Select
                            value={newRole}
                            onValueChange={(val) => setNewRole(val)}
                        >
                            <SelectItem value="support">תומך</SelectItem>
                            <SelectItem value="lead">מוביל צוות</SelectItem>
                        </Select>
                    </div>
                    <Button icon={PlusIcon} onClick={() => handleAddAssignment(newVolunteerId, newRole, selectedSurfer.national_id)} disabled={!newVolunteerId}>
                        הוסף
                    </Button>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
                    {selectedSurferAssignments.length === 0 && <Text style={{ color: cssVar.text.muted }}>טרם שובצו מתנדבים (גרור מתנדב לכאן)</Text>}
                    {selectedSurferAssignments.map(assign => (
                        <Card key={assign.id} className="p-2 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {assign.role === 'lead' ? (
                                    <ShieldCheckIcon className="w-5 h-5" style={{ color: cssVar.brand.primary }} />
                                ) : (
                                    <UserIcon className="w-5 h-5" style={{ color: cssVar.text.muted }} />
                                )}
                                <Text className={assign.role === 'lead' ? 'font-semibold' : ''}>{assign.volunteer_name}</Text>
                                <span
                                    className="text-xs px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: cssVar.bg.secondary }}
                                >
                                    {assign.role === 'lead' ? 'מוביל' : 'תומך'}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleRemoveAssignment(assign.id)}
                                className="border-none bg-transparent cursor-pointer"
                                style={{ color: cssVar.status.danger }}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </Card>
                    ))}
                </div>
                
                <div
                    className="mt-6 pt-5 border-t border-dashed"
                    style={{ borderColor: cssVar.border.primary }}
                >
                    <Text className="text-sm font-semibold mb-2">ציוד אישי</Text>
                    <Text className="italic text-sm" style={{ color: cssVar.text.muted }}>
                        כאן תהיה אפשרות להגדיר גלשן ואפוד ספציפיים לגולש זה.
                    </Text>
                </div>
            </Section>
        ) : (
            <Card className="h-full flex items-center justify-center border-2 border-dashed text-center p-5">
                <Text style={{ color: cssVar.text.muted }}>
                    בחר גולש מרשימת הנוכחות כדי לנהל את השיבוץ שלו, או גרור מתנדב על שם הגולש.
                </Text>
            </Card>
        )}
      </div>

      {/* Column 3 (Left): Volunteers Bank */}
      <div className="flex flex-col h-full overflow-hidden">
          <Section title={`מאגר מתנדבים זמינים (${availableVolunteers.length})`}>
              <div className="overflow-y-auto flex-1 pr-1">
                  <TextInput 
                    placeholder="חיפוש מתנדב..." 
                    className="mb-2"
                  />
                  <div className="flex flex-col gap-1">
                      {availableVolunteers.map(v => {
                          const isTeamLead = v.classification === 'staff' || v.classification === 'management';
                          return (
                            <Card
                                key={v.national_id}
                                draggable
                                onDragStart={(e) => onDragStart(e, v.national_id)}
                                className="p-2 cursor-grab flex items-center justify-between text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <Text className="font-medium">{v.full_name}</Text>
                                </div>
                                {isTeamLead && (
                                    <span
                                        title="מנהל צוות"
                                        className="text-xs px-1 py-0.5 rounded"
                                        style={{
                                            color: cssVar.brand.primary,
                                            backgroundColor: cssVar.status.infoSoft,
                                        }}
                                    >
                                        Lead
                                    </span>
                                )}
                            </Card>
                          );
                      })}
                      {availableVolunteers.length === 0 && (
                          <div className="text-center p-5">
                              <Text style={{ color: cssVar.text.muted }}>אין מתנדבים זמינים</Text>
                          </div>
                      )}
                  </div>
              </div>
          </Section>
      </div>
    </div>
  );
}
