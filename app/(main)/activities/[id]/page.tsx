"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { colors, spacing } from "@/app/styles/foundations";
import { PagePermissionGate } from "@/app/components/PagePermissionGate";
import { Activity } from "@/type";
import { ActivityHeader, TabButton } from "./components";
import { PlanningTab } from "./PlanningTab";
import { PreparationTab } from "./PreparationTab";
import { ExecutionTab } from "./ExecutionTab";
import { SummaryTab } from "./SummaryTab";
import { toast } from "sonner";

export default function ActivityManagementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"planning" | "prep" | "exec" | "summary">("planning");

  useEffect(() => {
    fetchActivity();
  }, [id]);

  async function fetchActivity() {
    try {
      setLoading(true);
      const res = await fetch(`/api/activities/${id}`);
      const data = await res.json();
      
      if (data.success) {
        setActivity(data.activity);
        
        // Auto-select tab based on status if not manually set (simple logic)
        if (data.activity.status === "Completed") setActiveTab("summary");
        else if (data.activity.status === "In Progress") setActiveTab("exec");
      } else {
        toast.error("לא ניתן לטעון את הפעילות");
      }
    } catch (error) {
      console.error(error);
      toast.error("שגיאה בשרת");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateActivity = async (updates: Partial<Activity>) => {
    if (!activity) return;
    try {
      const res = await fetch("/api/activities/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activity, ...updates })
      });
      const data = await res.json();
      if (data.success) {
        fetchActivity(); // Refresh
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  if (loading) return <div style={{ padding: spacing.lg }}>טוען נתוני פעילות...</div>;
  if (!activity) return <div style={{ padding: spacing.lg }}>פעילות לא נמצאה</div>;

  return (
    <PagePermissionGate>
      <div style={{ padding: spacing.lg, maxWidth: 1200, margin: "0 auto" }}>
        <ActivityHeader activity={activity} />

        <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.lg, background: colors.surfaceAlt, padding: spacing.sm, borderRadius: 50, width: "fit-content" }}>
          <TabButton active={activeTab === "planning"} onClick={() => setActiveTab("planning")}>
            1. תכנון
          </TabButton>
          <TabButton active={activeTab === "prep"} onClick={() => setActiveTab("prep")}>
            2. הכנה
          </TabButton>
          <TabButton active={activeTab === "exec"} onClick={() => setActiveTab("exec")}>
            3. ביצוע
          </TabButton>
          <TabButton active={activeTab === "summary"} onClick={() => setActiveTab("summary")}>
            4. סיכום
          </TabButton>
        </div>

        <div style={{ background: colors.white, borderRadius: 8, minHeight: 400 }}>
          {activeTab === "planning" && (
            <PlanningTab activity={activity} onUpdate={handleUpdateActivity} />
          )}
          {activeTab === "prep" && (
            <PreparationTab activity={activity} refresh={fetchActivity} />
          )}
          {activeTab === "exec" && (
            <ExecutionTab activity={activity} />
          )}
          {activeTab === "summary" && (
            <SummaryTab activity={activity} onUpdate={handleUpdateActivity} />
          )}
        </div>
      </div>
    </PagePermissionGate>
  );
}

