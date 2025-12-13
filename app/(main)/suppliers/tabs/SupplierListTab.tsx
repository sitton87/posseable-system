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
import { Supplier } from "@/type";
import { DraftEntry } from "@/app/hooks/useDraftManager";
import { FormState, SupplierFilters, identifierTypeOptions, supplierTypeOptions } from "../types";

const muted = colors.textMuted;

type Props = {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  filters: SupplierFilters;
  onFilterChange: <K extends keyof SupplierFilters>(
    key: K,
    value: SupplierFilters[K]
  ) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onCreate: () => void;
  drafts: DraftEntry<FormState>[];
  onResumeDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
};

export default function SupplierListTab({
  suppliers,
  loading,
  error,
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  onCreate,
  drafts,
  onResumeDraft,
  onDeleteDraft,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Card style={{ padding: spacing.lg }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.md,
          flexWrap: "wrap",
          gap: spacing.sm,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>ניהול ספקים</h3>
          {error ? (
            <p style={{ margin: 0, color: colors.danger, fontSize: 13 }}>
              {error}
            </p>
          ) : (
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              הצג, ערוך והוסף ספקים למערכת.
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענון נתונים
          </Button>
          <Button variant="secondary" onClick={onClearFilters}>
            ניקוי פילטרים
          </Button>
          <Button onClick={onCreate}>+ ספק חדש</Button>
        </div>
      </div>

      {drafts.length > 0 && (
        <div style={{ marginBottom: spacing.md }}>
          <DraftList
            drafts={drafts}
            title={`טיוטות שמורות (${drafts.length})`}
            description="פתקים אלו זמינים רק לך עד לשמירה סופית."
            onResume={onResumeDraft}
            onDelete={onDeleteDraft}
            getTitle={(draft) => draft.payload.name || "ספק ללא שם"}
            getSubtitle={(draft) =>
              `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
            }
          />
        </div>
      )}

      <FilterToolbar
        columns="repeat(auto-fit, minmax(220px, 1fr))"
        style={{ marginBottom: spacing.md }}
      >
        <input
          type="text"
          style={filterControlStyle}
          placeholder="חיפוש לפי שם, מזהה או טלפון"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        <select
          style={filterControlStyle}
          value={filters.status}
          onChange={(e) =>
            onFilterChange(
              "status",
              e.target.value as SupplierFilters["status"]
            )
          }
        >
          <option value="all">כל הסטטוסים</option>
          <option value="active">פעילים בלבד</option>
          <option value="inactive">לא פעילים</option>
        </select>
        <select
          style={filterControlStyle}
          value={filters.type}
          onChange={(e) =>
            onFilterChange("type", e.target.value as SupplierFilters["type"])
          }
        >
          <option value="all">כל סוגי הספקים</option>
          {supplierTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FilterToolbar>
      <div style={{ overflowX: "auto" }}>
        <table style={{ ...tableStyle, width: "100%" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>מספר ספק</th>
              <th style={tableHeaderStyle}>שם</th>
              <th style={tableHeaderStyle}>סוג מזהה</th>
              <th style={tableHeaderStyle}>סוג ספק</th>
              <th style={tableHeaderStyle}>איש קשר</th>
              <th style={tableHeaderStyle}>טלפון</th>
              <th style={tableHeaderStyle}>אימייל</th>
              <th style={tableHeaderStyle}>חוזה</th>
              <th style={tableHeaderStyle}>סטטוס</th>
              <th style={tableHeaderStyle}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={tableCellStyle}>
                  טוען נתונים...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={10} style={tableCellStyle}>
                  אין ספקים להצגה. נסה לשנות את הסינון.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.supplier_identifier}>
                  <td style={tableCellStyle}>{supplier.supplier_identifier}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                    {supplier.name}
                  </td>
                  <td style={tableCellStyle}>
                    {
                      identifierTypeOptions.find(
                        (opt) => opt.value === supplier.identifier_type
                      )?.label
                    }
                  </td>
                  <td style={tableCellStyle}>
                    {
                      supplierTypeOptions.find(
                        (opt) =>
                          opt.value === (supplier.supplier_type || "goods")
                      )?.label
                    }
                  </td>
                  <td style={tableCellStyle}>{supplier.contact_name || "—"}</td>
                  <td style={tableCellStyle}>
                    {formatPhoneNumber(supplier.phone)}
                  </td>
                  <td style={tableCellStyle}>{supplier.email || "—"}</td>
                  <td style={tableCellStyle}>
                    <StatusPill
                      tone={
                        supplier.has_active_contract ? "active" : "inactive"
                      }
                    >
                      {supplier.has_active_contract ? "פעיל" : "אין"}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>
                    <StatusPill
                      tone={supplier.is_active ? "active" : "inactive"}
                    >
                      {supplier.is_active ? "פעיל" : "לא פעיל"}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: spacing.xs,
                      }}
                    >
                      <SmallActionButton
                        variant="secondary"
                        onClick={() => onView(supplier)}
                        title="צפייה"
                      >
                        👁️
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        onClick={() => onEdit(supplier)}
                        title="עריכה"
                      >
                        ✏️
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        style={{ color: colors.danger }}
                        onClick={() => onDelete(supplier.supplier_identifier)}
                        title="ביטול"
                      >
                        🗑️
                      </SmallActionButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

