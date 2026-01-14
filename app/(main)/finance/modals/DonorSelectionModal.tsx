"use client";

import { Button, Modal } from "@/app/components/ui";
import { inputStyle } from "@/app/styles/components";
import { spacing } from "@/app/styles/foundations";
import { formatPhoneNumber } from "@/lib/utils/format";
import { Donor } from "@/type";
import { muted, smallButtonStyle } from "../utils";

type DonorSelectionModalProps = {
  open: boolean;
  onClose: () => void;
  donors: Donor[];
  search: string;
  setSearch: (value: string) => void;
  onSelect: (donor: Donor) => void;
  selectedDonorIds: string[];
};

export default function DonorSelectionModal({
  open,
  onClose,
  donors,
  search,
  setSearch,
  onSelect,
  selectedDonorIds,
}: DonorSelectionModalProps) {
  const filteredDonors = donors.filter((donor) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      donor.full_name.toLowerCase().includes(term) ||
      donor.national_id.includes(term)
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
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
          onClick={onClose}
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            <th style={{ textAlign: "center", padding: 8 }}>שם</th>
            <th style={{ textAlign: "center", padding: 8 }}>טלפון</th>
            <th style={{ textAlign: "center", padding: 8 }}>אימייל</th>
            <th style={{ textAlign: "center", padding: 8 }}>פעולה</th>
          </tr>
        </thead>
        <tbody>
          {filteredDonors.map((donor) => {
            const alreadySelected = selectedDonorIds.includes(donor.national_id);
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
                  {formatPhoneNumber(donor.phone)}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  {donor.email || "—"}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <Button
                    variant="secondary"
                    style={{ ...smallButtonStyle, padding: "6px 12px" }}
                    onClick={() => onSelect(donor)}
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
                {search
                  ? "לא נמצאו תורמים תואמים לחיפוש."
                  : "אין תורמים פעילים להצגה."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Modal>
  );
}



