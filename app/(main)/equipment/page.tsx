"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  EquipmentItem,
  EquipmentFamily,
  EquipmentCategory,
  Warehouse,
} from "@/type";
import { Button, Card } from "@/app/components/ui";
import { AccessDenied } from "@/app/components/AccessDenied";
import { usePagePermission } from "@/app/hooks/usePagePermission";
import { inputStyle, labelStyle } from "@/app/styles/components";
import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from "@/app/styles/foundations";
import { CatalogTab } from "./tabs/CatalogTab";
import { HomeTab } from "./tabs/HomeTab";
import { InventoryTab } from "./tabs/InventoryTab";
import { StructureTab } from "./tabs/StructureTab";
import { EquipmentFormModal } from "./modals/EquipmentFormModal";
import { InventoryReceiptModal } from "./modals/InventoryReceiptModal";
import { WarehouseModal } from "./modals/WarehouseModal";
import { StructureModal } from "./modals/StructureModal";
import { HistoryModal } from "./modals/HistoryModal";
import { ViewItemModal } from "./modals/ViewItemModal";
import { WarehouseInventoryModal } from "./modals/WarehouseInventoryModal";
import type {
  EquipmentFormState,
  EquipmentPageData,
  FiltersState,
  ReceiptDetail,
  ReceiptHistoryEntry,
  ReceiptLine,
  StructureFormState,
  WarehouseFormState,
  WarehouseStockEntry,
} from "./types";
import {
  createEmptyFormState,
  createEmptyReceiptLine,
  createEmptyStructureFormState,
  createEmptyWarehouseFormState,
  px,
} from "./utils";

const TAB_CONFIG = [
  {
    id: "home",
    label: "דף הבית",
    description: "סקירה כללית של הציוד, מחסנים וקיצורי דרך.",
    permissionKey: "equipment",
  },
  {
    id: "catalog",
    label: "קטלוג ציוד",
    description: "",
    permissionKey: "equipment-catalog",
  },
  {
    id: "inventory",
    label: "מלאי ומחסנים",
    description: "",
    permissionKey: "equipment-inventory",
  },
  {
    id: "structure",
    label: "הגדרות מבנה",
    description: "",
    permissionKey: "equipment-settings",
  },
] as const;

type EquipmentTabId = (typeof TAB_CONFIG)[number]["id"];

const muted = colors.textMuted;
const createDefaultFilters = (): FiltersState => ({
  search: "",
  family: "",
  category: "",
  type: "",
  condition: "",
  status: "active",
});

export default function EquipmentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const initialTab = (
    viewParam && TAB_CONFIG.some((tab) => tab.id === viewParam)
      ? viewParam
      : "home"
  ) as EquipmentTabId;
  const [data, setData] = useState<EquipmentPageData>({
    items: [],
    families: [],
    categories: [],
    warehouses: [],
    suppliers: [],
  });
  const [filters, setFilters] = useState<FiltersState>(createDefaultFilters());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formState, setFormState] = useState<EquipmentFormState>(
    createEmptyFormState()
  );
  const [receiptLines, setReceiptLines] = useState<ReceiptLine[]>([
    createEmptyReceiptLine(),
  ]);
  const [receiptSupplierId, setReceiptSupplierId] = useState("");
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [viewingItem, setViewingItem] = useState<EquipmentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryNote, setInventoryNote] = useState("");
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] =
    useState<ReceiptHistoryEntry | null>(null);
  const [historyEntries, setHistoryEntries] = useState<ReceiptHistoryEntry[]>(
    []
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [receiptDetail, setReceiptDetail] = useState<ReceiptDetail | null>(
    null
  );
  const [receiptDetailLoading, setReceiptDetailLoading] = useState(false);
  const [editingReceiptCode, setEditingReceiptCode] = useState<string | null>(
    null
  );
  const [warehouseInventoryModalOpen, setWarehouseInventoryModalOpen] =
    useState(false);
  const [inventoryWarehouse, setInventoryWarehouse] =
    useState<Warehouse | null>(null);
  const [warehouseStock, setWarehouseStock] = useState<WarehouseStockEntry[]>(
    []
  );
  const [warehouseStockLoading, setWarehouseStockLoading] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [structureModalMode, setStructureModalMode] =
    useState<StructureFormState["entityType"]>("family");
  const [structureForm, setStructureForm] = useState<StructureFormState>(
    createEmptyStructureFormState()
  );
  const [structureSubmitting, setStructureSubmitting] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState<WarehouseFormState>(
    createEmptyWarehouseFormState()
  );
  const [warehouseSubmitting, setWarehouseSubmitting] = useState(false);
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<EquipmentTabId>(initialTab);
  const handleTabChange = useCallback(
    (tabId: EquipmentTabId) => {
      setActiveTab(tabId);
      const params = new URLSearchParams(searchParams.toString());
      if (tabId === "home") {
        params.delete("view");
      } else {
        params.set("view", tabId);
      }
      const queryString = params.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );
  const goToStructureTab = useCallback(
    () => handleTabChange("structure"),
    [handleTabChange]
  );

  const formatDateInputValue = (value?: string | Date | null) => {
    if (!value) return "";
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return value.toString().slice(0, 10);
  };

  const buildWarehouseFormState = (
    warehouse: Warehouse
  ): WarehouseFormState => ({
    ...createEmptyWarehouseFormState(),
    code: warehouse.code || "",
    name: warehouse.name || "",
    city: warehouse.city || "",
    address_line: warehouse.address_line || "",
    postal_code: warehouse.postal_code || "",
    manager_name: warehouse.manager_name || "",
    manager_phone: warehouse.manager_phone || "",
    manager_email: warehouse.manager_email || "",
    contact_name: warehouse.contact_name || "",
    contact_phone: warehouse.contact_phone || "",
    rent_cost:
      typeof warehouse.rent_cost === "number" &&
      !Number.isNaN(warehouse.rent_cost)
        ? String(warehouse.rent_cost)
        : "",
    rent_currency: warehouse.rent_currency || "",
    rent_expiry: formatDateInputValue(warehouse.rent_expiry),
    lease_notes: warehouse.lease_notes || "",
    general_notes: warehouse.general_notes || "",
    is_active: warehouse.is_active,
  });

  const baseEquipmentPermission = usePagePermission("equipment");
  const catalogPermissionRaw = usePagePermission("equipment-catalog");
  const inventoryPermissionRaw = usePagePermission("equipment-inventory");
  const structurePermissionRaw = usePagePermission("equipment-settings");

  const deriveTabPermission = (
    specific: ReturnType<typeof usePagePermission>
  ) => {
    if (
      specific.permission === "none" &&
      baseEquipmentPermission.permission !== "none"
    ) {
      return {
        permission: baseEquipmentPermission.permission,
        canRead: baseEquipmentPermission.canRead,
        canEdit: baseEquipmentPermission.canEdit,
        loading: specific.loading || baseEquipmentPermission.loading,
      };
    }
    return {
      permission: specific.permission,
      canRead: specific.canRead,
      canEdit: specific.canEdit,
      loading: specific.loading || baseEquipmentPermission.loading,
    };
  };

  const catalogPermission = deriveTabPermission(catalogPermissionRaw);
  const inventoryPermission = deriveTabPermission(inventoryPermissionRaw);
  const structurePermission = deriveTabPermission(structurePermissionRaw);

  const permissionsLoading =
    catalogPermission.loading ||
    inventoryPermission.loading ||
    structurePermission.loading;

  const availableTabs = useMemo(
    () =>
      TAB_CONFIG.filter((tab) => {
        if (tab.id === "home") {
          return baseEquipmentPermission.permission !== "none";
        }
        if (tab.id === "catalog") {
          return catalogPermission.permission !== "none";
        }
        if (tab.id === "inventory") {
          return inventoryPermission.permission !== "none";
        }
        return structurePermission.permission !== "none";
      }),
    [
      baseEquipmentPermission.permission,
      catalogPermission.permission,
      inventoryPermission.permission,
      structurePermission.permission,
    ]
  );

  useEffect(() => {
    if (!availableTabs.length) {
      return;
    }
    if (!availableTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  useEffect(() => {
    const view = searchParams.get("view");
    if (!view) {
      if (activeTab !== "home") {
        setActiveTab("home");
      }
      return;
    }
    if (view !== activeTab && availableTabs.some((tab) => tab.id === view)) {
      setActiveTab(view as EquipmentTabId);
    }
  }, [searchParams, availableTabs, activeTab]);

  const tabPermissionMap = {
    home: baseEquipmentPermission,
    catalog: catalogPermission,
    inventory: inventoryPermission,
    structure: structurePermission,
  } satisfies Record<
    EquipmentTabId,
    {
      permission: ReturnType<typeof usePagePermission>["permission"];
      canRead: boolean;
      canEdit: boolean;
      loading: boolean;
    }
  >;

  const canEditCatalog = catalogPermission.canEdit;
  const canEditInventory = inventoryPermission.canEdit;
  const canEditStructure = structurePermission.canEdit;
  const currentTabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab);
  const activeTabPermission = tabPermissionMap[activeTab];

  const loadReceiptHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch("/api/equipment/receipts");
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "שגיאה בטעינת היסטוריית קליטות");
      }
      const payload = await res.json();
      const normalized = (payload.data || []).map((entry: any) => ({
        id: entry.id || entry.document_code,
        document_code: entry.document_code,
        receipt_date: entry.receipt_date,
        supplier_identifier: entry.supplier_identifier ?? undefined,
        supplier_name: entry.supplier_name ?? undefined,
        total_items: entry.total_items ?? 0,
        total_value: entry.total_value ?? undefined,
        created_by: entry.created_by ?? undefined,
        created_by_name: entry.created_by_name ?? undefined,
        status: entry.status ?? "נקלט",
        note: entry.note ?? undefined,
      }));
      setHistoryEntries(normalized);
    } catch (err) {
      console.error("Error loading receipt history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadReceiptDetail = useCallback(
    async (documentCode: string, options?: { updateState?: boolean }) => {
      const shouldUpdateState = options?.updateState ?? true;
      if (shouldUpdateState) {
        setReceiptDetail(null);
        setReceiptDetailLoading(true);
      }
      try {
        const res = await fetch(
          `/api/equipment/receipts?document=${encodeURIComponent(documentCode)}`
        );
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "שגיאה בטעינת תעודה");
        }
        const payload = await res.json();
        const detail: ReceiptDetail = payload.receipt;
        if (shouldUpdateState) {
          setReceiptDetail(detail);
        }
        return detail;
      } finally {
        if (shouldUpdateState) {
          setReceiptDetailLoading(false);
        }
      }
    },
    []
  );

  const loadWarehouseStock = useCallback(async (warehouseId: string) => {
    try {
      setWarehouseStockLoading(true);
      const res = await fetch(
        `/api/equipment/warehouse-stock?warehouseId=${encodeURIComponent(
          warehouseId
        )}`
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "שגיאה בטעינת מלאי המחסן");
      }
      const payload = await res.json();
      setWarehouseStock(payload.data || []);
    } catch (err: any) {
      console.error("Error loading warehouse stock:", err);
      alert(err?.message || "שגיאה בטעינת מלאי המחסן");
    } finally {
      setWarehouseStockLoading(false);
    }
  }, []);

  if (permissionsLoading) {
    return (
      <div style={{ padding: spacing.xl }}>
        <Card>
          <div style={{ textAlign: "center", color: muted }}>
            טוען הרשאות...
          </div>
        </Card>
      </div>
    );
  }

  if (!availableTabs.length) {
    return (
      <div style={{ padding: spacing.xl }}>
        <AccessDenied
          title="אין לך הרשאה למסך הציוד"
          description="פנה למנהל המערכת כדי לאפשר גישה לאחד מתתי-המודולים."
        />
      </div>
    );
  }

  const fetchEquipment = async (controller?: AbortController) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.family) params.set("family", filters.family);
      if (filters.category) params.set("category", filters.category);
      if (filters.type) params.set("type", filters.type);
      if (filters.condition) params.set("condition", filters.condition);
      if (filters.status) {
        params.set("status", filters.status);
      }

      const res = await fetch(
        `/api/equipment${params.toString() ? `?${params.toString()}` : ""}`,
        {
          signal: controller?.signal,
        }
      );

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "שגיאה בטעינת ציוד");
      }

      const payload = await res.json();
      if (!payload.success) {
        throw new Error(payload.error || "שגיאה בטעינת ציוד");
      }

      setData({
        items: payload.items || [],
        families: payload.families || [],
        categories: payload.categories || [],
        warehouses: payload.warehouses || [],
        suppliers: payload.suppliers || [],
      });
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Error fetching equipment:", err);
      setError(err?.message || "שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchEquipment(controller);
    return () => controller.abort();
  }, [filters]);

  useEffect(() => {
    if (!filters.family || !filters.category) return;
    const exists = data.categories.some(
      (cat) =>
        cat.family_code === filters.family && cat.code === filters.category
    );
    if (!exists) {
      setFilters((prev) => ({ ...prev, category: "" }));
    }
  }, [filters.family, filters.category, data.categories]);

  useEffect(() => {
    if (activeTab === "inventory") {
      loadReceiptHistory();
      return;
    }
    if (activeTab === "home" && historyEntries.length === 0) {
      loadReceiptHistory();
    }
  }, [activeTab, historyEntries.length, loadReceiptHistory]);

  const statSummary = useMemo(() => {
    const totalItems = data.items.length;
    const totalUnits = data.items.reduce(
      (sum, item) => sum + (item.total_units ?? 0),
      0
    );
    const consumables = data.items.filter((item) => item.is_consumable).length;
    const rentals = data.items.filter((item) => item.is_rental).length;

    return {
      totalItems,
      totalUnits,
      consumables,
      rentals,
    };
  }, [data.items]);

  const availableCategories = useMemo(
    () =>
      data.categories.filter((category) =>
        filters.family ? category.family_code === filters.family : true
      ),
    [data.categories, filters.family]
  );

  const formCategories = useMemo(
    () =>
      data.categories.filter((category) =>
        formState.family_code
          ? category.family_code === formState.family_code
          : true
      ),
    [data.categories, formState.family_code]
  );

  const familiesWithCounts = useMemo(
    () =>
      data.families.map((family) => {
        const itemCount = data.items.filter(
          (item) => item.family_code === family.code
        ).length;
        return { ...family, itemCount };
      }),
    [data.families, data.items]
  );

  const categoriesWithCounts = useMemo(
    () =>
      data.categories.map((category) => {
        const itemCount = data.items.filter(
          (item) =>
            item.family_code === category.family_code &&
            item.category_code === category.code
        ).length;
        return { ...category, itemCount };
      }),
    [data.categories, data.items]
  );

  const activeWarehouses = useMemo(
    () => data.warehouses.filter((warehouse) => warehouse.is_active),
    [data.warehouses]
  );

  const handleFilterChange = (
    key: keyof FiltersState,
    value: FiltersState[typeof key]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(createDefaultFilters());
  };

  const openInventoryModal = () => {
    setEditingReceiptCode(null);
    setReceiptLines([createEmptyReceiptLine()]);
    setInventoryNote("");
    setReceiptSupplierId("");
    setShowInventoryModal(true);
  };

  const closeInventoryModal = () => {
    setEditingReceiptCode(null);
    setReceiptSupplierId("");
    setShowInventoryModal(false);
  };

  const selectReceipt = (entry: ReceiptHistoryEntry | null) => {
    setSelectedReceipt(entry);
    if (entry) {
      loadReceiptDetail(entry.document_code).catch((err: any) => {
        console.error("Error loading receipt detail:", err);
        alert(err?.message || "שגיאה בטעינת התעודה");
      });
    } else {
      setReceiptDetail(null);
      setReceiptDetailLoading(false);
    }
  };

  const openHistoryModal = (entry: ReceiptHistoryEntry | null = null) => {
    selectReceipt(entry);
    setShowHistoryModal(true);
    if (!historyEntries.length) {
      loadReceiptHistory();
    }
  };

  const closeHistoryModal = () => {
    selectReceipt(null);
    setShowHistoryModal(false);
  };

  const openStructureModal = (mode: "family" | "category") => {
    setStructureModalMode(mode);
    setStructureForm({
      ...createEmptyStructureFormState(),
      entityType: mode,
    });
    setShowStructureModal(true);
  };

  const closeStructureModal = () => {
    setShowStructureModal(false);
  };

  const openWarehouseModal = () => {
    setWarehouseForm(createEmptyWarehouseFormState());
    setEditingWarehouseId(null);
    setShowWarehouseModal(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setWarehouseForm(buildWarehouseFormState(warehouse));
    setEditingWarehouseId(warehouse.id);
    setShowWarehouseModal(true);
  };

  const closeWarehouseModal = () => {
    setShowWarehouseModal(false);
    setEditingWarehouseId(null);
  };

  const openWarehouseInventoryModal = (warehouse: Warehouse) => {
    setInventoryWarehouse(warehouse);
    setWarehouseInventoryModalOpen(true);
    loadWarehouseStock(warehouse.id);
  };

  const closeWarehouseInventoryModal = () => {
    setWarehouseInventoryModalOpen(false);
    setInventoryWarehouse(null);
    setWarehouseStock([]);
  };

  const refreshWarehouseInventory = () => {
    if (inventoryWarehouse) {
      loadWarehouseStock(inventoryWarehouse.id);
    }
  };

  const handleTransferWarehouseStock = async ({
    itemId,
    quantity,
    targetWarehouseId,
    note,
  }: {
    itemId: string;
    quantity: number;
    targetWarehouseId: string;
    note?: string;
  }) => {
    if (!inventoryWarehouse) return;
    const res = await fetch("/api/equipment/warehouse-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "transfer",
        sourceWarehouseId: inventoryWarehouse.id,
        targetWarehouseId,
        lines: [{ item_id: itemId, quantity }],
        note: note || null,
      }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.error || "שגיאה בהעברת מלאי");
    }
    fetchEquipment();
    loadWarehouseStock(inventoryWarehouse.id);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormState(createEmptyFormState());
    setShowFormModal(true);
  };

  const openEditModal = (item: EquipmentItem) => {
    setEditingItem(item);
    let nextState: EquipmentFormState = {
      family_code: item.family_code,
      category_code: item.category_code,
      name: item.name,
      description: item.description || "",
      condition: item.condition,
      is_consumable: !!item.is_consumable,
      is_sku_tracked: !!item.is_sku_tracked,
      min_stock: item.min_stock?.toString() ?? "",
      is_rental: !!item.is_rental,
      rental_expiry: item.rental_expiry ? item.rental_expiry.slice(0, 10) : "",
      manufacturer_name: item.supplier_name || item.manufacturer_name || "",
      manufacturer_sku: item.manufacturer_sku || "",
      default_image_url: item.default_image_url || "",
      purchase_cost: item.purchase_cost?.toString() ?? "",
      notes: item.notes || "",
      is_active: item.is_active,
      ownership_type: item.ownership_type
        ? (item.ownership_type as EquipmentFormState["ownership_type"])
        : item.is_rental
        ? "rental"
        : "item",
      supplier_identifier: item.supplier_identifier || "",
    };

    if (nextState.is_consumable && nextState.is_rental) {
      nextState = {
        ...nextState,
        is_rental: false,
        rental_expiry: "",
      };
    }

    setFormState(nextState);
    setShowFormModal(true);
  };

  const openViewModal = (item: EquipmentItem) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setViewingItem(null);
    setShowViewModal(false);
  };

  const handleFormChange = <K extends keyof EquipmentFormState>(
    key: K,
    value: EquipmentFormState[K]
  ) => {
    setFormState((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "is_consumable" && typeof value === "boolean") {
        if (value) {
          next.is_rental = false;
          next.rental_expiry = "";
        }
      }

      if (key === "is_rental" && typeof value === "boolean") {
        if (value) {
          next.is_consumable = false;
        } else {
          next.rental_expiry = "";
        }
      }

      if (
        key === "rental_expiry" &&
        typeof value === "string" &&
        !prev.is_rental
      ) {
        next.rental_expiry = "";
      }

      return next;
    });
  };

  const handleStructureChange = <K extends keyof StructureFormState>(
    key: K,
    value: StructureFormState[K]
  ) => {
    setStructureForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleWarehouseChange = <K extends keyof WarehouseFormState>(
    key: K,
    value: WarehouseFormState[K]
  ) => {
    setWarehouseForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditReceipt = async (entry: ReceiptHistoryEntry) => {
    try {
      const detail = await loadReceiptDetail(entry.document_code, {
        updateState: false,
      });
      const mappedLines =
        detail?.lines?.map((line) => ({
          item_id: line.item_id,
          warehouse_id: line.warehouse_id,
          quantity: line.quantity?.toString() || "",
          supplier_document_number: line.supplier_document_number || "",
          unit_cost:
            line.unit_cost === null || line.unit_cost === undefined
              ? ""
              : line.unit_cost.toString(),
        })) || [];
      setReceiptLines(
        mappedLines.length ? mappedLines : [createEmptyReceiptLine()]
      );
      setInventoryNote(detail?.note || "");
      setReceiptSupplierId(
        detail?.supplier_identifier || entry.supplier_identifier || ""
      );
      setEditingReceiptCode(entry.document_code);
      setShowInventoryModal(true);
      selectReceipt(null);
      setShowHistoryModal(false);
    } catch (err: any) {
      console.error("Error preparing receipt for edit:", err);
      alert(err?.message || "שגיאה בטעינת התעודה לעריכה");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם למחוק (להפסיק להפעיל) פריט זה?")) return;
    try {
      const res = await fetch(`/api/equipment/update?id=${id}`, {
        method: "DELETE",
      });
      const payload = await res.json();
      if (!payload.success) {
        throw new Error(payload.error || "מחיקה נכשלה");
      }
      fetchEquipment();
    } catch (err: any) {
      console.error("Error deleting equipment:", err);
      alert(err?.message || "שגיאה במחיקת פריט");
    }
  };

  const handleSubmit = async () => {
    if (!formState.family_code || !formState.category_code) {
      alert("יש לבחור משפחה וקטגוריה");
      return;
    }
    if (!formState.name.trim()) {
      alert("שם הפריט הוא שדה חובה");
      return;
    }

    const payload = {
      family_code: formState.family_code,
      category_code: formState.category_code,
      name: formState.name.trim(),
      description: formState.description || null,
      condition: formState.condition,
      is_consumable: formState.is_consumable,
      is_sku_tracked: formState.is_sku_tracked,
      min_stock: formState.is_sku_tracked
        ? null
        : formState.min_stock
        ? Number(formState.min_stock)
        : null,
      is_rental: formState.is_rental,
      rental_expiry: formState.rental_expiry || null,
      manufacturer_name: formState.manufacturer_name || null,
      manufacturer_sku: formState.manufacturer_sku || null,
      default_image_url: formState.default_image_url || null,
      purchase_cost: formState.purchase_cost
        ? Number(formState.purchase_cost)
        : null,
      notes: formState.notes || null,
      is_active: formState.is_active,
      ownership_type: formState.ownership_type,
      supplier_identifier: formState.supplier_identifier || null,
    };

    try {
      setIsSubmitting(true);
      const endpoint = editingItem
        ? "/api/equipment/update"
        : "/api/equipment/add";
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem ? { ...payload, id: editingItem.id } : payload;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const response = await res.json();
      if (!response.success) {
        throw new Error(response.error || "שמירת פריט נכשלה");
      }

      setShowFormModal(false);
      setEditingItem(null);
      setFormState(createEmptyFormState());
      fetchEquipment();
    } catch (err: any) {
      console.error("Error saving equipment:", err);
      alert(err?.message || "שגיאה בשמירת הפריט");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStructureSubmit = async () => {
    const normalizedCode = structureForm.code.trim().toUpperCase();
    if (normalizedCode.length !== 2) {
      alert("קוד חייב להיות בן 2 תווים");
      return;
    }

    if (!structureForm.name.trim()) {
      alert("שם הוא שדה חובה");
      return;
    }

    const entityType = structureModalMode;
    let endpoint = "";
    let payload: Record<string, any> = {};

    if (entityType === "family") {
      payload = {
        code: normalizedCode,
        name: structureForm.name.trim(),
        description: structureForm.description || null,
        equipment_type: structureForm.equipment_type,
        allow_item_images: structureForm.allow_item_images,
        allow_consumables: structureForm.allow_consumables,
      };
      endpoint = "/api/equipment/family";
    } else {
      if (!structureForm.family_code) {
        alert("יש לבחור משפחה קיימת עבור קטגוריה חדשה");
        return;
      }
      payload = {
        family_code: structureForm.family_code,
        code: normalizedCode,
        name: structureForm.name.trim(),
        description: structureForm.description || null,
        enforce_sku: structureForm.enforce_sku,
        require_image: structureForm.require_image,
      };
      endpoint = "/api/equipment/category";
    }

    try {
      setStructureSubmitting(true);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const dataResponse = await res.json();
      if (!res.ok || !dataResponse.success) {
        throw new Error(dataResponse.error || "שמירת נתונים נכשלה");
      }

      alert(
        entityType === "family" ? "משפחה נוצרה בהצלחה" : "קטגוריה נוצרה בהצלחה"
      );
      closeStructureModal();
      fetchEquipment();
    } catch (err: any) {
      console.error("Error creating structure:", err);
      alert(err?.message || "שגיאה בשמירת הנתונים");
    } finally {
      setStructureSubmitting(false);
    }
  };

  const handleWarehouseSubmit = async () => {
    const isEditingWarehouse = Boolean(editingWarehouseId);
    const code = warehouseForm.code.trim().toUpperCase();
    const name = warehouseForm.name.trim();
    if (!code || code.length > 20) {
      alert("קוד המחסן נדרש (עד 20 תווים)");
      return;
    }
    if (!name) {
      alert("שם המחסן הוא שדה חובה");
      return;
    }

    let rentCostValue: number | null = null;
    if (warehouseForm.rent_cost.trim()) {
      const parsed = Number(warehouseForm.rent_cost);
      if (Number.isNaN(parsed)) {
        alert("עלות השכרה חייבת להיות מספרית");
        return;
      }
      rentCostValue = parsed;
    }

    const payload = {
      code,
      name,
      city: warehouseForm.city || null,
      address_line: warehouseForm.address_line || null,
      postal_code: warehouseForm.postal_code || null,
      manager_name: warehouseForm.manager_name || null,
      manager_phone: warehouseForm.manager_phone || null,
      manager_email: warehouseForm.manager_email || null,
      contact_name: warehouseForm.contact_name || null,
      contact_phone: warehouseForm.contact_phone || null,
      rent_cost: rentCostValue,
      rent_currency: warehouseForm.rent_currency
        ? warehouseForm.rent_currency.toUpperCase().slice(0, 3)
        : null,
      rent_expiry: warehouseForm.rent_expiry || null,
      lease_notes: warehouseForm.lease_notes || null,
      general_notes: warehouseForm.general_notes || null,
      is_active: warehouseForm.is_active,
    };

    try {
      setWarehouseSubmitting(true);
      const res = await fetch("/api/warehouses", {
        method: isEditingWarehouse ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditingWarehouse ? { id: editingWarehouseId, ...payload } : payload
        ),
      });
      const response = await res.json();
      if (!res.ok || !response.success) {
        throw new Error(response.error || "שמירת מחסן נכשלה");
      }
      alert(isEditingWarehouse ? "מחסן עודכן בהצלחה" : "מחסן נוצר בהצלחה");
      closeWarehouseModal();
      fetchEquipment();
    } catch (err: any) {
      console.error("Error saving warehouse:", err);
      alert(err?.message || "שגיאה בשמירת מחסן");
    } finally {
      setWarehouseSubmitting(false);
    }
  };

  const handleReceiptLineChange = <K extends keyof ReceiptLine>(
    index: number,
    key: K,
    value: ReceiptLine[K]
  ) => {
    setReceiptLines((prev) =>
      prev.map((line, idx) => {
        if (idx !== index) return line;
        const next = { ...line, [key]: value };
        if (key === "item_id") {
          const selectedItem = data.items.find((item) => item.id === value);
          if (selectedItem) {
            const cost =
              selectedItem.purchase_cost ?? selectedItem.unit_cost ?? null;
            if (cost !== null && cost !== undefined) {
              next.unit_cost = cost.toString();
            } else {
              next.unit_cost = "";
            }
          } else {
            next.unit_cost = "";
          }
        }
        return next;
      })
    );
  };

  const addReceiptLine = () => {
    setReceiptLines((prev) => [...prev, createEmptyReceiptLine()]);
  };

  const duplicateReceiptLine = (index: number) => {
    setReceiptLines((prev) => {
      const source = prev[index];
      if (!source) return prev;
      const clone = {
        ...createEmptyReceiptLine(),
        supplier_document_number: source.supplier_document_number,
      };
      return [
        ...prev.slice(0, index + 1),
        { ...clone },
        ...prev.slice(index + 1),
      ];
    });
  };

  const removeReceiptLine = (index: number) => {
    setReceiptLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleInventorySubmit = async () => {
    if (!receiptSupplierId) {
      alert("יש לבחור ספק לתעודה.");
      return;
    }
    const normalizedLines = receiptLines
      .map((line) => ({
        item_id: line.item_id.trim(),
        warehouse_id: line.warehouse_id.trim(),
        quantity: Number(line.quantity),
        supplier_document_number: line.supplier_document_number?.trim() || null,
        unit_cost:
          line.unit_cost && line.unit_cost.toString().trim().length
            ? Number(line.unit_cost)
            : null,
      }))
      .filter(
        (line) =>
          line.item_id &&
          line.warehouse_id &&
          Number.isFinite(line.quantity) &&
          line.quantity > 0
      );

    if (!normalizedLines.length) {
      alert("יש להזין לפחות שורת קליטה אחת עם פריט, מחסן וכמות חיובית.");
      return;
    }

    try {
      const res = await fetch("/api/equipment/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lines: normalizedLines,
          note: inventoryNote || null,
          document_code: editingReceiptCode,
          supplier_identifier: receiptSupplierId,
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "שגיאה בשמירת תעודת הקליטה");
      }

      alert("תעודת הקליטה נשמרה בהצלחה.");
      setReceiptLines([createEmptyReceiptLine()]);
      setInventoryNote("");
      setReceiptSupplierId("");
      closeInventoryModal();
      fetchEquipment();
      loadReceiptHistory();
      if (editingReceiptCode) {
        setEditingReceiptCode(null);
        if (
          selectedReceipt &&
          selectedReceipt.document_code === editingReceiptCode
        ) {
          setSelectedReceipt((prev) =>
            prev
              ? {
                  ...prev,
                  document_code:
                    payload.receipt?.document_code || prev.document_code,
                  total_items: payload.receipt?.total_items ?? prev.total_items,
                  note: inventoryNote || prev.note,
                }
              : prev
          );
          loadReceiptDetail(
            payload.receipt?.document_code || editingReceiptCode
          ).catch((err: any) => {
            console.error("Error refreshing receipt detail:", err);
          });
        }
      }
    } catch (err: any) {
      console.error("Error saving inventory receipt:", err);
      alert(err?.message || "שגיאה בשמירת תעודת הקליטה");
    }
  };

  return (
    <div
      style={{
        padding: spacing.xl,
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
      }}
    >
      {currentTabConfig &&
        (currentTabConfig.description || !activeTabPermission.canEdit) && (
          <div
            style={{
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            {currentTabConfig.description}
            {!activeTabPermission.canEdit && " · מצב קריאה בלבד"}
          </div>
        )}

      {activeTab === "home" && (
        <HomeTab
          items={data.items}
          warehouses={data.warehouses}
          historyEntries={historyEntries}
          historyLoading={historyLoading}
          statSummary={statSummary}
          onNavigate={(tab) => handleTabChange(tab)}
        />
      )}

      {activeTab === "catalog" && (
        <CatalogTab
          data={data}
          filters={filters}
          availableCategories={availableCategories}
          loading={loading}
          error={error}
          canEdit={canEditCatalog}
          onFilterChange={handleFilterChange}
          onRefresh={() => fetchEquipment()}
          onCreateItem={openCreateModal}
          onViewItem={openViewModal}
          onEditItem={openEditModal}
          onDeleteItem={handleDelete}
          onClearFilters={handleClearFilters}
        />
      )}

      {activeTab === "inventory" && (
        <InventoryTab
          historyEntries={historyEntries}
          historyLoading={historyLoading}
          canEdit={canEditInventory}
          onOpenInventoryModal={openInventoryModal}
          onOpenHistoryModal={openHistoryModal}
          onEditReceipt={handleEditReceipt}
          onGoToStructure={goToStructureTab}
        />
      )}

      {activeTab === "structure" && (
        <StructureTab
          familiesWithCounts={familiesWithCounts}
          categoriesWithCounts={categoriesWithCounts}
          canEdit={canEditStructure}
          onOpenStructureModal={openStructureModal}
          warehouses={data.warehouses}
          onCreateWarehouse={openWarehouseModal}
          onEditWarehouse={handleEditWarehouse}
          onManageWarehouse={openWarehouseInventoryModal}
        />
      )}

      <InventoryReceiptModal
        open={showInventoryModal}
        onClose={closeInventoryModal}
        documentCode={editingReceiptCode}
        receiptLines={receiptLines}
        inventoryNote={inventoryNote}
        activeWarehouses={activeWarehouses}
        items={data.items}
        suppliers={data.suppliers}
        selectedSupplierId={receiptSupplierId}
        onSupplierChange={setReceiptSupplierId}
        onInventoryNoteChange={setInventoryNote}
        onAddLine={addReceiptLine}
        onDuplicateLine={duplicateReceiptLine}
        onRemoveLine={removeReceiptLine}
        onLineChange={handleReceiptLineChange}
        onSubmit={handleInventorySubmit}
        onReset={() => {
          setReceiptLines([createEmptyReceiptLine()]);
          setInventoryNote("");
          setReceiptSupplierId("");
        }}
      />

      <WarehouseModal
        open={showWarehouseModal}
        form={warehouseForm}
        submitting={warehouseSubmitting}
        isEditing={Boolean(editingWarehouseId)}
        onClose={closeWarehouseModal}
        onSubmit={handleWarehouseSubmit}
        onChange={handleWarehouseChange}
      />

      <HistoryModal
        open={showHistoryModal}
        selected={selectedReceipt}
        entries={historyEntries}
        onClose={closeHistoryModal}
        onSelect={selectReceipt}
        detail={receiptDetail}
        detailLoading={receiptDetailLoading}
        onEdit={handleEditReceipt}
        canEdit={canEditInventory}
      />

      <StructureModal
        open={showStructureModal}
        mode={structureModalMode}
        form={structureForm}
        submitting={structureSubmitting}
        families={data.families}
        familiesWithCounts={familiesWithCounts}
        categoriesWithCounts={categoriesWithCounts}
        onClose={closeStructureModal}
        onSwitchMode={openStructureModal}
        onChange={handleStructureChange}
        onSubmit={handleStructureSubmit}
      />

      <EquipmentFormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        formState={formState}
        formCategories={formCategories}
        families={data.families}
        editingItem={editingItem}
        canEdit={canEditCatalog}
        suppliers={data.suppliers}
        onChange={handleFormChange}
      />

      <ViewItemModal
        open={showViewModal && !!viewingItem}
        item={viewingItem}
        onClose={closeViewModal}
      />

      <WarehouseInventoryModal
        open={warehouseInventoryModalOpen}
        warehouse={inventoryWarehouse}
        stock={warehouseStock}
        loading={warehouseStockLoading}
        warehouses={data.warehouses}
        onClose={closeWarehouseInventoryModal}
        onRefresh={refreshWarehouseInventory}
        onTransferStock={handleTransferWarehouseStock}
        canEdit={canEditInventory}
      />
    </div>
  );
}
