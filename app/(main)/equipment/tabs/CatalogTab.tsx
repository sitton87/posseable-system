"use client";

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
import type { EquipmentCategory, EquipmentItem } from "@/type";
import type { EquipmentPageData, FiltersState, StatSummary } from "../types";
import {
  CONDITION_OPTIONS,
  conditionBadgeMap,
  getConditionLabel,
  EQUIPMENT_TYPE_LABELS,
} from "../constants";
import { formatDate, formatNumber, px } from "../utils";
import { EquipmentSummaryCard } from "../components";

type CatalogTabProps = {
  data: EquipmentPageData;
  filters: FiltersState;
  availableCategories: EquipmentCategory[];
  statSummary: StatSummary;
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  onFilterChange: (
    key: keyof FiltersState,
    value: FiltersState[typeof key]
  ) => void;
  onRefresh: () => void;
  onCreateItem: () => void;
  onViewItem: (item: EquipmentItem) => void;
  onEditItem: (item: EquipmentItem) => void;
  onDeleteItem: (id: string) => void;
};

const filterControlStyle = withCenteredControl(inputStyle);
const muted = colors.textMuted;

export function CatalogTab({
  data,
  filters,
  availableCategories,
  statSummary,
  loading,
  error,
  canEdit,
  onFilterChange,
  onRefresh,
  onCreateItem,
  onViewItem,
  onEditItem,
  onDeleteItem,
}: CatalogTabProps) {
  return (
    <>
      <EquipmentSummaryCard
        statSummary={statSummary}
        error={error}
        onRefresh={onRefresh}
        onCreate={onCreateItem}
        canCreate={canEdit}
      />

      <Card>
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
            {CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>פריט</th>
                <th style={tableHeaderStyle}>משפחה / קטגוריה</th>
                <th style={tableHeaderStyle}>סוג ציוד</th>
                <th style={tableHeaderStyle}>מצב</th>
                <th style={tableHeaderStyle}>מלאי</th>
                <th style={tableHeaderStyle}>מחסנים</th>
                <th style={tableHeaderStyle}>סטטוסים נוספים</th>
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
                  return (
                    <tr key={item.id}>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                        <div style={{ color: muted, fontSize: 12 }}>
                          SKU פנימי: {item.internal_sku || "—"}
                        </div>
                        <div style={{ color: muted, fontSize: 12 }}>
                          מק״ט יצרן: {item.manufacturer_sku || "—"}
                        </div>
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
                        <div style={{ fontSize: 16, fontWeight: 700 }}>
                          {formatNumber(item.total_units, "0")}
                        </div>
                        <div style={{ fontSize: 12, color: muted }}>
                          מינימום:{" "}
                          {item.is_sku_tracked
                            ? "N/A"
                            : formatNumber(item.min_stock)}
                        </div>
                        <div style={{ fontSize: 12, color: muted }}>
                          מקסימום:{" "}
                          {item.is_sku_tracked
                            ? "N/A"
                            : formatNumber(item.max_stock)}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        {warehouses.length === 0 && (
                          <div style={{ color: muted }}>אין נתוני מלאי</div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          {warehouses.map((stock) => (
                            <span
                              key={stock.warehouse_id}
                              style={badgeStyle(
                                colors.surfaceAlt,
                                colors.textPrimary
                              )}
                            >
                              {stock.warehouse_name}:{" "}
                              {formatNumber(stock.quantity, "0")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        {item.is_consumable ? (
                          <span
                            style={badgeStyle(
                              colors.surfaceAlt,
                              colors.textPrimary
                            )}
                          >
                            פריט מתכלה
                          </span>
                        ) : item.is_rental ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <span
                              style={badgeStyle(
                                colors.surfaceAlt,
                                colors.textPrimary
                              )}
                            >
                              ציוד בהשכרה
                            </span>
                            <span style={{ fontSize: 12, color: muted }}>
                              תוקף: {formatDate(item.rental_expiry)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: muted }}>—</span>
                        )}
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
