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
import { Surfer, PROGRAM_OPTIONS } from "@/type";
import { DraftEntry } from "@/app/hooks/useDraftManager";
import { SurferFilters, SurferFormState } from "../types";

const muted = colors.textMuted;

type Props = {
  loading: boolean;
  error: string | null;
  surfers: Surfer[];
  filters: SurferFilters;
  groups: { id: string; name: string }[];
  groupsLoading: boolean;
  onFilterChange: <K extends keyof SurferFilters>(
    key: K,
    value: SurferFilters[K]
  ) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (surfer: Surfer) => void;
  onDelete: (id: string) => void;
  onView: (surfer: Surfer) => void;
  drafts: DraftEntry<SurferFormState>[];
  onResumeDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
};

export default function SurfersListTab({
  loading,
  error,
  surfers,
  filters,
  groups,
  groupsLoading,
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
          <h2 style={{ margin: 0 }}>רשימת גולשים</h2>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            ניהול ועריכת כל הגולשים במערכת.
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
          <Button onClick={onAdd}>+ גולש חדש</Button>
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
          getTitle={(draft) => draft.payload.full_name || "גולש ללא שם"}
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
          value={filters.status}
          onChange={(e) =>
            onFilterChange("status", e.target.value as SurferFilters["status"])
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
        <select
          style={filterControlStyle}
          value=""
          onChange={() => {}}
          disabled
        >
          <option>
            {groupsLoading ? "טוען קבוצות..." : "קבוצה (לצפייה בלבד)"}
          </option>
        </select>
      </FilterToolbar>

      {loading ? (
        <div style={{ textAlign: "center" }}>טוען גולשים...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>ת.ז.</th>
                <th style={tableHeaderStyle}>שם מלא</th>
                <th style={tableHeaderStyle}>תוכנית</th>
                <th style={tableHeaderStyle}>קבוצה</th>
                <th style={tableHeaderStyle}>סטטוס</th>
                <th style={tableHeaderStyle}>טלפון</th>
                <th style={tableHeaderStyle}>אישור רפואי</th>
                <th style={tableHeaderStyle}>מתנדבים</th>
                <th style={tableHeaderStyle}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {surfers.map((s) => (
                <tr key={s.national_id}>
                  <td style={tableCellStyle}>{s.national_id}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 700 }}>
                    {s.full_name}
                    {s.needs_wheelchair && (
                      <span style={{ marginRight: 6 }}>♿</span>
                    )}
                  </td>
                  <td style={tableCellStyle}>{s.program || "—"}</td>
                  <td style={tableCellStyle}>{s.group_name || "לא שויכה"}</td>
                  <td style={tableCellStyle}>
                    <StatusPill
                      tone={
                        s.status === "מאושר"
                          ? "success"
                          : s.status === "בהמתנה"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {s.status || "—"}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>{formatPhoneNumber(s.phone)}</td>
                  <td style={tableCellStyle}>
                    {s.medical_approval ? "✅" : "❌"}
                  </td>
                  <td style={tableCellStyle}>{s.volunteers_needed ?? "—"}</td>
                  <td style={tableCellStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <SmallActionButton
                        variant="secondary"
                        onClick={() => onView(s)}
                      >
                        👁️
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        onClick={() => onEdit(s)}
                      >
                        ✏️
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        style={{ color: colors.danger }}
                        onClick={() => onDelete(s.national_id)}
                      >
                        🗑️
                      </SmallActionButton>
                    </div>
                  </td>
                </tr>
              ))}
              {surfers.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      ...tableCellStyle,
                      textAlign: "center",
                      color: muted,
                    }}
                  >
                    אין גולשים להצגה
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

