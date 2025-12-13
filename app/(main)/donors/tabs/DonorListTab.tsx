"use client";

import { Button, Card } from "@/app/components/ui";
import {
  DraftList,
  FilterToolbar,
  SmallActionButton,
  StatusPill,
} from "@/app/components/shared";
import {
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
  filterControlStyle as baseFilterControlStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import { formatPhoneNumber } from "@/lib/utils/format";
import { DonorListTabProps, DonorFilters } from "../types";
import { formatCurrency, formatDate, muted } from "../utils";

export default function DonorListTab({
  donors,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  drafts,
  onResumeDraft,
  onDeleteDraft,
  filters,
  onFilterChange,
  onClearFilters,
}: DonorListTabProps) {
  const filterControlStyle = baseFilterControlStyle;

  return (
    <Card>
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
          <h2 style={{ margin: 0 }}>רשימת תורמים</h2>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            ניהול ועריכת כל התורמים במערכת.
          </p>
          {error && (
            <p style={{ marginTop: 4, color: colors.danger, fontSize: 12 }}>
              {error}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענון רשימה
          </Button>
          <Button onClick={onAdd}>+ תורם חדש</Button>
        </div>
      </div>
      {drafts.length > 0 && (
        <div style={{ marginTop: spacing.md }}>
          <DraftList
            drafts={drafts}
            title={`טיוטות אישיות (${drafts.length})`}
            description="טיוטות זמינות עבורך בלבד עד לשמירה סופית."
            onResume={onResumeDraft}
            onDelete={onDeleteDraft}
            getTitle={(draft) => draft.payload.full_name || "תורם ללא שם"}
            getSubtitle={(draft) =>
              `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
            }
          />
        </div>
      )}
      <FilterToolbar
        columns="repeat(auto-fit, minmax(220px, 1fr))"
        style={{ marginTop: spacing.md }}
      >
        <input
          type="text"
          style={filterControlStyle}
          placeholder="חיפוש לפי שם, ת.ז, ארגון או אימייל"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        <select
          style={filterControlStyle}
          value={filters.status}
          onChange={(e) =>
            onFilterChange("status", e.target.value as DonorFilters["status"])
          }
        >
          <option value="all">כל התורמים</option>
          <option value="active">תורמים פעילים</option>
          <option value="inactive">תורמים לא פעילים</option>
        </select>
      </FilterToolbar>
      <div
        style={{
          marginTop: spacing.sm,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button variant="ghost" onClick={onClearFilters}>
          ניקוי פילטרים
        </Button>
      </div>
      <div style={{ marginTop: spacing.lg }}>
        {loading ? (
          <div
            style={{ padding: spacing.lg, textAlign: "center", color: muted }}
          >
            טוען נתונים...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ ...tableStyle, width: "100%" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>ת.ז</th>
                  <th style={tableHeaderStyle}>שם</th>
                  <th style={tableHeaderStyle}>ארגון</th>
                  <th style={tableHeaderStyle}>טלפון</th>
                  <th style={tableHeaderStyle}>סה"כ תרומות</th>
                  <th style={tableHeaderStyle}>כמות תרומות</th>
                  <th style={tableHeaderStyle}>תרומה אחרונה</th>
                  <th style={tableHeaderStyle}>סטטוס</th>
                  <th style={tableHeaderStyle}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr key={donor.national_id}>
                    <td style={tableCellStyle}>{donor.national_id}</td>
                    <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                      {donor.full_name}
                    </td>
                    <td style={tableCellStyle}>{donor.organization || "—"}</td>
                    <td style={tableCellStyle}>
                      {formatPhoneNumber(donor.phone)}
                    </td>
                    <td style={tableCellStyle}>
                      {formatCurrency(donor.total_donations)}
                    </td>
                    <td style={tableCellStyle}>{donor.donation_count || 0}</td>
                    <td style={tableCellStyle}>
                      {formatDate(donor.last_donation_date)}
                    </td>
                    <td style={tableCellStyle}>
                      <StatusPill
                        tone={donor.is_active ? "active" : "inactive"}
                      >
                        {donor.is_active ? "פעיל" : "לא פעיל"}
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
                          onClick={() => onView(donor)}
                        >
                          👁️
                        </SmallActionButton>
                        <SmallActionButton
                          variant="secondary"
                          onClick={() => onEdit(donor)}
                        >
                          ✏️
                        </SmallActionButton>
                        <SmallActionButton
                          variant="secondary"
                          style={{ color: colors.danger }}
                          onClick={() => onDelete(donor.national_id)}
                        >
                          🗑️
                        </SmallActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {donors.length === 0 && (
                  <tr>
                    <td colSpan={9} style={tableCellStyle}>
                      אין תורמים להצגה. לחץ על "תורם חדש" כדי להתחיל.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

