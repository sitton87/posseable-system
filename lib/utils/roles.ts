export const ADMIN_ROLE_ALIASES = [
  "admin",
  "administrator",
  "system_admin",
  "sysadmin",
  "superadmin",
  "מנהל מערכת",
];

const SYSTEM_ADMIN_ROLE_GROUPS = [
  "management",
  "overall_management",
  "overall-management",
  "overall management",
];

export function normalizeRole(role?: string) {
  return role?.trim().toLowerCase() ?? "";
}

export function isAdminRole(role?: string) {
  const normalized = normalizeRole(role);
  return ADMIN_ROLE_ALIASES.some((alias) => alias === normalized);
}

export function hasSystemAdminAccess(
  role?: string,
  roleGroupCode?: string | null
) {
  if (isAdminRole(role)) {
    return true;
  }
  const normalizedGroup = roleGroupCode?.trim().toLowerCase();
  if (!normalizedGroup) {
    return false;
  }
  return SYSTEM_ADMIN_ROLE_GROUPS.includes(normalizedGroup);
}

