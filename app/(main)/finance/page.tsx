"use client";

import { useState, useEffect } from "react";
import type { Activity, SeasonPlan, Donor } from "@/type";

// Styles
const muted = "#6b7280";
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 6px 18px rgba(12,18,31,0.06)",
  border: "1px solid rgba(15,23,42,0.06)",
};

const btn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
  color: "#fff",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
};

const btnSecondary: React.CSSProperties = {
  ...btn,
  background: "#f3f4f6",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: muted,
  marginBottom: 4,
  display: "block",
};

type Transaction = {
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

const TRANSACTION_TYPES = ["income", "expense"] as const;
const INCOME_CATEGORIES = ["תרומה", "מענק", "מכירת ציוד", "אחר"] as const;
const EXPENSE_CATEGORIES = [
  "ציוד",
  "תחזוקה",
  "שכר",
  "ביטוח",
  "שכירות",
  "דלק",
  "אחר",
] as const;

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");
  const [filterSeasonId, setFilterSeasonId] = useState<string>("");
  const [filterActivityId, setFilterActivityId] = useState<string>("");
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [seasonActivities, setSeasonActivities] = useState<Activity[]>([]);
  const [formSeasonActivities, setFormSeasonActivities] = useState<Activity[]>(
    []
  );
  const [formActivitiesLoading, setFormActivitiesLoading] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [donorSearch, setDonorSearch] = useState("");

  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    type: "expense" as "income" | "expense",
    category: "",
    amount: "",
    description: "",
    supplier_id: "",
    notes: "",
    linkToActivity: false,
    season_id: "",
    activity_id: "",
    paid_by: "",
    payment_details: "",
    has_invoice: false,
    invoice_number: "",
    attachment: null as { name: string; mime: string; data: string } | null,
    remove_attachment: false,
    donor_shares: [] as { donor_id: string; amount: string }[],
  });
  const [currentAttachment, setCurrentAttachment] = useState<{
    name: string;
    mime: string;
    data: string;
  } | null>(null);

  const filteredDonors = donors.filter((donor) => {
    const search = donorSearch.trim().toLowerCase();
    if (!search) return true;
    return (
      donor.full_name.toLowerCase().includes(search) ||
      donor.national_id.includes(search)
    );
  });

  const isDonation =
    formData.type === "income" && formData.category === "תרומה";
  const donationAmount = parseFloat(formData.amount || "0") || 0;
  const totalDonorShareAmount = formData.donor_shares.reduce(
    (sum, share) => sum + (parseFloat(share.amount || "0") || 0),
    0
  );
  const donorShareMismatch =
    isDonation &&
    formData.donor_shares.length > 0 &&
    Math.abs(totalDonorShareAmount - donationAmount) > 0.01;

  useEffect(() => {
    fetchTransactions();
  }, [
    filterType,
    filterFromDate,
    filterToDate,
    filterSeasonId,
    filterActivityId,
  ]);

  useEffect(() => {
    fetchSeasons();
  }, []);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await fetch("/api/donors?active=true", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setDonors(data.donors);
        }
      } catch (err) {
        console.error("Error fetching donors:", err);
      }
    };
    fetchDonors();
  }, []);

  useEffect(() => {
    if (!filterSeasonId) {
      setSeasonActivities([]);
      return;
    }
    fetchActivitiesBySeason(filterSeasonId);
  }, [filterSeasonId]);

  useEffect(() => {
    if (!showModal || !formData.linkToActivity) {
      setFormSeasonActivities([]);
      return;
    }
    if (!formData.season_id) {
      setFormSeasonActivities([]);
      return;
    }
    fetchActivitiesBySeason(formData.season_id, "form");
  }, [showModal, formData.linkToActivity, formData.season_id]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = "/api/finance";
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterFromDate) params.set("dateFrom", filterFromDate);
      if (filterToDate) params.set("dateTo", filterToDate);
      if (filterSeasonId) params.set("seasonId", filterSeasonId);
      if (filterActivityId) params.set("activityId", filterActivityId);
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("שגיאה בטעינת תנועות");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await fetch("/api/seasons", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    } catch (err) {
      console.error("Error fetching seasons:", err);
    }
  };

  const fetchActivitiesBySeason = async (
    seasonId: string,
    target: "filter" | "form" = "filter"
  ) => {
    if (!seasonId) return;
    try {
      if (target === "form") {
        setFormActivitiesLoading(true);
      }
      const res = await fetch(`/api/activities?season_id=${seasonId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        if (target === "form") {
          setFormSeasonActivities(data.activities);
        } else {
          setSeasonActivities(data.activities);
        }
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      if (target === "form") {
        setFormActivitiesLoading(false);
      }
    }
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setFormData({
      transaction_date: new Date().toISOString().split("T")[0],
      type: "expense",
      category: "",
      amount: "",
      description: "",
      supplier_id: "",
      notes: "",
      linkToActivity: false,
      season_id: "",
      activity_id: "",
      paid_by: "",
      payment_details: "",
      has_invoice: false,
      invoice_number: "",
      attachment: null,
      remove_attachment: false,
      donor_shares: [],
    });
    setFormSeasonActivities([]);
    setCurrentAttachment(null);
    setShowModal(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      transaction_date: transaction.transaction_date.split("T")[0],
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      supplier_id: transaction.supplier_id || "",
      notes: transaction.notes || "",
      linkToActivity: Boolean(transaction.activity_id),
      season_id: transaction.activity_season_id
        ? transaction.activity_season_id.toString()
        : "",
      activity_id: transaction.activity_id
        ? transaction.activity_id.toString()
        : "",
      paid_by: transaction.paid_by || "",
      payment_details: transaction.payment_details || "",
      has_invoice: Boolean(transaction.has_invoice),
      invoice_number: transaction.invoice_number || "",
      attachment: null,
      remove_attachment: false,
      donor_shares:
        transaction.donor_shares?.map((share) => ({
          donor_id: share.donor_id,
          amount: share.amount.toString(),
        })) || [],
    });
    if (transaction.attachment_name && transaction.attachment_data) {
      setCurrentAttachment({
        name: transaction.attachment_name,
        mime: transaction.attachment_mime || "application/octet-stream",
        data: transaction.attachment_data,
      });
    } else {
      setCurrentAttachment(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.transaction_date ||
      !formData.category ||
      !formData.amount ||
      !formData.description
    ) {
      alert("תאריך, קטגוריה, סכום ותיאור הם שדות חובה");
      return;
    }

    if (formData.linkToActivity && (!formData.season_id || !formData.activity_id)) {
      alert("בחר עונה ופעילות לשיוך הכנסה/הוצאה");
      return;
    }

    const donationSelected =
      formData.type === "income" && formData.category === "תרומה";
    let donorSharesPayload: { donor_id: string; amount: number }[] = [];

    if (donationSelected) {
      if (!formData.donor_shares.length) {
        alert("בחר לפחות תורם אחד עבור תרומה");
        return;
      }

      donorSharesPayload = formData.donor_shares.map((share) => ({
        donor_id: share.donor_id,
        amount: parseFloat(share.amount || "0"),
      }));

      if (donorSharesPayload.some((share) => !share.amount || share.amount <= 0)) {
        alert("סכום תרומה לכל תורם חייב להיות חיובי");
        return;
      }

      const sharesTotal = donorSharesPayload.reduce(
        (sum, share) => sum + share.amount,
        0
      );
      const transactionAmount = parseFloat(formData.amount || "0") || 0;
      if (Math.abs(sharesTotal - transactionAmount) > 0.01) {
        alert("סכום התרומות לתורמים חייב להשתוות לסכום הכולל");
        return;
      }
    }

    try {
      const url = editingTransaction ? "/api/finance/update" : "/api/finance/add";
      const method = editingTransaction ? "PUT" : "POST";

      const activityId =
        formData.linkToActivity && formData.activity_id
          ? parseInt(formData.activity_id, 10)
          : null;

      const body: any = {
        transaction_date: formData.transaction_date,
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        supplier_id: formData.supplier_id || null,
        notes: formData.notes || null,
        activity_id: activityId,
        paid_by: formData.paid_by || null,
        payment_details: formData.payment_details || null,
        has_invoice: formData.has_invoice,
        invoice_number: formData.invoice_number || null,
        donor_shares: donationSelected ? donorSharesPayload : [],
      };

      if (editingTransaction) {
        body.id = editingTransaction.id;
      }

      if (formData.attachment) {
        body.attachment = {
          name: formData.attachment.name,
          mime: formData.attachment.mime,
          data: formData.attachment.data,
        };
      } else if (
        editingTransaction?.attachment_name &&
        formData.remove_attachment
      ) {
        body.attachment = { clear: true };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        alert(
          editingTransaction ? "תנועה עודכנה בהצלחה!" : "תנועה נוספה בהצלחה!"
        );
        setShowModal(false);
        fetchTransactions();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving transaction:", err);
      alert("שגיאה בשמירת תנועה");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את התנועה?")) return;

    try {
      const res = await fetch(`/api/finance/update?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        alert("תנועה נמחקה בהצלחה!");
        fetchTransactions();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
      alert("שגיאה במחיקת תנועה");
    }
  };

  const handleAttachmentFile = (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, attachment: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",").pop() || "";
        setFormData((prev) => ({
          ...prev,
          attachment: {
            name: file.name,
            mime: file.type,
            data: base64,
          },
          remove_attachment: false,
        }));
        setCurrentAttachment({
          name: file.name,
          mime: file.type,
          data: base64,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const addDonorShare = (donor: Donor) => {
    setFormData((prev) => {
      if (
        prev.donor_shares.some((share) => share.donor_id === donor.national_id)
      ) {
        return prev;
      }
      return {
        ...prev,
        donor_shares: [
          ...prev.donor_shares,
          { donor_id: donor.national_id, amount: "" },
        ],
      };
    });
  };

  const updateDonorShareAmount = (donor_id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      donor_shares: prev.donor_shares.map((share) =>
        share.donor_id === donor_id ? { ...share, amount: value } : share
      ),
    }));
  };

  const removeDonorShare = (donor_id: string) => {
    setFormData((prev) => ({
      ...prev,
      donor_shares: prev.donor_shares.filter(
        (share) => share.donor_id !== donor_id
      ),
    }));
  };

  const handleSelectDonor = (donor: Donor) => {
    addDonorShare(donor);
    setShowDonorModal(false);
    setDonorSearch("");
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען תנועות...</div>
      </div>
    );
  }

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div style={{ padding: 20 }}>
      {/* Header with Stats */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              💰 ניהול כספים
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {transactions.length} תנועות במערכת
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף תנועה
          </button>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 16,
              background: "rgba(34, 197, 94, 0.1)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
              סה״כ הכנסות
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#16a34a" }}>
              ₪{totalIncome.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              padding: 16,
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
              סה״כ הוצאות
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#dc2626" }}>
              ₪{totalExpense.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              padding: 16,
              background:
                balance >= 0
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(251, 191, 36, 0.1)",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
              יתרה
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: balance >= 0 ? "#2563eb" : "#d97706",
              }}
            >
              ₪{balance.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>סוג תנועה</label>
            <select
              style={inputStyle}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">כל התנועות</option>
              <option value="income">הכנסות בלבד</option>
              <option value="expense">הוצאות בלבד</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>מתאריך</label>
            <input
              type="date"
              style={inputStyle}
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>עד תאריך</label>
            <input
              type="date"
              style={inputStyle}
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>עונה</label>
            <select
              style={inputStyle}
              value={filterSeasonId}
              onChange={(e) => {
                setFilterSeasonId(e.target.value);
                setFilterActivityId("");
              }}
            >
              <option value="">כל העונות</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} · {season.year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>פעילות</label>
            <select
              style={inputStyle}
              value={filterActivityId}
              onChange={(e) => setFilterActivityId(e.target.value)}
              disabled={!filterSeasonId}
            >
              <option value="">
                {!filterSeasonId
                  ? "בחר עונה קודם"
                  : seasonActivities.length
                  ? "בחר פעילות..."
                  : "אין פעילויות לעונה"}
              </option>
              {filterSeasonId &&
                seasonActivities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.kind} ·{" "}
                    {new Date(activity.activity_date).toLocaleDateString(
                      "he-IL"
                    )}
                  </option>
                ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              style={{
                ...btnSecondary,
                width: "100%",
                fontSize: 14,
              }}
              onClick={() => {
                setFilterType("");
                setFilterFromDate("");
                setFilterToDate("");
                setFilterSeasonId("");
                setFilterActivityId("");
              }}
            >
              איפוס סינונים
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={cardStyle}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px",
            }}
          >
            <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
              <tr style={{ color: muted, fontSize: 13 }}>
                <th style={{ textAlign: "right", padding: 8 }}>תאריך</th>
                <th style={{ textAlign: "center", padding: 8 }}>סוג</th>
                <th style={{ textAlign: "center", padding: 8 }}>קטגוריה</th>
                <th style={{ textAlign: "center", padding: 8 }}>
                  פעילות משויכת
                </th>
                <th style={{ textAlign: "right", padding: 8 }}>תיאור</th>
                <th style={{ textAlign: "center", padding: 8 }}>סכום</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
                >
                  <td style={{ padding: 8, fontSize: 13, color: muted }}>
                    {new Date(t.transaction_date).toLocaleDateString("he-IL")}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          t.type === "income"
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        color: t.type === "income" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {t.type === "income" ? "הכנסה" : "הוצאה"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                    {t.category}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                    {t.activity_id ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {t.activity_kind || `פעילות #${t.activity_id}`}
                        </span>
                        <span style={{ fontSize: 12, color: muted }}>
                          {t.activity_date
                            ? new Date(t.activity_date).toLocaleDateString(
                                "he-IL"
                              )
                            : "—"}
                          {t.season_name ? ` · ${t.season_name}` : ""}
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: 8, fontWeight: 600 }}>
                    <div>{t.description}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>
                      {t.paid_by && (
                        <span style={{ display: "block" }}>
                          שולמה ע"י: {t.paid_by}
                        </span>
                      )}
                      {t.has_invoice && (
                        <span style={{ display: "block" }}>
                          חשבונית{" "}
                          {t.invoice_number ? `#${t.invoice_number}` : "✓"}
                        </span>
                      )}
                      {t.attachment_name && t.attachment_data && (
                        <a
                          href={`data:${
                            t.attachment_mime || "application/octet-stream"
                          };base64,${t.attachment_data}`}
                          download={t.attachment_name}
                          style={{ color: "#0ea5e9", fontSize: 12 }}
                        >
                          הורדת קובץ
                        </a>
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: 8,
                      fontWeight: 700,
                      fontSize: 16,
                      color: t.type === "income" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {t.type === "income" ? "+" : "-"}₪
                    {t.amount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <button
                      style={{ ...btnSecondary, marginLeft: 4, fontSize: 12 }}
                      onClick={() => handleEdit(t)}
                    >
                      ✏️
                    </button>
                    <button
                      style={{
                        ...btnSecondary,
                        color: "#dc2626",
                        fontSize: 12,
                      }}
                      onClick={() => handleDelete(t.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין תנועות במערכת. לחץ על "הוסף תנועה" להתחיל.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(600px, 90vw)",
              padding: 24,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
              {editingTransaction ? "ערוך תנועה" : "הוסף תנועה חדשה"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    תאריך <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.transaction_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transaction_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    סוג תנועה <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    style={inputStyle}
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "income" | "expense",
                        category: "", // Reset category on type change
                        donor_shares:
                          e.target.value === "income"
                            ? formData.donor_shares
                            : [],
                      })
                    }
                  >
                    <option value="expense">הוצאה</option>
                    <option value="income">הכנסה</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isDonation ? "1fr 1fr" : "1fr",
                  gap: 12,
                  alignItems: "start",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    קטגוריה <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    style={inputStyle}
                    value={formData.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        category: value,
                        donor_shares:
                          prev.type === "income" && value === "תרומה"
                            ? prev.donor_shares
                            : [],
                      }));
                    }}
                  >
                    <option value="">בחר קטגוריה...</option>
                    {(formData.type === "income"
                      ? INCOME_CATEGORIES
                      : EXPENSE_CATEGORIES
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {isDonation && (
                  <div>
                    <label style={labelStyle}>תורמים ושיוך סכומים</label>
                    {formData.donor_shares.length === 0 && (
                      <div
                        style={{
                          fontSize: 13,
                          color: muted,
                          marginBottom: 8,
                        }}
                      >
                        לא נבחרו תורמים. לחץ על "הוסף תורם".
                      </div>
                    )}
                    {formData.donor_shares.map((share) => {
                      const donor = donors.find(
                        (d) => d.national_id === share.donor_id
                      );
                      return (
                        <div
                          key={share.donor_id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>
                              {donor?.full_name || "תורם לא נמצא"}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: muted,
                                fontFamily: "monospace",
                              }}
                            >
                              {share.donor_id}
                            </div>
                          </div>
                          <div style={{ width: 140 }}>
                            <input
                              type="number"
                              style={inputStyle}
                              value={share.amount}
                              onChange={(e) =>
                                updateDonorShareAmount(
                                  share.donor_id,
                                  e.target.value
                                )
                              }
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <button
                            type="button"
                            style={{
                              ...btnSecondary,
                              padding: "4px 8px",
                              color: "#dc2626",
                            }}
                            onClick={() => removeDonorShare(share.donor_id)}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      style={{
                        ...btnSecondary,
                        marginTop: 4,
                        padding: "6px 12px",
                      }}
                      onClick={() => setShowDonorModal(true)}
                    >
                      + הוסף תורם
                    </button>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: donorShareMismatch ? "#dc2626" : muted,
                        fontWeight: donorShareMismatch ? 600 : 400,
                      }}
                    >
                      סה״כ משויך: ₪
                      {totalDonorShareAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                      {donorShareMismatch &&
                        ` (נדרש ₪${donationAmount.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })})`}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 4,
                  padding: 12,
                  borderRadius: 8,
                  background: "#f9fafb",
                  border: "1px dashed #d1d5db",
                }}
              >
                <label style={labelStyle}>שיוך לפעילות</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.linkToActivity}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        linkToActivity: checked,
                        season_id: "",
                        activity_id: "",
                      }));
                      if (!checked) {
                        setFormSeasonActivities([]);
                      }
                    }}
                  />
                  <span style={{ fontSize: 13, color: muted }}>
                    לקשר הכנסה/הוצאה לפעילות ספציפית בעונה
                  </span>
                </div>

                {formData.linkToActivity && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>
                        בחר עונה <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <select
                        style={inputStyle}
                        value={formData.season_id}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            season_id: e.target.value,
                            activity_id: "",
                          }))
                        }
                      >
                        <option value="">בחר עונה...</option>
                        {seasons.map((season) => (
                          <option key={season.id} value={season.id}>
                            {season.name} · {season.year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>
                        בחר פעילות <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <select
                        style={inputStyle}
                        value={formData.activity_id}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            activity_id: e.target.value,
                          }))
                        }
                        disabled={
                          !formData.season_id ||
                          formActivitiesLoading ||
                          formSeasonActivities.length === 0
                        }
                      >
                        <option value="">
                          {formActivitiesLoading
                            ? "טוען פעילויות..."
                            : formSeasonActivities.length
                            ? "בחר פעילות..."
                            : "אין פעילויות זמינות לעונה זו"}
                        </option>
                        {formSeasonActivities.map((activity) => (
                          <option key={activity.id} value={activity.id}>
                            {activity.kind} ·{" "}
                            {new Date(
                              activity.activity_date
                            ).toLocaleDateString("he-IL")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>
                  סכום (₪) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  style={inputStyle}
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  תיאור <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="תיאור התנועה"
                />
              </div>

              <div>
                <label style={labelStyle}>מי שילם / מקור התשלום</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.paid_by}
                  onChange={(e) =>
                    setFormData({ ...formData, paid_by: e.target.value })
                  }
                  placeholder="שם האדם או הגורם שביצע את התשלום"
                />
              </div>

              <div>
                <label style={labelStyle}>פרטי התשלום</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  value={formData.payment_details}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_details: e.target.value,
                    })
                  }
                  placeholder="לדוגמה: כרטיס אשראי, סוף 1234, תשלום ב-3 תשלומים"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <input
                  type="checkbox"
                  id="has_invoice"
                  checked={formData.has_invoice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      has_invoice: e.target.checked,
                    })
                  }
                />
                <label htmlFor="has_invoice" style={{ fontWeight: 600 }}>
                  הוצאה חשבונית כנגד
                </label>
              </div>

              {formData.has_invoice && (
                <div>
                  <label style={labelStyle}>מספר חשבונית</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.invoice_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoice_number: e.target.value,
                      })
                    }
                    placeholder="לדוגמה: INV-2025-001"
                  />
                </div>
              )}

              <div
                style={{
                  border: "1px dashed #d1d5db",
                  borderRadius: 8,
                  padding: 12,
                  background: "#f9fafb",
                }}
              >
                <label style={labelStyle}>צרף מסמך (PDF / תמונה)</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) =>
                    handleAttachmentFile(e.target.files?.[0] || null)
                  }
                />
                {(currentAttachment || formData.attachment) && (
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={`data:${
                        formData.attachment?.mime ||
                        currentAttachment?.mime ||
                        "application/octet-stream"
                      };base64,${
                        formData.attachment?.data || currentAttachment?.data
                      }`}
                      download={
                        formData.attachment?.name ||
                        currentAttachment?.name ||
                        "attachment"
                      }
                      style={{ color: "#0ea5e9", fontSize: 13 }}
                    >
                      הורד/י קובץ מצורף
                    </a>
                    <button
                      type="button"
                      style={{
                        ...btnSecondary,
                        fontSize: 12,
                        padding: "4px 10px",
                      }}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          attachment: null,
                          remove_attachment: true,
                        }));
                        setCurrentAttachment(null);
                      }}
                    >
                      הסר קובץ
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>הערות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="הערות נוספות..."
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  style={btnSecondary}
                  onClick={() => setShowModal(false)}
                >
                  ביטול
                </button>
                <button style={btnPrimary} onClick={handleSubmit}>
                  {editingTransaction ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDonorModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowDonorModal(false)}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(720px, 95vw)",
              padding: 24,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                בחר תורם
              </h3>
              <button
                style={btnSecondary}
                onClick={() => setShowDonorModal(false)}
              >
                ✕ סגור
              </button>
            </div>
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              style={inputStyle}
              placeholder="חפש לפי שם או ת.ז"
              value={donorSearch}
              onChange={(e) => setDonorSearch(e.target.value)}
            />
          </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 8px",
              }}
            >
              <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
                <tr style={{ color: muted, fontSize: 13 }}>
                  <th style={{ textAlign: "right", padding: 8 }}>שם</th>
                  <th style={{ textAlign: "center", padding: 8 }}>טלפון</th>
                  <th style={{ textAlign: "center", padding: 8 }}>אימייל</th>
                  <th style={{ textAlign: "center", padding: 8 }}>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((donor) => (
                  <tr
                    key={donor.national_id}
                    style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
                  >
                    <td style={{ padding: 8 }}>
                      <div style={{ fontWeight: 600 }}>{donor.full_name}</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: muted,
                          fontFamily: "monospace",
                        }}
                      >
                        {donor.national_id}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      {donor.phone || "—"}
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      {donor.email || "—"}
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      <button
                        style={{ ...btnSecondary, padding: "6px 12px" }}
                        onClick={() => handleSelectDonor(donor)}
                        disabled={formData.donor_shares.some(
                          (share) => share.donor_id === donor.national_id
                        )}
                      >
                        {formData.donor_shares.some(
                          (share) => share.donor_id === donor.national_id
                        )
                          ? "נבחר"
                          : "בחר"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDonors.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: 20, color: muted }}
                    >
                      {donorSearch
                        ? "לא נמצאו תורמים תואמים לחיפוש."
                        : "אין תורמים פעילים להצגה."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
