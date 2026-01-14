"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogPanel,
  Title,
  Text,
  Badge,
  Divider,
  Grid,
  Flex,
  Icon,
} from "@tremor/react";
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { formatPhoneNumber } from "@/lib/utils/format";
import { Volunteer, VolunteerDetail } from "../types";
import { cssVar } from "@/app/styles/design-system";

type Props = {
  volunteer: Volunteer | null;
  detail: VolunteerDetail | null;
  loading: boolean;
  onClose: () => void;
};

export default function VolunteerViewModal({
  volunteer,
  detail,
  loading,
  onClose,
}: Props) {
  if (!volunteer) return null;

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

  const getClassificationColor = (classification: string | undefined): "blue" | "purple" | "slate" => {
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
    <Dialog open={!!volunteer} onClose={onClose} static={true} className="z-[100]">
      <DialogPanel
        className="max-w-3xl w-full p-0 overflow-hidden rounded-ds-modal-radius"
        style={{
          background: cssVar.modal.bg,
          boxShadow: cssVar.modal.shadow,
          border: `1px solid ${cssVar.border.primary}`,
        }}
        dir="rtl"
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4"
          style={{
            borderBottom: `1px solid ${cssVar.border.primary}`,
            background: cssVar.bg.secondary,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: cssVar.brand.muted }}
            >
              <UserIcon className="w-5 h-5" style={{ color: cssVar.brand.primary }} />
            </div>
            <div>
              <Title style={{ color: cssVar.text.primary }} className="text-xl">
                {volunteer.full_name}
              </Title>
              <Text style={{ color: cssVar.text.muted }} className="text-sm">
                ת.ז: {volunteer.national_id}
              </Text>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: cssVar.text.muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cssVar.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="p-6 max-h-[75vh] overflow-y-auto space-y-6"
          style={{ background: cssVar.modal.bg }}
        >
          {/* Personal Info */}
          <InfoSection title="פרטים אישיים" icon={UserIcon}>
            <Grid numItems={2} numItemsSm={3} className="gap-4">
              <InfoItem label="טלפון" value={formatPhoneNumber(volunteer.phone)} icon={PhoneIcon} />
              <InfoItem label="אימייל" value={volunteer.email} icon={EnvelopeIcon} />
              <InfoItem label="תאריך הצטרפות" value={
                volunteer.created_at 
                  ? new Date(volunteer.created_at).toLocaleDateString("he-IL") 
                  : null
              } icon={CalendarIcon} />
            </Grid>
          </InfoSection>

          {/* Classification */}
          <InfoSection title="סיווג ופעילות" icon={ClipboardDocumentListIcon}>
            <Grid numItems={2} numItemsSm={3} className="gap-4">
              <div>
                <Text className="text-xs mb-1 block" style={{ color: cssVar.text.muted }}>
                  סוג
                </Text>
                <Badge color={getClassificationColor(volunteer.classification)} size="sm">
                  {getClassificationLabel(volunteer.classification)}
                </Badge>
              </div>
              <InfoItem label="סה״כ פעילויות" value={volunteer.total_activities?.toString()} />
              <InfoItem label="סוג מתנדב" value={volunteer.volunteer_type} />
            </Grid>
          </InfoSection>

          {/* Active Status */}
          <InfoSection title="מצב פעילות" icon={BriefcaseIcon}>
            <Flex className="gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Icon 
                  icon={volunteer.active ? CheckCircleIcon : XCircleIcon} 
                  color={volunteer.active ? "emerald" : "red"} 
                  size="sm"
                />
                <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                  סטטוס: {volunteer.active ? "פעיל" : "לא פעיל"}
                </Text>
              </div>
            </Flex>
          </InfoSection>

          {/* Activities */}
          <InfoSection title={`פעילויות (${detail?.activities?.length || 0})`} icon={CalendarIcon} iconColor="info">
            {loading ? (
              <div className="text-center py-4">
                <Text style={{ color: cssVar.text.muted }}>טוען פעילויות...</Text>
              </div>
            ) : detail?.activities?.length ? (
              <div className="space-y-2">
                {detail.activities.map((a) => (
                  <div
                    key={`${a.activity_id}-${a.activity_date}`}
                    className="flex justify-between items-center p-3 rounded-lg transition-colors"
                    style={{
                      background: cssVar.bg.secondary,
                      border: `1px solid ${cssVar.border.primary}`,
                    }}
                  >
                    <div>
                      <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                        {a.kind || "פעילות"}
                      </Text>
                      <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                        גולש: {a.surfer_name || "—"}
                      </Text>
                    </div>
                    <Badge color="slate" size="xs">
                      {a.activity_date
                        ? new Date(a.activity_date).toLocaleDateString("he-IL")
                        : "—"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-4 rounded-lg"
                style={{ background: cssVar.bg.secondary }}
              >
                <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                  אין פעילויות קודמות.
                </Text>
              </div>
            )}
          </InfoSection>

          {/* Supported Surfers */}
          <InfoSection title={`גולשים שסייע (${detail?.supportedSurfers?.length || 0})`} icon={UserGroupIcon} iconColor="success">
            {loading ? (
              <div className="text-center py-4">
                <Text style={{ color: cssVar.text.muted }}>טוען שיוכים...</Text>
              </div>
            ) : detail?.supportedSurfers?.length ? (
              <div className="space-y-2">
                {detail.supportedSurfers.map((s) => (
                  <div
                    key={s.national_id}
                    className="flex justify-between items-center p-3 rounded-lg transition-colors"
                    style={{
                      background: cssVar.bg.secondary,
                      border: `1px solid ${cssVar.border.primary}`,
                    }}
                  >
                    <div>
                      <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                        {s.full_name}
                      </Text>
                      <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                        {s.program || "—"} · {s.group_name || "ללא קבוצה"}
                      </Text>
                    </div>
                    <Badge 
                      color={s.status === "מאושר" ? "emerald" : s.status === "בהמתנה" ? "amber" : "slate"} 
                      size="xs"
                    >
                      {s.status || "—"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-4 rounded-lg"
                style={{ background: cssVar.bg.secondary }}
              >
                <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                  אין שיוכי צוות לגולשים.
                </Text>
              </div>
            )}
          </InfoSection>

          {/* Notes */}
          {volunteer.notes && (
            <InfoSection title="הערות">
              <div
                className="rounded-lg p-3"
                style={{
                  background: cssVar.bg.secondary,
                  border: `1px solid ${cssVar.border.primary}`,
                }}
              >
                <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                  {volunteer.notes}
                </Text>
              </div>
            </InfoSection>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end px-6 py-4"
          style={{
            background: cssVar.bg.secondary,
            borderTop: `1px solid ${cssVar.border.primary}`,
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: cssVar.bg.tertiary,
              color: cssVar.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cssVar.border.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = cssVar.bg.tertiary;
            }}
          >
            סגור
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

function InfoSection({
  title,
  icon: IconComponent,
  iconColor = "brand",
  children,
}: {
  title: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: "brand" | "warning" | "danger" | "info" | "success";
  children: ReactNode;
}) {
  const colorMap = {
    brand: cssVar.brand.primary,
    warning: cssVar.status.warning,
    danger: cssVar.status.danger,
    info: cssVar.status.info,
    success: cssVar.status.success,
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {IconComponent && (
          <IconComponent className="w-4 h-4" style={{ color: colorMap[iconColor] }} />
        )}
        <Text
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: cssVar.text.secondary }}
        >
          {title}
        </Text>
      </div>
      <Divider className="my-2" />
      <div className="mt-3">{children}</div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: IconComponent,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div>
      <Text className="text-xs mb-1 block" style={{ color: cssVar.text.muted }}>
        {label}
      </Text>
      <div className="flex items-center gap-1.5 justify-start">
        {IconComponent && (
          <IconComponent className="w-3.5 h-3.5" style={{ color: cssVar.text.subtle }} />
        )}
        <Text className="font-medium" style={{ color: cssVar.text.primary }}>
          {value || "—"}
        </Text>
      </div>
    </div>
  );
}
