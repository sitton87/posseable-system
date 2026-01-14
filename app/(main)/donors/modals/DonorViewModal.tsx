"use client";

import {
  Card,
  Title,
  Text,
  Badge,
  Button,
  Flex,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { formatPhoneNumber } from "@/lib/utils/format";
import type { Donor } from "@/type";
import { DonationRecord } from "../types";
import { formatCurrency, formatDate } from "../utils";

type DonorViewModalProps = {
  donor: Donor | null;
  onClose: () => void;
  donationHistory: DonationRecord[];
  historyLoading: boolean;
};

export default function DonorViewModal({
  donor,
  onClose,
  donationHistory,
  historyLoading,
}: DonorViewModalProps) {
  if (!donor) return null;

  return (
    <Dialog open={Boolean(donor)} onClose={onClose}>
      <DialogPanel className="max-w-2xl">
        {/* Header */}
        <Flex justifyContent="between" alignItems="start" className="mb-6">
          <div>
            <Title>{donor.full_name}</Title>
            <Text style={{ color: cssVar.text.muted }}>
              תעודת זהות: {donor.national_id}
            </Text>
          </div>
          <Button variant="secondary" onClick={onClose}>
            ✕ סגור
          </Button>
        </Flex>

        {/* פרטים כלליים */}
        <Card className="mb-4">
          <Text className="font-semibold mb-3" style={{ color: cssVar.text.primary }}>
            פרטים כלליים
          </Text>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>ארגון</Text>
              <Text style={{ color: cssVar.text.primary }}>{donor.organization || "—"}</Text>
            </div>
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>סטטוס</Text>
              <Badge color={donor.is_active ? "emerald" : "slate"} size="sm">
                {donor.is_active ? "פעיל" : "לא פעיל"}
              </Badge>
            </div>
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>טלפון</Text>
              <Text style={{ color: cssVar.text.primary }}>{formatPhoneNumber(donor.phone)}</Text>
            </div>
            <div>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>אימייל</Text>
              <Text style={{ color: cssVar.text.primary }}>{donor.email || "—"}</Text>
            </div>
          </div>
        </Card>

        {/* הערות */}
        <Card className="mb-4">
          <Text className="font-semibold mb-3" style={{ color: cssVar.text.primary }}>
            הערות
          </Text>
          <Text className="whitespace-pre-wrap" style={{ color: cssVar.text.secondary }}>
            {donor.notes || "—"}
          </Text>
        </Card>

        {/* היסטוריית תרומות */}
        <Card>
          <Text className="font-semibold mb-3" style={{ color: cssVar.text.primary }}>
            היסטוריית תרומות
          </Text>
          {historyLoading ? (
            <div className="text-center py-4" style={{ color: cssVar.text.muted }}>
              טוען היסטוריה...
            </div>
          ) : donationHistory.length === 0 ? (
            <div className="text-center py-4" style={{ color: cssVar.text.muted }}>
              לא נמצאו תרומות קודמות.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>תאריך</TableHeaderCell>
                    <TableHeaderCell>תיאור</TableHeaderCell>
                    <TableHeaderCell>סכום</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donationHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.transaction_date)}</TableCell>
                      <TableCell>{record.description || "—"}</TableCell>
                      <TableCell>{formatCurrency(record.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </DialogPanel>
    </Dialog>
  );
}
