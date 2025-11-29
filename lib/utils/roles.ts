export const ADMIN_ROLE_ALIASES = [
  "admin",
  "administrator",
  "system_admin",
  "sysadmin",
  "superadmin",
  "מנהל מערכת",
];

export function normalizeRole(role?: string) {
  return role?.trim().toLowerCase() ?? "";
}

export function isAdminRole(role?: string) {
  const normalized = normalizeRole(role);
  return ADMIN_ROLE_ALIASES.some((alias) => alias === normalized);
}

