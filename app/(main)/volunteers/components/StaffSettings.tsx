import { useState, useEffect } from "react";
import { Card, Button, Modal } from "@/app/components/ui";
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
import { StaffCard } from "./StaffCard";

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
      // Fetch all volunteers but filter for staff/management in frontend or ask API to filter
      // The API supports ?classification=staff etc. but we want both staff and management.
      // Or we can just fetch all and filter client side if list isn't huge.
      // Let's try fetching separately or adjusting API.
      // For now, let's fetch all and filter.
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
    "#ef4444", // Red
    "#f97316", // Orange
    "#f59e0b", // Amber
    "#84cc16", // Lime
    "#10b981", // Emerald
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#ec4899", // Pink
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
      const endpoint = editingRole
        ? "/api/volunteers/roles"
        : "/api/volunteers/roles";
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
    <Card style={{ padding: spacing.lg }}>
      <div
        style={{
          display: "flex",
          gap: spacing.md,
          borderBottom: `1px solid ${colors.borderMuted}`,
          paddingBottom: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <button
          onClick={() => setActiveTab("staff")}
          style={{
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "staff"
                ? `2px solid ${colors.primary}`
                : "2px solid transparent",
            fontWeight: activeTab === "staff" ? 700 : 400,
            cursor: "pointer",
            fontSize: 16,
            padding: `0 ${spacing.sm} ${spacing.xs} ${spacing.sm}`,
            color:
              activeTab === "staff" ? colors.textPrimary : colors.textMuted,
          }}
        >
          ניהול צוות ומדריכים
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          style={{
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "roles"
                ? `2px solid ${colors.primary}`
                : "2px solid transparent",
            fontWeight: activeTab === "roles" ? 700 : 400,
            cursor: "pointer",
            fontSize: 16,
            padding: `0 ${spacing.sm} ${spacing.xs} ${spacing.sm}`,
            color:
              activeTab === "roles" ? colors.textPrimary : colors.textMuted,
          }}
        >
          ניהול תפקידים והסמכות
        </button>
      </div>

      {activeTab === "staff" && (
        <div>
          <div style={{ marginBottom: spacing.md, color: colors.textMuted }}>
            רשימת אנשי הצוות וההנהלה. לחץ על איש צוות לניהול הסמכות ותפקידים.
          </div>
          {staffLoading ? (
            <div>טוען...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>שם מלא</th>
                    <th style={tableHeaderStyle}>תפקיד מערכת</th>
                    <th style={tableHeaderStyle}>טלפון</th>
                    <th style={tableHeaderStyle}>אימייל</th>
                    <th style={tableHeaderStyle}>סטטוס</th>
                    <th style={tableHeaderStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s) => (
                    <tr key={s.national_id}>
                      <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                        {s.full_name}
                      </td>
                      <td style={tableCellStyle}>
                        {s.classification === "management" ? "הנהלה" : "צוות"}
                      </td>
                      <td style={tableCellStyle}>{s.phone}</td>
                      <td style={tableCellStyle}>{s.email}</td>
                      <td style={tableCellStyle}>
                        <StatusPill tone={s.active ? "active" : "inactive"}>
                          {s.active ? "פעיל" : "לא פעיל"}
                        </StatusPill>
                      </td>
                      <td style={tableCellStyle}>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedStaff(s)}
                        >
                          ניהול כרטיס
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {staffList.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ ...tableCellStyle, textAlign: "center" }}
                      >
                        לא נמצאו אנשי צוות.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "roles" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <div style={{ color: colors.textMuted }}>
              הגדרת תפקידים אפשריים לפעילויות והסמכות נדרשות.
            </div>
            <Button onClick={() => handleOpenRoleModal()}>+ תפקיד חדש</Button>
          </div>
          {rolesLoading ? (
            <div>טוען...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>שם תפקיד</th>
                    <th style={tableHeaderStyle}>תיאור</th>
                    <th style={tableHeaderStyle}>דורש תעודה</th>
                    <th style={tableHeaderStyle}>דורש חידוש</th>
                    <th style={tableHeaderStyle}>דורש הדרכה</th>
                    <th style={tableHeaderStyle}>צבע</th>
                    <th style={tableHeaderStyle}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                        {r.name}
                      </td>
                      <td style={tableCellStyle}>{r.description}</td>
                      <td style={tableCellStyle}>
                        {r.requires_certification ? "כן" : "לא"}
                      </td>
                      <td style={tableCellStyle}>
                        {r.requires_renewal ? "כן" : "לא"}
                      </td>
                      <td style={tableCellStyle}>
                        {r.requires_training ? "כן" : "לא"}
                      </td>
                      <td style={tableCellStyle}>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            background: r.color_hex,
                            border: `1px solid ${colors.borderMuted}`,
                          }}
                        ></div>
                      </td>
                      <td style={tableCellStyle}>
                        <SmallActionButton
                          variant="secondary"
                          onClick={() => handleOpenRoleModal(r)}
                          style={{ marginInlineEnd: spacing.xs }}
                        >
                          ✏️
                        </SmallActionButton>
                        <SmallActionButton
                          variant="secondary"
                          onClick={() => handleDeleteRole(r.id)}
                          style={{ color: colors.danger }}
                        >
                          🗑️
                        </SmallActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedStaff && (
        <StaffCard
          volunteer={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}

      {showRoleModal && (
        <Modal
          open={true}
          onClose={() => setShowRoleModal(false)}
          width="500px"
        >
          <h3>{editingRole ? "עריכת תפקיד" : "תפקיד חדש"}</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              marginTop: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>שם התפקיד</label>
              <input
                style={inputStyle}
                value={roleForm.name}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label style={labelStyle}>תיאור</label>
              <textarea
                style={inputStyle}
                value={roleForm.description}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, description: e.target.value })
                }
              />
            </div>
            <div style={{ display: "flex", gap: spacing.lg }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <input
                  type="checkbox"
                  checked={roleForm.requires_certification}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      requires_certification: e.target.checked,
                    })
                  }
                />
                דורש תעודה
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <input
                  type="checkbox"
                  checked={roleForm.requires_renewal}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      requires_renewal: e.target.checked,
                    })
                  }
                />
                דורש חידוש שנתי
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <input
                  type="checkbox"
                  checked={roleForm.requires_training}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      requires_training: e.target.checked,
                    })
                  }
                />
                דורש הדרכה
              </label>
            </div>
            <div>
              <label style={labelStyle}>צבע מזהה</label>
              <div
                style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}
              >
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setRoleForm({ ...roleForm, color_hex: color })
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: color,
                      border:
                        roleForm.color_hex === color
                          ? `2px solid ${colors.textPrimary}`
                          : "2px solid transparent",
                      cursor: "pointer",
                      boxShadow:
                        roleForm.color_hex === color
                          ? "0 0 0 2px white inset"
                          : "none",
                    }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: spacing.sm,
                marginTop: spacing.lg,
              }}
            >
              <Button
                variant="secondary"
                onClick={() => setShowRoleModal(false)}
              >
                ביטול
              </Button>
              <Button onClick={handleSaveRole}>שמור</Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
