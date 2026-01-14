import { useState, useEffect, useCallback } from "react";
import {
  Title,
  Text,
  Button,
  TextInput,
  Textarea,
  Select,
  SelectItem,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Callout,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import {
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

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
      const resAssigned = await fetch(
        `/api/volunteers/${volunteer.national_id}/roles`
      );
      const dataAssigned = await resAssigned.json();
      if (dataAssigned.success) {
        setAssignedRoles(dataAssigned.roles);
      }

      const resAll = await fetch(`/api/volunteers/roles`);
      const dataAll = await resAll.json();
      if (dataAll.success) {
        setAvailableRoles(dataAll.roles);
      }

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
    setCertFile(null);
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
    <Dialog open={true} onClose={onClose}>
      <DialogPanel className="max-w-4xl p-0">
        <div className="flex h-[80vh]">
          {/* Sidebar */}
          <div
            className="w-[250px] border-r p-5"
            style={{ backgroundColor: cssVar.bg.secondary, borderColor: cssVar.border.primary }}
          >
            <div className="mb-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 text-white"
                style={{ backgroundColor: cssVar.brand.primary }}
              >
                {volunteer.full_name.charAt(0)}
              </div>
              <Title>{volunteer.full_name}</Title>
              <Text className="text-sm">{volunteer.classification}</Text>
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("roles")}
                className={`text-right p-2 rounded border-none cursor-pointer ${
                  activeTab === "roles" ? "font-semibold" : "font-normal"
                }`}
                style={{
                  backgroundColor: activeTab === "roles" ? cssVar.bg.primary : "transparent",
                  color: cssVar.text.primary,
                }}
              >
                הסמכות ותפקידים
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`text-right p-2 rounded border-none cursor-pointer ${
                  activeTab === "history" ? "font-semibold" : "font-normal"
                }`}
                style={{
                  backgroundColor: activeTab === "history" ? cssVar.bg.primary : "transparent",
                  color: cssVar.text.primary,
                }}
              >
                היסטוריית פעילות
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "roles" && (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <Title>הסמכות ותפקידים</Title>
                  <Button icon={PlusIcon} onClick={handleOpenAssignModal}>הוסף תפקיד</Button>
                </div>

                {loading ? (
                  <Text style={{ color: cssVar.text.muted }}>טוען...</Text>
                ) : assignedRoles.length === 0 ? (
                  <Text style={{ color: cssVar.text.muted }}>
                    אין תפקידים משויכים.
                  </Text>
                ) : (
                  <div className="grid gap-4">
                    {assignedRoles.map((role) => (
                      <div
                        key={role.role_id}
                        className="border rounded-lg p-4 flex justify-between items-start"
                        style={{ borderColor: cssVar.border.primary }}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ background: role.color_hex }}
                            ></div>
                            <Text className="font-semibold">
                              {role.role_name}
                            </Text>
                          </div>
                          <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                            הוקצה ב:{" "}
                            {new Date(role.assigned_at).toLocaleDateString("he-IL")}
                            {role.training_date && (
                              <span className="mr-1">
                                • עבר הדרכה:{" "}
                                {new Date(role.training_date).toLocaleDateString("he-IL")}
                              </span>
                            )}
                            {role.valid_until && (
                              <span
                                className="mr-1"
                                style={{
                                  color: new Date(role.valid_until) < new Date()
                                    ? cssVar.status.danger
                                    : cssVar.text.muted,
                                  fontWeight: new Date(role.valid_until) < new Date() ? "bold" : "normal",
                                }}
                              >
                                • בתוקף עד:{" "}
                                {new Date(role.valid_until).toLocaleDateString("he-IL")}
                                {new Date(role.valid_until) < new Date() && " (פג תוקף!)"}
                              </span>
                            )}
                          </Text>
                          {role.notes && (
                            <Text className="mt-1 text-sm">
                              {role.notes}
                            </Text>
                          )}
                          {role.certificate_url && (
                            <div className="mt-1">
                              <a
                                href={role.certificate_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs hover:underline"
                                style={{ color: cssVar.brand.primary }}
                              >
                                📄 צפה בתעודה
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => handleEditRole(role)}
                          >
                            ערוך
                          </Button>
                          <Button
                            variant="secondary"
                            size="xs"
                            color="rose"
                            onClick={() => handleRemoveRole(role.role_id)}
                          >
                            הסר
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <Title className="mb-5">היסטוריית פעילות</Title>
                {loading ? (
                  <Text style={{ color: cssVar.text.muted }}>טוען...</Text>
                ) : activities.length === 0 ? (
                  <Text style={{ color: cssVar.text.muted }}>
                    אין פעילות מתועדת.
                  </Text>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>תאריך</TableHeaderCell>
                        <TableHeaderCell>סוג פעילות</TableHeaderCell>
                        <TableHeaderCell>גולש</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activities.map((a) => (
                        <TableRow key={a.activity_id}>
                          <TableCell>
                            {a.activity_date
                              ? new Date(a.activity_date).toLocaleDateString("he-IL")
                              : "—"}
                          </TableCell>
                          <TableCell>{a.kind || "—"}</TableCell>
                          <TableCell>{a.surfer_name || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Assign Role Modal */}
        <Dialog open={showAssignModal} onClose={() => setShowAssignModal(false)}>
          <DialogPanel className="max-w-md">
            <Title className="mb-6">
              {editingRoleId ? "עריכת תפקיד" : `הוספת תפקיד ל${volunteer.full_name}`}
            </Title>
            <div className="flex flex-col gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תפקיד
                </Text>
                <Select
                  value={selectedRoleId || undefined}
                  onValueChange={setSelectedRoleId}
                  disabled={!!editingRoleId}
                  placeholder="בחר תפקיד..."
                >
                  {availableRoles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {selectedRoleObj?.requires_training && (
                <Callout title="שים לב" icon={ExclamationTriangleIcon} color="amber">
                  תפקיד זה דורש הדרכה פנים ארגונית. נא להזין תאריך הדרכה.
                </Callout>
              )}

              {(selectedRoleObj?.requires_training || trainingDate) && (
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                    תאריך הדרכה {selectedRoleObj?.requires_training && <span style={{ color: cssVar.status.danger }}>*</span>}
                  </Text>
                  <TextInput
                    type="date"
                    value={trainingDate}
                    onChange={(e) => setTrainingDate(e.target.value)}
                  />
                </div>
              )}

              {selectedRoleObj?.requires_renewal && (
                <Callout title="שים לב" icon={ExclamationTriangleIcon} color="amber">
                  תפקיד זה דורש חידוש שנתי. נא להזין תאריך תוקף.
                </Callout>
              )}

              {(selectedRoleObj?.requires_renewal || validUntil) && (
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                    תוקף עד {selectedRoleObj?.requires_renewal && <span style={{ color: cssVar.status.danger }}>*</span>}
                  </Text>
                  <TextInput
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  קובץ תעודה (PDF/תמונה)
                </Text>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="text-sm"
                  onChange={handleFileChange}
                />
                {certFile && (
                  <Text className="text-xs mt-1" style={{ color: cssVar.text.muted }}>
                    קובץ נבחר: {certFile.name}
                  </Text>
                )}
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  הערות
                </Text>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: cssVar.border.primary }}>
              <Button
                variant="secondary"
                onClick={() => setShowAssignModal(false)}
              >
                ביטול
              </Button>
              <Button onClick={handleSaveRole}>שמור</Button>
            </div>
          </DialogPanel>
        </Dialog>
      </DialogPanel>
    </Dialog>
  );
}
