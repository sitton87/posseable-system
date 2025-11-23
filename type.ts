// Database Models Types

export type Volunteer = {
  id: string; // uniqueidentifier (GUID)
  full_name: string;
  phone?: string | null;
  email?: string | null;
  kind?: string | null;
  active: boolean;
  notes?: string | null;
  created_at: Date | string;
};

export type Role = {
  id: string;
  name: string;
  description?: string | null;
};

export type VolunteerRole = {
  volunteer_id: string;
  role_id: string;
  assigned_at: Date | string;
};

export type Surfer = {
  id: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  active: boolean;
  notes?: string | null;
  created_at: Date | string;
};

export type SeasonPlan = {
  id: string;
  name: string;
  year: number;
  start_date: Date | string;
  end_date: Date | string;
  notes?: string | null;
};

export type Activity = {
  id: string;
  season_id: string;
  kind: string;
  activity_date: Date | string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  capacity?: number | null;
  status: string;
  notes?: string | null;
  created_at: Date | string;
};

export type Registration = {
  id: string;
  activity_id: string;
  surfer_id: string;
  status: string;
  notes?: string | null;
  created_at: Date | string;
};

export type Equipment = {
  id: string;
  name: string;
  category?: string | null;
  size?: string | null;
  condition?: string | null;
  active: boolean;
  notes?: string | null;
};

export type ActivityEquipment = {
  activity_id: string;
  equipment_id: string;
  quantity: number;
  notes?: string | null;
};

export type Donor = {
  id: string;
  name: string;
  organization?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  is_active: boolean;
};

export type Supplier = {
  id: string;
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  is_active: boolean;
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
};

// Form types
export type VolunteerFormData = Omit<Volunteer, "id" | "created_at">;
export type SurferFormData = Omit<Surfer, "id" | "created_at">;
export type ActivityFormData = Omit<Activity, "id" | "created_at">;
