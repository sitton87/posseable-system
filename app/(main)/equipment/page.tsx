"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  EquipmentItem,
  EquipmentFamily,
  EquipmentCategory,
  Warehouse,
} from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import { AccessDenied } from "@/app/components/AccessDenied";
import { usePagePermission } from "@/app/hooks/usePagePermission";
import {
  badgeStyle,
  inputStyle,
  labelStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
  withCenteredControl,
} from "@/app/styles/components";
import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from "@/app/styles/foundations";
import { EquipmentSummaryCard, WarehouseManagementCard } from "./components";
import {
  CONDITION_OPTIONS,
  conditionBadgeMap,
  getConditionLabel,
  EQUIPMENT_TYPE_LABELS,
} from "./constants";
import type {
  EquipmentFormState,
  EquipmentPageData,
  FiltersState,
  ReceiptHistoryEntry,
  ReceiptLine,
  StructureFormState,
  WarehouseFormState,
} from "./types";
import {
  createEmptyFormState,
  createEmptyReceiptLine,
  createEmptyStructureFormState,
  createEmptyWarehouseFormState,
  formatDate,
  formatNumber,
  generateClientId,
  generateDocumentCode,
  px,
} from "./utils";

const TAB_CONFIG = [
  {
    id: "catalog",
    label: "קטלוג ציוד",
    description: "ניהול מלא של פריטי הציוד, סטטוסים ופעולות תחזוקה.",
    permissionKey: "equipment-catalog",
  },
  {
    id: "inventory",
    label: "מלאי ומחסנים",
    description: "שליטה במיקומי המחסנים, קליטת מלאי ותיעוד תעודות.",
    permissionKey: "equipment-inventory",
  },
  {
    id: "structure",
    label: "הגדרות מבנה",
    description: "יצירה ותחזוקה של משפחות, קטגוריות ושדות עזר לציוד.",
    permissionKey: "equipment-settings",
  },
] as const;

type EquipmentTabId = (typeof TAB_CONFIG)[number]["id"];

const muted = colors.textMuted;
const filterControlStyle = withCenteredControl(inputStyle);

const DEMO_RECEIPTS: ReceiptHistoryEntry[] = [
  {
    id: "demo-1",
    document_code: "021215001",
    receipt_date: "2025-12-01",
    supplier_name: "ספק הדגמה",
    total_items: 3,
    status: "טיוטה",
  },
  {
    id: "demo-2",
    document_code: "021215002",
    receipt_date: "2025-11-29",
    supplier_name: "Surf Logistics",
    total_items: 5,
    status: "סגור",
  },
];

export default function EquipmentPage() {
  const [data, setData] = useState<EquipmentPageData>({
    items: [],
    families: [],
    categories: [],
    warehouses: [],
  });
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    family: "",
    category: "",
    type: "",
    condition: "",
    status: "active",
  });
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
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [viewingItem, setViewingItem] = useState<EquipmentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryNote, setInventoryNote] = useState("");
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] =
    useState<ReceiptHistoryEntry | null>(null);
  const [historyEntries, setHistoryEntries] =
    useState<ReceiptHistoryEntry[]>(DEMO_RECEIPTS);
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
  const [activeTab, setActiveTab] = useState<EquipmentTabId>("catalog");

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
        if (tab.id === "catalog") {
          return catalogPermission.permission !== "none";
        }
        if (tab.id === "inventory") {
          return inventoryPermission.permission !== "none";
        }
        return structurePermission.permission !== "none";
      }),
    [
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

  const tabPermissionMap = {
    catalog: catalogPermission,
    inventory: inventoryPermission,
    structure: structurePermission,
  } as const;

  const canEditCatalog = catalogPermission.canEdit;
  const canEditInventory = inventoryPermission.canEdit;
  const canEditStructure = structurePermission.canEdit;
  const currentTabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab);
  const activeTabPermission = tabPermissionMap[activeTab];

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
      if (filters.status && filters.status !== "all") {
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

  const openInventoryModal = () => {
    setReceiptLines([createEmptyReceiptLine()]);
    setInventoryNote("");
    setShowInventoryModal(true);
  };

  const closeInventoryModal = () => {
    setShowInventoryModal(false);
  };

  const openHistoryModal = (entry: ReceiptHistoryEntry | null = null) => {
    setSelectedReceipt(entry);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setSelectedReceipt(null);
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
    setShowWarehouseModal(true);
  };

  const closeWarehouseModal = () => {
    setShowWarehouseModal(false);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormState(createEmptyFormState());
    setShowFormModal(true);
  };

  const openEditModal = (item: EquipmentItem) => {
    setEditingItem(item);
    setFormState({
      family_code: item.family_code,
      category_code: item.category_code,
      name: item.name,
      description: item.description || "",
      condition: item.condition,
      is_consumable: !!item.is_consumable,
      is_sku_tracked: !!item.is_sku_tracked,
      min_stock: item.min_stock?.toString() ?? "",
      max_stock: item.max_stock?.toString() ?? "",
      is_rental: !!item.is_rental,
      rental_expiry: item.rental_expiry ? item.rental_expiry.slice(0, 10) : "",
      manufacturer_name: item.manufacturer_name || "",
      manufacturer_sku: item.manufacturer_sku || "",
      default_image_url: item.default_image_url || "",
      purchase_cost: item.purchase_cost?.toString() ?? "",
      notes: item.notes || "",
    });
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
    setFormState((prev) => ({ ...prev, [key]: value }));
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
      max_stock: formState.is_sku_tracked
        ? null
        : formState.max_stock
        ? Number(formState.max_stock)
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
      is_active: true,
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const response = await res.json();
      if (!res.ok || !response.success) {
        throw new Error(response.error || "שמירת מחסן נכשלה");
      }
      alert("מחסן נוצר בהצלחה");
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
      prev.map((line, idx) =>
        idx === index ? { ...line, [key]: value } : line
      )
    );
  };

  const addReceiptLine = () => {
    setReceiptLines((prev) => [...prev, createEmptyReceiptLine()]);
  };

  const removeReceiptLine = (index: number) => {
    setReceiptLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleInventorySubmit = () => {
    const normalizedLines = receiptLines
      .map((line) => ({
        ...line,
        quantity: line.quantity.trim(),
        unit_cost: line.unit_cost.trim(),
      }))
      .filter(
        (line) => line.item_id && line.warehouse_id && Number(line.quantity) > 0
      );

    if (!normalizedLines.length) {
      alert("יש להזין לפחות שורת קליטה אחת עם פריט, מחסן וכמות חיובית.");
      return;
    }

    const documentCode = generateDocumentCode();
    const now = new Date().toISOString();
    const totalItems = normalizedLines.reduce(
      (sum, line) => sum + Number(line.quantity),
      0
    );
    const aggregatedSupplier =
      normalizedLines[0]?.supplier_identifier?.trim() || undefined;

    setHistoryEntries((prev) => [
      {
        id: generateClientId("receipt"),
        document_code: documentCode,
        receipt_date: now,
        supplier_name: aggregatedSupplier,
        total_items: totalItems,
        status: "טיוטה",
        lines: normalizedLines,
        note: inventoryNote || undefined,
      },
      ...prev,
    ]);

    setData((prev) => {
      const updatedItems = prev.items.map((item) => {
        const relatedLines = normalizedLines.filter(
          (line) => line.item_id === item.id
        );
        if (!relatedLines.length) {
          return item;
        }

        const stockArray = [...(item.warehouse_stock || [])];

        relatedLines.forEach((line) => {
          const qty = Number(line.quantity);
          const stockIndex = stockArray.findIndex(
            (stock) => stock.warehouse_id === line.warehouse_id
          );
          if (stockIndex >= 0) {
            stockArray[stockIndex] = {
              ...stockArray[stockIndex],
              quantity: Number(stockArray[stockIndex].quantity || 0) + qty,
            };
          } else {
            const warehouseInfo = prev.warehouses.find(
              (warehouse) => warehouse.id === line.warehouse_id
            );
            stockArray.push({
              warehouse_id: line.warehouse_id,
              warehouse_name: warehouseInfo?.name || "—",
              warehouse_code: warehouseInfo?.code,
              quantity: qty,
            });
          }
        });

        const total_units = stockArray.reduce(
          (sum, stock) => sum + Number(stock.quantity || 0),
          0
        );

        return {
          ...item,
          warehouse_stock: stockArray,
          total_units,
        };
      });

      return {
        ...prev,
        items: updatedItems,
      };
    });

    alert("תעודת קליטה נשמרה (סימולציה ללא חיבור למסד נתונים).");
    setReceiptLines([createEmptyReceiptLine()]);
    setInventoryNote("");
    closeInventoryModal();
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
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: spacing.sm,
        }}
      >
        {availableTabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: "1 1 220px",
                minWidth: 220,
                borderRadius: radii.card,
                border: `1px solid ${
                  isActive ? colors.primary : colors.border
                }`,
                backgroundColor: isActive ? colors.primarySoft : colors.surface,
                color: colors.textPrimary,
                padding: px(spacing.md),
                textAlign: "right",
                cursor: "pointer",
                boxShadow: isActive ? shadows.card : "none",
              }}
            >
              <div style={{ fontWeight: 700 }}>{tab.label}</div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>
                {tab.description}
              </div>
              {!tabPermissionMap[tab.id].canEdit && (
                <div style={{ fontSize: 12, color: colors.textMuted }}>
                  מצב קריאה בלבד
                </div>
              )}
            </button>
          );
        })}
      </div>

      {currentTabConfig && (
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

      {activeTab === "catalog" && (
        <>
          <EquipmentSummaryCard
            statSummary={statSummary}
            error={error}
            onRefresh={() => fetchEquipment()}
            onCreate={openCreateModal}
            canCreate={canEditCatalog}
          />

          <Card>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              <input
                type="text"
                placeholder="חיפוש לפי שם, SKU או יצרן"
                style={filterControlStyle}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <select
                style={filterControlStyle}
                value={filters.family}
                onChange={(e) => handleFilterChange("family", e.target.value)}
              >
                <option value="">כל המשפחות</option>
                {data.families.map((family) => (
                  <option key={family.code} value={family.code}>
                    {family.code} · {family.name}
                  </option>
                ))}
              </select>
              <select
                style={filterControlStyle}
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">כל הקטגוריות</option>
                {availableCategories.map((category) => (
                  <option
                    key={`${category.family_code}-${category.code}`}
                    value={category.code}
                  >
                    {category.family_code}/{category.code} · {category.name}
                  </option>
                ))}
              </select>
              <select
                style={filterControlStyle}
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">כל סוגי הציוד</option>
                <option value="sea">ציוד ים</option>
                <option value="support">ציוד מסייע</option>
              </select>
              <select
                style={filterControlStyle}
                value={filters.condition}
                onChange={(e) =>
                  handleFilterChange("condition", e.target.value)
                }
              >
                <option value="">כל המצבים</option>
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                style={filterControlStyle}
                value={filters.status}
                onChange={(e) =>
                  handleFilterChange(
                    "status",
                    e.target.value as FiltersState["status"]
                  )
                }
              >
                <option value="active">פעילים בלבד</option>
                <option value="all">כל הפריטים</option>
                <option value="inactive">לא פעילים</option>
              </select>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>פריט</th>
                    <th style={tableHeaderStyle}>משפחה / קטגוריה</th>
                    <th style={tableHeaderStyle}>סוג ציוד</th>
                    <th style={tableHeaderStyle}>מצב</th>
                    <th style={tableHeaderStyle}>מלאי</th>
                    <th style={tableHeaderStyle}>מחסנים</th>
                    <th style={tableHeaderStyle}>סטטוסים נוספים</th>
                    <th style={tableHeaderStyle}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={tableCellStyle}>
                        טוען נתונים...
                      </td>
                    </tr>
                  ) : (
                    data.items.map((item) => {
                      const typeLabel =
                        EQUIPMENT_TYPE_LABELS[item.equipment_type] ||
                        item.equipment_type ||
                        "—";
                      const warehouses = item.warehouse_stock || [];
                      return (
                        <tr key={item.id}>
                          <td style={tableCellStyle}>
                            <div style={{ fontWeight: 700 }}>{item.name}</div>
                            <div style={{ color: muted, fontSize: 12 }}>
                              SKU פנימי: {item.internal_sku || "—"}
                            </div>
                            <div style={{ color: muted, fontSize: 12 }}>
                              מק״ט יצרן: {item.manufacturer_sku || "—"}
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            <div>{item.family_name || item.family_code}</div>
                            <div style={{ fontSize: 12, color: muted }}>
                              {item.category_name || item.category_code}
                            </div>
                          </td>
                          <td style={tableCellStyle}>{typeLabel}</td>
                          <td style={tableCellStyle}>
                            <span
                              style={badgeStyle(
                                conditionBadgeMap[item.condition]?.background ||
                                  colors.borderMuted,
                                conditionBadgeMap[item.condition]?.color ||
                                  colors.textPrimary
                              )}
                            >
                              {getConditionLabel(item.condition)}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>
                              {formatNumber(item.total_units, "0")}
                            </div>
                            <div style={{ fontSize: 12, color: muted }}>
                              מינימום:{" "}
                              {item.is_sku_tracked
                                ? "N/A"
                                : formatNumber(item.min_stock)}
                            </div>
                            <div style={{ fontSize: 12, color: muted }}>
                              מקסימום:{" "}
                              {item.is_sku_tracked
                                ? "N/A"
                                : formatNumber(item.max_stock)}
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            {warehouses.length === 0 && (
                              <div style={{ color: muted }}>אין נתוני מלאי</div>
                            )}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                              }}
                            >
                              {warehouses.map((stock) => (
                                <span
                                  key={stock.warehouse_id}
                                  style={badgeStyle(
                                    colors.surfaceAlt,
                                    colors.textPrimary
                                  )}
                                >
                                  {stock.warehouse_name}:{" "}
                                  {formatNumber(stock.quantity, "0")}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            <div>
                              <strong>מתכלה:</strong>{" "}
                              {item.is_consumable ? "כן" : "לא"}
                            </div>
                            <div>
                              <strong>השכרה:</strong>{" "}
                              {item.is_rental
                                ? `כן (${formatDate(item.rental_expiry)})`
                                : "לא"}
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: spacing.xs,
                              }}
                            >
                              <Button
                                variant="secondary"
                                title="צפייה"
                                aria-label="צפייה"
                                onClick={() => openViewModal(item)}
                              >
                                👁️
                              </Button>
                              {canEditCatalog && (
                                <>
                                  <Button
                                    variant="secondary"
                                    title="עריכה"
                                    aria-label="עריכה"
                                    onClick={() => openEditModal(item)}
                                  >
                                    ✏️
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    title="מחיקה"
                                    aria-label="מחיקה"
                                    style={{ color: colors.danger }}
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    🗑️
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  {!loading && data.items.length === 0 && (
                    <tr>
                      <td colSpan={8} style={tableCellStyle}>
                        אין פריטים תואמים לסינון שנבחר.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === "inventory" && (
        <>
          <WarehouseManagementCard
            warehouses={data.warehouses}
            onCreateWarehouse={openWarehouseModal}
            canCreate={canEditInventory}
          />

          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: spacing.sm,
                marginBottom: spacing.md,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>ניהול קליטת מלאי</h3>
                <p style={{ margin: 0, color: muted, fontSize: 13 }}>
                  פתיחת תעודת קליטה חדשה או צפייה בתעודות קיימות
                </p>
              </div>
              <div style={{ display: "flex", gap: spacing.sm }}>
                <Button
                  onClick={openInventoryModal}
                  disabled={!canEditInventory}
                >
                  + קליטת מלאי חדשה
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => openHistoryModal(null)}
                >
                  היסטוריית תעודות
                </Button>
              </div>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>תעודות אחרונות (נתוני הדגמה)</strong>
                <Button
                  variant="secondary"
                  onClick={() => openHistoryModal(null)}
                >
                  הצג הכל
                </Button>
              </div>
              <div style={{ marginTop: spacing.sm }}>
                {historyEntries.length === 0 ? (
                  <div
                    style={{
                      padding: px(spacing.md),
                      textAlign: "center",
                      color: muted,
                    }}
                  >
                    טרם נקלטו תעודות במערכת.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>תעודה</th>
                        <th style={tableHeaderStyle}>תאריך</th>
                        <th style={tableHeaderStyle}>ספק</th>
                        <th style={tableHeaderStyle}>פריטים</th>
                        <th style={tableHeaderStyle}>סטטוס</th>
                        <th style={tableHeaderStyle}>פעולה</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td style={tableCellStyle}>{entry.document_code}</td>
                          <td style={tableCellStyle}>
                            {formatDate(entry.receipt_date)}
                          </td>
                          <td style={tableCellStyle}>
                            {entry.supplier_name || "—"}
                          </td>
                          <td style={tableCellStyle}>{entry.total_items}</td>
                          <td style={tableCellStyle}>{entry.status}</td>
                          <td style={tableCellStyle}>
                            <Button
                              variant="secondary"
                              onClick={() => openHistoryModal(entry)}
                              aria-label="צפייה בתעודה"
                            >
                              👁️
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === "structure" && (
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>ניהול משפחות וקטגוריות</h3>
              <p style={{ margin: 0, color: muted, fontSize: 13 }}>
                לא ניתן למחוק או לעדכן מבנים אליהם מקושרים פריטים פעילים
              </p>
            </div>
            <div style={{ display: "flex", gap: spacing.sm }}>
              <Button
                variant="secondary"
                onClick={() => openStructureModal("family")}
                disabled={!canEditStructure}
              >
                משפחה חדשה
              </Button>
              <Button
                onClick={() => openStructureModal("category")}
                disabled={!canEditStructure}
              >
                קטגוריה חדשה
              </Button>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 8px 0" }}>משפחות קיימות</h4>
              <div
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.card,
                  maxHeight: 260,
                  overflowY: "auto",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>קוד</th>
                      <th style={tableHeaderStyle}>שם</th>
                      <th style={tableHeaderStyle}>פריטים</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familiesWithCounts.map((family) => (
                      <tr key={family.code}>
                        <td style={tableCellStyle}>{family.code}</td>
                        <td style={tableCellStyle}>{family.name}</td>
                        <td style={tableCellStyle}>{family.itemCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 style={{ margin: "0 0 8px 0" }}>קטגוריות קיימות</h4>
              <div
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.card,
                  maxHeight: 260,
                  overflowY: "auto",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>משפחה</th>
                      <th style={tableHeaderStyle}>קוד</th>
                      <th style={tableHeaderStyle}>שם</th>
                      <th style={tableHeaderStyle}>פריטים</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriesWithCounts.map((category) => (
                      <tr key={`${category.family_code}-${category.code}`}>
                        <td style={tableCellStyle}>{category.family_code}</td>
                        <td style={tableCellStyle}>{category.code}</td>
                        <td style={tableCellStyle}>{category.name}</td>
                        <td style={tableCellStyle}>{category.itemCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Modal
        open={showInventoryModal}
        onClose={closeInventoryModal}
        width="min(820px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>קליטת מלאי חדשה</h3>
          <Button variant="secondary" onClick={addReceiptLine}>
            + שורה חדשה
          </Button>
        </div>
        <p style={{ marginTop: spacing.xs, color: muted, fontSize: 13 }}>
          הזן את שורות הקליטה, כולל מחסן, ספק וכמות. החיבור למסד יתבצע בשלב הבא.
        </p>
        {!activeWarehouses.length && (
          <div
            style={{
              marginTop: spacing.sm,
              padding: px(spacing.sm),
              borderRadius: radii.card,
              background: colors.primarySoft,
              color: colors.warning,
              textAlign: "center",
            }}
          >
            כדי לקלוט מלאי יש ליצור לפחות מחסן פעיל. לחץ על &quot;+ מחסן
            חדש&quot; בחלק המחסנים.
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing.md,
            marginTop: spacing.md,
          }}
        >
          {receiptLines.map((line, index) => (
            <div
              key={`receipt-modal-line-${index}`}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radii.card,
                padding: px(spacing.md),
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: spacing.sm,
              }}
            >
              <select
                style={inputStyle}
                value={line.item_id}
                onChange={(e) =>
                  handleReceiptLineChange(index, "item_id", e.target.value)
                }
              >
                <option value="">בחר פריט</option>
                {data.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.internal_sku} · {item.name}
                  </option>
                ))}
              </select>
              <select
                style={inputStyle}
                value={line.warehouse_id}
                onChange={(e) =>
                  handleReceiptLineChange(index, "warehouse_id", e.target.value)
                }
                disabled={!activeWarehouses.length}
              >
                <option value="">בחר מחסן</option>
                {activeWarehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} · {warehouse.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                style={inputStyle}
                placeholder="כמות"
                value={line.quantity}
                onChange={(e) =>
                  handleReceiptLineChange(index, "quantity", e.target.value)
                }
              />
              <input
                type="number"
                min="0"
                step="0.01"
                style={inputStyle}
                placeholder="עלות ליחידה"
                value={line.unit_cost}
                onChange={(e) =>
                  handleReceiptLineChange(index, "unit_cost", e.target.value)
                }
              />
              <input
                type="text"
                style={inputStyle}
                placeholder="מספר ספק"
                value={line.supplier_identifier}
                onChange={(e) =>
                  handleReceiptLineChange(
                    index,
                    "supplier_identifier",
                    e.target.value
                  )
                }
              />
              <Button
                variant="secondary"
                onClick={() => removeReceiptLine(index)}
                disabled={receiptLines.length === 1}
              >
                ✖ הסר
              </Button>
            </div>
          ))}
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            placeholder="הערות לתעודה"
            value={inventoryNote}
            onChange={(e) => setInventoryNote(e.target.value)}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: spacing.sm,
            }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setReceiptLines([createEmptyReceiptLine()]);
                setInventoryNote("");
              }}
            >
              ניקוי טופס
            </Button>
            <Button onClick={handleInventorySubmit}>שמור קליטה</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showWarehouseModal}
        onClose={closeWarehouseModal}
        width="min(760px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ marginTop: 0, fontSize: 20, fontWeight: 800 }}>
          מחסן חדש
        </h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>קוד*</label>
              <input
                type="text"
                maxLength={20}
                style={inputStyle}
                value={warehouseForm.code}
                onChange={(e) =>
                  handleWarehouseChange("code", e.target.value.toUpperCase())
                }
              />
            </div>
            <div>
              <label style={labelStyle}>שם*</label>
              <input
                type="text"
                style={inputStyle}
                value={warehouseForm.name}
                onChange={(e) => handleWarehouseChange("name", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>עיר</label>
              <input
                type="text"
                style={inputStyle}
                value={warehouseForm.city}
                onChange={(e) => handleWarehouseChange("city", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>רחוב וכתובת</label>
              <input
                type="text"
                style={inputStyle}
                value={warehouseForm.address_line}
                onChange={(e) =>
                  handleWarehouseChange("address_line", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>מיקוד</label>
              <input
                type="text"
                style={inputStyle}
                value={warehouseForm.postal_code}
                onChange={(e) =>
                  handleWarehouseChange("postal_code", e.target.value)
                }
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>מנהל המחסן</label>
              <input
                type="text"
                style={inputStyle}
                value={warehouseForm.manager_name}
                onChange={(e) =>
                  handleWarehouseChange("manager_name", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>טלפון מנהל</label>
              <input
                type="text"
                style={inputStyle}
                value={warehouseForm.manager_phone}
                onChange={(e) =>
                  handleWarehouseChange("manager_phone", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>אימייל מנהל</label>
              <input
                type="email"
                style={inputStyle}
                value={warehouseForm.manager_email}
                onChange={(e) =>
                  handleWarehouseChange("manager_email", e.target.value)
                }
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>איש קשר נוסף</label>
              <input
                type="text"
                style={inputStyle}
                value={warehouseForm.contact_name}
                onChange={(e) =>
                  handleWarehouseChange("contact_name", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>טלפון איש קשר</label>
              <input
                type="text"
                style={inputStyle}
                value={warehouseForm.contact_phone}
                onChange={(e) =>
                  handleWarehouseChange("contact_phone", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>עלות שכירות (חודשי)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                style={inputStyle}
                value={warehouseForm.rent_cost}
                onChange={(e) =>
                  handleWarehouseChange("rent_cost", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>מטבע</label>
              <input
                type="text"
                maxLength={3}
                style={inputStyle}
                value={warehouseForm.rent_currency}
                onChange={(e) =>
                  handleWarehouseChange(
                    "rent_currency",
                    e.target.value.toUpperCase()
                  )
                }
              />
            </div>
            <div>
              <label style={labelStyle}>תום חוזה שכירות</label>
              <input
                type="date"
                style={inputStyle}
                value={warehouseForm.rent_expiry}
                onChange={(e) =>
                  handleWarehouseChange("rent_expiry", e.target.value)
                }
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>הערות חוזה / מסמכים</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80 }}
                value={warehouseForm.lease_notes}
                onChange={(e) =>
                  handleWarehouseChange("lease_notes", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>הערות כלליות</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80 }}
                value={warehouseForm.general_notes}
                onChange={(e) =>
                  handleWarehouseChange("general_notes", e.target.value)
                }
              />
            </div>
          </div>

          <label
            style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
          >
            <input
              type="checkbox"
              checked={warehouseForm.is_active}
              onChange={(e) =>
                handleWarehouseChange("is_active", e.target.checked)
              }
            />
            מחסן פעיל
          </label>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: spacing.sm,
            }}
          >
            <Button variant="secondary" onClick={closeWarehouseModal}>
              ביטול
            </Button>
            <Button
              onClick={handleWarehouseSubmit}
              disabled={warehouseSubmitting}
            >
              {warehouseSubmitting ? "שומר..." : "שמור מחסן"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showHistoryModal}
        onClose={closeHistoryModal}
        width="min(720px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>היסטוריית תעודות</h3>
          <Button variant="secondary" onClick={closeHistoryModal}>
            ✖ סגור
          </Button>
        </div>
        {selectedReceipt ? (
          <div
            style={{
              marginTop: spacing.md,
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: muted }}>מספר תעודה</div>
              <strong>{selectedReceipt.document_code}</strong>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: spacing.md,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: muted }}>תאריך</div>
                <div>{formatDate(selectedReceipt.receipt_date)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>ספק</div>
                <div>{selectedReceipt.supplier_name || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
                <div>{selectedReceipt.status}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>מספר פריטים</div>
                <div>{selectedReceipt.total_items}</div>
              </div>
            </div>
            <div
              style={{
                marginTop: spacing.md,
                padding: px(spacing.md),
                borderRadius: radii.card,
                background: colors.surfaceAlt,
                color: muted,
              }}
            >
              פירוט תעודה יגיע מחיבור המסד (בקרוב).
            </div>
          </div>
        ) : (
          <div style={{ marginTop: spacing.md }}>
            {historyEntries.length === 0 ? (
              <div
                style={{
                  padding: px(spacing.md),
                  textAlign: "center",
                  color: muted,
                }}
              >
                אין תעודות להצגה.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>תעודה</th>
                    <th style={tableHeaderStyle}>תאריך</th>
                    <th style={tableHeaderStyle}>ספק</th>
                    <th style={tableHeaderStyle}>פריטים</th>
                    <th style={tableHeaderStyle}>סטטוס</th>
                    <th style={tableHeaderStyle}>פעולה</th>
                  </tr>
                </thead>
                <tbody>
                  {historyEntries.map((entry) => (
                    <tr key={`modal-history-${entry.id}`}>
                      <td style={tableCellStyle}>{entry.document_code}</td>
                      <td style={tableCellStyle}>
                        {formatDate(entry.receipt_date)}
                      </td>
                      <td style={tableCellStyle}>
                        {entry.supplier_name || "—"}
                      </td>
                      <td style={tableCellStyle}>{entry.total_items}</td>
                      <td style={tableCellStyle}>{entry.status}</td>
                      <td style={tableCellStyle}>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedReceipt(entry)}
                        >
                          👁️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={showStructureModal}
        onClose={closeStructureModal}
        width="min(820px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>
            {structureModalMode === "family" ? "משפחה חדשה" : "קטגוריה חדשה"}
          </h3>
          <div style={{ display: "flex", gap: spacing.xs }}>
            <Button
              variant={
                structureModalMode === "family" ? "primary" : "secondary"
              }
              onClick={() => openStructureModal("family")}
            >
              משפחה
            </Button>
            <Button
              variant={
                structureModalMode === "category" ? "primary" : "secondary"
              }
              onClick={() => openStructureModal("category")}
            >
              קטגוריה
            </Button>
          </div>
        </div>
        <div
          style={{
            marginTop: spacing.md,
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) minmax(260px, 1fr)",
            gap: spacing.md,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            {structureModalMode === "category" && (
              <div>
                <label style={labelStyle}>משפחה קיימת*</label>
                <select
                  style={inputStyle}
                  value={structureForm.family_code}
                  onChange={(e) =>
                    handleStructureChange("family_code", e.target.value)
                  }
                >
                  <option value="">בחר משפחה</option>
                  {familiesWithCounts.map((family) => (
                    <option
                      key={`structure-family-${family.code}`}
                      value={family.code}
                    >
                      {family.code} · {family.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={labelStyle}>קוד*</label>
              <input
                type="text"
                maxLength={2}
                style={inputStyle}
                value={structureForm.code}
                onChange={(e) =>
                  handleStructureChange("code", e.target.value.toUpperCase())
                }
              />
            </div>
            <div>
              <label style={labelStyle}>שם*</label>
              <input
                type="text"
                style={inputStyle}
                value={structureForm.name}
                onChange={(e) => handleStructureChange("name", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>תיאור</label>
              <textarea
                style={{ ...inputStyle, minHeight: 70 }}
                value={structureForm.description}
                onChange={(e) =>
                  handleStructureChange("description", e.target.value)
                }
              />
            </div>
            {structureModalMode === "family" ? (
              <>
                <div>
                  <label style={labelStyle}>סוג ציוד</label>
                  <select
                    style={inputStyle}
                    value={structureForm.equipment_type}
                    onChange={(e) =>
                      handleStructureChange(
                        "equipment_type",
                        e.target.value as StructureFormState["equipment_type"]
                      )
                    }
                  >
                    <option value="sea">ציוד ים</option>
                    <option value="support">ציוד מסייע</option>
                  </select>
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.xs,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={structureForm.allow_item_images}
                    onChange={(e) =>
                      handleStructureChange(
                        "allow_item_images",
                        e.target.checked
                      )
                    }
                  />
                  לאפשר תמונות ברמת משפחה
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.xs,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={structureForm.allow_consumables}
                    onChange={(e) =>
                      handleStructureChange(
                        "allow_consumables",
                        e.target.checked
                      )
                    }
                  />
                  לאפשר סימון מתכלה כברירת מחדל
                </label>
              </>
            ) : (
              <>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.xs,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={structureForm.enforce_sku}
                    onChange={(e) =>
                      handleStructureChange("enforce_sku", e.target.checked)
                    }
                  />
                  חובה על מק״ט יצרן
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.xs,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={structureForm.require_image}
                    onChange={(e) =>
                      handleStructureChange("require_image", e.target.checked)
                    }
                  />
                  דרישת תמונה לפריטים
                </label>
              </>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: spacing.sm,
                marginTop: spacing.sm,
              }}
            >
              <Button variant="secondary" onClick={closeStructureModal}>
                ביטול
              </Button>
              <Button
                onClick={handleStructureSubmit}
                disabled={structureSubmitting}
              >
                {structureSubmitting ? "שומר..." : "שמור"}
              </Button>
            </div>
          </div>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: radii.card,
              padding: px(spacing.md),
            }}
          >
            <strong>מצב קיים</strong>
            <p style={{ marginTop: spacing.xs, color: muted, fontSize: 13 }}>
              סקירה מהירה של המבנים כולל ספירת פריטים.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.sm,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: muted }}>משפחות</div>
                <ul style={{ margin: 0, paddingInlineStart: spacing.lg }}>
                  {familiesWithCounts.slice(0, 5).map((family) => (
                    <li key={`structure-side-family-${family.code}`}>
                      {family.code} · {family.name} ({family.itemCount})
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>קטגוריות</div>
                <ul style={{ margin: 0, paddingInlineStart: spacing.lg }}>
                  {categoriesWithCounts.slice(0, 5).map((category) => (
                    <li
                      key={`structure-side-category-${category.family_code}-${category.code}`}
                    >
                      {category.family_code}/{category.code} · {category.name} (
                      {category.itemCount})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        width="min(720px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ marginTop: 0, fontSize: 20, fontWeight: 800 }}>
          {editingItem ? "עריכת פריט ציוד" : "פריט ציוד חדש"}
        </h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>משפחה*</label>
              <select
                style={inputStyle}
                value={formState.family_code}
                onChange={(e) =>
                  handleFormChange("family_code", e.target.value)
                }
              >
                <option value="">בחר משפחה</option>
                {data.families.map((family) => (
                  <option key={family.code} value={family.code}>
                    {family.code} · {family.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>קטגוריה*</label>
              <select
                style={inputStyle}
                value={formState.category_code}
                onChange={(e) =>
                  handleFormChange("category_code", e.target.value)
                }
              >
                <option value="">בחר קטגוריה</option>
                {formCategories.map((category) => (
                  <option
                    key={`${category.family_code}-${category.code}`}
                    value={category.code}
                  >
                    {category.code} · {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>שם הפריט*</label>
            <input
              type="text"
              style={inputStyle}
              value={formState.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              placeholder="למשל: גלשן פאן 8'"
            />
          </div>
          <div>
            <label style={labelStyle}>תיאור</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              value={formState.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              placeholder="מידע נוסף על הפריט..."
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>מצב</label>
              <select
                style={inputStyle}
                value={formState.condition}
                onChange={(e) => handleFormChange("condition", e.target.value)}
              >
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>מקט יצרן</label>
              <input
                type="text"
                style={inputStyle}
                value={formState.manufacturer_sku}
                onChange={(e) =>
                  handleFormChange("manufacturer_sku", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>שם יצרן</label>
              <input
                type="text"
                style={inputStyle}
                value={formState.manufacturer_name}
                onChange={(e) =>
                  handleFormChange("manufacturer_name", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>עלות רכישה</label>
              <input
                type="number"
                min="0"
                step="0.01"
                style={inputStyle}
                value={formState.purchase_cost}
                onChange={(e) =>
                  handleFormChange("purchase_cost", e.target.value)
                }
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: spacing.md,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.card,
              padding: px(spacing.md),
            }}
          >
            <label
              style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
            >
              <input
                type="checkbox"
                checked={formState.is_consumable}
                onChange={(e) =>
                  handleFormChange("is_consumable", e.target.checked)
                }
              />
              פריט מתכלה
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
            >
              <input
                type="checkbox"
                checked={formState.is_sku_tracked}
                onChange={(e) =>
                  handleFormChange("is_sku_tracked", e.target.checked)
                }
              />
              מנוהל לפי מק״ט ייחודי
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
            >
              <input
                type="checkbox"
                checked={formState.is_rental}
                onChange={(e) =>
                  handleFormChange("is_rental", e.target.checked)
                }
              />
              ציוד בהשכרה
            </label>
            {formState.is_rental && (
              <input
                type="date"
                style={inputStyle}
                value={formState.rental_expiry}
                onChange={(e) =>
                  handleFormChange("rental_expiry", e.target.value)
                }
              />
            )}
          </div>
          {!formState.is_sku_tracked && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: spacing.md,
              }}
            >
              <div>
                <label style={labelStyle}>מלאי מינימלי</label>
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={formState.min_stock}
                  onChange={(e) =>
                    handleFormChange("min_stock", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>מלאי מקסימלי</label>
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={formState.max_stock}
                  onChange={(e) =>
                    handleFormChange("max_stock", e.target.value)
                  }
                />
              </div>
            </div>
          )}
          <div>
            <label style={labelStyle}>קישור לתמונה / מסמך</label>
            <input
              type="url"
              style={inputStyle}
              value={formState.default_image_url}
              onChange={(e) =>
                handleFormChange("default_image_url", e.target.value)
              }
            />
          </div>
          <div>
            <label style={labelStyle}>הערות</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              value={formState.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: spacing.sm,
            }}
          >
            <Button variant="secondary" onClick={() => setShowFormModal(false)}>
              ביטול
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "שומר..." : editingItem ? "עדכן" : "צור פריט"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showViewModal && !!viewingItem}
        onClose={closeViewModal}
        width="min(720px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingItem && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{viewingItem.name}</h3>
                <div style={{ color: muted, fontSize: 13 }}>
                  SKU פנימי: {viewingItem.internal_sku || "—"}
                </div>
              </div>
              <Button variant="secondary" onClick={closeViewModal}>
                ✖ סגור
              </Button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: spacing.md,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: muted }}>משפחה</div>
                <div>{viewingItem.family_name || viewingItem.family_code}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>קטגוריה</div>
                <div>
                  {viewingItem.category_name || viewingItem.category_code}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>מצב</div>
                <span
                  style={badgeStyle(
                    conditionBadgeMap[viewingItem.condition]?.background ||
                      colors.borderMuted,
                    conditionBadgeMap[viewingItem.condition]?.color ||
                      colors.textPrimary
                  )}
                >
                  {getConditionLabel(viewingItem.condition)}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>סוג ציוד</div>
                <div>
                  {EQUIPMENT_TYPE_LABELS[viewingItem.equipment_type] ||
                    viewingItem.equipment_type}
                </div>
              </div>
            </div>
            <div
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radii.card,
                padding: px(spacing.md),
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: spacing.xs }}>
                מלאי לפי מחסן
              </div>
              {(!viewingItem.warehouse_stock ||
                viewingItem.warehouse_stock.length === 0) && (
                <div style={{ color: muted }}>אין נתוני מלאי זמינים</div>
              )}
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: spacing.xs }}
              >
                {(viewingItem.warehouse_stock || []).map((stock) => (
                  <span
                    key={stock.warehouse_id}
                    style={badgeStyle(colors.surfaceAlt, colors.textPrimary)}
                  >
                    {stock.warehouse_name}: {formatNumber(stock.quantity, "0")}
                  </span>
                ))}
              </div>
            </div>
            {viewingItem.notes && (
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: muted,
                    marginBottom: spacing.xs,
                  }}
                >
                  הערות
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {viewingItem.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
