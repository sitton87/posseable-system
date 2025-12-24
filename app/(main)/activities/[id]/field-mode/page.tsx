"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Activity } from "@/type";
import { colors, spacing } from "@/app/styles/foundations";
import { toast } from "sonner";

// Icons (Simulated with text/emoji for simplicity, can be replaced with Lucide)
const PhoneIcon = () => <span>📞</span>;
const MedicalIcon = () => <span>🚑</span>;
const BackIcon = () => <span>↩️</span>;

export default function FieldModePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    fetchActivity();
  }, [id]);

  async function fetchActivity() {
    try {
      const res = await fetch(`/api/activities/${id}`);
      const data = await res.json();
      if (data.success) {
        setActivity(data.activity);
        setAssignments(data.activity.assignments || []);
      }
    } catch (error) {
      toast.error("שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  }

  // Handle Attendance Toggle
  const toggleAttendance = async (surferId: string, currentStatus: boolean) => {
    // In a real app, update DB. For now, local state.
    // await fetch('/api/attendance', ...)
    toast.success("סטטוס נוכחות עודכן");
  };

  if (loading) return <div style={{ padding: 20, textAlign: "center", color: "white" }}>טוען מצב שטח...</div>;
  if (!activity) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#1a1a1a", // Dark mode for field
        color: "#ffffff",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: spacing.md,
          background: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #333",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "1px solid #555",
            borderRadius: 8,
            padding: "8px 16px",
            color: "white",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <BackIcon /> חזרה למערכת
        </button>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>{activity.group_name}</div>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            {activity.start_time?.slice(0, 5)} - {activity.end_time?.slice(0, 5)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: spacing.md, flex: 1 }}>
        
        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md, marginBottom: spacing.xl }}>
          <div style={{ background: "#333", padding: spacing.md, borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📋</div>
            <div>צ'ק ליסט</div>
          </div>
          <div style={{ background: "#333", padding: spacing.md, borderRadius: 12, textAlign: "center" }}>
             <div style={{ fontSize: 24, marginBottom: 4 }}>🆘</div>
             <div>נוהל חירום</div>
          </div>
        </div>

        {/* Surfers List */}
        <h3 style={{ borderBottom: "1px solid #444", paddingBottom: 8, marginBottom: 16 }}>רשימת גולשים ({assignments.length})</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              style={{
                background: "#2a2a2a",
                borderRadius: 12,
                padding: spacing.md,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
                  {assignment.surfer_name}
                </div>
                <div style={{ fontSize: 14, color: "#bbb" }}>
                  חונך: {assignment.volunteer_name || "ללא"}
                </div>
              </div>

              <div style={{ display: "flex", gap: spacing.md }}>
                <button
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "none",
                    background: "#0056b3",
                    color: "white",
                    fontSize: 20,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="טלפון חירום"
                  onClick={() => alert("מחייג לאיש קשר חירום...")}
                >
                  <PhoneIcon />
                </button>
                <button
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "none",
                    background: "#c0392b",
                    color: "white",
                    fontSize: 20,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="מידע רפואי"
                  onClick={() => alert("פותח כרטיס רפואי...")}
                >
                  <MedicalIcon />
                </button>
                <button
                   style={{
                    padding: "0 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "#27ae60",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                   }}
                >
                  נוכח
                </button>
              </div>
            </div>
          ))}
          
          {assignments.length === 0 && (
            <div style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
              לא שובצו גולשים לפעילות זו.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

