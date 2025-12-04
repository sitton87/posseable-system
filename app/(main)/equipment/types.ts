import type {
  EquipmentCategory,
  EquipmentFamily,
  EquipmentItem,
  Warehouse,
} from "@/type";

export type FiltersState = {
  search: string;
  family: string;
  category: string;
  type: string;
  condition: string;
  status: "active" | "all" | "inactive";
};

export type EquipmentFormState = {
  family_code: string;
  category_code: string;
  name: string;
  description: string;
  condition: string;
  is_consumable: boolean;
  is_sku_tracked: boolean;
  min_stock: string;
  max_stock: string;
  is_rental: boolean;
  rental_expiry: string;
  manufacturer_name: string;
  manufacturer_sku: string;
  default_image_url: string;
  purchase_cost: string;
  notes: string;
  is_active: boolean;
};

export type ReceiptLine = {
  item_id: string;
  warehouse_id: string;
  quantity: string;
  unit_cost: string;
  supplier_identifier: string;
};

export type ReceiptHistoryEntry = {
  id: string;
  document_code: string;
  receipt_date: string;
  supplier_name?: string;
  total_items: number;
  status: string;
  lines?: ReceiptLine[];
  note?: string;
};

export type ReceiptDetailLine = {
  item_id: string;
  item_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  unit_cost?: number | null;
  supplier_identifier?: string | null;
};

export type ReceiptDetail = {
  document_code: string;
  receipt_date: string;
  total_items: number;
  note?: string | null;
  lines: ReceiptDetailLine[];
};

export type WarehouseStockEntry = {
  item_id: string;
  item_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  equipment_type: string;
  condition: string;
};

export type StructureFormState = {
  entityType: "family" | "category";
  family_code: string;
  code: string;
  name: string;
  description: string;
  equipment_type: "sea" | "support";
  allow_item_images: boolean;
  allow_consumables: boolean;
  enforce_sku: boolean;
  require_image: boolean;
};

export type WarehouseFormState = {
  code: string;
  name: string;
  city: string;
  address_line: string;
  postal_code: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  contact_name: string;
  contact_phone: string;
  rent_cost: string;
  rent_currency: string;
  rent_expiry: string;
  lease_notes: string;
  general_notes: string;
  is_active: boolean;
};

export type EquipmentPageData = {
  items: EquipmentItem[];
  families: EquipmentFamily[];
  categories: EquipmentCategory[];
  warehouses: Warehouse[];
};

export type StatSummary = {
  totalItems: number;
  totalUnits: number;
  consumables: number;
  rentals: number;
};
