import { useState } from "react";
import { Activity } from "@/type";
import { Section, FormGrid } from "@/app/components/shared/layoutPrimitives";
import { Button } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
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
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Section title="סיכום פעילות">
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>סיכום כללי</label>
            <textarea
              style={{ width: "100%", minHeight: 100, padding: 8, borderRadius: 4, border: `1px solid ${colors.border}` }}
              value={formData.summary_general}
              onChange={(e) => setFormData({ ...formData, summary_general: e.target.value })}
              placeholder="איך עברה הפעילות באופן כללי?"
            />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
            <div>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: 4, color: "green" }}>נקודות לשימור</label>
              <textarea
                style={{ width: "100%", minHeight: 100, padding: 8, borderRadius: 4, border: `1px solid ${colors.border}` }}
                value={formData.summary_preserve}
                onChange={(e) => setFormData({ ...formData, summary_preserve: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: 4, color: "red" }}>נקודות לשיפור</label>
              <textarea
                style={{ width: "100%", minHeight: 100, padding: 8, borderRadius: 4, border: `1px solid ${colors.border}` }}
                value={formData.summary_improve}
                onChange={(e) => setFormData({ ...formData, summary_improve: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Section>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: spacing.lg }}>
        <Button variant="outline" onClick={handleSave} disabled={saving}>
          שמור טיוטה
        </Button>
        {activity.status !== "Completed" && (
          <Button variant="primary" onClick={handleCompleteActivity} disabled={saving}>
             סיים פעילות וסגור
          </Button>
        )}
      </div>
    </div>
  );
}



