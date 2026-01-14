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
  Icon,
} from "@tremor/react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { DraftList } from "@/app/components/shared";
import { formatPhoneNumber } from "@/lib/utils/format";
import { Surfer, PROGRAM_OPTIONS } from "@/type";
import { DraftEntry } from "@/app/hooks/useDraftManager";
import { SurferFilters, SurferFormState } from "../types";
import { cssVar, tw } from "@/app/styles/design-system";

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
  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case "מאושר":
        return "emerald";
      case "בהמתנה":
        return "amber";
      default:
        return "slate";
    }
  };

  return (
    <Card className="h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
            רשימת גולשים
          </Title>
          <span className="text-xl font-light" style={{ color: cssVar.border.primary }}>|</span>
          <Text style={{ color: cssVar.text.muted }}>ניהול ועריכת כל הגולשים במערכת</Text>
          {error && (
            <Text className="text-sm" style={{ color: cssVar.status.danger }}>
              {error}
            </Text>
          )}
        </div>
        <div>
          <button
            onClick={onAdd}
            className="h-[38px] flex items-center justify-center gap-2 px-4 rounded-lg transition-all active:scale-95 border-none outline-none"
            style={{
              background: cssVar.brand.primary,
              color: cssVar.text.inverted,
              boxShadow: cssVar.shadow.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cssVar.brand.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = cssVar.brand.primary;
            }}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm font-medium whitespace-nowrap">גולש חדש</span>
          </button>
        </div>
      </div>

      {drafts.length > 0 && (
        <div className="mb-6">
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
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
          <TextInput
            icon={MagnifyingGlassIcon}
            placeholder="חיפוש לפי שם, ת.ז..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
          <Select
            value={filters.status}
            onValueChange={(val) =>
              onFilterChange("status", val as SurferFilters["status"])
            }
            placeholder="סטטוס"
          >
            <SelectItem value="all">כל המצבים</SelectItem>
            <SelectItem value="active">פעילים</SelectItem>
            <SelectItem value="inactive">לא פעילים</SelectItem>
            <SelectItem value="approved">מאושרים</SelectItem>
            <SelectItem value="pending">ממתינים</SelectItem>
          </Select>
          <Select
            value={filters.program}
            onValueChange={(val) => onFilterChange("program", val)}
            placeholder="תוכנית"
          >
            <SelectItem value="">כל התוכניות</SelectItem>
            {PROGRAM_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
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

      {loading ? (
        <div className="text-center py-10" style={{ color: cssVar.text.muted }}>
          טוען גולשים...
        </div>
      ) : (
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="text-center">ת.ז.</TableHeaderCell>
              <TableHeaderCell className="text-center">שם מלא</TableHeaderCell>
              <TableHeaderCell className="text-center">תוכנית</TableHeaderCell>
              <TableHeaderCell className="text-center">קבוצה</TableHeaderCell>
              <TableHeaderCell className="text-center">סטטוס</TableHeaderCell>
              <TableHeaderCell className="text-center">טלפון</TableHeaderCell>
              <TableHeaderCell className="text-center">אישור רפואי</TableHeaderCell>
              <TableHeaderCell className="text-center">פעולות</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {surfers.map((s) => (
              <TableRow key={s.national_id} className="transition-colors hover:bg-ds-bg-secondary">
                <TableCell className="text-center">{s.national_id}</TableCell>
                <TableCell className="text-center font-medium" style={{ color: cssVar.text.primary }}>
                  <Flex justifyContent="center" className="gap-2">
                    {s.full_name}
                    {s.needs_wheelchair && (
                      <span title="זקוק לכיסא גלגלים">♿</span>
                    )}
                  </Flex>
                </TableCell>
                <TableCell className="text-center">{s.program || "—"}</TableCell>
                <TableCell className="text-center">{s.group_name || "לא שויכה"}</TableCell>
                <TableCell className="text-center">
                  <Badge color={getStatusColor(s.status)} size="xs">
                    {s.status || "—"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{formatPhoneNumber(s.phone ?? undefined)}</TableCell>
                <TableCell className="text-center">
                  <Flex justifyContent="center">
                    {s.medical_approval ? (
                      <Icon
                        icon={CheckCircleIcon}
                        color="emerald"
                        variant="simple"
                        tooltip="יש אישור רפואי"
                      />
                    ) : (
                      <Icon
                        icon={XCircleIcon}
                        color="red"
                        variant="simple"
                        tooltip="חסר אישור רפואי"
                      />
                    )}
                  </Flex>
                </TableCell>
                <TableCell>
                  <Flex justifyContent="center" className="gap-2">
                    <Button
                      size="xs"
                      variant="secondary"
                      color="indigo"
                      icon={EyeIcon}
                      onClick={() => onView(s)}
                      tooltip="צפייה"
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                    />
                    <Button
                      size="xs"
                      variant="secondary"
                      color="blue"
                      icon={PencilIcon}
                      onClick={() => onEdit(s)}
                      tooltip="עריכה"
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                    />
                    <Button
                      size="xs"
                      variant="secondary"
                      color="rose"
                      icon={TrashIcon}
                      onClick={() => onDelete(s.national_id)}
                      tooltip="מחיקה"
                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
                    />
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
            {surfers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-10"
                  style={{ color: cssVar.text.muted }}
                >
                  לא נמצאו גולשים
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
