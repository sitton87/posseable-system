"use client";

import { Activity, EquipmentItem } from "@/type";
import { colors, spacing } from "@/app/styles/foundations";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { Button, Select, Input } from "@/app/components/ui";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Wrench, Plus, Trash2 } from "lucide-react";
import { TasksBoard } from "@/app/components/shared/TasksBoard";

const TASKS_TEMPLATE = [
    { offset: -7, text: "שליחת זימונים למתנדבים" },
    { offset: -5, text: "פרסום בקבוצות וואטסאפ" },
    { offset: -3, text: "וידוא התייצבות גולשים וסגירת הרשמה" },
    { offset: -2, text: "בדיקת ציוד, גלשנים והעמסה" },
    { offset: -1, text: "שליחת תזכורת סופית ומיקום למשתתפים" },
    { offset: 0, text: "תדריך בוקר למדריכים וחלוקת גזרות" },
    { offset: 1, text: "סיכום פעילות, העלאת מדיה והפקת לקחים" }
];

export function TimelineTab({ 
  activity,
  refresh
}: { 
  activity: Activity & { checklist?: any[], equipment?: any[] }; 
  refresh: () => void;
}) {
    const [generating, setGenerating] = useState(false);
    const [tasksKey, setTasksKey] = useState(0); 
    const [taskTrigger, setTaskTrigger] = useState<{ action: string, ts: number } | null>(null);
    const [assignees, setAssignees] = useState<any[]>([]);
    
    // Equipment State
    const [items, setItems] = useState<EquipmentItem[]>([]);
    const [newItemId, setNewItemId] = useState("");
    const [newQty, setNewQty] = useState(1);
    const [addingEquip, setAddingEquip] = useState(false);

    useEffect(() => {
        // Fetch staff and management for assignment
        Promise.all([
            fetch("/api/volunteers?classification=staff").then(r => r.json()),
            fetch("/api/volunteers?classification=management").then(r => r.json()),
            fetch("/api/equipment").then(r => r.json())
        ]).then(([sData, mData, eData]) => {
            const staff = sData.success ? sData.volunteers : [];
            const mgmt = mData.success ? mData.volunteers : [];
            const combined = Array.from(new Map([...staff, ...mgmt].map((v: any) => [v.national_id, v])).values());
            setAssignees(combined.map((v: any) => ({ id: v.national_id, name: v.full_name })));
            
            if (eData.success) setItems(eData.items);
        });
    }, []);

    const handleAddEquipment = async () => {
        if (!newItemId) return;
        setAddingEquip(true);
        try {
          const res = await fetch("/api/activities/equipment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activity_id: activity.id,
              item_id: newItemId,
              quantity: newQty,
              notes: "REQUESTED" // Default status/note
            })
          });
          if (res.ok) {
            toast.success("ציוד נוסף בהצלחה");
            setNewItemId("");
            setNewQty(1);
            refresh();
          } else {
            toast.error("שגיאה בהוספת ציוד");
          }
        } catch (e) {
          toast.error("שגיאה בשרת");
        } finally {
          setAddingEquip(false);
        }
    };

    const handleRemoveEquipment = async (reqId: string) => {
        if (!confirm("האם להסיר את הציוד מהפעילות?")) return;
        try {
          await fetch(`/api/activities/equipment?id=${reqId}`, { method: "DELETE" });
          refresh();
          toast.success("הוסר בהצלחה");
        } catch (e) { toast.error("שגיאה"); }
    };

    const handleUpdateEquipmentStatus = async (reqId: string, newStatus: string) => {
        try {
            await fetch(`/api/activities/equipment`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: reqId, status: newStatus })
            });
            refresh();
        } catch(e) { toast.error("שגיאה בעדכון סטטוס"); }
    };

    const generatePreparationTasks = async () => {
        if (!activity.activity_date) {
            toast.error("לא ניתן לייצר משימות ללא תאריך פעילות");
            return;
        }

        if (!confirm("האם לייצר אוטומטית משימות הכנה?")) return;

        setGenerating(true);
        const activityDate = new Date(activity.activity_date);
        let successCount = 0;

        try {
            await Promise.all(TASKS_TEMPLATE.map(async (task) => {
                const dueDate = new Date(activityDate);
                dueDate.setDate(activityDate.getDate() + task.offset);
                
                // Use the standard Notes API
                const res = await fetch("/api/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        entity_type: "activity",
                        entity_id: activity.id.toString(),
                        title: task.text,
                        body: task.text, 
                        status: "not_started",
                        due_date: dueDate.toISOString().split('T')[0]
                    })
                });
                if (res.ok) successCount++;
            }));

            if (successCount > 0) {
                toast.success(`נוצרו ${successCount} משימות בהצלחה`);
                setTasksKey(prev => prev + 1); // Refresh TasksBoard
                refresh(); 
            } else {
                toast.error("שגיאה ביצירת משימות");
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בתהליך");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: spacing.lg, alignItems: "start" }}>
            
            {/* Right Column: Tasks Timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
                <Section title="ציר זמן והכנות">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
                        <div style={{ color: colors.textMuted, fontSize: 13 }}>
                            ניהול משימות הכנה לפי לוח זמנים.
                        </div>
                        <div style={{ display: "flex", gap: spacing.sm }}>
                            <Button variant="secondary" onClick={generatePreparationTasks} disabled={generating} style={{ fontSize: 12 }}>
                                {generating ? "מייצר..." : "⚡ טען תבנית הכנה"}
                            </Button>
                            <Button variant="primary" onClick={() => setTaskTrigger({ action: 'open_add_modal', ts: Date.now() })} style={{ fontSize: 12 }}>
                                <Plus size={14} style={{ marginLeft: 6 }} /> הוסף משימה
                            </Button>
                        </div>
                    </div>
                    
                    <TasksBoard 
                        key={tasksKey}
                        entityType="activity"
                        fixedEntityId={activity.id.toString()}
                        title=""
                        assignees={assignees} // Pass volunteers as assignees
                        variant="list"
                        hideAddButton={true}
                        externalTrigger={taskTrigger}
                    />
                </Section>
            </div>

            {/* Left Column: Equipment Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
                <Section title="רשימת ציוד לוגיסטי">
                    <div style={{ display: "flex", gap: spacing.sm, alignItems: "flex-end", marginBottom: spacing.md }}>
                       <div style={{ flex: 1 }}>
                         <Select
                           label="בחר ציוד"
                           value={newItemId}
                           onChange={(e) => setNewItemId(e.target.value)}
                           options={[
                             { value: "", label: "בחר פריט..." },
                             ...items.map(i => ({ value: i.id.toString(), label: i.name }))
                           ]}
                         />
                       </div>
                       <div style={{ width: 80 }}>
                         <Input 
                           label="כמות" 
                           type="number" 
                           value={newQty} 
                           onChange={(e) => setNewQty(Number(e.target.value))} 
                           min={1}
                         />
                       </div>
                       <Button onClick={handleAddEquipment} disabled={addingEquip || !newItemId} style={{ padding: "0 12px" }}>
                         <Plus size={16} />
                       </Button>
                    </div>

                    {(!activity.equipment || activity.equipment.length === 0) ? (
                        <div style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>
                            לא נבחר ציוד לפעילות זו.
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {activity.equipment.map((item: any) => (
                                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, background: "white", borderRadius: 4, border: `1px solid ${colors.border}` }}>
                                    <div style={{ background: colors.surfaceAlt, padding: 6, borderRadius: "50%" }}>
                                        <Wrench size={14} color={colors.textMuted} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.item_name}</div>
                                        <div style={{ fontSize: 12, color: colors.textMuted }}>כמות: {item.quantity}</div>
                                    </div>
                                    <select 
                                        style={{ fontSize: 11, padding: "2px 4px", borderRadius: 4, border: `1px solid ${colors.borderMuted}` }}
                                        value={item.status || "REQUESTED"}
                                        onChange={(e) => handleUpdateEquipmentStatus(item.id, e.target.value)}
                                    >
                                        <option value="REQUESTED">דרוש</option>
                                        <option value="APPROVED">אושר</option>
                                        <option value="TAKEN">נלקח</option>
                                        <option value="RETURNED">הוחזר</option>
                                        <option value="MISSING">חסר במלאי</option>
                                    </select>
                                    <button 
                                        onClick={() => handleRemoveEquipment(item.id)}
                                        style={{ color: colors.danger, background: "none", border: "none", cursor: "pointer", padding: 4 }}
                                        title="הסר"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            </div>
        </div>
    );
}
