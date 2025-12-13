import { Modal } from "@/app/components/ui";
import { SmallActionButton, StatusPill, Section } from "@/app/components/shared";
import { tableCellStyle, tableHeaderStyle, tableStyle } from "@/app/styles/components";
import { spacing, colors } from "@/app/styles/foundations";
import { formatPhoneNumber } from "@/lib/utils/format";
import { Volunteer, VolunteerDetail } from "../types";

const muted = colors.textMuted;

type Props = {
  volunteer: Volunteer | null;
  detail: VolunteerDetail | null;
  loading: boolean;
  onClose: () => void;
};

export default function VolunteerViewModal({
  volunteer,
  detail,
  loading,
  onClose,
}: Props) {
  return (
    <Modal
      open={Boolean(volunteer)}
      onClose={onClose}
      width="min(760px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      {volunteer && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.lg,
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>{volunteer.full_name}</h3>
              <p style={{ margin: 0, color: muted, fontSize: 13 }}>
                תעודת זהות: {volunteer.national_id}
              </p>
            </div>
            <SmallActionButton variant="secondary" onClick={onClose}>
              ✕ סגור
            </SmallActionButton>
          </div>

          <Section
            title="פרטים כלליים"
            style={{ background: colors.surface }}
            bodyStyle={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: muted }}>טלפון</div>
              <div>{formatPhoneNumber(volunteer.phone)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>אימייל</div>
              <div>{volunteer.email || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
              <StatusPill tone={volunteer.active ? "active" : "inactive"}>
                {volunteer.active ? "פעיל" : "לא פעיל"}
              </StatusPill>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>תוכנית</div>
              <div>{volunteer.program || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted }}>קבוצה</div>
              <div>{volunteer.group_name || "—"}</div>
            </div>
          </Section>

          <Section
            title={`פעילויות (${detail?.activities?.length || 0})`}
            style={{ background: colors.surface }}
          >
            {loading ? (
              <div style={{ textAlign: "center", color: muted }}>
                טוען פעילויות...
              </div>
            ) : !detail?.activities?.length ? (
              <div style={{ color: muted, fontSize: 13 }}>
                אין פעילויות קודמות.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...tableStyle, minWidth: 520 }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>תאריך</th>
                      <th style={tableHeaderStyle}>סוג</th>
                      <th style={tableHeaderStyle}>גולש</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.activities.map((a) => (
                      <tr key={a.activity_id}>
                        <td style={tableCellStyle}>
                          {a.activity_date
                            ? new Date(a.activity_date).toLocaleDateString(
                                "he-IL"
                              )
                            : "—"}
                        </td>
                        <td style={tableCellStyle}>{a.kind || "—"}</td>
                        <td style={tableCellStyle}>{a.surfer_name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section
            title={`גולשים שסייע (${detail?.supportedSurfers?.length || 0})`}
            style={{ background: colors.surface }}
          >
            {loading ? (
              <div style={{ textAlign: "center", color: muted }}>
                טוען שיוכים...
              </div>
            ) : !detail?.supportedSurfers?.length ? (
              <div style={{ color: muted, fontSize: 13 }}>
                אין שיוכי צוות לגולשים.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ ...tableStyle, minWidth: 520 }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>שם</th>
                      <th style={tableHeaderStyle}>תוכנית</th>
                      <th style={tableHeaderStyle}>סטטוס</th>
                      <th style={tableHeaderStyle}>קבוצה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.supportedSurfers.map((s) => (
                      <tr key={s.national_id}>
                        <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                          {s.full_name}
                        </td>
                        <td style={tableCellStyle}>{s.program || "—"}</td>
                        <td style={tableCellStyle}>{s.status || "—"}</td>
                        <td style={tableCellStyle}>{s.group_name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </>
      )}
    </Modal>
  );
}

