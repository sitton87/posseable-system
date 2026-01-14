"use client";

import { Button, Modal } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import { Activity, Donor, SeasonPlan } from "@/type";
import { TransactionFormData } from "../types";
import {
  dashedBoxStyle,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  muted,
  sectionBoxStyle,
  smallButtonStyle,
} from "../utils";

type TransactionFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: TransactionFormData;
  setFormData: React.Dispatch<React.SetStateAction<TransactionFormData>>;
  editing: boolean;
  seasons: SeasonPlan[];
  formSeasonActivities: Activity[];
  formActivitiesLoading: boolean;
  donors: Donor[];
  onAddDonor: () => void;
  currentAttachment: { name: string; mime: string; data: string } | null;
  setCurrentAttachment: (
    value: { name: string; mime: string; data: string } | null
  ) => void;
};

export default function TransactionFormModal({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editing,
  seasons,
  formSeasonActivities,
  formActivitiesLoading,
  donors,
  onAddDonor,
  currentAttachment,
  setCurrentAttachment,
}: TransactionFormModalProps) {
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(640px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
        {editing ? "ערוך תנועה" : "הוסף תנועה חדשה"}
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
                      e.target.value === "income" ? formData.donor_shares : [],
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
                  onClick={onAddDonor}
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
            onChange={(e) => handleAttachmentFile(e.target.files?.[0] || null)}
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
            onClick={onClose}
            type="button"
          >
            ביטול
          </Button>
          <Button onClick={onSubmit} type="button">
            {editing ? "עדכון" : "הוסף"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}



