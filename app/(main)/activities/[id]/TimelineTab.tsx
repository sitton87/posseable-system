"use client";

import { Activity, EquipmentItem } from "@/type";
import { cssVar } from "@/app/styles/design-system";
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
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  TrashIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
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
    
    const [items, setItems] = useState<EquipmentItem[]>([]);
    const [newItemId, setNewItemId] = useState("");
    const [newQty, setNewQty] = useState("1");
    const [addingEquip, setAddingEquip] = useState(false);

    useEffect(() => {
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
              quantity: Number(newQty),
              notes: "REQUESTED"
            })
          });
          if (res.ok) {
            toast.success("ציוד נוסף בהצלחה");
            setNewItemId("");
            setNewQty("1");
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
                setTasksKey(prev => prev + 1);
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
        <div className="grid grid-cols-[2fr_1fr] gap-5 items-start">
            
            {/* Right Column: Tasks Timeline */}
            <div className="flex flex-col gap-5">
                <Section title="ציר זמן והכנות">
                    <div className="flex justify-between items-center mb-4">
                        <Text style={{ color: cssVar.text.muted }}>
                            ניהול משימות הכנה לפי לוח זמנים.
                        </Text>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" icon={BoltIcon} onClick={generatePreparationTasks} disabled={generating}>
                                {generating ? "מייצר..." : "טען תבנית הכנה"}
                            </Button>
                            <Button size="sm" icon={PlusIcon} onClick={() => setTaskTrigger({ action: 'open_add_modal', ts: Date.now() })}>
                                הוסף משימה
                            </Button>
                        </div>
                    </div>
                    
                    <TasksBoard 
                        key={tasksKey}
                        entityType="activity"
                        fixedEntityId={activity.id.toString()}
                        title=""
                        assignees={assignees}
                        variant="list"
                        hideAddButton={true}
                        externalTrigger={taskTrigger}
                    />
                </Section>
            </div>

            {/* Left Column: Equipment Checklist */}
            <div className="flex flex-col gap-5">
                <Section title="רשימת ציוד לוגיסטי">
                    <div className="flex gap-2 items-end mb-4">
                       <div className="flex-1">
                         <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>בחר ציוד</Text>
                         <Select
                           value={newItemId || undefined}
                           onValueChange={(val) => setNewItemId(val || "")}
                           placeholder="בחר פריט..."
                         >
                           {items.map(i => (
                             <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>
                           ))}
                         </Select>
                       </div>
                       <div className="w-20">
                         <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>כמות</Text>
                         <TextInput 
                           type="number" 
                           value={newQty} 
                           onChange={(e) => setNewQty(e.target.value)} 
                         />
                       </div>
                       <Button size="sm" icon={PlusIcon} onClick={handleAddEquipment} disabled={addingEquip || !newItemId} />
                    </div>

                    {(!activity.equipment || activity.equipment.length === 0) ? (
                        <Card className="text-center p-5 border-dashed">
                            <Text style={{ color: cssVar.text.muted }}>לא נבחר ציוד לפעילות זו.</Text>
                        </Card>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {activity.equipment.map((item: any) => (
                                <Card key={item.id} className="p-2 flex items-center gap-2">
                                    <div
                                      className="p-1.5 rounded-full"
                                      style={{ backgroundColor: cssVar.bg.secondary }}
                                    >
                                        <WrenchScrewdriverIcon className="w-3.5 h-3.5" style={{ color: cssVar.text.muted }} />
                                    </div>
                                    <div className="flex-1">
                                        <Text className="font-semibold text-sm">{item.item_name}</Text>
                                        <Text className="text-xs" style={{ color: cssVar.text.muted }}>כמות: {item.quantity}</Text>
                                    </div>
                                    <select 
                                        className="text-xs px-1 py-0.5 rounded border"
                                        style={{ borderColor: cssVar.border.primary }}
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
                                        className="bg-transparent border-none cursor-pointer p-1"
                                        style={{ color: cssVar.status.danger }}
                                        title="הסר"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                </Card>
                            ))}
                        </div>
                    )}
                </Section>
            </div>
        </div>
    );
}
