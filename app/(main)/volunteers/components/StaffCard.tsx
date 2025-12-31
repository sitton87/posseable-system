import { useState, useEffect, useCallback } from "react";
import { Modal, Button } from "@/app/components/ui";
import {
  Section,
  SmallActionButton,
  StatusPill,
} from "@/app/components/shared";
import { colors, spacing, radii } from "@/app/styles/foundations";
import {
  tableStyle,
  tableHeaderStyle,
  tableCellStyle,
  labelStyle,
  inputStyle,
} from "@/app/styles/components";

type Role = {
  id: number;
  name: string;
  description?: string;
  requires_certification: boolean;
  requires_renewal: boolean;
  requires_training: boolean;
  color_hex?: string;
};

type AssignedRole = {
  role_id: number;
  role_name: string;
  color_hex: string;
  assigned_at: string;
  valid_until?: string;
  training_date?: string;
  certificate_url?: string;
  notes?: string;
};

type Volunteer = {
  national_id: string;
  full_name: string;
  classification: string;
  email?: string;
  phone?: string;
};

type StaffCardProps = {
  volunteer: Volunteer;
  onClose: () => void;
};

export function StaffCard({ volunteer, onClose }: StaffCardProps) {
  const [activeTab, setActiveTab] = useState<"roles" | "history">("roles");
  const [assignedRoles, setAssignedRoles] = useState<AssignedRole[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  // Assignment Form State
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [validUntil, setValidUntil] = useState("");
  const [trainingDate, setTrainingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [certFile, setCertFile] = useState<{
    name: string;
    mime: string;
    data: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch assigned roles
      const resAssigned = await fetch(
        `/api/volunteers/${volunteer.national_id}/roles`
      );
      const dataAssigned = await resAssigned.json();
      if (dataAssigned.success) {
        setAssignedRoles(dataAssigned.roles);
      }

      // Fetch all roles for the dropdown
      const resAll = await fetch(`/api/volunteers/roles`);
      const dataAll = await resAll.json();
      if (dataAll.success) {
        setAvailableRoles(dataAll.roles);
      }

      // Fetch activity history
      const resDetails = await fetch(
        `/api/volunteers/${volunteer.national_id}`
      );
      const dataDetails = await resDetails.json();
      if (dataDetails.success) {
        setActivities(dataDetails.activities || []);
      }
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  }, [volunteer.national_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAssignModal = () => {
    setEditingRoleId(null);
    setSelectedRoleId("");
    setValidUntil("");
    setTrainingDate("");
    setNotes("");
    setCertFile(null);
    setShowAssignModal(true);
  };

  const handleEditRole = (role: AssignedRole) => {
    setEditingRoleId(role.role_id);
    setSelectedRoleId(String(role.role_id));
    setValidUntil(role.valid_until ? role.valid_until.split("T")[0] : "");
    setTrainingDate(role.training_date ? role.training_date.split("T")[0] : "");
    setNotes(role.notes || "");
    setCertFile(null); // Reset file input, will only update if new file selected
    setShowAssignModal(true);
  };

  const handleSaveRole = async () => {
    if (!selectedRoleId) return;
    try {
      const isEdit = !!editingRoleId;
      const endpoint = isEdit
        ? `/api/volunteers/${volunteer.national_id}/roles/${selectedRoleId}`
        : `/api/volunteers/${volunteer.national_id}/roles`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_id: parseInt(selectedRoleId),
          valid_until: validUntil || null,
          training_date: trainingDate || null,
          certificate_file: certFile,
          notes: notes || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAssignModal(false);
        fetchData();
        // Reset form
        setEditingRoleId(null);
        setSelectedRoleId("");
        setValidUntil("");
        setTrainingDate("");
        setNotes("");
        setCertFile(null);
      } else {
        alert(data.error || "Failed to save role");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving role");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // get base64 part only
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setCertFile({
        name: file.name,
        mime: file.type,
        data: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const selectedRoleObj = availableRoles.find(
    (r) => String(r.id) === selectedRoleId
  );

  const handleRemoveRole = async (roleId: number) => {
    if (!confirm("Are you sure you want to remove this role assignment?"))
      return;
    try {
      const res = await fetch(
        `/api/volunteers/${volunteer.national_id}/roles/${roleId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Failed to remove role");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      width="min(800px, 95vw)"
      style={{ padding: 0, overflow: "hidden" }}
    >
      <div style={{ display: "flex", height: "80vh" }}>
        {/* Sidebar / Header Info */}
        <div
          style={{
            width: 250,
            background: colors.surface,
            borderRight: `1px solid ${colors.borderMuted}`,
            padding: spacing.lg,
          }}
        >
          <div style={{ marginBottom: spacing.lg }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: colors.primary,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: spacing.md,
              }}
            >
              {volunteer.full_name.charAt(0)}
            </div>
            <h3 style={{ margin: 0 }}>{volunteer.full_name}</h3>
            <div style={{ color: colors.textMuted, fontSize: 14 }}>
              {volunteer.classification}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.xs,
            }}
          >
            <button
              onClick={() => setActiveTab("roles")}
              style={{
                textAlign: "right",
                padding: spacing.sm,
                borderRadius: radii.button,
                background:
                  activeTab === "roles" ? colors.background : "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: activeTab === "roles" ? 600 : 400,
              }}
            >
              הסמכות ותפקידים
            </button>
            <button
              onClick={() => setActiveTab("history")}
              style={{
                textAlign: "right",
                padding: spacing.sm,
                borderRadius: radii.button,
                background:
                  activeTab === "history" ? colors.background : "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: activeTab === "history" ? 600 : 400,
              }}
            >
              היסטוריית פעילות
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: spacing.xl, overflowY: "auto" }}>
          {activeTab === "roles" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: spacing.lg,
                }}
              >
                <h2 style={{ margin: 0 }}>הסמכות ותפקידים</h2>
                <Button onClick={handleOpenAssignModal}>+ הוסף תפקיד</Button>
              </div>

              {loading ? (
                <div>טוען...</div>
              ) : assignedRoles.length === 0 ? (
                <div style={{ color: colors.textMuted }}>
                  אין תפקידים משויכים.
                </div>
              ) : (
                <div style={{ display: "grid", gap: spacing.md }}>
                  {assignedRoles.map((role) => (
                    <div
                      key={role.role_id}
                      style={{
                        border: `1px solid ${colors.borderMuted}`,
                        borderRadius: radii.card,
                        padding: spacing.md,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: spacing.sm,
                            marginBottom: spacing.xs,
                          }}
                        >
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: role.color_hex,
                            }}
                          ></div>
                          <span style={{ fontWeight: 600, fontSize: 16 }}>
                            {role.role_name}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: colors.textMuted }}>
                          הוקצה ב:{" "}
                          {new Date(role.assigned_at).toLocaleDateString(
                            "he-IL"
                          )}
                          {role.training_date && (
                            <span style={{ marginRight: 4 }}>
                              • עבר הדרכה:{" "}
                              {new Date(role.training_date).toLocaleDateString(
                                "he-IL"
                              )}
                            </span>
                          )}
                          {role.valid_until && (
                            <span
                              style={{
                                color:
                                  new Date(role.valid_until) < new Date()
                                    ? colors.danger
                                    : colors.textMuted,
                                fontWeight:
                                  new Date(role.valid_until) < new Date()
                                    ? "bold"
                                    : "normal",
                                marginRight: 4,
                              }}
                            >
                              • בתוקף עד:{" "}
                              {new Date(role.valid_until).toLocaleDateString(
                                "he-IL"
                              )}
                              {new Date(role.valid_until) < new Date() &&
                                " (פג תוקף!)"}
                            </span>
                          )}
                        </div>
                        {role.notes && (
                          <div style={{ marginTop: spacing.xs, fontSize: 14 }}>
                            {role.notes}
                          </div>
                        )}
                        {role.certificate_url && ( // Assuming certificate_url might still be used for legacy or if we generate a download link
                          <div style={{ marginTop: spacing.xs }}>
                            <a
                              href={role.certificate_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: 13, color: colors.primary }}
                            >
                              📄 צפה בתעודה
                            </a>
                          </div>
                        )}
                        {/* If we have direct file data logic, we might need a download button instead if url is not present, 
                             but for now we assume API returns a usable URL or we handle it in API to return a stream URL */}
                      </div>
                      <div style={{ display: "flex", gap: spacing.xs }}>
                        <SmallActionButton
                          variant="secondary"
                          onClick={() => handleEditRole(role)}
                        >
                          ערוך
                        </SmallActionButton>
                        <SmallActionButton
                          variant="secondary"
                          style={{ color: colors.danger }}
                          onClick={() => handleRemoveRole(role.role_id)}
                        >
                          הסר
                        </SmallActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 style={{ marginBottom: spacing.lg }}>היסטוריית פעילות</h2>
              {loading ? (
                <div>טוען...</div>
              ) : activities.length === 0 ? (
                <div style={{ color: colors.textMuted }}>
                  אין פעילות מתועדת.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ ...tableStyle, minWidth: "100%" }}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>תאריך</th>
                        <th style={tableHeaderStyle}>סוג פעילות</th>
                        <th style={tableHeaderStyle}>גולש</th>
                        {/* <th style={tableHeaderStyle}>תפקיד בפעילות</th> -- If we had this data */}
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((a) => (
                        <tr key={a.activity_id}>
                          <td style={tableCellStyle}>
                            {a.activity_date
                              ? new Date(a.activity_date).toLocaleDateString(
                                  "he-IL"
                                )
                              : "—"}
                          </td>
                          <td style={tableCellStyle}>{a.kind || "—"}</td>
                          <td style={tableCellStyle}>{a.surfer_name || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Role Modal */}
      {showAssignModal && (
        <Modal
          open={true}
          onClose={() => setShowAssignModal(false)}
          width="400px"
        >
          <h3>
            {editingRoleId
              ? "עריכת תפקיד"
              : `הוספת תפקיד ל${volunteer.full_name}`}
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              marginTop: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>תפקיד</label>
              <select
                style={inputStyle}
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                disabled={!!editingRoleId} // Disable changing role type during edit
              >
                <option value="">בחר תפקיד...</option>
                {availableRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedRoleObj?.requires_training && (
              <div
                style={{
                  background: "#fef3c7",
                  padding: spacing.sm,
                  borderRadius: radii.button,
                  fontSize: 13,
                  color: "#92400e",
                  marginBottom: spacing.xs,
                }}
              >
                ⚠️ תפקיד זה דורש הדרכה פנים ארגונית. נא להזין תאריך הדרכה.
              </div>
            )}

            {(selectedRoleObj?.requires_training || trainingDate) && (
              <div>
                <label style={labelStyle}>
                  תאריך הדרכה {selectedRoleObj?.requires_training && "*"}
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  value={trainingDate}
                  onChange={(e) => setTrainingDate(e.target.value)}
                />
              </div>
            )}

            {selectedRoleObj?.requires_renewal && (
              <div
                style={{
                  background: "#fef3c7",
                  padding: spacing.sm,
                  borderRadius: radii.button,
                  fontSize: 13,
                  color: "#92400e",
                }}
              >
                ⚠️ תפקיד זה דורש חידוש שנתי. נא להזין תאריך תוקף.
              </div>
            )}

            {(selectedRoleObj?.requires_renewal || validUntil) && (
              <div>
                <label style={labelStyle}>
                  תוקף עד {selectedRoleObj?.requires_renewal && "*"}
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>קובץ תעודה (PDF/תמונה)</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                style={inputStyle}
                onChange={handleFileChange}
              />
              {certFile && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  קובץ נבחר: {certFile.name}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>הערות</label>
              <textarea
                style={{ ...inputStyle, minHeight: 60 }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: spacing.sm,
                marginTop: spacing.sm,
              }}
            >
              <Button
                variant="secondary"
                onClick={() => setShowAssignModal(false)}
              >
                ביטול
              </Button>
              <Button onClick={handleSaveRole}>שמור</Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
