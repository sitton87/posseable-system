"use client";

import type { CSSProperties } from "react";
import { useState, useEffect } from "react";
import type { Activity, SeasonPlan, Donor } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, radii, spacing } from "@/app/styles/foundations";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;
const sectionBoxStyle: CSSProperties = {
  marginBottom: spacing.lg,
  padding: spacing.lg,
  background: colors.surfaceAlt,
  borderRadius: radii.card,
};
const smallButtonStyle: CSSProperties = {
  fontSize: 12,
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
};
const typePillStyle = (type: "income" | "expense"): CSSProperties => ({
  padding: "4px 8px",
  borderRadius: radii.button,
  fontSize: 12,
  fontWeight: 600,
  background: type === "income" ? colors.successSoft : colors.dangerSoft,
  color: type === "income" ? colors.success : colors.danger,
});
const summaryCardStyle = (bg: string, color: string): CSSProperties => ({
  padding: spacing.lg,
  background: bg,
  borderRadius: radii.card,
  color,
});
const dashedBoxStyle: CSSProperties = {
  padding: spacing.md,
  borderRadius: radii.card,
  background: colors.surfaceAlt,
  border: `1px dashed ${colors.borderMuted}`,
};
const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("he-IL") : "—";
const formatCurrency = (value?: number | null) =>
  typeof value === "number" ? `₪${value.toLocaleString()}` : "—";

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
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [viewingTransaction, setViewingTransaction] =
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

    if (
      formData.linkToActivity &&
      (!formData.season_id || !formData.activity_id)
    ) {
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

      if (
        donorSharesPayload.some((share) => !share.amount || share.amount <= 0)
      ) {
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
      const url = editingTransaction
        ? "/api/finance/update"
        : "/api/finance/add";
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
  const handleView = (transaction: Transaction) => {
    setViewingTransaction(transaction);
    setShowViewModal(true);
  };
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingTransaction(null);
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
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
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
    <div style={{ padding: spacing.xl }}>
      <Card style={{ marginBottom: spacing.lg }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.md,
            gap: spacing.md,
            flexWrap: "wrap",
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
          <Button onClick={handleAdd}>+ הוסף תנועה</Button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div style={summaryCardStyle(colors.successSoft, colors.success)}>
            <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
              סה״כ הכנסות
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              ₪{totalIncome.toLocaleString()}
            </div>
          </div>
          <div style={summaryCardStyle(colors.dangerSoft, colors.danger)}>
            <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
              סה״כ הוצאות
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              ₪{totalExpense.toLocaleString()}
            </div>
          </div>
          <div
            style={summaryCardStyle(
              balance >= 0 ? colors.primarySoft : "rgba(251, 191, 36, 0.2)",
              balance >= 0 ? colors.primary : "#d97706"
            )}
          >
            <div style={{ fontSize: 13, color: muted, marginBottom: 4 }}>
              יתרה
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              ₪{balance.toLocaleString()}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: spacing.lg,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: spacing.md,
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
            <Button
              variant="secondary"
              style={{ width: "100%" }}
              onClick={() => {
                setFilterType("");
                setFilterFromDate("");
                setFilterToDate("");
                setFilterSeasonId("");
                setFilterActivityId("");
              }}
            >
              איפוס סינונים
            </Button>
          </div>
        </div>
      </Card>

      <Card>
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
                    <span style={typePillStyle(t.type)}>
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
                          style={{ color: colors.accent, fontSize: 12 }}
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
                      color:
                        t.type === "income" ? colors.success : colors.danger,
                    }}
                  >
                    {t.type === "income" ? "+" : "-"}₪
                    {t.amount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: 4 }}
                      onClick={() => handleView(t)}
                    >
                      👁️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: 4 }}
                      onClick={() => handleEdit(t)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, color: colors.danger }}
                      onClick={() => handleDelete(t.id)}
                    >
                      🗑️
                    </Button>
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
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        width="min(640px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
          {editingTransaction ? "ערוך תנועה" : "הוסף תנועה חדשה"}
        </h3>

        <div
          style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
        >
          <div style={sectionBoxStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: spacing.md,
              }}
            >
              <div>
                <label style={labelStyle}>
                  תאריך <span style={{ color: colors.danger }}>*</span>
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
                  סוג תנועה <span style={{ color: colors.danger }}>*</span>
                </label>
                <select
                  style={inputStyle}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "income" | "expense",
                      category: "",
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
          </div>

          <div style={sectionBoxStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDonation ? "1fr 1fr" : "1fr",
                gap: spacing.md,
                alignItems: "start",
              }}
            >
              <div>
                <label style={labelStyle}>
                  קטגוריה <span style={{ color: colors.danger }}>*</span>
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
                        marginBottom: spacing.xs,
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
                          gap: spacing.sm,
                          marginBottom: spacing.sm,
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
                        <Button
                          variant="secondary"
                          style={{ ...smallButtonStyle, color: colors.danger }}
                          onClick={() => removeDonorShare(share.donor_id)}
                          type="button"
                        >
                          ✕
                        </Button>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="secondary"
                    style={{ marginTop: spacing.xs }}
                    onClick={() => setShowDonorModal(true)}
                  >
                    + הוסף תורם
                  </Button>
                  <div
                    style={{
                      marginTop: spacing.xs,
                      fontSize: 12,
                      color: donorShareMismatch ? colors.danger : muted,
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
          </div>

          <div style={dashedBoxStyle}>
            <label style={labelStyle}>שיוך לפעילות</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.sm,
                marginBottom: spacing.md,
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
                  if (!checked) setFormSeasonActivities([]);
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
                  gap: spacing.md,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    בחר עונה <span style={{ color: colors.danger }}>*</span>
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
                    בחר פעילות <span style={{ color: colors.danger }}>*</span>
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
                        {new Date(activity.activity_date).toLocaleDateString(
                          "he-IL"
                        )}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div style={sectionBoxStyle}>
            <div>
              <label style={labelStyle}>
                סכום (₪) <span style={{ color: colors.danger }}>*</span>
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
                תיאור <span style={{ color: colors.danger }}>*</span>
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
              style={{ display: "flex", alignItems: "center", gap: spacing.sm }}
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
          </div>

          {formData.has_invoice && (
            <div style={sectionBoxStyle}>
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

          <div style={dashedBoxStyle}>
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
                  marginTop: spacing.xs,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: spacing.sm,
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
                  style={{ color: colors.accent, fontSize: 13 }}
                >
                  הורד/י קובץ מצורף
                </a>
                <Button
                  type="button"
                  variant="secondary"
                  style={{ ...smallButtonStyle }}
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
                </Button>
              </div>
            )}
          </div>

          <div style={sectionBoxStyle}>
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
              gap: spacing.md,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              type="button"
            >
              ביטול
            </Button>
            <Button onClick={handleSubmit} type="button">
              {editingTransaction ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showViewModal && !!viewingTransaction}
        onClose={closeViewModal}
        width="min(700px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingTransaction && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing.md,
                gap: spacing.md,
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                פרטי תנועה – {viewingTransaction.description}
              </h3>
              <Button
                variant="secondary"
                onClick={closeViewModal}
                type="button"
              >
                ✕ סגור
              </Button>
            </div>

            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  color: muted,
                  borderBottom: `2px solid ${colors.borderMuted}`,
                  paddingBottom: spacing.xs,
                }}
              >
                יסודות
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: spacing.md,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>תאריך</div>
                  <div>{formatDate(viewingTransaction.transaction_date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סוג</div>
                  <span
                    style={{
                      ...typePillStyle(viewingTransaction.type),
                      marginTop: spacing.xs,
                    }}
                  >
                    {viewingTransaction.type === "income" ? "הכנסה" : "הוצאה"}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>קטגוריה</div>
                  <div style={{ fontWeight: 600 }}>
                    {viewingTransaction.category}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סכום</div>
                  <div
                    style={{
                      fontWeight: 700,
                      color:
                        viewingTransaction.type === "income"
                          ? colors.success
                          : colors.danger,
                    }}
                  >
                    {formatCurrency(viewingTransaction.amount)}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: spacing.md }}>
                <div style={{ fontSize: 12, color: muted }}>תיאור</div>
                <div style={{ fontWeight: 600 }}>
                  {viewingTransaction.description}
                </div>
              </div>
            </div>

            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  color: muted,
                  borderBottom: `2px solid ${colors.borderMuted}`,
                  paddingBottom: spacing.xs,
                }}
              >
                שיוך לפעילות
              </h4>
              {viewingTransaction.activity_id ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: spacing.md,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>פעילות</div>
                    <div style={{ fontWeight: 600 }}>
                      {viewingTransaction.activity_kind ||
                        `פעילות #${viewingTransaction.activity_id}`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>
                      תאריך פעילות
                    </div>
                    <div>{formatDate(viewingTransaction.activity_date)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>עונה</div>
                    <div>
                      {viewingTransaction.season_name
                        ? `${viewingTransaction.season_name} · ${
                            viewingTransaction.season_year ?? ""
                          }`
                        : "—"}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: muted }}>
                  לא משויכת לפעילות
                </div>
              )}
            </div>

            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  color: muted,
                  borderBottom: `2px solid ${colors.borderMuted}`,
                  paddingBottom: spacing.xs,
                }}
              >
                פרטי תשלום
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: spacing.md,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>שולם על ידי</div>
                  <div>{viewingTransaction.paid_by || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>חשבונית</div>
                  <div>
                    {viewingTransaction.has_invoice
                      ? viewingTransaction.invoice_number
                        ? `#${viewingTransaction.invoice_number}`
                        : "קיימת"
                      : "—"}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: spacing.sm }}>
                <div style={{ fontSize: 12, color: muted }}>פרטי תשלום</div>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {viewingTransaction.payment_details || "—"}
                </div>
              </div>
            </div>

            {viewingTransaction.donor_shares?.length ? (
              <div style={{ ...sectionBoxStyle, background: colors.surface }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    color: muted,
                    borderBottom: `2px solid ${colors.borderMuted}`,
                    paddingBottom: spacing.xs,
                  }}
                >
                  תורמים משויכים
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: spacing.sm,
                  }}
                >
                  {viewingTransaction.donor_shares.map((share) => (
                    <div
                      key={share.donor_id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: spacing.sm,
                        borderRadius: radii.card,
                        border: `1px solid ${colors.borderMuted}`,
                        background: colors.surfaceAlt,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {share.donor_name || "—"}
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
                      <div style={{ fontWeight: 700 }}>
                        {formatCurrency(share.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(viewingTransaction.attachment_name &&
              viewingTransaction.attachment_data) ||
            viewingTransaction.notes ? (
              <div style={{ ...sectionBoxStyle, background: colors.surface }}>
                {viewingTransaction.notes && (
                  <>
                    <h4
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: 14,
                        color: muted,
                        borderBottom: `2px solid ${colors.borderMuted}`,
                        paddingBottom: spacing.xs,
                      }}
                    >
                      הערות
                    </h4>
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        marginBottom: viewingTransaction.attachment_name
                          ? spacing.md
                          : 0,
                      }}
                    >
                      {viewingTransaction.notes}
                    </div>
                  </>
                )}
                {viewingTransaction.attachment_name &&
                  viewingTransaction.attachment_data && (
                    <a
                      href={`data:${
                        viewingTransaction.attachment_mime ||
                        "application/octet-stream"
                      };base64,${viewingTransaction.attachment_data}`}
                      download={viewingTransaction.attachment_name}
                      style={{ color: colors.accent, fontSize: 13 }}
                    >
                      הורד/י קובץ מצורף ({viewingTransaction.attachment_name})
                    </a>
                  )}
              </div>
            ) : null}
          </>
        )}
      </Modal>

      <Modal
        open={showDonorModal}
        onClose={() => setShowDonorModal(false)}
        width="min(720px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.md,
            gap: spacing.md,
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>בחר תורם</h3>
          <Button
            variant="secondary"
            onClick={() => setShowDonorModal(false)}
            type="button"
          >
            ✕ סגור
          </Button>
        </div>
        <div style={{ marginBottom: spacing.sm }}>
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
            {filteredDonors.map((donor) => {
              const alreadySelected = formData.donor_shares.some(
                (share) => share.donor_id === donor.national_id
              );
              return (
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
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, padding: "6px 12px" }}
                      onClick={() => handleSelectDonor(donor)}
                      disabled={alreadySelected}
                    >
                      {alreadySelected ? "נבחר" : "בחר"}
                    </Button>
                  </td>
                </tr>
              );
            })}
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
      </Modal>
    </div>
  );
}
