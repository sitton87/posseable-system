"use client";

import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Badge,
  Button,
  TextInput,
  Select,
  SelectItem,
  Title,
  Flex,
} from "@tremor/react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { DraftList } from "@/app/components/shared";
import { formatPhoneNumber } from "@/lib/utils/format";
import { Supplier } from "@/type";
import { DraftEntry } from "@/app/hooks/useDraftManager";
import { FormState, SupplierFilters, identifierTypeOptions, supplierTypeOptions } from "../types";
import { cssVar } from "@/app/styles/design-system";

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
    <Card className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
            ניהול ספקים
          </Title>
          <span className="text-xl font-light" style={{ color: cssVar.border.primary }}>|</span>
          {error ? (
            <Text style={{ color: cssVar.status.danger }}>{error}</Text>
          ) : (
            <Text style={{ color: cssVar.text.muted }}>הצג, ערוך והוסף ספקים למערכת</Text>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענון נתונים
          </Button>
          <button
            onClick={onCreate}
            className="h-[38px] flex items-center justify-center gap-2 px-4 rounded-lg transition-all active:scale-95 border-none outline-none"
            style={{
              background: cssVar.brand.primary,
              color: cssVar.text.inverted,
              boxShadow: cssVar.shadow.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cssVar.brand.emphasis;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = cssVar.brand.primary;
            }}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm font-medium whitespace-nowrap">ספק חדש</span>
          </button>
        </div>
      </div>

      {/* Drafts */}
      {drafts.length > 0 && (
        <div className="mb-6">
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
          <TextInput
            icon={MagnifyingGlassIcon}
            placeholder="חיפוש לפי שם, מזהה או טלפון"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
          <Select
            value={filters.status}
            onValueChange={(val) =>
              onFilterChange("status", val as SupplierFilters["status"])
            }
            placeholder="סטטוס"
          >
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="active">פעילים בלבד</SelectItem>
            <SelectItem value="inactive">לא פעילים</SelectItem>
          </Select>
          <Select
            value={filters.type}
            onValueChange={(val) =>
              onFilterChange("type", val as SupplierFilters["type"])
            }
            placeholder="סוג ספק"
          >
            <SelectItem value="all">כל סוגי הספקים</SelectItem>
            {supplierTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        </div>
        <Button
          variant="secondary"
          color="slate"
          onClick={onClearFilters}
          className="whitespace-nowrap h-[38px]"
        >
          ניקוי פילטרים
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10" style={{ color: cssVar.text.muted }}>
          טוען נתונים...
        </div>
      ) : (
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="text-center">מספר ספק</TableHeaderCell>
              <TableHeaderCell className="text-center">שם</TableHeaderCell>
              <TableHeaderCell className="text-center">סוג מזהה</TableHeaderCell>
              <TableHeaderCell className="text-center">סוג ספק</TableHeaderCell>
              <TableHeaderCell className="text-center">איש קשר</TableHeaderCell>
              <TableHeaderCell className="text-center">טלפון</TableHeaderCell>
              <TableHeaderCell className="text-center">אימייל</TableHeaderCell>
              <TableHeaderCell className="text-center">חוזה</TableHeaderCell>
              <TableHeaderCell className="text-center">סטטוס</TableHeaderCell>
              <TableHeaderCell className="text-center">פעולות</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-10"
                  style={{ color: cssVar.text.muted }}
                >
                  אין ספקים להצגה. נסה לשנות את הסינון.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow
                  key={supplier.supplier_identifier}
                  className="transition-colors hover:bg-tremor-background-subtle"
                >
                  <TableCell className="text-center">{supplier.supplier_identifier}</TableCell>
                  <TableCell className="text-center font-medium" style={{ color: cssVar.text.primary }}>
                    {supplier.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {identifierTypeOptions.find(
                      (opt) => opt.value === supplier.identifier_type
                    )?.label || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {supplierTypeOptions.find(
                      (opt) => opt.value === (supplier.supplier_type || "goods")
                    )?.label || "—"}
                  </TableCell>
                  <TableCell className="text-center">{supplier.contact_name || "—"}</TableCell>
                  <TableCell className="text-center">{formatPhoneNumber(supplier.phone)}</TableCell>
                  <TableCell className="text-center">{supplier.email || "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      color={supplier.has_active_contract ? "emerald" : "slate"}
                      size="xs"
                    >
                      {supplier.has_active_contract ? "פעיל" : "אין"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      color={supplier.is_active ? "emerald" : "slate"}
                      size="xs"
                    >
                      {supplier.is_active ? "פעיל" : "לא פעיל"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Flex justifyContent="center" className="gap-2">
                      <Button
                        size="xs"
                        variant="secondary"
                        color="indigo"
                        icon={EyeIcon}
                        onClick={() => onView(supplier)}
                        tooltip="צפייה"
                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                      />
                      <Button
                        size="xs"
                        variant="secondary"
                        color="blue"
                        icon={PencilIcon}
                        onClick={() => onEdit(supplier)}
                        tooltip="עריכה"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                      />
                      <Button
                        size="xs"
                        variant="secondary"
                        color="rose"
                        icon={TrashIcon}
                        onClick={() => onDelete(supplier.supplier_identifier)}
                        tooltip="ביטול"
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
                      />
                    </Flex>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
