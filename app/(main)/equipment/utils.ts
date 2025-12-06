import type {
  EquipmentFormState,
  ReceiptHistoryEntry,
  ReceiptLine,
  StructureFormState,
  WarehouseFormState,
} from "./types";
import { CONDITION_OPTIONS } from "./constants";

export const px = (value: number) => `${value}px`;

export function formatNumber(value?: number | null, fallback = "—") {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return fallback;
  }
  return new Intl.NumberFormat("he-IL").format(value);
}

const currencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
});

export function formatCurrency(value?: number | null, fallback = "—") {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return fallback;
  }
  try {
    return currencyFormatter.format(value);
  } catch {
    return fallback;
  }
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("he-IL").format(date);
  } catch {
    return value;
  }
}

export function generateDocumentCode() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const randomPart = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `${dd}${mm}${HH}${randomPart}`;
}

export function generateClientId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export const createEmptyFormState = (): EquipmentFormState => ({
  family_code: "",
  category_code: "",
  name: "",
  description: "",
  condition: CONDITION_OPTIONS[0].value,
  is_consumable: false,
  is_sku_tracked: true,
  min_stock: "",
  is_rental: false,
  rental_expiry: "",
  manufacturer_name: "",
  manufacturer_sku: "",
  default_image_url: "",
  purchase_cost: "",
  notes: "",
  is_active: true,
  ownership_type: "item",
  supplier_identifier: "",
});

export const createEmptyReceiptLine = (): ReceiptLine => ({
  item_id: "",
  warehouse_id: "",
  quantity: "",
  supplier_document_number: "",
  unit_cost: "",
});

export const createEmptyStructureFormState = (): StructureFormState => ({
  entityType: "family",
  family_code: "",
  code: "",
  name: "",
  description: "",
  equipment_type: "sea",
  allow_item_images: false,
  allow_consumables: true,
  enforce_sku: true,
  require_image: false,
});

export const createEmptyWarehouseFormState = (): WarehouseFormState => ({
  code: "",
  name: "",
  city: "",
  address_line: "",
  postal_code: "",
  manager_name: "",
  manager_phone: "",
  manager_email: "",
  contact_name: "",
  contact_phone: "",
  rent_cost: "",
  rent_currency: "ILS",
  rent_expiry: "",
  lease_notes: "",
  general_notes: "",
  is_active: true,
});
