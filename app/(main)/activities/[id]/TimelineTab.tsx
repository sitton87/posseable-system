"use client";

import { Activity } from "@/type";
import { colors, spacing } from "@/app/styles/foundations";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { Button } from "@/app/components/ui";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
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
    const [assignees, setAssignees] = useState<any[]>([]);

    useEffect(() => {
        // Fetch staff and management for assignment
        Promise.all([
            fetch("/api/volunteers?classification=staff").then(r => r.json()),
            fetch("/api/volunteers?classification=management").then(r => r.json())
        ]).then(([sData, mData]) => {
            const staff = sData.success ? sData.volunteers : [];
            const mgmt = mData.success ? mData.volunteers : [];
            const combined = Array.from(new Map([...staff, ...mgmt].map((v: any) => [v.national_id, v])).values());
            setAssignees(combined.map((v: any) => ({ id: v.national_id, name: v.full_name })));
        });
    }, []);

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
                        <Button variant="secondary" onClick={generatePreparationTasks} disabled={generating} style={{ fontSize: 12 }}>
                            {generating ? "מייצר..." : "⚡ טען תבנית הכנה"}
                        </Button>
                    </div>
                    
                    <TasksBoard 
                        key={tasksKey}
                        entityType="activity"
                        fixedEntityId={activity.id.toString()}
                        title=""
                        assignees={assignees} // Pass volunteers as assignees
                        variant="list"
                    />
                </Section>
            </div>

            {/* Left Column: Equipment Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
                <Section title="רשימת ציוד (צ'ק ליסט)">
                    {(!activity.equipment || activity.equipment.length === 0) ? (
                        <div style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>
                            אין ציוד משויך. עבור לטאב "לוגיסטיקה" כדי להוסיף ציוד.
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
                                        <div style={{ fontSize: 12, color: colors.textMuted }}>כמות: {item.quantity} | {item.status}</div>
                                    </div>
                                    <input type="checkbox" style={{ width: 16, height: 16 }} />
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            </div>
        </div>
    );
}
