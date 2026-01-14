"use client";

import {
  Title,
  Text,
  TextInput,
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
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { cssVar } from "@/app/styles/design-system";
import { formatPhoneNumber } from "@/lib/utils/format";
import { Donor } from "@/type";

type DonorSelectionModalProps = {
  open: boolean;
  onClose: () => void;
  donors: Donor[];
  search: string;
  setSearch: (value: string) => void;
  onSelect: (donor: Donor) => void;
  selectedDonorIds: string[];
};

export default function DonorSelectionModal({
  open,
  onClose,
  donors,
  search,
  setSearch,
  onSelect,
  selectedDonorIds,
}: DonorSelectionModalProps) {
  const filteredDonors = donors.filter((donor) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      donor.full_name.toLowerCase().includes(term) ||
      donor.national_id.includes(term)
    );
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-2xl">
        {/* Header */}
        <Flex justifyContent="between" alignItems="center" className="mb-6 flex-wrap gap-4">
          <Title>בחר תורם</Title>
          <Button variant="secondary" onClick={onClose}>
            ✕ סגור
          </Button>
        </Flex>

        {/* Search */}
        <div className="mb-4">
          <TextInput
            icon={MagnifyingGlassIcon}
            placeholder="חפש לפי שם או ת.ז"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="text-center">שם</TableHeaderCell>
              <TableHeaderCell className="text-center">טלפון</TableHeaderCell>
              <TableHeaderCell className="text-center">אימייל</TableHeaderCell>
              <TableHeaderCell className="text-center">פעולה</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDonors.map((donor) => {
              const alreadySelected = selectedDonorIds.includes(donor.national_id);
              return (
                <TableRow
                  key={donor.national_id}
                  className="transition-colors hover:bg-tremor-background-subtle"
                >
                  <TableCell>
                    <div className="font-semibold" style={{ color: cssVar.text.primary }}>
                      {donor.full_name}
                    </div>
                    <div className="text-xs font-mono" style={{ color: cssVar.text.muted }}>
                      {donor.national_id}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatPhoneNumber(donor.phone)}
                  </TableCell>
                  <TableCell className="text-center">
                    {donor.email || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => onSelect(donor)}
                      disabled={alreadySelected}
                    >
                      {alreadySelected ? "נבחר" : "בחר"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDonors.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10"
                  style={{ color: cssVar.text.muted }}
                >
                  {search
                    ? "לא נמצאו תורמים תואמים לחיפוש."
                    : "אין תורמים פעילים להצגה."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogPanel>
    </Dialog>
  );
}
