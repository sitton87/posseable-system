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
import { DonorListTabProps, DonorFilters } from "../types";
import { formatCurrency, formatDate } from "../utils";
import { cssVar } from "@/app/styles/design-system";

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
  return (
    <Card className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
            רשימת תורמים
          </Title>
          <span className="text-xl font-light" style={{ color: cssVar.border.primary }}>|</span>
          <Text style={{ color: cssVar.text.muted }}>ניהול ועריכת כל התורמים במערכת</Text>
          {error && (
            <Text className="text-sm" style={{ color: cssVar.status.danger }}>
              {error}
            </Text>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענון רשימה
          </Button>
          <button
            onClick={onAdd}
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
            <span className="text-sm font-medium whitespace-nowrap">תורם חדש</span>
          </button>
        </div>
      </div>

      {/* Drafts */}
      {drafts.length > 0 && (
        <div className="mb-6">
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
          <TextInput
            icon={MagnifyingGlassIcon}
            placeholder="חיפוש לפי שם, ת.ז, ארגון או אימייל"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
          <Select
            value={filters.status}
            onValueChange={(val) =>
              onFilterChange("status", val as DonorFilters["status"])
            }
            placeholder="סטטוס"
          >
            <SelectItem value="all">כל התורמים</SelectItem>
            <SelectItem value="active">תורמים פעילים</SelectItem>
            <SelectItem value="inactive">תורמים לא פעילים</SelectItem>
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
              <TableHeaderCell className="text-center">ת.ז</TableHeaderCell>
              <TableHeaderCell className="text-center">שם</TableHeaderCell>
              <TableHeaderCell className="text-center">ארגון</TableHeaderCell>
              <TableHeaderCell className="text-center">טלפון</TableHeaderCell>
              <TableHeaderCell className="text-center">סה״כ תרומות</TableHeaderCell>
              <TableHeaderCell className="text-center">כמות תרומות</TableHeaderCell>
              <TableHeaderCell className="text-center">תרומה אחרונה</TableHeaderCell>
              <TableHeaderCell className="text-center">סטטוס</TableHeaderCell>
              <TableHeaderCell className="text-center">פעולות</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donors.map((donor) => (
              <TableRow key={donor.national_id} className="transition-colors hover:bg-tremor-background-subtle">
                <TableCell className="text-center">{donor.national_id}</TableCell>
                <TableCell className="text-center font-medium" style={{ color: cssVar.text.primary }}>
                  {donor.full_name}
                </TableCell>
                <TableCell className="text-center">{donor.organization || "—"}</TableCell>
                <TableCell className="text-center">{formatPhoneNumber(donor.phone)}</TableCell>
                <TableCell className="text-center">{formatCurrency(donor.total_donations)}</TableCell>
                <TableCell className="text-center">{donor.donation_count || 0}</TableCell>
                <TableCell className="text-center">{formatDate(donor.last_donation_date)}</TableCell>
                <TableCell className="text-center">
                  <Badge color={donor.is_active ? "emerald" : "slate"} size="xs">
                    {donor.is_active ? "פעיל" : "לא פעיל"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Flex justifyContent="center" className="gap-2">
                    <Button
                      size="xs"
                      variant="secondary"
                      color="indigo"
                      icon={EyeIcon}
                      onClick={() => onView(donor)}
                      tooltip="צפייה"
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                    />
                    <Button
                      size="xs"
                      variant="secondary"
                      color="blue"
                      icon={PencilIcon}
                      onClick={() => onEdit(donor)}
                      tooltip="עריכה"
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                    />
                    <Button
                      size="xs"
                      variant="secondary"
                      color="rose"
                      icon={TrashIcon}
                      onClick={() => onDelete(donor.national_id)}
                      tooltip="מחיקה"
                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
                    />
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
            {donors.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-10"
                  style={{ color: cssVar.text.muted }}
                >
                  אין תורמים להצגה. לחץ על "תורם חדש" כדי להתחיל.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
