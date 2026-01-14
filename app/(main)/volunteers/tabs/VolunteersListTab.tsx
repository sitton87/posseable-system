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
import { DraftEntry } from "@/app/hooks/useDraftManager";
import { Volunteer, VolunteerFilters, VolunteerFormState } from "../types";
import { cssVar } from "@/app/styles/design-system";

type Props = {
  loading: boolean;
  error: string | null;
  volunteers: Volunteer[];
  filters: VolunteerFilters;
  onFilterChange: <K extends keyof VolunteerFilters>(
    key: K,
    value: VolunteerFilters[K]
  ) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (volunteer: Volunteer) => void;
  onDelete: (id: string) => void;
  onView: (volunteer: Volunteer) => void;
  drafts: DraftEntry<VolunteerFormState>[];
  onResumeDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
};

export default function VolunteersListTab({
  loading,
  error,
  volunteers,
  filters,
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
  const getClassificationLabel = (classification: string | undefined) => {
    switch (classification) {
      case "staff":
        return "איש צוות";
      case "management":
        return "הנהלה";
      default:
        return "מתנדב";
    }
  };

  const getClassificationColor = (classification: string | undefined) => {
    switch (classification) {
      case "staff":
        return "blue";
      case "management":
        return "purple";
      default:
        return "slate";
    }
  };

  return (
    <Card className="h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
            רשימת צוות ומתנדבים
          </Title>
          <span className="text-xl font-light" style={{ color: cssVar.border.primary }}>|</span>
          <Text style={{ color: cssVar.text.muted }}>ניהול ועריכת כל המתנדבים במערכת</Text>
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
            <span className="text-sm font-medium whitespace-nowrap">מתנדב חדש</span>
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
            getTitle={(draft) => draft.payload.full_name || "מתנדב ללא שם"}
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
            value={filters.classification || "all"}
            onValueChange={(val) =>
              onFilterChange("classification", val as VolunteerFilters["classification"])
            }
            placeholder="סוג"
          >
            <SelectItem value="all">כל הסוגים</SelectItem>
            <SelectItem value="volunteer">מתנדבים</SelectItem>
            <SelectItem value="staff">צוות</SelectItem>
            <SelectItem value="management">הנהלה</SelectItem>
          </Select>
          <Select
            value={filters.status || "all"}
            onValueChange={(val) =>
              onFilterChange("status", val as VolunteerFilters["status"])
            }
            placeholder="סטטוס"
          >
            <SelectItem value="all">כל המצבים</SelectItem>
            <SelectItem value="active">פעילים</SelectItem>
            <SelectItem value="inactive">לא פעילים</SelectItem>
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
          טוען מתנדבים...
        </div>
      ) : (
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="text-center">ת.ז.</TableHeaderCell>
              <TableHeaderCell className="text-center">שם מלא</TableHeaderCell>
              <TableHeaderCell className="text-center">סוג</TableHeaderCell>
              <TableHeaderCell className="text-center">טלפון</TableHeaderCell>
              <TableHeaderCell className="text-center">אימייל</TableHeaderCell>
              <TableHeaderCell className="text-center">פעיל</TableHeaderCell>
              <TableHeaderCell className="text-center">פעולות</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {volunteers.map((v) => (
              <TableRow key={v.national_id} className="transition-colors hover:bg-ds-bg-secondary">
                <TableCell className="text-center">{v.national_id}</TableCell>
                <TableCell className="text-center font-medium" style={{ color: cssVar.text.primary }}>
                  {v.full_name}
                </TableCell>
                <TableCell className="text-center">
                  <Badge color={getClassificationColor(v.classification)} size="xs">
                    {getClassificationLabel(v.classification)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{formatPhoneNumber(v.phone)}</TableCell>
                <TableCell className="text-center">{v.email || "—"}</TableCell>
                <TableCell className="text-center">
                  <Flex justifyContent="center">
                    {v.active ? (
                      <Icon
                        icon={CheckCircleIcon}
                        color="emerald"
                        variant="simple"
                        tooltip="פעיל"
                      />
                    ) : (
                      <Icon
                        icon={XCircleIcon}
                        color="red"
                        variant="simple"
                        tooltip="לא פעיל"
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
                      onClick={() => onView(v)}
                      tooltip="צפייה"
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                    />
                    <Button
                      size="xs"
                      variant="secondary"
                      color="blue"
                      icon={PencilIcon}
                      onClick={() => onEdit(v)}
                      tooltip="עריכה"
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                    />
                    <Button
                      size="xs"
                      variant="secondary"
                      color="rose"
                      icon={TrashIcon}
                      onClick={() => onDelete(v.national_id)}
                      tooltip="מחיקה"
                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
                    />
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
            {volunteers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10"
                  style={{ color: cssVar.text.muted }}
                >
                  לא נמצאו מתנדבים
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
