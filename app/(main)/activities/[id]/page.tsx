"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { tw, cssVar } from "@/app/styles/design-system";
import { PagePermissionGate } from "@/app/components/PagePermissionGate";
import { Activity } from "@/type";
import { ActivityHeader, TabButton } from "./components";
import { OverviewTab } from "./OverviewTab";
import { TimelineTab } from "./TimelineTab";
import { AssignmentsTab } from "./AssignmentsTab";
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
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "assignments" | "summary">(
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

  if (loading) return <div className={`p-ds-spacing-5 ${tw.text.muted}`}>טוען נתוני פעילות...</div>;
  if (!activity) return <div className={`p-ds-spacing-5 ${tw.text.muted}`}>פעילות לא נמצאה</div>;

  return (
    <PagePermissionGate>
      <div className="p-ds-spacing-5 w-full">
        <ActivityHeader activity={activity} />

        <div className={`flex gap-ds-spacing-1 mb-ds-spacing-5 ${tw.bg.secondary} p-ds-spacing-1 ${tw.rounded.full} w-fit flex-wrap`}>
          <TabButton active={activeTab === "overview"} onClick={() => updateTab("overview")}>
            מבט על
          </TabButton>
          <TabButton active={activeTab === "timeline"} onClick={() => updateTab("timeline")}>
            ציר זמן והכנות
          </TabButton>
          <TabButton active={activeTab === "assignments"} onClick={() => updateTab("assignments")}>
            שיבוצים וצוותים
          </TabButton>
          <TabButton active={activeTab === "summary"} onClick={() => updateTab("summary")}>
            סיכום ומשוב
          </TabButton>
        </div>

        <div className="min-h-[400px]">
          {activeTab === "overview" && (
            <OverviewTab activity={activity} onUpdate={handleUpdateActivity} />
          )}
          {activeTab === "timeline" && (
            <TimelineTab activity={activity} refresh={() => fetchActivity(true)} />
          )}
          {activeTab === "assignments" && (
            <AssignmentsTab activity={activity} />
          )}
          {activeTab === "summary" && (
            <SummaryTab activity={activity} onUpdate={handleUpdateActivity} />
          )}
        </div>
      </div>
    </PagePermissionGate>
  );
}
