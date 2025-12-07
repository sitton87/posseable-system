// Database Models Types

export type Volunteer = {
  national_id: string; // PK - תעודת זהות (9 תווים)
  full_name: string;
  phone?: string | null;
  email?: string | null;
  kind?: string | null;
  street?: string | null; // רחוב
  house_number?: string | null; // מספר בית
  city?: string | null; // עיר
  join_date?: string | null; // date - תאריך הצטרפות
  training_date?: string | null; // date - תאריך הדרכה
  total_activities: number; // סך פעילויות
  profession?: string | null; // מקצוע
  sea_connection_level?: number | null; // רמת קשר לים (0-255)
  active: boolean;
  notes?: string | null;
  created_at: Date | string;
  // שדות חדשים
  volunteer_type?: string | null; // מים/מדיה/אחר
  media_specialization?: string | null; // צילום/וידאו/רחפן/סושיאל/אחר (רלוונטי למתנדבי מדיה)
  availability?: string | null; // זמינות
  personal_website?: string | null; // אתר אישי
  documents?: string | null; // JSON של מסמכים
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
  national_id: string; // PK - תעודת זהות (9 תווים)
  full_name: string;
  phone?: string | null;
  email?: string | null;
  residence?: string | null;
  age?: number | null;
  date_of_birth?: string | null; // date
  gender?: string | null;
  status?: string | null;
  program?: string | null; // תוכנית: שיקום לוחמים, גלי הקשת, כללית, נוער בסיכון, משפחות
  group_id?: string | null; // uniqueidentifier - קישור לקבוצה
  medical_approval?: boolean | null;
  medical_condition?: string | null;
  needs_wheelchair?: boolean | null;
  volunteers_needed?: number | null;
  special_requirements?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  active: boolean;
  notes?: string | null;
  created_at: Date | string;
  // From JOIN
  group_name?: string;
};

export type Group = {
  id: string; // uniqueidentifier (GUID)
  name: string;
  description?: string | null;
  season_id: number; // INT - קישור לעונה
  start_season_id?: number | null;
  additional_seasons?: string | null;
  min_participants: number;
  max_participants: number;
  current_participants: number;
  status: string; // פעיל, סגור, מלא, הושהה
  is_active: boolean;
  notes?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  // From JOIN
  season_name?: string;
  season_year?: number;
  surfers?: Surfer[];
};

export type SeasonPlan = {
  id: number; // INT not GUID
  name: string;
  year: number;
  start_date: Date | string;
  end_date: Date | string;
  notes?: string | null;
};

export type ActivitySeries = {
  id: number;
  season_id: number;
  name: string;
  description?: string | null;
  status?: string | null;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  lead_national_id?: string | null;
  lead_name?: string | null;
  notes?: string | null;
  is_default: boolean;
  created_at: Date | string;
  season_name?: string;
  season_year?: number;
  activities_count?: number;
};

export type Activity = {
  id: string;
  season_id: number; // INT not string
  series_id: number;
  group_id?: string | null; // קישור לקבוצה
  kind: string;
  activity_date: Date | string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  capacity?: number | null;
  status: string;
  notes?: string | null;
  created_at: Date | string;
  // From JOIN
  group_name?: string;
  series_name?: string;
  participant_count?: number;
  lead_name?: string | null;
  lead_national_id?: string | null;
};

export type Registration = {
  id: string;
  activity_id: string;
  surfer_id: string;
  status: string;
  notes?: string | null;
  created_at: Date | string;
};

export type EquipmentFamily = {
  code: string;
  name: string;
  description?: string | null;
  equipment_type: string;
  allow_item_images: boolean;
  allow_consumables: boolean;
  is_active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
};

export type EquipmentCategory = {
  family_code: string;
  code: string;
  name: string;
  description?: string | null;
  enforce_sku: boolean;
  require_image: boolean;
  is_active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
};

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  city?: string | null;
  address_line?: string | null;
  postal_code?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  manager_email?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  rent_cost?: number | null;
  rent_currency?: string | null;
  rent_expiry?: string | null;
  lease_notes?: string | null;
  general_notes?: string | null;
  is_active: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
  total_value?: number | null;
};

export type EquipmentWarehouseStock = {
  warehouse_id: string;
  warehouse_name: string;
  warehouse_code?: string | null;
  quantity: number;
};

export type EquipmentMedia = {
  id: string;
  file_url: string;
  caption?: string | null;
  is_primary: boolean;
};

export type EquipmentItem = {
  id: string;
  family_code: string;
  family_name?: string;
  category_code: string;
  category_name?: string;
  serial_number: number;
  internal_sku?: string | null;
  manufacturer_sku?: string | null;
  name: string;
  description?: string | null;
  equipment_type: string; // sea / support
  condition: string;
  is_consumable: boolean;
  is_sku_tracked: boolean;
  min_stock?: number | null;
  is_rental: boolean;
  rental_expiry?: string | null;
  ownership_type?: "item" | "rental" | "consignment" | null;
  manufacturer_name?: string | null;
  supplier_identifier?: string | null;
  supplier_name?: string | null;
  default_image_url?: string | null;
  purchase_cost?: number | null;
  notes?: string | null;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  total_units?: number;
  warehouse_stock?: EquipmentWarehouseStock[];
  media?: EquipmentMedia[];
};

// Backwards compatibility alias – legacy code can keep importing Equipment
export type Equipment = EquipmentItem;

export type ActivityEquipment = {
  activity_id: string;
  equipment_id: string;
  quantity: number;
  notes?: string | null;
};

export type Donor = {
  national_id: string;
  full_name: string;
  organization?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: Date | string;
  total_donations?: number;
  donation_count?: number;
  last_donation_date?: string | Date | null;
};

export type Supplier = {
  supplier_identifier: string;
  identifier_type: string;
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
export type VolunteerFormData = Omit<Volunteer, "created_at">;
export type SurferFormData = Omit<Surfer, "created_at" | "group_name">;
export type ActivityFormData = Omit<
  Activity,
  | "id"
  | "created_at"
  | "group_name"
  | "series_name"
  | "participant_count"
  | "lead_name"
  | "lead_national_id"
>;
export type GroupFormData = Omit<
  Group,
  | "id"
  | "created_at"
  | "updated_at"
  | "current_participants"
  | "season_name"
  | "season_year"
>;

// Constants
export const GENDER_OPTIONS = ["זכר", "נקבה", "אחר"] as const;
export const STATUS_OPTIONS = ["מאושר", "בהמתנה", "לא פעיל"] as const;
export const GROUP_STATUS_OPTIONS = ["פעיל", "סגור", "מלא", "הושהה"] as const;
export const PROGRAM_OPTIONS = [
  "שיקום לוחמים",
  "גלי הקשת",
  "כללית",
  "נוער בסיכון",
  "משפחות",
] as const;
export const VOLUNTEER_KIND_OPTIONS = [
  "מתנדב קבוע",
  "מתנדב זמני",
  "מדריך",
  "מאמן",
  "צוות ניהול",
] as const;
export const SEA_CONNECTION_LEVEL_OPTIONS = [
  { value: 0, label: "אין קשר" },
  { value: 1, label: "מתחיל" },
  { value: 2, label: "בינוני" },
  { value: 3, label: "מתקדם" },
  { value: 4, label: "מומחה" },
  { value: 5, label: "מקצועי" },
] as const;

export const VOLUNTEER_TYPE_OPTIONS = ["מים", "מדיה", "אחר"] as const;

export const MEDIA_SPECIALIZATION_OPTIONS = [
  "צילום",
  "וידאו",
  "רחפן",
  "סושיאל",
  "אחר",
] as const;

export type PermissionLevel = "none" | "read" | "write";

export type RoleGroup = {
  code: string;
  name: string;
  description?: string | null;
  is_default: boolean;
  created_at: Date | string;
};

export type AppPage = {
  page_key: string;
  display_name: string;
  route_path: string;
  category?: string | null;
  is_active: boolean;
  created_at: Date | string;
};

export type RoleGroupPermission = {
  role_group_code: string;
  page_key: string;
  permission_level: PermissionLevel;
  updated_at: Date | string;
  updated_by?: string | null;
};
