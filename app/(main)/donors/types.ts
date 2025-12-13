import type { Donor } from "@/type";
import type { DraftEntry } from "@/app/hooks/useDraftManager";

export type DonorFormState = {
  national_id: string;
  full_name: string;
  organization: string;
  phone: string;
  email: string;
  notes: string;
  is_active: boolean;
};

export type DonorStats = {
  total_donors: number;
  active_donors: number;
  total_donation_events: number;
  total_donations: number;
  highest_donation: number;
  average_donation: number;
};

export type DonorTask = {
  id: string;
  donorName: string;
  summary: string;
  dueDate?: string | null;
  status: string;
  emphasis: "call" | "meet" | "thank-you";
};

export type DonationRecord = {
  id: string;
  transaction_date: string;
  amount: number;
  currency?: string | null;
  description?: string | null;
};

export type DonorTabId = "home" | "list";

export type DonorFilters = {
  search: string;
  status: "all" | "active" | "inactive";
};

export type HomeTabProps = {
  stats: DonorStats;
  donors: Donor[];
  onRefresh: () => void;
  loading: boolean;
};

export type DonorListTabProps = {
  donors: Donor[];
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (donor: Donor) => void;
  onDelete: (id: string) => void;
  onView: (donor: Donor) => void;
  onRefresh: () => void;
  drafts: DraftEntry<DonorFormState>[];
  onResumeDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  filters: DonorFilters;
  onFilterChange: <K extends keyof DonorFilters>(
    key: K,
    value: DonorFilters[K]
  ) => void;
  onClearFilters: () => void;
};

