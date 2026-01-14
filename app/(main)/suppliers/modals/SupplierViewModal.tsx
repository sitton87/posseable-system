"use client";

import {
  Card,
  Title,
  Text,
  Button,
  Flex,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { formatPhoneNumber } from "@/lib/utils/format";
import { Supplier } from "@/type";
import { supplierTypeOptions } from "../types";

type Props = {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
};

export default function SupplierViewModal({
  open,
  supplier,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-xl">
        {supplier && (
          <>
            {/* Header */}
            <Flex justifyContent="between" alignItems="start" className="mb-6">
              <Title>{supplier.name}</Title>
              <Button variant="secondary" onClick={onClose}>
                ✕ סגור
              </Button>
            </Flex>

            {/* מספר ספק */}
            <Card className="mb-4">
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>מספר ספק</Text>
              <Text className="font-mono" style={{ color: cssVar.text.primary }}>
                {supplier.supplier_identifier}
              </Text>
            </Card>

            {/* סוג ספק */}
            <Card className="mb-4">
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>סוג ספק</Text>
              <Text style={{ color: cssVar.text.primary }}>
                {supplierTypeOptions.find(
                  (opt) => opt.value === (supplier.supplier_type || "goods")
                )?.label || "—"}
              </Text>
            </Card>

            {/* שירותים */}
            {supplier.services_offered && (
              <Card className="mb-4">
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>שירותים</Text>
                <Text style={{ color: cssVar.text.primary }}>{supplier.services_offered}</Text>
              </Card>
            )}

            {/* פרטי קשר */}
            <Card className="mb-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Text className="text-xs" style={{ color: cssVar.text.muted }}>איש קשר</Text>
                  <Text style={{ color: cssVar.text.primary }}>{supplier.contact_name || "—"}</Text>
                </div>
                <div>
                  <Text className="text-xs" style={{ color: cssVar.text.muted }}>טלפון</Text>
                  <Text style={{ color: cssVar.text.primary }}>{formatPhoneNumber(supplier.phone)}</Text>
                </div>
                <div>
                  <Text className="text-xs" style={{ color: cssVar.text.muted }}>אימייל</Text>
                  <Text style={{ color: cssVar.text.primary }}>{supplier.email || "—"}</Text>
                </div>
              </div>
            </Card>

            {/* הערות */}
            {supplier.notes && (
              <Card>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>הערות</Text>
                <Text className="whitespace-pre-wrap" style={{ color: cssVar.text.secondary }}>
                  {supplier.notes}
                </Text>
              </Card>
            )}
          </>
        )}
      </DialogPanel>
    </Dialog>
  );
}
