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
  Col,
  Flex,
  Icon,
} from "@tremor/react";
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { Surfer } from "@/type";
import { formatPhoneNumber } from "@/lib/utils/format";
import { SurferDetail } from "../types";
import { calcAge } from "../utils";
import { cssVar, tw } from "@/app/styles/design-system";

type Props = {
  surfer: Surfer | null;
  detail: SurferDetail | null;
  loading: boolean;
  onClose: () => void;
};

export default function SurferViewModal({
  surfer,
  detail,
  loading,
  onClose,
}: Props) {
  if (!surfer) return null;
  const derivedAge = calcAge(surfer.date_of_birth) ?? surfer.age ?? null;

  return (
    <Dialog open={!!surfer} onClose={onClose} static={true} className="z-[100]">
      <DialogPanel
        className="max-w-3xl w-full p-0 overflow-hidden rounded-ds-modal-radius"
        style={{
          background: cssVar.bg.primary,
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
                {surfer.full_name}
              </Title>
              <Text style={{ color: cssVar.text.muted }} className="text-sm">
                ת.ז: {surfer.national_id}
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
          style={{ background: cssVar.bg.primary }}
        >
          {/* Personal Info */}
          <InfoSection title="פרטים אישיים" icon={UserIcon}>
            <Grid numItems={2} numItemsSm={3} className="gap-4">
              <InfoItem label="טלפון" value={formatPhoneNumber(surfer.phone)} icon={PhoneIcon} />
              <InfoItem label="אימייל" value={surfer.email} icon={EnvelopeIcon} />
              <InfoItem label="מגורים" value={surfer.residence} icon={MapPinIcon} />
              <InfoItem 
                label="גיל" 
                value={derivedAge !== null ? `${derivedAge} שנים` : null} 
                icon={CalendarIcon} 
              />
              <InfoItem label="מגדר" value={surfer.gender} />
            </Grid>
          </InfoSection>

          {/* Status & Program */}
          <InfoSection title="שיוך וסטטוס" icon={ClipboardDocumentListIcon}>
            <Grid numItems={2} numItemsSm={4} className="gap-4">
              <div>
                <Text className="text-xs mb-1 block" style={{ color: cssVar.text.muted }}>
                  תוכנית
                </Text>
                {surfer.program ? (
                  <Badge color="blue" size="sm">{surfer.program}</Badge>
                ) : (
                  <Text style={{ color: cssVar.text.subtle }}>—</Text>
                )}
              </div>
              <div>
                <Text className="text-xs mb-1 block" style={{ color: cssVar.text.muted }}>
                  סטטוס
                </Text>
                <Badge 
                  color={surfer.status === "מאושר" ? "emerald" : surfer.status === "בהמתנה" ? "amber" : "slate"} 
                  size="sm"
                >
                  {surfer.status || "—"}
                </Badge>
              </div>
              <div>
                <Text className="text-xs mb-1 block" style={{ color: cssVar.text.muted }}>
                  קבוצה
                </Text>
                {surfer.group_name ? (
                  <Badge color="indigo" size="sm">{surfer.group_name}</Badge>
                ) : (
                  <Text style={{ color: cssVar.text.subtle }}>לא שויכה</Text>
                )}
              </div>
              <InfoItem label="מתנדבים נדרשים" value={surfer.volunteers_needed?.toString()} />
            </Grid>
          </InfoSection>

          {/* Medical Info */}
          <InfoSection title="מצב רפואי" icon={ExclamationTriangleIcon} iconColor="warning">
            <div className="space-y-4">
              <Flex className="gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Icon 
                    icon={surfer.medical_approval ? CheckCircleIcon : XCircleIcon} 
                    color={surfer.medical_approval ? "emerald" : "red"} 
                    size="sm"
                  />
                  <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                    אישור רפואי: {surfer.medical_approval ? "קיים" : "חסר"}
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                    כיסא גלגלים: {surfer.needs_wheelchair ? "♿ כן" : "לא"}
                  </Text>
                </div>
              </Flex>
              {surfer.medical_condition && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: cssVar.status.warningLight,
                    border: `1px solid ${cssVar.status.warning}`,
                  }}
                >
                  <Text className="text-sm" style={{ color: cssVar.status.warning }}>
                    {surfer.medical_condition}
                  </Text>
                </div>
              )}
            </div>
          </InfoSection>

          {/* Emergency Contact */}
          <InfoSection title="איש קשר לחירום" icon={PhoneIcon} iconColor="danger">
            <Grid numItems={2} className="gap-4">
              <InfoItem label="שם" value={surfer.emergency_contact_name} />
              <InfoItem label="טלפון" value={formatPhoneNumber(surfer.emergency_contact_phone)} icon={PhoneIcon} />
            </Grid>
          </InfoSection>

          {/* Special Requirements */}
          {surfer.special_requirements && (
            <InfoSection title="דרישות מיוחדות">
              <div
                className="rounded-lg p-3"
                style={{
                  background: cssVar.bg.secondary,
                  border: `1px solid ${cssVar.border.primary}`,
                }}
              >
                <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                  {surfer.special_requirements}
                </Text>
              </div>
            </InfoSection>
          )}

          {/* Notes */}
          {surfer.notes && (
            <InfoSection title="הערות">
              <div
                className="rounded-lg p-3"
                style={{
                  background: cssVar.bg.secondary,
                  border: `1px solid ${cssVar.border.primary}`,
                }}
              >
                <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                  {surfer.notes}
                </Text>
              </div>
            </InfoSection>
          )}

          {/* Volunteer Activities */}
          <InfoSection title="מתנדבים לפי פעילות" icon={UserGroupIcon} iconColor="info">
            {loading ? (
              <div className="text-center py-4">
                <Text style={{ color: cssVar.text.muted }}>טוען מתנדבים...</Text>
              </div>
            ) : detail?.volunteerActivities?.length ? (
              <div className="space-y-2">
                {detail.volunteerActivities.map((row) => (
                  <div
                    key={`${row.activity_id}-${row.volunteer_national_id}-${row.activity_date}`}
                    className="flex justify-between items-center p-3 rounded-lg transition-colors"
                    style={{
                      background: cssVar.bg.secondary,
                      border: `1px solid ${cssVar.border.primary}`,
                    }}
                  >
                    <div>
                      <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                        {row.volunteer_name || row.volunteer_national_id}
                      </Text>
                      <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                        פעילות #{row.activity_id} · {row.kind || "—"}
                      </Text>
                    </div>
                    <Badge color="slate" size="xs">
                      {row.activity_date
                        ? new Date(row.activity_date).toLocaleDateString("he-IL")
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
                  אין מתנדבים משויכים לפעילויות של הגולש.
                </Text>
              </div>
            )}
          </InfoSection>
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
