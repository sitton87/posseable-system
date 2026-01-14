"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { cssVar } from "@/app/styles/design-system";
import { Toaster, toast } from "sonner";
import { ArrowRight, Check, X, Phone, AlertTriangle, Info, Clock, Users } from "lucide-react";
import { Modal } from "@/app/components/ui";

interface FieldData {
  activity: {
    id: number;
    group_name: string;
    activity_date: string;
    start_time: string;
    end_time: string;
    location: string;
    sea_condition: string;
  };
  surfers: Array<{
    national_id: string;
    full_name: string;
    medical_condition?: string;
    special_requirements?: string;
    needs_wheelchair: boolean;
    registration_id: number;
    attendance_status: string; // 'Approved', etc.
    actual_attendance: string; // 'Present', 'Absent', null
    emergency_name?: string;
    emergency_phone?: string;
    emergency_rel?: string;
    lead_volunteer_name?: string;
    lead_volunteer_phone?: string;
  }>;
}

export default function FieldModePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<FieldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSurfer, setSelectedSurfer] = useState<any>(null); // For modal
  const [modalType, setModalType] = useState<"medical" | "contact" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
        fetchData();
    }
  }, [id]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/field-mode/${id}`);
      
      if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.success) {
        setData(json);
      } else {
        const msg = json.error || "שגיאה בטעינת הנתונים";
        toast.error(msg);
        setError(msg);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("שגיאה בתקשורת: " + error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAttendance = async (regId: number, status: "Present" | "Absent" | null) => {
    if (!data) return;

    // Optimistic Update
    const oldSurfers = [...data.surfers];
    const updatedSurfers = data.surfers.map(s => 
      s.registration_id === regId ? { ...s, actual_attendance: status || "" } : s
    );
    setData({ ...data, surfers: updatedSurfers });

    try {
      const res = await fetch("/api/activities/registrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: regId, attendance_status: status })
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (e) {
      toast.error("שגיאה בעדכון");
      setData({ ...data, surfers: oldSurfers }); // Revert
    }
  };

  if (loading) return <div style={{ background: "#111", height: "100vh", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>טוען...</div>;
  
  if (error) return (
      <div style={{ padding: 20, color: "white", background: "#111", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div style={{ color: "#ef4444", fontSize: 20 }}>שגיאה: {error}</div>
          <button onClick={() => router.back()} style={{ padding: "10px 20px", background: "#333", border: "none", color: "white", borderRadius: 8 }}>חזור</button>
      </div>
  );

  if (!data) return (
    <div style={{ padding: 20, color: "white", background: "#111", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div>לא נמצא מידע לפעילות זו</div>
        <button onClick={() => router.back()} style={{ padding: "10px 20px", background: "#333", border: "none", color: "white", borderRadius: 8 }}>חזור</button>
    </div>
  );

  const presentCount = data.surfers.filter(s => s.actual_attendance === "Present").length;
  const totalCount = data.surfers.length;

  return (
    <div style={{ 
      background: "#121212", 
      minHeight: "100vh", 
      color: "#ffffff", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      paddingBottom: 80
    }}>
      <Toaster position="top-center" />
      
      {/* Sticky Header */}
      <div style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 50, 
        background: "#1e1e1e", 
        borderBottom: "1px solid #333",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: "#333", border: "none", color: "white", padding: 8, borderRadius: "50%" }}>
            <ArrowRight size={20} />
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{data.activity.group_name}</div>
            <div style={{ fontSize: 12, color: "#aaa", display: "flex", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={12} /> {data.activity.start_time?.slice(0, 5)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={12} /> {presentCount}/{totalCount}</span>
            </div>
          </div>
        </div>
        {data.activity.sea_condition && (
            <div style={{ background: "#0077b6", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: "bold" }}>
                🌊 {data.activity.sea_condition.slice(0, 10)}...
            </div>
        )}
      </div>

      {/* Surfer List */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {data.surfers.map(surfer => {
            const isPresent = surfer.actual_attendance === "Present";
            const hasMedical = surfer.medical_condition || surfer.needs_wheelchair;

            return (
                <div key={surfer.national_id} style={{ 
                    background: "#252525", 
                    borderRadius: 12, 
                    overflow: "hidden",
                    border: hasMedical ? "1px solid #ef4444" : "1px solid #333"
                }}>
                    <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div onClick={() => { setSelectedSurfer(surfer); setModalType("medical"); }}>
                            <div style={{ fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                                {surfer.full_name}
                                {hasMedical && <AlertTriangle size={16} color="#ef4444" />}
                            </div>
                            <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>
                                חונך: {surfer.lead_volunteer_name || "ללא"}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button 
                                onClick={() => { setSelectedSurfer(surfer); setModalType("contact"); }}
                                style={{ 
                                    width: 44, height: 44, borderRadius: 12, 
                                    background: "#333", border: "none", color: "#ddd",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                            >
                                <Phone size={20} />
                            </button>
                            
                            <button 
                                onClick={() => handleAttendance(surfer.registration_id, isPresent ? null : "Present")}
                                style={{ 
                                    width: 60, height: 44, borderRadius: 12, 
                                    background: isPresent ? "#22c55e" : "#333", 
                                    border: isPresent ? "none" : "1px solid #555", 
                                    color: "white",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.2s"
                                }}
                            >
                                {isPresent ? <Check size={24} /> : <span style={{ fontSize: 12, color: "#aaa" }}>סמן</span>}
                            </button>
                        </div>
                    </div>
                    {hasMedical && (
                        <div style={{ background: "#ef444420", padding: "6px 16px", fontSize: 12, color: "#fca5a5" }}>
                            דגש רפואי קיים
                        </div>
                    )}
                </div>
            );
        })}
        {data.surfers.length === 0 && <div style={{ textAlign: "center", color: "#666", marginTop: 40 }}>אין גולשים רשומים</div>}
      </div>

      {/* Modals */}
      {selectedSurfer && (
        <Modal 
            open={!!modalType} 
            onClose={() => setModalType(null)} 
        >
            <div style={{ padding: 20 }}>
                <h2 style={{ 
                    fontSize: 20, 
                    fontWeight: "bold", 
                    marginBottom: 20, 
                    borderBottom: "1px solid #eee", 
                    paddingBottom: 10,
                    color: "black"
                }}>
                    {modalType === "contact" ? "חירום וקשר" : "מידע רפואי"}
                </h2>

                <div style={{ color: "black" }}>
                {modalType === "contact" && (
                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ fontSize: 18 }}>
                            <strong>{selectedSurfer.emergency_name || "לא הוגדר איש קשר"}</strong>
                            <div style={{ fontSize: 14, color: "#666" }}>{selectedSurfer.emergency_rel}</div>
                        </div>
                        {selectedSurfer.emergency_phone ? (
                            <a 
                                href={`tel:${selectedSurfer.emergency_phone}`} 
                                style={{ 
                                    display: "block", 
                                    width: "100%", 
                                    padding: 16, 
                                    background: "#ef4444", 
                                    color: "white", 
                                    borderRadius: 12, 
                                    textDecoration: "none", 
                                    fontWeight: "bold",
                                    fontSize: 20
                                }}
                            >
                                📞 חייג עכשיו
                            </a>
                        ) : (
                            <div style={{ color: "red" }}>אין מספר טלפון</div>
                        )}
                        <hr style={{ borderColor: "#eee", width: "100%" }} />
                        <div style={{ textAlign: "right" }}>
                            <strong>חונך מוביל:</strong> {selectedSurfer.lead_volunteer_name}<br/>
                            {selectedSurfer.lead_volunteer_phone && <a href={`tel:${selectedSurfer.lead_volunteer_phone}`} style={{ color: cssVar.brand.primary }}>חייג לחונך</a>}
                        </div>
                    </div>
                )}

                {modalType === "medical" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ fontSize: 18, fontWeight: "bold" }}>{selectedSurfer.full_name}</div>
                        
                        <div style={{ background: "#fef2f2", padding: 12, borderRadius: 8, border: "1px solid #fecaca" }}>
                            <strong style={{ color: "#b91c1c", display: "block", marginBottom: 4 }}>בעיה רפואית:</strong>
                            <p style={{ margin: 0, color: "#7f1d1d" }}>{selectedSurfer.medical_condition || "ללא"}</p>
                        </div>

                        <div style={{ background: "#fff7ed", padding: 12, borderRadius: 8, border: "1px solid #fed7aa" }}>
                            <strong style={{ color: "#c2410c", display: "block", marginBottom: 4 }}>דגשים מיוחדים:</strong>
                            <p style={{ margin: 0, color: "#7c2d12" }}>{selectedSurfer.special_requirements || "ללא"}</p>
                        </div>

                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
}

