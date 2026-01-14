"use client";

import {
  Card,
  Title,
  Text,
  Button,
  Flex,
} from "@tremor/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { cssVar } from "@/app/styles/design-system";
import { Activity, Donor, SeasonPlan } from "@/type";
import { useEffect, useState } from "react";
import FinanceSummary from "./components/FinanceSummary";
import TransactionFilters from "./components/TransactionFilters";
import TransactionTable from "./components/TransactionTable";
import DonorSelectionModal from "./modals/DonorSelectionModal";
import TransactionFormModal from "./modals/TransactionFormModal";
import TransactionViewModal from "./modals/TransactionViewModal";
import { FinanceStats, Transaction, TransactionFormData } from "./types";
import { createEmptyFormData } from "./utils";

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

  const [formData, setFormData] = useState<TransactionFormData>(
    createEmptyFormData()
  );
  const [currentAttachment, setCurrentAttachment] = useState<{
    name: string;
    mime: string;
    data: string;
  } | null>(null);

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
    setFormData(createEmptyFormData());
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

  const handleSelectDonor = (donor: Donor) => {
    addDonorShare(donor);
    setShowDonorModal(false);
    setDonorSearch("");
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-10 text-center" style={{ color: cssVar.text.muted }}>
        טוען תנועות...
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

  const stats: FinanceStats = {
    totalIncome,
    totalExpense,
    balance,
  };

  return (
    <div className="p-6 sm:p-10">
      <Card className="mb-6">
        <Flex justifyContent="between" alignItems="center" className="flex-wrap gap-4 mb-6">
          <div>
            <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
              💰 ניהול כספים
            </Title>
          </div>
          <button
            onClick={handleAdd}
            className="h-[38px] flex items-center justify-center gap-2 px-4 rounded-lg transition-all active:scale-95 border-none outline-none"
            style={{
              background: cssVar.brand.primary,
              color: cssVar.text.inverted,
              boxShadow: cssVar.shadow.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cssVar.brand.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = cssVar.brand.primary;
            }}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm font-medium whitespace-nowrap">הוסף תנועה</span>
          </button>
        </Flex>

        <FinanceSummary stats={stats} transactionCount={transactions.length} />

        <div className="mt-6">
          <TransactionFilters
            filterType={filterType}
            setFilterType={setFilterType}
            filterFromDate={filterFromDate}
            setFilterFromDate={setFilterFromDate}
            filterToDate={filterToDate}
            setFilterToDate={setFilterToDate}
            filterSeasonId={filterSeasonId}
            setFilterSeasonId={setFilterSeasonId}
            filterActivityId={filterActivityId}
            setFilterActivityId={setFilterActivityId}
            seasons={seasons}
            seasonActivities={seasonActivities}
            onReset={() => {
              setFilterType("");
              setFilterFromDate("");
              setFilterToDate("");
              setFilterSeasonId("");
              setFilterActivityId("");
            }}
          />
        </div>
      </Card>

      <TransactionTable
        transactions={transactions}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TransactionFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editing={!!editingTransaction}
        seasons={seasons}
        formSeasonActivities={formSeasonActivities}
        formActivitiesLoading={formActivitiesLoading}
        donors={donors}
        onAddDonor={() => setShowDonorModal(true)}
        currentAttachment={currentAttachment}
        setCurrentAttachment={setCurrentAttachment}
      />

      <TransactionViewModal
        open={showViewModal && !!viewingTransaction}
        onClose={closeViewModal}
        transaction={viewingTransaction}
      />

      <DonorSelectionModal
        open={showDonorModal}
        onClose={() => setShowDonorModal(false)}
        donors={donors}
        search={donorSearch}
        setSearch={setDonorSearch}
        onSelect={handleSelectDonor}
        selectedDonorIds={formData.donor_shares.map((s) => s.donor_id)}
      />
    </div>
  );
}
