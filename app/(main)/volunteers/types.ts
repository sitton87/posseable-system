import { NoteStatus } from "@/type";

export type Volunteer = {
  national_id: string;
  full_name: string;
  phone: string;
  email: string;
  residence?: string | null;
  program?: string | null;
  group_id?: string | null;
  group_name?: string | null;
  status?: string | null;
  active: boolean;
  notes?: string | null;
  classification: "volunteer" | "staff" | "management";
};

export type VolunteerFilters = {
  search: string;
  status: "all" | "active" | "inactive" | "approved" | "pending";
  program: string;
  classification: "all" | "volunteer" | "staff" | "management";
};

export type VolunteerStats = {
  total: number;
  active: number;
  approved: number;
  pending: number;
  grouped: number;
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
    status?: string | null;
    program?: string | null;
    group_name?: string | null;
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
  program?: string | null;
  status?: string | null;
  group_name?: string | null;
};

export type VolunteerDetail = {
  activities: VolunteerActivityRow[];
  supportedSurfers: SupportedSurferRow[];
};

export type VolunteerFormState = {
  national_id: string;
  full_name: string;
  phone: string;
  email: string;
  residence: string;
  program: string;
  group_id: string;
  status: string;
  active: boolean;
  notes: string;
  classification: string;
};

export type TaskFormState = {
  volunteer_id: string;
  title: string;
  body: string;
  due_date: string;
};

export type TabId = "home" | "list" | "settings";

