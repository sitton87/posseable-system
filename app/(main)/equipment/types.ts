import type {
  Donor,
  EquipmentCategory,
  EquipmentFamily,
  EquipmentItem,
  Supplier,
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
  is_rental: boolean;
  rental_expiry: string;
  manufacturer_name: string;
  manufacturer_sku: string;
  default_image_url: string;
  purchase_cost: string;
  notes: string;
  is_active: boolean;
  ownership_type: "item" | "rental" | "consignment";
  supplier_identifier: string;
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
  suppliers: Supplier[];
  donors: Donor[];
};

export type StatSummary = {
  totalItems: number;
  totalUnits: number;
  consumables: number;
  rentals: number;
};

export type InventoryDocumentAction =
  | "RECEIPT"
  | "DONATION"
  | "DISPOSAL"
  | "TRANSFER"
  | "STOCKTAKE_ADJUST";

export type InventoryDocumentFormLine = {
  item_id: string;
  quantity: string;
  source_warehouse_id: string;
  target_warehouse_id: string;
  supplier_document_number: string;
  adjust_direction: "increase" | "decrease";
};

export type InventoryDocumentFormState = {
  action_type: InventoryDocumentAction;
  donor_national_id: string;
  supplier_identifier: string;
  supplier_document_type: string;
  notes: string;
  external_party: string;
  lines: InventoryDocumentFormLine[];
};

export type InventoryDocumentSummary = {
  id: string;
  document_number: number;
  action_type: InventoryDocumentAction;
  document_date: string;
  source_warehouse_id?: string | null;
  source_warehouse_name?: string | null;
  target_warehouse_id?: string | null;
  target_warehouse_name?: string | null;
  supplier_identifier?: string | null;
  supplier_name?: string | null;
  supplier_document_type?: string | null;
  donor_national_id?: string | null;
  donor_name?: string | null;
  external_party?: string | null;
  total_quantity: number;
  total_value?: number | null;
  notes?: string | null;
  created_by?: string | null;
  created_by_name?: string | null;
};

export type InventoryDocumentLine = {
  id: string;
  item_id: string;
  item_name: string;
  internal_sku?: string | null;
  quantity: number;
  unit_cost?: number | null;
  source_warehouse_id?: string | null;
  source_warehouse_name?: string | null;
  target_warehouse_id?: string | null;
  target_warehouse_name?: string | null;
  supplier_document_number?: string | null;
};

export type InventoryDocumentDetail = InventoryDocumentSummary & {
  lines: InventoryDocumentLine[];
};
