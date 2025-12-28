"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { colors, spacing } from "@/app/styles/foundations";
import { PagePermissionGate } from "@/app/components/PagePermissionGate";
import { Activity } from "@/type";
import { ActivityHeader, TabButton } from "./components";
import { OverviewTab } from "./OverviewTab";
import { TimelineTab } from "./TimelineTab";
import { AssignmentsTab } from "./AssignmentsTab";
import { LogisticsTab } from "./LogisticsTab";
import { SummaryTab } from "./SummaryTab";
import { toast } from "sonner";

export default function ActivityManagementPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const initialTab = searchParams.get("tab") as any;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "assignments" | "logistics" | "summary">(
      initialTab || "overview"
  );

  useEffect(() => {
    fetchActivity();
  }, [id]);

  useEffect(() => {
      if(initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const updateTab = (tab: string) => {
      setActiveTab(tab as any);
      // Optional: update URL
      // router.replace(`/activities/${id}?tab=${tab}`, { scroll: false });
  };

  async function fetchActivity(silent = false) {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/activities/${id}`);
      const data = await res.json();
      
      if (data.success) {
        setActivity(data.activity);
        
        // Auto-select tab logic if no initial tab and just loaded
        if (!initialTab && loading) { // Only check auto-tab on initial load
        if (data.activity.status === "Completed") setActiveTab("summary");
        else if (data.activity.status === "In Progress") setActiveTab("assignments");
        }
      } else {
        toast.error("לא ניתן לטעון את הפעילות");
      }
    } catch (error) {
      console.error(error);
      toast.error("שגיאה בשרת");
    } finally {
      if (!silent) setLoading(false);
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
        toast.success("פעילות עודכנה");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("שגיאה בעדכון");
      throw error;
    }
  };

  if (loading) return <div style={{ padding: spacing.lg }}>טוען נתוני פעילות...</div>;
  if (!activity) return <div style={{ padding: spacing.lg }}>פעילות לא נמצאה</div>;

  return (
    <PagePermissionGate>
      <div style={{ padding: spacing.lg, width: "100%" }}> {/* Full width container */}
        <ActivityHeader activity={activity} />

        <div style={{ display: "flex", gap: spacing.xs, marginBottom: spacing.lg, background: "#f1f5f9", padding: 4, borderRadius: 50, width: "fit-content", flexWrap: "wrap" }}>
          <TabButton active={activeTab === "overview"} onClick={() => updateTab("overview")}>
            מבט על
          </TabButton>
          <TabButton active={activeTab === "timeline"} onClick={() => updateTab("timeline")}>
            ציר זמן והכנות
          </TabButton>
          <TabButton active={activeTab === "assignments"} onClick={() => updateTab("assignments")}>
            שיבוצים וצוותים
          </TabButton>
          <TabButton active={activeTab === "logistics"} onClick={() => updateTab("logistics")}>
            לוגיסטיקה וציוד
          </TabButton>
          <TabButton active={activeTab === "summary"} onClick={() => updateTab("summary")}>
            סיכום ומשוב
          </TabButton>
        </div>

        <div style={{ minHeight: 400 }}>
          {activeTab === "overview" && (
            <OverviewTab activity={activity} onUpdate={handleUpdateActivity} />
          )}
          {activeTab === "timeline" && (
            <TimelineTab activity={activity} refresh={() => fetchActivity(true)} />
          )}
          {activeTab === "assignments" && (
            <AssignmentsTab activity={activity} />
          )}
          {activeTab === "logistics" && (
            <LogisticsTab activity={activity} refresh={() => fetchActivity(true)} />
          )}
          {activeTab === "summary" && (
            <SummaryTab activity={activity} onUpdate={handleUpdateActivity} />
          )}
        </div>
      </div>
    </PagePermissionGate>
  );
}
