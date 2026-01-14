"use client";

import { Fragment, useState } from "react";
import {
  Card,
  Title,
  Text,
  TextInput,
  Select,
  SelectItem,
  Button,
  Badge,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import type { EquipmentCategory, EquipmentFamily, EquipmentItem } from "@/type";
import type { FiltersState } from "../types";
import {
  CONDITION_OPTIONS,
  EQUIPMENT_TYPE_LABELS,
  conditionBadgeMap,
  getConditionLabel,
} from "../constants";
import { formatDate, formatNumber } from "../utils";

type EquipmentCatalogCardProps = {
  loading: boolean;
  filters: FiltersState;
  families: EquipmentFamily[];
  availableCategories: EquipmentCategory[];
  items: EquipmentItem[];
  onFilterChange: <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K]
  ) => void;
  onView: (item: EquipmentItem) => void;
  onEdit: (item: EquipmentItem) => void;
  onDelete: (id: string) => void;
  onClearFilters: () => void;
};

export function EquipmentCatalogCard({
  loading,
  filters,
  families,
  availableCategories,
  items,
  onFilterChange,
  onView,
  onEdit,
  onDelete,
  onClearFilters,
}: EquipmentCatalogCardProps) {
  const [expandedStockItem, setExpandedStockItem] = useState<string | null>(
    null
  );

  const toggleStockCard = (itemId: string) => {
    setExpandedStockItem((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
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
          {families.map((family) => (
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
          {CONDITION_OPTIONS.map(
            (option: (typeof CONDITION_OPTIONS)[number]) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            )
          )}
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
      </div>
      <div className="flex justify-end mb-5">
        <Button variant="secondary" onClick={onClearFilters}>
          ניקוי פילטרים
        </Button>
      </div>

      <div className="overflow-x-auto">
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
                  <Text style={{ color: cssVar.text.muted }}>טוען נתונים...</Text>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const warehouses = item.warehouse_stock || [];
                const typeLabel =
                  EQUIPMENT_TYPE_LABELS[item.equipment_type] ||
                  item.equipment_type ||
                  "—";
                const isExpanded = expandedStockItem === item.id;
                return (
                  <Fragment key={item.id}>
                    <TableRow>
                      <TableCell>
                        <Text className="font-semibold">
                          {item.internal_sku || "—"}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text className="font-semibold">{item.name}</Text>
                      </TableCell>
                      <TableCell>
                        <Text>{item.family_name || item.family_code}</Text>
                        <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                          {item.category_name || item.category_code}
                        </Text>
                      </TableCell>
                      <TableCell>{typeLabel}</TableCell>
                      <TableCell>
                        <Badge
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
                            <Text>פריט בקונסיגנציה</Text>
                          )}
                          {item.is_consumable && <Text>פריט מתכלה</Text>}
                          {item.is_rental && (
                            <div>
                              <Text>פריט בהשכרה</Text>
                              {item.rental_expiry && (
                                <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                                  תוקף: {formatDate(item.rental_expiry)}
                                </Text>
                              )}
                            </div>
                          )}
                          {!item.is_consumable &&
                            !item.is_rental &&
                            item.ownership_type !== "consignment" &&
                            !item.notes && (
                              <Text style={{ color: cssVar.text.muted }}>—</Text>
                            )}
                          {item.notes && (
                            <Text style={{ color: cssVar.text.muted }}>
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
                            onClick={() => onView(item)}
                          >
                            👁️
                          </Button>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => onEdit(item)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="secondary"
                            size="xs"
                            color="red"
                            onClick={() => onDelete(item.id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Card className="mt-2 text-center">
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
                                      <Text style={{ color: cssVar.text.muted }}>
                                        אין נתוני מלאי זמינים
                                      </Text>
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
                                  <Text className="text-sm" style={{ color: cssVar.text.muted }}>
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
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Text style={{ color: cssVar.text.muted }}>
                    אין פריטים תואמים לסינון שנבחר.
                  </Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
