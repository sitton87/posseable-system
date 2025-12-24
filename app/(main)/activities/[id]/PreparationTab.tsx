"use client";

import { useState, useEffect } from "react";
import { Activity, ActivityEquipmentRequest, EquipmentItem } from "@/type";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { Button, Input, Select } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { ChecklistSection } from "./ChecklistSection";

export function PreparationTab({ 
  activity,
  refresh
}: { 
  activity: Activity & { 
    equipment?: ActivityEquipmentRequest[];
    checklist?: any[];
  }; 
  refresh: () => void;
}) {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [newItemId, setNewItemId] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // Load equipment catalog for selection
    fetch("/api/equipment")
      .then(res => res.json())
      .then(data => {
        if (data.success) setItems(data.items);
      })
      .catch(err => console.error(err));
  }, []);

  const handleAddEquipment = async () => {
    if (!newItemId) return;
    setAdding(true);
    try {
      const res = await fetch("/api/activities/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_id: activity.id,
          item_id: newItemId,
          quantity: newQty,
          notes: ""
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
      setAdding(false);
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

  const equipmentList = activity.equipment || [];

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "1fr 1fr", 
      gap: spacing.lg,
      alignItems: "start"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
        <Section title="רשימת ציוד לפעילות">
        <div style={{ display: "flex", gap: spacing.md, alignItems: "flex-end", marginBottom: spacing.lg }}>
           <div style={{ flex: 1 }}>
             <Select
               label="בחר ציוד להוספה"
               value={newItemId}
               onChange={(e) => setNewItemId(e.target.value)}
               options={[
                 { value: "", label: "בחר פריט..." },
                 ...items.map(i => ({ value: i.id.toString(), label: i.name }))
               ]}
             />
           </div>
           <div style={{ width: 100 }}>
             <Input 
               label="כמות" 
               type="number" 
               value={newQty} 
               onChange={(e) => setNewQty(Number(e.target.value))} 
               min={1}
             />
           </div>
           <Button onClick={handleAddEquipment} disabled={adding || !newItemId}>
             <Plus size={16} style={{ marginLeft: 6 }} />
             הוסף
           </Button>
        </div>

        {equipmentList.length === 0 ? (
          <div style={{ color: colors.textMuted, textAlign: "center", padding: spacing.lg }}>
            טרם שויך ציוד לפעילות זו
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}`, textAlign: "right" }}>
                  <th style={{ padding: spacing.sm }}>שם הפריט</th>
                  <th style={{ padding: spacing.sm }}>כמות נדרשת</th>
                  <th style={{ padding: spacing.sm }}>סטטוס</th>
                  <th style={{ padding: spacing.sm }}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {equipmentList.map(req => (
                  <tr key={req.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: spacing.sm }}>{req.item_name}</td>
                    <td style={{ padding: spacing.sm }}>{req.quantity}</td>
                    <td style={{ padding: spacing.sm }}>{req.status}</td>
                    <td style={{ padding: spacing.sm }}>
                      <button 
                        onClick={() => handleRemoveEquipment(req.id)}
                        style={{ color: colors.danger, background: "none", border: "none", cursor: "pointer" }}
                        title="הסר"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column" }}>
        <ChecklistSection activity={activity} refresh={refresh} />
      </div>
    </div>
  );
}

