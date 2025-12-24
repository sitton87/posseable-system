"use client";

import { useState, useEffect } from "react";
import { Activity } from "@/type";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { Button, Input, Select } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
import { toast } from "sonner";
import { Plus, Trash2, CheckSquare, Square, User } from "lucide-react";

export function ChecklistSection({ activity, refresh }: { activity: Activity & { checklist?: any[] }, refresh: () => void }) {
  const [newItem, setNewItem] = useState("");
  const [assignee, setAssignee] = useState("");
  const [assigneeType, setAssigneeType] = useState<"volunteer" | "surfer" | "">("");
  
  // Lists for selection
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [surfers, setSurfers] = useState<any[]>([]);

  useEffect(() => {
    // Load potential assignees - Only Staff and Management
    Promise.all([
      fetch("/api/volunteers?classification=staff").then(r => r.json()),
      fetch("/api/volunteers?classification=management").then(r => r.json())
    ]).then(([sData, mData]) => {
      const staff = sData.success ? sData.volunteers : [];
      const mgmt = mData.success ? mData.volunteers : [];
      // Dedup
      const combined = Array.from(new Map([...staff, ...mgmt].map((v: any) => [v.national_id, v])).values());
      setVolunteers(combined);
    });
  }, []);

  const handleAdd = async () => {
    if (!newItem) return;
    try {
      const res = await fetch("/api/activities/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_id: activity.id,
          item_text: newItem,
          category: "general",
          assigned_to_volunteer_id: assigneeType === "volunteer" ? assignee : null,
          assigned_to_surfer_id: assigneeType === "surfer" ? assignee : null
        })
      });
      if (res.ok) {
        setNewItem("");
        setAssignee("");
        setAssigneeType("");
        refresh();
        toast.success("משימה נוספה");
      }
    } catch (e) { toast.error("שגיאה"); }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
     try {
      await fetch("/api/activities/checklist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_completed: !currentStatus })
      });
      refresh();
    } catch (e) { toast.error("שגיאה"); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("למחוק משימה?")) return;
     try {
      await fetch(`/api/activities/checklist?id=${id}`, { method: "DELETE" });
      refresh();
    } catch (e) { toast.error("שגיאה"); }
  };

  const checklist = activity.checklist || [];

  return (
    <Section title="צ'ק ליסט ומשימות">
      <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.lg, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 200 }}>
          <Input 
            label="תיאור משימה" 
            value={newItem} 
            onChange={(e) => setNewItem(e.target.value)} 
            placeholder="מה צריך לעשות?"
          />
        </div>
        
        <div style={{ flex: 1, minWidth: 150 }}>
             <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: colors.textMuted }}>שיוך (אופציונלי)</label>
             <select 
               style={{ width: "100%", padding: 8, borderRadius: 4, border: `1px solid ${colors.border}` }}
               value={assigneeType + ":" + assignee}
               onChange={(e) => {
                 const [type, id] = e.target.value.split(":");
                 setAssigneeType(type as any);
                 setAssignee(id);
               }}
             >
               <option value=":">ללא שיוך</option>
               <optgroup label="מתנדבים">
                 {volunteers.map(v => (
                   <option key={v.national_id} value={`volunteer:${v.national_id}`}>{v.full_name}</option>
                 ))}
               </optgroup>
               {/* Uncomment when surfer API is confirmed */}
               {/* <optgroup label="גולשים">
                 {surfers.map(s => (
                   <option key={s.national_id} value={`surfer:${s.national_id}`}>{s.full_name}</option>
                 ))}
               </optgroup> */}
             </select>
        </div>

        <Button onClick={handleAdd} disabled={!newItem}>
          <Plus size={16} style={{ marginLeft: 6 }} /> הוסף
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
        {checklist.map(item => (
          <div key={item.id} style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: spacing.sm, 
            background: item.is_completed ? colors.surfaceAlt : "white",
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            opacity: item.is_completed ? 0.7 : 1
          }}>
            <button 
              onClick={() => toggleComplete(item.id, item.is_completed)}
              style={{ background: "none", border: "none", cursor: "pointer", marginRight: spacing.sm }}
            >
              {item.is_completed ? <CheckSquare size={20} color={colors.success} /> : <Square size={20} />}
            </button>
            
            <div style={{ flex: 1, textDecoration: item.is_completed ? "line-through" : "none" }}>
              {item.item_text}
            </div>

            {(item.assigned_to_volunteer_name || item.assigned_to_surfer_name) && (
               <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: colors.primary, background: colors.primary + "10", padding: "2px 6px", borderRadius: 10, marginLeft: spacing.md }}>
                 <User size={12} />
                 {item.assigned_to_volunteer_name || item.assigned_to_surfer_name}
               </div>
            )}

            <button 
               onClick={() => handleDelete(item.id)}
               style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {checklist.length === 0 && <div style={{ color: colors.textMuted, fontStyle: "italic" }}>אין משימות</div>}
      </div>
    </Section>
  );
}

