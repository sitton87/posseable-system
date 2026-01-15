export type Transaction = {
  id: string;
  transaction_date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  donor_id?: string;
  supplier_id?: string;
  notes?: string;
  created_at: string;
  activity_id?: number | null;
  activity_kind?: string | null;
  activity_date?: string | null;
  activity_season_id?: number | null;
  season_name?: string | null;
  season_year?: number | null;
  paid_by?: string | null;
  payment_details?: string | null;
  has_invoice?: boolean | null;
  invoice_number?: string | null;
  attachment_name?: string | null;
  attachment_mime?: string | null;
  attachment_data?: string | null;
  donor_shares?: {
    donor_id: string;
    donor_name?: string;
    amount: number;
  }[];
};

export type TransactionFormData = {
  transaction_date: string;
  type: "income" | "expense";
  category: string;
  amount: string;
  description: string;
  supplier_id: string;
  notes: string;
  linkToActivity: boolean;
  season_id: string;
  activity_id: string;
  paid_by: string;
  payment_details: string;
  has_invoice: boolean;
  invoice_number: string;
  attachment: { name: string; mime: string; data: string } | null;
  remove_attachment: boolean;
  donor_shares: { donor_id: string; amount: string }[];
};

export type FinanceStats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};




