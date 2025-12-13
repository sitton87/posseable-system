export type PermissionLevel = "none" | "read" | "write";

export type AppUser = {
  national_id: string;
  full_name: string;
  email: string;
  role: string;
  role_group_code?: string | null;
  must_reset: boolean;
  created_at: string;
  is_active?: boolean;
};

export type RoleGroupOption = {
  code: string;
  name: string;
  description?: string | null;
  is_default?: boolean;
};

export type AppPageRow = {
  page_key: string;
  display_name: string;
  route_path: string;
  category?: string | null;
};

