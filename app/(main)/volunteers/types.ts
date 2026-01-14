import { NoteStatus } from "@/type";

// Based on DB schema: volunteer table
export type Volunteer = {
  national_id: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  kind?: string | null;
  active: boolean;
  notes?: string | null;
  created_at?: string | null;
  // Address
  street?: string | null;
  house_number?: string | null;
  city?: string | null;
  // Dates
  join_date?: string | null;
  training_date?: string | null;
  // Activity
  total_activities: number;
  // Professional info
  profession?: string | null;
  sea_connection_level?: number | null;
  volunteer_type?: string | null;
  media_specialization?: string | null;
  availability?: string | null;
  personal_website?: string | null;
  documents?: string | null;
  // Classification (required)
  classification: "volunteer" | "staff" | "management";
};

export type VolunteerFilters = {
  search: string;
  status: "all" | "active" | "inactive";
  classification: "all" | "volunteer" | "staff" | "management";
};

export type VolunteerStats = {
  total: number;
  active: number;
  staff: number;
  management: number;
};

export type VolunteerNote = {
  note_id: string;
  entity_id: string;
  title: string;
  body: string;
  status: NoteStatus;
  due_date?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export type VolunteerSummaryData = {
  stats: VolunteerStats;
  tasks: VolunteerNote[];
  recentActivity: {
    national_id: string;
    full_name: string;
    classification?: string | null;
    created_at?: string | null;
  }[];
};

export type VolunteerActivityRow = {
  activity_id: number;
  activity_date?: string | null;
  kind?: string | null;
  volunteer_national_id: string;
  surfer_name?: string | null;
};

export type SupportedSurferRow = {
  national_id: string;
  full_name: string;
  program?: string | null; // This is for SURFER, not volunteer - surfers have program
  status?: string | null;  // This is for SURFER status
  group_name?: string | null;
};

export type VolunteerDetail = {
  activities: VolunteerActivityRow[];
  supportedSurfers: SupportedSurferRow[];
};

// Form state matches DB columns
export type VolunteerFormState = {
  national_id: string;
  full_name: string;
  phone: string;
  email: string;
  // Address
  street: string;
  house_number: string;
  city: string;
  // Activity
  active: boolean;
  notes: string;
  classification: string;
  volunteer_type: string;
  profession: string;
  availability: string;
};

export type TaskFormState = {
  volunteer_id: string;
  title: string;
  body: string;
  due_date: string;
};

export type TabId = "home" | "list" | "settings";
