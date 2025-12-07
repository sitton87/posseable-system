"use client";

import { Fragment, useState } from "react";
import { Card, Button } from "@/app/components/ui";
import {
  badgeStyle,
  inputStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
  withCenteredControl,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type { DraftEntry } from "@/app/hooks/useDraftManager";
import type { EquipmentCategory, EquipmentItem } from "@/type";
import type {
  EquipmentFormState,
  EquipmentPageData,
  FiltersState,
} from "../types";
import {
  CONDITION_OPTIONS,
  conditionBadgeMap,
  getConditionLabel,
  EQUIPMENT_TYPE_LABELS,
} from "../constants";
import { formatDate, formatNumber } from "../utils";

type CatalogTabProps = {
  data: EquipmentPageData;
  filters: FiltersState;
  availableCategories: EquipmentCategory[];
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  drafts?: DraftEntry<EquipmentFormState>[];
  onResumeDraft?: (draftId: string) => void;
  onDeleteDraft?: (draftId: string) => void;
  onFilterChange: (
    key: keyof FiltersState,
    value: FiltersState[typeof key]
  ) => void;
  onRefresh: () => void;
  onCreateItem: () => void;
  onViewItem: (item: EquipmentItem) => void;
  onEditItem: (item: EquipmentItem) => void;
  onDeleteItem: (id: string) => void;
  onClearFilters: () => void;
};

const filterControlStyle = withCenteredControl(inputStyle);
const muted = colors.textMuted;
const draftBorderColor = "#8bd4a1";
const draftSurfaceColor = "#e6f5ec";
const stockCardStyle = {
  border: `1px solid ${colors.border}`,
  borderRadius: spacing.sm,
  padding: spacing.md,
  background: colors.surfaceAlt,
};
const draftListContainer = {
  border: `1px solid ${draftBorderColor}`,
  borderRadius: spacing.md,
  padding: spacing.md,
  background: draftSurfaceColor,
};
const draftRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.md,
  padding: `${spacing.sm} 0`,
  borderBottom: `1px solid ${draftBorderColor}`,
};
const stockTableHeader = {
  textAlign: "center" as const,
  padding: "8px 12px",
  fontSize: 13,
  color: muted,
  borderBottom: `1px solid ${colors.border}`,
};
const stockTableCell = {
  padding: "8px 12px",
  fontSize: 14,
  borderBottom: `1px solid ${colors.borderMuted}`,
  textAlign: "center" as const,
};

export function CatalogTab({
  data,
  filters,
  availableCategories,
  loading,
  error,
  canEdit,
  drafts,
  onResumeDraft,
  onDeleteDraft,
  onFilterChange,
  onRefresh,
  onCreateItem,
  onViewItem,
  onEditItem,
  onDeleteItem,
  onClearFilters,
}: CatalogTabProps) {
  const [expandedStockItem, setExpandedStockItem] = useState<string | null>(
    null
  );

  const toggleStockCard = (itemId: string) => {
    setExpandedStockItem((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>קטלוג הציוד</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              תצוגה ועריכה של כל פריטי הציוד במערכת
            </p>
            {error && (
              <p
                style={{
                  margin: "4px 0 0",
                  color: colors.danger,
                  fontSize: 12,
                }}
              >
                {error}
              </p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: spacing.sm,
              flexWrap: "wrap",
            }}
          >
            <Button variant="secondary" onClick={onRefresh}>
              רענון נתונים
            </Button>
            {canEdit && <Button onClick={onCreateItem}>+ פריט חדש</Button>}
          </div>
        </div>
        {drafts && drafts.length > 0 && (
          <div style={{ ...draftListContainer, marginBottom: spacing.lg }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: spacing.md,
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong>טיוטות שמורות ({drafts.length})</strong>
                <p style={{ margin: 0, color: muted, fontSize: 12 }}>
                  הטיוטות מוצגות רק לך עד לסיום השמירה כמסמך רשמי.
                </p>
              </div>
            </div>
            <div style={{ marginTop: spacing.sm }}>
              {drafts.map((draft, index) => (
                <div
                  key={draft.id}
                  style={{
                    ...draftRowStyle,
                    borderBottom:
                      index === drafts.length - 1
                        ? "none"
                        : draftRowStyle.borderBottom,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: spacing.sm,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          ...badgeStyle,
                          background: colors.success,
                          color: "#fff",
                        }}
                      >
                        טיוטה
                      </span>
                      <strong style={{ fontSize: 14 }}>
                        {draft.payload.name?.trim() || "פריט חדש"}
                      </strong>
                    </div>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: muted,
                        fontSize: 12,
                      }}
                    >
                      עודכן {new Date(draft.updatedAt).toLocaleString("he-IL")}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: spacing.sm,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      onClick={() => onResumeDraft?.(draft.id)}
                      aria-label="המשך עריכת טיוטה"
                    >
                      המשך
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onDeleteDraft?.(draft.id)}
                      aria-label="מחיקת טיוטה"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <input
            type="text"
            placeholder="חיפוש לפי שם, SKU או יצרן"
            style={filterControlStyle}
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
          <select
            style={filterControlStyle}
            value={filters.family}
            onChange={(e) => onFilterChange("family", e.target.value)}
          >
            <option value="">כל המשפחות</option>
            {data.families.map((family) => (
              <option key={family.code} value={family.code}>
                {family.code} · {family.name}
              </option>
            ))}
          </select>
          <select
            style={filterControlStyle}
            value={filters.category}
            onChange={(e) => onFilterChange("category", e.target.value)}
          >
            <option value="">כל הקטגוריות</option>
            {availableCategories.map((category) => (
              <option
                key={`${category.family_code}-${category.code}`}
                value={category.code}
              >
                {category.family_code}/{category.code} · {category.name}
              </option>
            ))}
          </select>
          <select
            style={filterControlStyle}
            value={filters.type}
            onChange={(e) => onFilterChange("type", e.target.value)}
          >
            <option value="">כל סוגי הציוד</option>
            <option value="sea">ציוד ים</option>
            <option value="support">ציוד מסייע</option>
          </select>
          <select
            style={filterControlStyle}
            value={filters.condition}
            onChange={(e) => onFilterChange("condition", e.target.value)}
          >
            <option value="">כל המצבים</option>
            {CONDITION_OPTIONS.map(
              (option: (typeof CONDITION_OPTIONS)[number]) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )
            )}
          </select>
          <select
            style={filterControlStyle}
            value={filters.status}
            onChange={(e) =>
              onFilterChange("status", e.target.value as FiltersState["status"])
            }
          >
            <option value="active">פעילים בלבד</option>
            <option value="all">כל הפריטים</option>
            <option value="inactive">לא פעילים</option>
          </select>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: spacing.lg,
          }}
        >
          <Button variant="secondary" onClick={onClearFilters}>
            ניקוי פילטרים
          </Button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>קוד פריט</th>
                <th style={tableHeaderStyle}>פריט</th>
                <th style={tableHeaderStyle}>משפחה / קטגוריה</th>
                <th style={tableHeaderStyle}>סוג ציוד</th>
                <th style={tableHeaderStyle}>מצב</th>
                <th style={tableHeaderStyle}>הערות</th>
                <th style={tableHeaderStyle}>מלאי/מחסן</th>
                <th style={tableHeaderStyle}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={tableCellStyle}>
                    טוען נתונים...
                  </td>
                </tr>
              ) : (
                data.items.map((item) => {
                  const typeLabel =
                    EQUIPMENT_TYPE_LABELS[item.equipment_type] ||
                    item.equipment_type ||
                    "—";
                  const warehouses = item.warehouse_stock || [];
                  const isExpanded = expandedStockItem === item.id;
                  return (
                    <Fragment key={item.id}>
                      <tr>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: 700 }}>
                            {item.internal_sku || "—"}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: 700 }}>{item.name}</div>
                        </td>
                        <td style={tableCellStyle}>
                          <div>{item.family_name || item.family_code}</div>
                          <div style={{ fontSize: 12, color: muted }}>
                            {item.category_name || item.category_code}
                          </div>
                        </td>
                        <td style={tableCellStyle}>{typeLabel}</td>
                        <td style={tableCellStyle}>
                          <span
                            style={badgeStyle(
                              conditionBadgeMap[item.condition]?.background ||
                                colors.borderMuted,
                              conditionBadgeMap[item.condition]?.color ||
                                colors.textPrimary
                            )}
                          >
                            {getConditionLabel(item.condition)}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              fontSize: 12,
                            }}
                          >
                            {item.ownership_type === "consignment" && (
                              <span>פריט בקונסיגנציה</span>
                            )}
                            {item.is_consumable && <span>פריט מתכלה</span>}
                            {item.is_rental && (
                              <span>
                                <div>פריט בהשכרה</div>
                                {item.rental_expiry && (
                                  <div style={{ fontSize: 11, color: muted }}>
                                    תוקף: {formatDate(item.rental_expiry)}
                                  </div>
                                )}
                              </span>
                            )}
                            {!item.is_consumable &&
                              !item.is_rental &&
                              item.ownership_type !== "consignment" &&
                              !item.notes && (
                                <span style={{ color: muted }}>—</span>
                              )}
                            {item.notes && (
                              <span style={{ color: muted }}>
                                {item.notes.length > 120
                                  ? `${item.notes.slice(0, 117)}...`
                                  : item.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <Button
                            variant="secondary"
                            onClick={() => toggleStockCard(item.id)}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? "סגור כרטיס" : "הצג מלאי/מחסן"}
                          </Button>
                        </td>
                        <td style={tableCellStyle}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: spacing.xs,
                            }}
                          >
                            <Button
                              variant="secondary"
                              title="צפייה"
                              aria-label="צפייה"
                              onClick={() => onViewItem(item)}
                            >
                              👁️
                            </Button>
                            {canEdit && (
                              <>
                                <Button
                                  variant="secondary"
                                  title="עריכה"
                                  aria-label="עריכה"
                                  onClick={() => onEditItem(item)}
                                >
                                  ✏️
                                </Button>
                                <Button
                                  variant="secondary"
                                  title="מחיקה"
                                  aria-label="מחיקה"
                                  style={{ color: colors.danger }}
                                  onClick={() => onDeleteItem(item.id)}
                                >
                                  🗑️
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={8}
                            style={{
                              ...tableCellStyle,
                              background: colors.surfaceAlt,
                            }}
                          >
                            <div
                              style={{
                                ...stockCardStyle,
                                marginTop: spacing.sm,
                                textAlign: "center",
                              }}
                            >
                              <table
                                style={{
                                  width: "100%",
                                  maxWidth: 420,
                                  borderCollapse: "collapse",
                                  margin: "0 auto",
                                  marginBottom: spacing.md,
                                }}
                              >
                                <thead>
                                  <tr>
                                    <th style={stockTableHeader}>שם המחסן</th>
                                    <th style={stockTableHeader}>כמות</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {warehouses.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan={2}
                                        style={{
                                          ...stockTableCell,
                                          textAlign: "center",
                                          color: muted,
                                        }}
                                      >
                                        אין נתוני מלאי זמינים
                                      </td>
                                    </tr>
                                  ) : (
                                    warehouses.map((stock) => (
                                      <tr key={stock.warehouse_id}>
                                        <td style={stockTableCell}>
                                          {stock.warehouse_name}
                                        </td>
                                        <td style={stockTableCell}>
                                          {formatNumber(stock.quantity, "0")}
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: spacing.xs,
                                  fontWeight: 600,
                                }}
                              >
                                <div>
                                  סה״כ מלאי:{" "}
                                  {formatNumber(item.total_units, "0")}
                                </div>
                                {!item.is_sku_tracked &&
                                  typeof item.min_stock === "number" &&
                                  !Number.isNaN(item.min_stock) && (
                                    <div style={{ fontSize: 13, color: muted }}>
                                      מלאי מינימום:{" "}
                                      {formatNumber(item.min_stock)}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
              {!loading && data.items.length === 0 && (
                <tr>
                  <td colSpan={8} style={tableCellStyle}>
                    אין פריטים תואמים לסינון שנבחר.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
