import { Surfer, SurferStats } from "@/type";

export type SurferFilters = {
  search: string;
  status: "all" | "active" | "inactive" | "approved" | "pending";
  program: string;
};

export type SurferNote = {
  note_id: string;
  entity_id: string;
  title: string;
  body: string;
  status: string;
  priority?: string;
  due_date?: string | null;
  created_at?: string | null;
};

export type SurferSummaryData = {
  stats: SurferStats;
  tasks: SurferNote[];
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
  volunteer_name?: string | null;
};

export type SurferDetail = {
  volunteerActivities: VolunteerActivityRow[];
};

export type SurferFormState = {
  national_id: string;
  full_name: string;
  phone: string;
  email: string;
  residence: string;
  age: string;
  date_of_birth: string;
  gender: string;
  status: string;
  program: string;
  group_id: string;
  medical_approval: boolean;
  medical_condition: string;
  needs_wheelchair: boolean;
  volunteers_needed: string;
  special_requirements: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  active: boolean;
  notes: string;
};

export type TaskFormState = {
  surfer_id: string;
  title: string;
  body: string;
  due_date: string;
};

export type TabId = "home" | "list" | "groups" | "settings";

