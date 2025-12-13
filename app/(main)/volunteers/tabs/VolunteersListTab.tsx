import { Button, Card } from "@/app/components/ui";
import {
  DraftList,
  FilterToolbar,
  SmallActionButton,
  StatusPill,
} from "@/app/components/shared";
import {
  filterControlStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import { formatPhoneNumber } from "@/lib/utils/format";
import { PROGRAM_OPTIONS } from "@/type";
import { DraftEntry } from "@/app/hooks/useDraftManager";
import { Volunteer, VolunteerFilters, VolunteerFormState } from "../types";

const muted = colors.textMuted;

type Props = {
  loading: boolean;
  error: string | null;
  volunteers: Volunteer[];
  filters: VolunteerFilters;
  onFilterChange: <K extends keyof VolunteerFilters>(
    key: K,
    value: VolunteerFilters[K]
  ) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (volunteer: Volunteer) => void;
  onDelete: (id: string) => void;
  onView: (volunteer: Volunteer) => void;
  drafts: DraftEntry<VolunteerFormState>[];
  onResumeDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
};

export default function VolunteersListTab({
  loading,
  error,
  volunteers,
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onView,
  drafts,
  onResumeDraft,
  onDeleteDraft,
}: Props) {
  return (
    <Card
      style={{
        padding: spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: spacing.sm,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>רשימת צוות ומתנדבים</h2>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            ניהול ועריכת כל המתנדבים ואנשי הצוות במערכת.
          </p>
          {error && (
            <p style={{ marginTop: 4, color: colors.danger, fontSize: 12 }}>
              {error}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: spacing.sm,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <SmallActionButton variant="secondary" onClick={onRefresh}>
            רענן
          </SmallActionButton>
          <SmallActionButton variant="secondary" onClick={onClearFilters}>
            ניקוי פילטרים
          </SmallActionButton>
          <Button onClick={onAdd}>+ מתנדב חדש</Button>
        </div>
      </div>

      {drafts.length > 0 && (
        <DraftList
          drafts={drafts}
          title={`טיוטות שמורות (${drafts.length})`}
          description="טיוטות אלו זמינות עבורך בלבד עד לשמירה סופית."
          onResume={onResumeDraft}
          onDelete={onDeleteDraft}
          badgeLabel="טיוטה"
          getTitle={(draft) => draft.payload.full_name || "מתנדב ללא שם"}
          getSubtitle={(draft) =>
            `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
          }
        />
      )}

      <FilterToolbar columns="repeat(auto-fit, minmax(200px, 1fr))">
        <input
          style={filterControlStyle}
          placeholder="חיפוש לפי שם, ת.ז, טלפון או אימייל"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        <select
          style={filterControlStyle}
          value={filters.classification}
          onChange={(e) =>
            onFilterChange(
              "classification",
              e.target.value as VolunteerFilters["classification"]
            )
          }
        >
          <option value="all">כל הסוגים</option>
          <option value="volunteer">מתנדבים</option>
          <option value="staff">צוות</option>
          <option value="management">הנהלה</option>
        </select>
        <select
          style={filterControlStyle}
          value={filters.status}
          onChange={(e) =>
            onFilterChange(
              "status",
              e.target.value as VolunteerFilters["status"]
            )
          }
        >
          <option value="all">כל המצבים</option>
          <option value="active">פעילים</option>
          <option value="inactive">לא פעילים</option>
          <option value="approved">מאושרים</option>
          <option value="pending">ממתינים</option>
        </select>
        <select
          style={filterControlStyle}
          value={filters.program}
          onChange={(e) => onFilterChange("program", e.target.value)}
        >
          <option value="">כל התוכניות</option>
          {PROGRAM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </FilterToolbar>

      {loading ? (
        <div style={{ textAlign: "center" }}>טוען מתנדבים...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>ת.ז.</th>
                <th style={tableHeaderStyle}>שם מלא</th>
                <th style={tableHeaderStyle}>סוג</th>
                <th style={tableHeaderStyle}>תוכנית</th>
                <th style={tableHeaderStyle}>קבוצה</th>
                <th style={tableHeaderStyle}>סטטוס</th>
                <th style={tableHeaderStyle}>טלפון</th>
                <th style={tableHeaderStyle}>פעיל</th>
                <th style={tableHeaderStyle}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.national_id}>
                  <td style={tableCellStyle}>{v.national_id}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 700 }}>
                    {v.full_name}
                  </td>
                  <td style={tableCellStyle}>
                    {v.classification === "staff"
                      ? "איש צוות"
                      : v.classification === "management"
                      ? "הנהלה"
                      : "מתנדב"}
                  </td>
                  <td style={tableCellStyle}>{v.program || "—"}</td>
                  <td style={tableCellStyle}>{v.group_name || "לא שויכה"}</td>
                  <td style={tableCellStyle}>{v.status || "—"}</td>
                  <td style={tableCellStyle}>{formatPhoneNumber(v.phone)}</td>
                  <td style={tableCellStyle}>
                    <StatusPill tone={v.active ? "active" : "inactive"}>
                      {v.active ? "פעיל" : "לא פעיל"}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>
                    <SmallActionButton
                      variant="secondary"
                      onClick={() => onView(v)}
                      style={{ marginInlineEnd: spacing.xs }}
                    >
                      👁️
                    </SmallActionButton>
                    <SmallActionButton
                      variant="secondary"
                      onClick={() => onEdit(v)}
                      style={{ marginInlineEnd: spacing.xs }}
                    >
                      ✏️
                    </SmallActionButton>
                    <SmallActionButton
                      variant="secondary"
                      style={{ color: colors.danger }}
                      onClick={() => onDelete(v.national_id)}
                    >
                      🗑️
                    </SmallActionButton>
                  </td>
                </tr>
              ))}
              {volunteers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ ...tableCellStyle, textAlign: "center" }}
                  >
                    לא נמצאו מתנדבים. לחץ על "מתנדב חדש" כדי להתחיל.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

