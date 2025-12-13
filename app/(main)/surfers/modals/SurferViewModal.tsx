import { ReactNode } from "react";
import { Modal } from "@/app/components/ui";
import { SmallActionButton } from "@/app/components/shared";
import { spacing, colors, radii } from "@/app/styles/foundations";
import { Surfer } from "@/type";
import { formatPhoneNumber } from "@/lib/utils/format";
import { SurferDetail } from "../types";
import { calcAge } from "../utils";

const muted = colors.textMuted;

type Props = {
  surfer: Surfer | null;
  detail: SurferDetail | null;
  loading: boolean;
  onClose: () => void;
};

export default function SurferViewModal({
  surfer,
  detail,
  loading,
  onClose,
}: Props) {
  if (!surfer) return null;
  const derivedAge = calcAge(surfer.date_of_birth) ?? surfer.age ?? null;
  return (
    <Modal
      open={!!surfer}
      onClose={onClose}
      width="min(720px, 90vw)"
      style={{ padding: spacing.lg }}
      overlayStyle={{ padding: `${spacing.lg}px 0` }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>פרטי גולש</h3>
          <SmallActionButton variant="secondary" onClick={onClose}>
            ✕ סגור
          </SmallActionButton>
        </div>

        <InfoSection title="📋 פרטים אישיים">
          <InfoRow label="שם מלא" value={surfer.full_name} />
          <InfoRow label="ת.ז" value={surfer.national_id} />
          <InfoRow label="טלפון" value={formatPhoneNumber(surfer.phone)} />
          <InfoRow label="אימייל" value={surfer.email || "—"} />
          <InfoRow label="מגורים" value={surfer.residence || "—"} />
          <InfoRow
            label="גיל"
            value={derivedAge !== null ? `${derivedAge} שנים` : "—"}
          />
          <InfoRow label="מגדר" value={surfer.gender || "—"} />
        </InfoSection>

        <InfoSection title="🎯 שיוך וסטטוס">
          <InfoRow label="תוכנית" value={surfer.program || "—"} />
          <InfoRow label="סטטוס" value={surfer.status || "—"} />
          <InfoRow label="קבוצה" value={surfer.group_name || "לא שויכה"} />
          <InfoRow
            label="מתנדבים נדרשים"
            value={surfer.volunteers_needed?.toString() || "לא הוגדר"}
          />
        </InfoSection>

        <InfoSection title="🏥 מצב רפואי">
          <InfoRow
            label="אישור רפואי"
            value={surfer.medical_approval ? "כן" : "לא"}
          />
          <InfoRow
            label="זקוק לכיסא גלגלים"
            value={surfer.needs_wheelchair ? "כן" : "לא"}
          />
          <InfoRow label="מצב רפואי" value={surfer.medical_condition || "—"} />
        </InfoSection>

        <InfoSection title="🚨 איש קשר לחירום">
          <InfoRow
            label="שם איש קשר"
            value={surfer.emergency_contact_name || "—"}
          />
          <InfoRow
            label="טלפון חירום"
            value={formatPhoneNumber(surfer.emergency_contact_phone)}
          />
        </InfoSection>

        {surfer.special_requirements && (
          <InfoSection title="דרישות מיוחדות">
            <div>{surfer.special_requirements}</div>
          </InfoSection>
        )}
        {surfer.notes && (
          <InfoSection title="הערות">
            <div>{surfer.notes}</div>
          </InfoSection>
        )}

        <InfoSection title="👥 מתנדבים לפי פעילות">
          {loading ? (
            <div style={{ color: muted, fontSize: 13 }}>טוען מתנדבים...</div>
          ) : detail?.volunteerActivities?.length ? (
            detail.volunteerActivities.map((row) => (
              <div
                key={`${row.activity_id}-${row.volunteer_national_id}-${row.activity_date}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: `1px solid ${colors.borderMuted}`,
                  paddingBottom: spacing.xs,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {row.volunteer_name || row.volunteer_national_id}
                  </div>
                  <div style={{ fontSize: 12, color: muted }}>
                    פעילות #{row.activity_id} · {row.kind || "—"}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: muted }}>
                  {row.activity_date
                    ? new Date(row.activity_date).toLocaleDateString("he-IL")
                    : "—"}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: muted, fontSize: 13 }}>
              אין מתנדבים משויכים לפעילויות של הגולש.
            </div>
          )}
        </InfoSection>
      </div>
    </Modal>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: colors.surfaceAlt,
        borderRadius: radii.card,
        padding: spacing.md,
      }}
    >
      <div style={{ color: muted, fontWeight: 700, marginBottom: spacing.sm }}>
        {title}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.sm,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: muted }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value || "—"}</div>
    </div>
  );
}

