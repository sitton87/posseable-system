import { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Textarea,
  Switch,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { StaffCard } from "./StaffCard";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type Role = {
  id: number;
  name: string;
  description?: string;
  requires_certification: boolean;
  requires_renewal: boolean;
  requires_training: boolean;
  color_hex: string;
};

type Volunteer = {
  national_id: string;
  full_name: string;
  classification: string;
  email: string;
  phone: string;
  active: boolean;
};

export function StaffSettings() {
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff");

  // Staff List State
  const [staffList, setStaffList] = useState<Volunteer[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Volunteer | null>(null);

  // Role Management State
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Role Form
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    requires_certification: false,
    requires_renewal: false,
    requires_training: false,
    color_hex: "#3b82f6",
  });

  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await fetch("/api/volunteers?classification=all");
      const data = await res.json();
      if (data.success) {
        const filtered = data.volunteers.filter(
          (v: any) =>
            v.classification === "staff" || v.classification === "management"
        );
        setStaffList(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStaffLoading(false);
    }
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const res = await fetch("/api/volunteers/roles");
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "staff") fetchStaff();
    if (activeTab === "roles") fetchRoles();
  }, [activeTab]);

  const PRESET_COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
    "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  ];

  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        description: role.description || "",
        requires_certification: role.requires_certification,
        requires_renewal: role.requires_renewal,
        requires_training: role.requires_training || false,
        color_hex: role.color_hex || "#3b82f6",
      });
    } else {
      setEditingRole(null);
      setRoleForm({
        name: "",
        description: "",
        requires_certification: false,
        requires_renewal: false,
        requires_training: false,
        color_hex: "#3b82f6",
      });
    }
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    try {
      const endpoint = "/api/volunteers/roles";
      const method = editingRole ? "PUT" : "POST";
      const body = editingRole ? { ...roleForm, id: editingRole.id } : roleForm;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowRoleModal(false);
        fetchRoles();
      } else {
        alert(data.error || "Failed to save role");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving role");
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await fetch(`/api/volunteers/roles?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchRoles();
      } else {
        alert(data.error || "Failed to delete role");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-ds-spacing-5">
      <div className="flex gap-4 border-b pb-4 mb-5" style={{ borderColor: cssVar.border.primary }}>
        <button
          onClick={() => setActiveTab("staff")}
          className={`bg-transparent border-none cursor-pointer text-base px-2 pb-1 ${
            activeTab === "staff"
              ? "border-b-2 font-bold"
              : "border-b-2 border-transparent font-normal"
          }`}
          style={{
            borderColor: activeTab === "staff" ? cssVar.brand.primary : "transparent",
            color: activeTab === "staff" ? cssVar.text.primary : cssVar.text.muted,
          }}
        >
          ניהול צוות ומדריכים
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`bg-transparent border-none cursor-pointer text-base px-2 pb-1 ${
            activeTab === "roles"
              ? "border-b-2 font-bold"
              : "border-b-2 border-transparent font-normal"
          }`}
          style={{
            borderColor: activeTab === "roles" ? cssVar.brand.primary : "transparent",
            color: activeTab === "roles" ? cssVar.text.primary : cssVar.text.muted,
          }}
        >
          ניהול תפקידים והסמכות
        </button>
      </div>

      {activeTab === "staff" && (
        <div>
          <Text className="mb-4">
            רשימת אנשי הצוות וההנהלה. לחץ על איש צוות לניהול הסמכות ותפקידים.
          </Text>
          {staffLoading ? (
            <Text style={{ color: cssVar.text.muted }}>טוען...</Text>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>שם מלא</TableHeaderCell>
                  <TableHeaderCell>תפקיד מערכת</TableHeaderCell>
                  <TableHeaderCell>טלפון</TableHeaderCell>
                  <TableHeaderCell>אימייל</TableHeaderCell>
                  <TableHeaderCell>סטטוס</TableHeaderCell>
                  <TableHeaderCell></TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffList.map((s) => (
                  <TableRow key={s.national_id}>
                    <TableCell className="font-semibold">
                      {s.full_name}
                    </TableCell>
                    <TableCell>
                      {s.classification === "management" ? "הנהלה" : "צוות"}
                    </TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      <Badge color={s.active ? "emerald" : "gray"} size="sm">
                        {s.active ? "פעיל" : "לא פעיל"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setSelectedStaff(s)}
                      >
                        ניהול כרטיס
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {staffList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Text>לא נמצאו אנשי צוות.</Text>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {activeTab === "roles" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text>
              הגדרת תפקידים אפשריים לפעילויות והסמכות נדרשות.
            </Text>
            <Button icon={PlusIcon} onClick={() => handleOpenRoleModal()}>תפקיד חדש</Button>
          </div>
          {rolesLoading ? (
            <Text style={{ color: cssVar.text.muted }}>טוען...</Text>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>שם תפקיד</TableHeaderCell>
                  <TableHeaderCell>תיאור</TableHeaderCell>
                  <TableHeaderCell>דורש תעודה</TableHeaderCell>
                  <TableHeaderCell>דורש חידוש</TableHeaderCell>
                  <TableHeaderCell>דורש הדרכה</TableHeaderCell>
                  <TableHeaderCell>צבע</TableHeaderCell>
                  <TableHeaderCell>פעולות</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold">
                      {r.name}
                    </TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>
                      {r.requires_certification ? "כן" : "לא"}
                    </TableCell>
                    <TableCell>
                      {r.requires_renewal ? "כן" : "לא"}
                    </TableCell>
                    <TableCell>
                      {r.requires_training ? "כן" : "לא"}
                    </TableCell>
                    <TableCell>
                      <div
                        className="w-5 h-5 rounded border"
                        style={{ background: r.color_hex, borderColor: cssVar.border.primary }}
                      ></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={PencilIcon}
                          onClick={() => handleOpenRoleModal(r)}
                        />
                        <Button
                          variant="secondary"
                          size="xs"
                          color="rose"
                          icon={TrashIcon}
                          onClick={() => handleDeleteRole(r.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {selectedStaff && (
        <StaffCard
          volunteer={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}

      <Dialog open={showRoleModal} onClose={() => setShowRoleModal(false)}>
        <DialogPanel className="max-w-md">
          <Title className="mb-6">
            {editingRole ? "עריכת תפקיד" : "תפקיד חדש"}
          </Title>
          <div className="flex flex-col gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שם התפקיד
              </Text>
              <TextInput
                value={roleForm.name}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                תיאור
              </Text>
              <Textarea
                value={roleForm.description}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, description: e.target.value })
                }
              />
            </div>
            <div className="flex gap-5 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  checked={roleForm.requires_certification}
                  onChange={(val) =>
                    setRoleForm({ ...roleForm, requires_certification: val })
                  }
                />
                <Text className="text-sm">דורש תעודה</Text>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={roleForm.requires_renewal}
                  onChange={(val) =>
                    setRoleForm({ ...roleForm, requires_renewal: val })
                  }
                />
                <Text className="text-sm">דורש חידוש שנתי</Text>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={roleForm.requires_training}
                  onChange={(val) =>
                    setRoleForm({ ...roleForm, requires_training: val })
                  }
                />
                <Text className="text-sm">דורש הדרכה</Text>
              </div>
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                צבע מזהה
              </Text>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setRoleForm({ ...roleForm, color_hex: color })
                    }
                    className={`w-8 h-8 rounded-full cursor-pointer ${
                      roleForm.color_hex === color
                        ? "border-2 shadow-[inset_0_0_0_2px_white]"
                        : "border-2 border-transparent"
                    }`}
                    style={{
                      background: color,
                      borderColor: roleForm.color_hex === color ? cssVar.text.primary : "transparent",
                    }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: cssVar.border.primary }}>
            <Button
              variant="secondary"
              onClick={() => setShowRoleModal(false)}
            >
              ביטול
            </Button>
            <Button onClick={handleSaveRole}>שמור</Button>
          </div>
        </DialogPanel>
      </Dialog>
    </Card>
  );
}
