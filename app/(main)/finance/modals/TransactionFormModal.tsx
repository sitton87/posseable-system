"use client";

import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Flex,
  Select,
  SelectItem,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { Activity, Donor, SeasonPlan } from "@/type";
import { TransactionFormData } from "../types";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
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

  const categories = formData.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-2xl">
        <Title className="mb-6">
          {editing ? "ערוך תנועה" : "הוסף תנועה חדשה"}
        </Title>

        <div className="space-y-4">
          {/* תאריך וסוג */}
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תאריך <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <TextInput
                  type="date"
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
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  סוג תנועה <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <Select
                  value={formData.type}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      type: val as "income" | "expense",
                      category: "",
                      donor_shares: val === "income" ? formData.donor_shares : [],
                    })
                  }
                >
                  <SelectItem value="expense">הוצאה</SelectItem>
                  <SelectItem value="income">הכנסה</SelectItem>
                </Select>
              </div>
            </div>
          </Card>

          {/* קטגוריה ותורמים */}
          <Card>
            <div className={`grid gap-4 ${isDonation ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  קטגוריה <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                {formData.category ? (
                  <Select
                    value={formData.category}
                    onValueChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        category: val,
                        donor_shares:
                          prev.type === "income" && val === "תרומה"
                            ? prev.donor_shares
                            : [],
                      }));
                    }}
                  >
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Select
                    value={undefined}
                    onValueChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        category: val,
                        donor_shares:
                          prev.type === "income" && val === "תרומה"
                            ? prev.donor_shares
                            : [],
                      }));
                    }}
                    placeholder="בחר קטגוריה..."
                  >
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              </div>

              {isDonation && (
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                    תורמים ושיוך סכומים
                  </Text>
                  {formData.donor_shares.length === 0 && (
                    <Text className="text-xs mb-2" style={{ color: cssVar.text.muted }}>
                      לא נבחרו תורמים. לחץ על "הוסף תורם".
                    </Text>
                  )}
                  {formData.donor_shares.map((share) => {
                    const donor = donors.find(
                      (d) => d.national_id === share.donor_id
                    );
                    return (
                      <div
                        key={share.donor_id}
                        className="flex items-center gap-2 mb-2"
                      >
                        <div className="flex-1">
                          <Text className="font-semibold text-sm">
                            {donor?.full_name || "תורם לא נמצא"}
                          </Text>
                          <Text className="text-xs font-mono" style={{ color: cssVar.text.muted }}>
                            {share.donor_id}
                          </Text>
                        </div>
                        <div className="w-32">
                          <TextInput
                            type="number"
                            value={share.amount}
                            onChange={(e) =>
                              updateDonorShareAmount(share.donor_id, e.target.value)
                            }
                            placeholder="סכום"
                          />
                        </div>
                        <Button
                          size="xs"
                          variant="secondary"
                          color="rose"
                          onClick={() => removeDonorShare(share.donor_id)}
                        >
                          ✕
                        </Button>
                      </div>
                    );
                  })}
                  <Button
                    variant="secondary"
                    size="xs"
                    className="mt-2"
                    onClick={onAddDonor}
                  >
                    + הוסף תורם
                  </Button>
                  <Text
                    className="text-xs mt-2"
                    style={{
                      color: donorShareMismatch ? cssVar.status.danger : cssVar.text.muted,
                      fontWeight: donorShareMismatch ? 600 : 400,
                    }}
                  >
                    סה״כ משויך: ₪{totalDonorShareAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    {donorShareMismatch &&
                      ` (נדרש ₪${donationAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })})`}
                  </Text>
                </div>
              )}
            </div>
          </Card>

          {/* שיוך לפעילות */}
          <Card className="border-dashed">
            <Text className="text-sm mb-2" style={{ color: cssVar.text.secondary }}>
              שיוך לפעילות
            </Text>
            <div className="flex items-center gap-2 mb-4">
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
                className="w-4 h-4"
              />
              <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                לקשר הכנסה/הוצאה לפעילות ספציפית בעונה
              </Text>
            </div>

            {formData.linkToActivity && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                    בחר עונה <span style={{ color: cssVar.status.danger }}>*</span>
                  </Text>
                  <Select
                    value={formData.season_id || undefined}
                    onValueChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        season_id: val,
                        activity_id: "",
                      }));
                    }}
                    placeholder="בחר עונה..."
                  >
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id.toString()}>
                        {season.name} · {season.year}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                    בחר פעילות <span style={{ color: cssVar.status.danger }}>*</span>
                  </Text>
                  <Select
                    value={formData.activity_id || undefined}
                    onValueChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        activity_id: val,
                      }));
                    }}
                    disabled={
                      !formData.season_id ||
                      formActivitiesLoading ||
                      formSeasonActivities.length === 0
                    }
                    placeholder={
                      formActivitiesLoading
                        ? "טוען פעילויות..."
                        : formSeasonActivities.length
                        ? "בחר פעילות..."
                        : "אין פעילויות זמינות לעונה זו"
                    }
                  >
                    {formSeasonActivities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id.toString()}>
                        {activity.kind} ·{" "}
                        {new Date(activity.activity_date).toLocaleDateString("he-IL")}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            )}
          </Card>

          {/* סכום ותיאור */}
          <Card>
            <div className="space-y-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  סכום (₪) <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <TextInput
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תיאור <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <TextInput
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="תיאור התנועה"
                />
              </div>

              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  מי שילם / מקור התשלום
                </Text>
                <TextInput
                  type="text"
                  value={formData.paid_by}
                  onChange={(e) =>
                    setFormData({ ...formData, paid_by: e.target.value })
                  }
                  placeholder="שם האדם או הגורם שביצע את התשלום"
                />
              </div>

              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  פרטי התשלום
                </Text>
                <textarea
                  className="w-full min-h-[60px] p-3 border rounded-lg resize-y text-sm"
                  style={{
                    borderColor: cssVar.border.primary,
                    backgroundColor: cssVar.bg.primary,
                    color: cssVar.text.primary,
                  }}
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

              <div className="flex items-center gap-2">
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
                  className="w-4 h-4"
                />
                <label htmlFor="has_invoice" className="font-semibold text-sm">
                  הוצאה חשבונית כנגד
                </label>
              </div>
            </div>
          </Card>

          {/* חשבונית */}
          {formData.has_invoice && (
            <Card>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                מספר חשבונית
              </Text>
              <TextInput
                type="text"
                value={formData.invoice_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoice_number: e.target.value,
                  })
                }
                placeholder="לדוגמה: INV-2025-001"
              />
            </Card>
          )}

          {/* קובץ מצורף */}
          <Card className="border-dashed">
            <Text className="text-sm mb-2" style={{ color: cssVar.text.secondary }}>
              צרף מסמך (PDF / תמונה)
            </Text>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => handleAttachmentFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            {(currentAttachment || formData.attachment) && (
              <Flex justifyContent="between" alignItems="center" className="mt-2 flex-wrap gap-2">
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
                  style={{ color: cssVar.brand.primary }}
                  className="text-sm"
                >
                  הורד/י קובץ מצורף
                </a>
                <Button
                  variant="secondary"
                  size="xs"
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
              </Flex>
            )}
          </Card>

          {/* הערות */}
          <Card>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              הערות
            </Text>
            <textarea
              className="w-full min-h-[60px] p-3 border rounded-lg resize-y text-sm"
              style={{
                borderColor: cssVar.border.primary,
                backgroundColor: cssVar.bg.primary,
                color: cssVar.text.primary,
              }}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="הערות נוספות..."
            />
          </Card>

          {/* Actions */}
          <Flex justifyContent="end" className="gap-3">
            <Button variant="secondary" onClick={onClose}>
              ביטול
            </Button>
            <Button onClick={onSubmit}>
              {editing ? "עדכון" : "הוסף"}
            </Button>
          </Flex>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
