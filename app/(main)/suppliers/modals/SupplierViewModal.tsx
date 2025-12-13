import { Modal, Button } from "@/app/components/ui";
import { sectionCardStyle } from "@/app/components/shared";
import { colors, spacing } from "@/app/styles/foundations";
import { formatPhoneNumber } from "@/lib/utils/format";
import { Supplier } from "@/type";
import { supplierTypeOptions } from "../types";

const muted = colors.textMuted;

const sectionBoxStyle = {
  ...sectionCardStyle,
  marginBottom: spacing.lg,
};

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
    <Modal
      open={open}
      onClose={onClose}
      width="min(640px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      {supplier && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <h3 style={{ margin: 0 }}>{supplier.name}</h3>
            <Button variant="secondary" onClick={onClose}>
              ✕ סגור
            </Button>
          </div>
          <div style={{ ...sectionBoxStyle, background: colors.surface }}>
            <div style={{ fontSize: 12, color: muted }}>מספר ספק</div>
            <div style={{ fontFamily: "monospace" }}>
              {supplier.supplier_identifier}
            </div>
          </div>
          <div style={{ ...sectionBoxStyle, background: colors.surface }}>
            <div style={{ fontSize: 12, color: muted }}>סוג ספק</div>
            <div>
              {
                supplierTypeOptions.find(
                  (opt) =>
                    opt.value === (supplier.supplier_type || "goods")
                )?.label
              }
            </div>
          </div>
          {supplier.services_offered && (
            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <div style={{ fontSize: 12, color: muted }}>שירותים</div>
              <div>{supplier.services_offered}</div>
            </div>
          )}
          <div style={{ ...sectionBoxStyle, background: colors.surface }}>
            <div style={{ fontSize: 12, color: muted }}>איש קשר</div>
            <div>{supplier.contact_name || "—"}</div>
            <div style={{ fontSize: 12, color: muted }}>טלפון</div>
            <div>{formatPhoneNumber(supplier.phone)}</div>
            <div style={{ fontSize: 12, color: muted }}>אימייל</div>
            <div>{supplier.email || "—"}</div>
          </div>
          {supplier.notes && (
            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <div style={{ fontSize: 12, color: muted }}>הערות</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{supplier.notes}</div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

