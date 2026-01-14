"use client";

import { useState } from "react";
import { Activity } from "@/type";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { Card, Title, Text, Textarea, Button } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { toast } from "sonner";

export function SummaryTab({ 
  activity,
  onUpdate
}: { 
  activity: Activity;
  onUpdate: (data: Partial<Activity>) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    summary_general: activity.summary_general || "",
    summary_preserve: activity.summary_preserve || "",
    summary_improve: activity.summary_improve || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(formData);
      toast.success("הסיכום נשמר בהצלחה");
    } catch (error) {
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteActivity = async () => {
    if (!confirm("האם אתה בטוח שברצונך לסיים את הפעילות? הסטטוס ישתנה ל'הושלם'.")) return;
    setSaving(true);
    try {
      await onUpdate({ ...formData, status: "Completed" });
      toast.success("הפעילות הסתיימה בהצלחה!");
    } catch (error) {
      toast.error("שגיאה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Section title="סיכום פעילות">
        <div className="flex flex-col gap-4">
          <div>
            <Text className="font-bold mb-1">סיכום כללי</Text>
            <Textarea
              rows={4}
              value={formData.summary_general}
              onChange={(e) => setFormData({ ...formData, summary_general: e.target.value })}
              placeholder="איך עברה הפעילות באופן כללי?"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="font-bold mb-1" style={{ color: cssVar.status.success }}>נקודות לשימור</Text>
              <Textarea
                rows={4}
                value={formData.summary_preserve}
                onChange={(e) => setFormData({ ...formData, summary_preserve: e.target.value })}
              />
            </div>
            <div>
              <Text className="font-bold mb-1" style={{ color: cssVar.status.danger }}>נקודות לשיפור</Text>
              <Textarea
                rows={4}
                value={formData.summary_improve}
                onChange={(e) => setFormData({ ...formData, summary_improve: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Section>

      <div className="flex justify-between mt-5">
        <Button variant="secondary" onClick={handleSave} disabled={saving}>
          שמור טיוטה
        </Button>
        {activity.status !== "Completed" && (
          <Button onClick={handleCompleteActivity} disabled={saving}>
             סיים פעילות וסגור
          </Button>
        )}
      </div>
    </div>
  );
}
