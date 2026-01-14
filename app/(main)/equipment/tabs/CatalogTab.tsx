"use client";

import { Fragment, useState } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Select,
  SelectItem,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
} from "@tremor/react";
import { DraftList, FilterToolbar } from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";
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
import {
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

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
    <Card>
      <div className="flex justify-between items-center flex-wrap gap-ds-spacing-2 mb-ds-spacing-5">
        <div>
          <Title>קטלוג הציוד</Title>
          <Text className="mt-1">
            תצוגה ועריכה של כל פריטי הציוד במערכת
          </Text>
          {error && (
            <Text className="mt-1 text-xs" color="rose">
              {error}
            </Text>
          )}
        </div>
        <div className="flex gap-ds-spacing-2 flex-wrap">
          <Button variant="secondary" icon={XMarkIcon} onClick={onClearFilters}>
            ניקוי פילטרים
          </Button>
          <Button variant="secondary" icon={ArrowPathIcon} onClick={onRefresh}>
            רענון נתונים
          </Button>
          {canEdit && <Button icon={PlusIcon} onClick={onCreateItem}>פריט חדש</Button>}
        </div>
      </div>

      {drafts && drafts.length > 0 && (
        <div className="mb-ds-spacing-5">
          <DraftList
            drafts={drafts}
            title={`טיוטות שמורות (${drafts.length})`}
            description="הטיוטות מוצגות רק לך עד לסיום השמירה כמסמך רשמי."
            onResume={onResumeDraft}
            onDelete={onDeleteDraft}
            getTitle={(draft) => draft.payload.name?.trim() || "פריט חדש"}
            getSubtitle={(draft) =>
              `עודכן ${new Date(draft.updatedAt).toLocaleString("he-IL")}`
            }
          />
        </div>
      )}

      <FilterToolbar className="mb-ds-spacing-5">
        <TextInput
          placeholder="חיפוש לפי שם, SKU או יצרן"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        <Select
          value={filters.family || undefined}
          onValueChange={(val) => onFilterChange("family", val || "")}
          placeholder="כל המשפחות"
        >
          {data.families.map((family) => (
            <SelectItem key={family.code} value={family.code}>
              {family.code} · {family.name}
            </SelectItem>
          ))}
        </Select>
        <Select
          value={filters.category || undefined}
          onValueChange={(val) => onFilterChange("category", val || "")}
          placeholder="כל הקטגוריות"
        >
          {availableCategories.map((category) => (
            <SelectItem
              key={`${category.family_code}-${category.code}`}
              value={category.code}
            >
              {category.family_code}/{category.code} · {category.name}
            </SelectItem>
          ))}
        </Select>
        <Select
          value={filters.type || undefined}
          onValueChange={(val) => onFilterChange("type", val || "")}
          placeholder="כל סוגי הציוד"
        >
          <SelectItem value="sea">ציוד ים</SelectItem>
          <SelectItem value="support">ציוד מסייע</SelectItem>
        </Select>
        <Select
          value={filters.condition || undefined}
          onValueChange={(val) => onFilterChange("condition", val || "")}
          placeholder="כל המצבים"
        >
          {CONDITION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
        <Select
          value={filters.status}
          onValueChange={(val) =>
            onFilterChange("status", val as FiltersState["status"])
          }
        >
          <SelectItem value="active">פעילים בלבד</SelectItem>
          <SelectItem value="all">כל הפריטים</SelectItem>
          <SelectItem value="inactive">לא פעילים</SelectItem>
        </Select>
      </FilterToolbar>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>קוד פריט</TableHeaderCell>
            <TableHeaderCell>פריט</TableHeaderCell>
            <TableHeaderCell>משפחה / קטגוריה</TableHeaderCell>
            <TableHeaderCell>סוג ציוד</TableHeaderCell>
            <TableHeaderCell>מצב</TableHeaderCell>
            <TableHeaderCell>הערות</TableHeaderCell>
            <TableHeaderCell>מלאי/מחסן</TableHeaderCell>
            <TableHeaderCell>פעולות</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8}>
                <Text className="text-center py-4" style={{ color: cssVar.text.muted }}>
                  טוען נתונים...
                </Text>
              </TableCell>
            </TableRow>
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
                  <TableRow>
                    <TableCell className="font-semibold">
                      {item.internal_sku || "—"}
                    </TableCell>
                    <TableCell className="font-semibold">{item.name}</TableCell>
                    <TableCell>
                      <div>{item.family_name || item.family_code}</div>
                      <Text className="text-xs">
                        {item.category_name || item.category_code}
                      </Text>
                    </TableCell>
                    <TableCell>{typeLabel}</TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        style={{
                          background: conditionBadgeMap[item.condition]?.background || cssVar.border.secondary,
                          color: conditionBadgeMap[item.condition]?.color || cssVar.text.primary,
                        }}
                      >
                        {getConditionLabel(item.condition)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {item.ownership_type === "consignment" && (
                          <span>פריט בקונסיגנציה</span>
                        )}
                        {item.is_consumable && <span>פריט מתכלה</span>}
                        {item.is_rental && (
                          <span>
                            <div>פריט בהשכרה</div>
                            {item.rental_expiry && (
                              <Text className="text-xs">
                                תוקף: {formatDate(item.rental_expiry)}
                              </Text>
                            )}
                          </span>
                        )}
                        {!item.is_consumable &&
                          !item.is_rental &&
                          item.ownership_type !== "consignment" &&
                          !item.notes && (
                            <Text>—</Text>
                          )}
                        {item.notes && (
                          <Text className="text-xs">
                            {item.notes.length > 120
                              ? `${item.notes.slice(0, 117)}...`
                              : item.notes}
                          </Text>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => toggleStockCard(item.id)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "סגור כרטיס" : "הצג מלאי/מחסן"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={EyeIcon}
                          onClick={() => onViewItem(item)}
                        />
                        {canEdit && (
                          <>
                            <Button
                              variant="secondary"
                              size="xs"
                              icon={PencilIcon}
                              onClick={() => onEditItem(item)}
                            />
                            <Button
                              variant="secondary"
                              size="xs"
                              color="rose"
                              icon={TrashIcon}
                              onClick={() => onDeleteItem(item.id)}
                            />
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Card className="mt-2 p-4">
                          <Table className="max-w-md mx-auto mb-4">
                            <TableHead>
                              <TableRow>
                                <TableHeaderCell className="text-center">שם המחסן</TableHeaderCell>
                                <TableHeaderCell className="text-center">כמות</TableHeaderCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {warehouses.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={2} className="text-center">
                                    <Text>אין נתוני מלאי זמינים</Text>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                warehouses.map((stock) => (
                                  <TableRow key={stock.warehouse_id}>
                                    <TableCell className="text-center">
                                      {stock.warehouse_name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {formatNumber(stock.quantity, "0")}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                          <div className="flex flex-col items-center gap-1 font-semibold">
                            <Text>
                              סה״כ מלאי: {formatNumber(item.total_units, "0")}
                            </Text>
                            {!item.is_sku_tracked &&
                              typeof item.min_stock === "number" &&
                              !Number.isNaN(item.min_stock) && (
                                <Text className="text-sm">
                                  מלאי מינימום: {formatNumber(item.min_stock)}
                                </Text>
                              )}
                          </div>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })
          )}
          {!loading && data.items.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <Text>אין פריטים תואמים לסינון שנבחר.</Text>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
