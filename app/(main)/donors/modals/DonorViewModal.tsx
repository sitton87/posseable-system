"use client";

import { Button, Modal } from "@/app/components/ui";
import { StatusPill, sectionCardStyle } from "@/app/components/shared";
import { colors, spacing } from "@/app/styles/foundations";
import { formatPhoneNumber } from "@/lib/utils/format";
import type { Donor } from "@/type";
import { DonationRecord } from "../types";
import { formatCurrency, formatDate, muted } from "../utils";

type DonorViewModalProps = {
  donor: Donor | null;
  onClose: () => void;
  donationHistory: DonationRecord[];
  historyLoading: boolean;
};

const sectionBoxStyle = {
  ...sectionCardStyle,
  marginBottom: spacing.lg,
};

export default function DonorViewModal({
  donor,
  onClose,
  donationHistory,
  historyLoading,
}: DonorViewModalProps) {
  if (!donor) return null;

  return (
    <Modal
      open={Boolean(donor)}
      onClose={onClose}
      width="min(680px, 96vw)"
      style={{ padding: spacing.xxl }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.lg,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>{donor.full_name}</h3>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            תעודת זהות: {donor.national_id}
          </p>
        </div>
        <Button variant="secondary" onClick={onClose}>
          ✕ סגור
        </Button>
      </div>

      <div style={{ ...sectionBoxStyle, background: colors.surface }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>פרטים כלליים</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: spacing.md,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: muted }}>ארגון</div>
            <div>{donor.organization || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
            <StatusPill tone={donor.is_active ? "active" : "inactive"}>
              {donor.is_active ? "פעיל" : "לא פעיל"}
            </StatusPill>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>טלפון</div>
            <div>{formatPhoneNumber(donor.phone)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted }}>אימייל</div>
            <div>{donor.email || "—"}</div>
          </div>
        </div>
      </div>

      <div style={{ ...sectionBoxStyle, background: colors.surface }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>הערות</h4>
        <div style={{ whiteSpace: "pre-wrap", minHeight: 40 }}>
          {donor.notes || "—"}
        </div>
      </div>

      <div style={{ ...sectionBoxStyle, background: colors.surface }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>היסטוריית תרומות</h4>
        {historyLoading ? (
          <div style={{ textAlign: "center", color: muted }}>
            טוען היסטוריה...
          </div>
        ) : donationHistory.length === 0 ? (
          <div style={{ textAlign: "center", color: muted }}>
            לא נמצאו תרומות קודמות.
          </div>
        ) : (
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            <table style={{ width: "100%", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "right", color: muted }}>
                  <th>תאריך</th>
                  <th>תיאור</th>
                  <th>סכום</th>
                </tr>
              </thead>
              <tbody>
                {donationHistory.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.transaction_date)}</td>
                    <td>{record.description || "—"}</td>
                    <td>{formatCurrency(record.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}



