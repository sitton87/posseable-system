"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  EquipmentItem,
  EquipmentFamily,
  EquipmentCategory,
  Warehouse,
} from "@/type";
import { Card, Text } from "@tremor/react";
import { AccessDenied } from "@/app/components/AccessDenied";
import { usePagePermission } from "@/app/hooks/usePagePermission";
import { useDraftManager } from "@/app/hooks/useDraftManager";
import { tw, cssVar, numericValues } from "@/app/styles/design-system";
import { CatalogTab } from "./tabs/CatalogTab";
import { HomeTab } from "./tabs/HomeTab";
import { InventoryTab } from "./tabs/InventoryTab";
import { StructureTab } from "./tabs/StructureTab";
import DocumentDraftPrompt from "./modals/DocumentDraftPrompt";
import EquipmentDraftPrompt from "./modals/EquipmentDraftPrompt";
import { EquipmentFormModal } from "./modals/EquipmentFormModal";
import { InventoryDocumentModal } from "./modals/InventoryDocumentModal";
import { InventoryDocumentDetailModal } from "./modals/InventoryDocumentDetailModal";
import { WarehouseModal } from "./modals/WarehouseModal";
import { StructureModal } from "./modals/StructureModal";
import { ViewItemModal } from "./modals/ViewItemModal";
import { WarehouseInventoryModal } from "./modals/WarehouseInventoryModal";
import type {
  EquipmentFormState,
  EquipmentPageData,
  FiltersState,
  InventoryDocumentDetail,
  InventoryDocumentFormState,
  InventoryDocumentSummary,
  StructureFormState,
  WarehouseFormState,
  WarehouseStockEntry,
} from "./types";
import {
  createEmptyFormState,
  createEmptyInventoryDocumentForm,
  createEmptyInventoryDocumentLine,
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

const createDefaultFilters = (): FiltersState => ({
  search: "",
  family: "",
  category: "",
  type: "",
  condition: "",
  status: "active",
});

const generateDraftId = (prefix: string) => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const cloneEquipmentState = (state: EquipmentFormState) =>
  JSON.parse(JSON.stringify(state)) as EquipmentFormState;

const cloneDocumentState = (state: InventoryDocumentFormState) =>
  JSON.parse(JSON.stringify(state)) as InventoryDocumentFormState;

const areDocumentStatesEqual = (
  a: InventoryDocumentFormState | null,
  b: InventoryDocumentFormState | null
) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

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
    donors: [],
  });
  const [filters, setFilters] = useState<FiltersState>(createDefaultFilters());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formState, setFormState] = useState<EquipmentFormState>(
    createEmptyFormState()
  );
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [viewingItem, setViewingItem] = useState<EquipmentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [documentSubmitting, setDocumentSubmitting] = useState(false);
  const [inventoryDocuments, setInventoryDocuments] = useState<
    InventoryDocumentSummary[]
  >([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentDetail, setDocumentDetail] =
    useState<InventoryDocumentDetail | null>(null);
  const [documentDetailOpen, setDocumentDetailOpen] = useState(false);
  const [documentDetailLoading, setDocumentDetailLoading] = useState(false);
  const [documentFormState, setDocumentFormState] =
    useState<InventoryDocumentFormState>(createEmptyInventoryDocumentForm());
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(
    null
  );
  const [editingDocumentNumber, setEditingDocumentNumber] =
    useState<number | null>(null);
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
  const {
    drafts: equipmentDrafts,
    saveDraft: saveEquipmentDraft,
    deleteDraft: deleteEquipmentDraft,
  } = useDraftManager<EquipmentFormState>("equipmentItem");
  const {
    drafts: documentDrafts,
    saveDraft: saveDocumentDraft,
    deleteDraft: deleteDocumentDraft,
  } = useDraftManager<InventoryDocumentFormState>("inventoryDocument");
  const [equipmentFormDirty, setEquipmentFormDirty] = useState(false);
  const [equipmentDraftPromptOpen, setEquipmentDraftPromptOpen] =
    useState(false);
  const [currentEquipmentDraftId, setCurrentEquipmentDraftId] = useState<
    string | null
  >(null);
  const [documentFormDirty, setDocumentFormDirty] = useState(false);
  const [documentDraftPromptOpen, setDocumentDraftPromptOpen] =
    useState(false);
  const [currentDocumentDraftId, setCurrentDocumentDraftId] = useState<
    string | null
  >(null);
  const documentBaseStateRef = useRef<InventoryDocumentFormState | null>(null);
  const documentCurrentStateRef = useRef<InventoryDocumentFormState | null>(
    null
  );
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

  const loadInventoryDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      const res = await fetch("/api/inventory/documents");
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "שגיאה בטעינת תעודות מלאי");
      }
      const payload = await res.json();
      setInventoryDocuments(payload.documents || []);
    } catch (err) {
      console.error("Error loading inventory documents:", err);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const loadInventoryDocumentDetail = useCallback(
    async (documentId: string, options?: { skipState?: boolean }) => {
      const shouldUpdateState = !options?.skipState;
      if (shouldUpdateState) {
        setDocumentDetailLoading(true);
        setDocumentDetail(null);
      }
      try {
        const params = new URLSearchParams({ id: documentId });
        const res = await fetch(`/api/inventory/documents?${params.toString()}`);
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "שגיאה בטעינת תעודה");
        }
        const payload = await res.json();
        if (shouldUpdateState) {
          setDocumentDetail(payload.document);
        }
        return payload.document as InventoryDocumentDetail;
      } finally {
        if (shouldUpdateState) {
          setDocumentDetailLoading(false);
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
      <div className="p-ds-spacing-6">
        <Card>
          <Text className="text-center py-4" style={{ color: cssVar.text.muted }}>
            טוען הרשאות...
          </Text>
        </Card>
      </div>
    );
  }

  if (!availableTabs.length) {
    return (
      <div className="p-ds-spacing-6">
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
        donors: payload.donors || [],
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
      loadInventoryDocuments();
      return;
    }
    if (activeTab === "home" && inventoryDocuments.length === 0) {
      loadInventoryDocuments();
    }
  }, [activeTab, inventoryDocuments.length, loadInventoryDocuments]);

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

  const handleFilterChange = (
    key: keyof FiltersState,
    value: FiltersState[typeof key]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(createDefaultFilters());
  };

  const openStructureModal = async (mode: "family" | "category") => {
    setStructureModalMode(mode);
    const nextForm = {
      ...createEmptyStructureFormState(),
      entityType: mode,
    };
    setStructureForm(nextForm);
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

  const applyDocumentFormState = useCallback(
    (
      nextState: InventoryDocumentFormState,
      options?: {
        draftId?: string | null;
        editingId?: string | null;
        editingNumber?: number | null;
      }
    ) => {
      const cloned = cloneDocumentState(nextState);
      setDocumentFormState(cloned);
      documentBaseStateRef.current = cloneDocumentState(cloned);
      documentCurrentStateRef.current = cloneDocumentState(cloned);
      setDocumentFormDirty(false);
      setCurrentDocumentDraftId(options?.draftId ?? null);
      setEditingDocumentId(options?.editingId ?? null);
      setEditingDocumentNumber(options?.editingNumber ?? null);
    },
    []
  );

  const openDocumentModal = () => {
    applyDocumentFormState(createEmptyInventoryDocumentForm(), {
      draftId: null,
      editingId: null,
      editingNumber: null,
    });
    setDocumentDraftPromptOpen(false);
    setDocumentModalOpen(true);
  };

  const closeDocumentModal = () => {
    setDocumentModalOpen(false);
    setDocumentFormDirty(false);
    setCurrentDocumentDraftId(null);
    setEditingDocumentId(null);
    setEditingDocumentNumber(null);
    setDocumentFormState(createEmptyInventoryDocumentForm());
    documentBaseStateRef.current = null;
    documentCurrentStateRef.current = null;
    setDocumentDraftPromptOpen(false);
  };

  const closeDocumentDetailModal = () => {
    setDocumentDetailOpen(false);
    setDocumentDetail(null);
  };

  const requestCloseDocumentModal = () => {
    if (documentFormDirty) {
      setDocumentDraftPromptOpen(true);
      return;
    }
    closeDocumentModal();
  };

  const handleSaveDocumentDraft = () => {
    const current =
      documentCurrentStateRef.current || cloneDocumentState(documentFormState);
    const draftId = currentDocumentDraftId || generateDraftId("doc");
    saveDocumentDraft(draftId, cloneDocumentState(current));
    setCurrentDocumentDraftId(draftId);
    setDocumentDraftPromptOpen(false);
    setDocumentFormDirty(false);
    closeDocumentModal();
  };

  const handleDiscardDocumentDraft = () => {
    setDocumentDraftPromptOpen(false);
    setDocumentFormDirty(false);
    closeDocumentModal();
  };

  const handleDismissDocumentPrompt = () => {
    setDocumentDraftPromptOpen(false);
  };

  const handleResumeDocumentDraft = (draftId: string) => {
    const draft = documentDrafts.find((entry) => entry.id === draftId);
    if (!draft) return;
    applyDocumentFormState(draft.payload, { draftId });
    setDocumentDraftPromptOpen(false);
    setDocumentModalOpen(true);
  };

  const handleDeleteDocumentDraft = (draftId: string) => {
    deleteDocumentDraft(draftId);
    if (currentDocumentDraftId === draftId) {
      setCurrentDocumentDraftId(null);
    }
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
    setCurrentEquipmentDraftId(null);
    setEquipmentFormDirty(false);
    setEquipmentDraftPromptOpen(false);
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
    setEquipmentFormDirty(false);
    setCurrentEquipmentDraftId(null);
    setEquipmentDraftPromptOpen(false);
  };

  const closeEquipmentModal = () => {
    setShowFormModal(false);
    setEditingItem(null);
    setFormState(createEmptyFormState());
    setEquipmentFormDirty(false);
    setCurrentEquipmentDraftId(null);
    setEquipmentDraftPromptOpen(false);
  };

  const requestCloseEquipmentModal = () => {
    if (equipmentFormDirty) {
      setEquipmentDraftPromptOpen(true);
      return;
    }
    closeEquipmentModal();
  };

  const handleSaveEquipmentDraft = () => {
    const draftId =
      currentEquipmentDraftId || editingItem?.id || generateDraftId("item");
    saveEquipmentDraft(draftId, cloneEquipmentState(formState));
    setCurrentEquipmentDraftId(draftId);
    setEquipmentDraftPromptOpen(false);
    setEquipmentFormDirty(false);
    closeEquipmentModal();
  };

  const handleDiscardEquipmentDraft = () => {
    setEquipmentDraftPromptOpen(false);
    setEquipmentFormDirty(false);
    closeEquipmentModal();
  };

  const handleDismissEquipmentPrompt = () => {
    setEquipmentDraftPromptOpen(false);
  };

  const handleResumeEquipmentDraft = (draftId: string) => {
    const draft = equipmentDrafts.find((entry) => entry.id === draftId);
    if (!draft) return;
    setFormState(cloneEquipmentState(draft.payload));
    setEditingItem(null);
    setCurrentEquipmentDraftId(draftId);
    setEquipmentFormDirty(false);
    setEquipmentDraftPromptOpen(false);
    setShowFormModal(true);
  };

  const handleDeleteEquipmentDraft = (draftId: string) => {
    deleteEquipmentDraft(draftId);
    if (currentEquipmentDraftId === draftId) {
      setCurrentEquipmentDraftId(null);
    }
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
    setEquipmentFormDirty(true);
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

  const handleViewInventoryDocument = useCallback(
    async (documentId: string) => {
      setDocumentDetailOpen(true);
      try {
        await loadInventoryDocumentDetail(documentId);
      } catch (err: any) {
        console.error("Error loading inventory document detail:", err);
        alert(err?.message || "שגיאה בטעינת התעודה");
        setDocumentDetailOpen(false);
      }
    },
    [loadInventoryDocumentDetail]
  );

  const handleDocumentStateChange = useCallback(
    (state: InventoryDocumentFormState) => {
      const snapshot = cloneDocumentState(state);
      documentCurrentStateRef.current = snapshot;
      const baseSnapshot = documentBaseStateRef.current;
      setDocumentFormDirty(!areDocumentStatesEqual(baseSnapshot, snapshot));
    },
    []
  );

  const handleSubmitInventoryDocument = useCallback(
    async (
      form: InventoryDocumentFormState,
      options?: { documentId?: string | null }
    ) => {
      const actionType = form.action_type;
      const editingId = options?.documentId ?? null;

      if (actionType === "RECEIPT" && !form.supplier_identifier) {
        alert("בקליטת ספק יש לבחור ספק.");
        return;
      }
      if (actionType === "DONATION" && !form.donor_national_id) {
        alert("יש לבחור תורם לתעודת תרומה.");
        return;
      }

      const sanitizedLines = form.lines
        .map((line) => {
          let quantity = Number(line.quantity);
          if (!line.item_id || Number.isNaN(quantity) || quantity === 0) {
            return null;
          }

          const trimmedSource = line.source_warehouse_id?.trim() || "";
          const trimmedTarget = line.target_warehouse_id?.trim() || "";
          const supplierDoc =
            line.supplier_document_number?.trim() || null;

          let sourceWarehouse: string | null = null;
          let targetWarehouse: string | null = null;

          if (actionType === "TRANSFER") {
            sourceWarehouse = trimmedSource || null;
            targetWarehouse = trimmedTarget || null;
            if (!sourceWarehouse || !targetWarehouse) {
              return null;
            }
          } else if (actionType === "DISPOSAL") {
            sourceWarehouse = trimmedTarget || null;
            if (!sourceWarehouse) {
              return null;
            }
          } else {
            targetWarehouse = trimmedTarget || null;
            if (!targetWarehouse) {
              return null;
            }
          }

          if (actionType === "STOCKTAKE_ADJUST") {
            const isDecrease = line.adjust_direction === "decrease";
            quantity = Math.abs(quantity) * (isDecrease ? -1 : 1);
          } else {
            quantity = Math.abs(quantity);
          }

          const includeSupplierDoc =
            actionType !== "TRANSFER" && actionType !== "STOCKTAKE_ADJUST";

          return {
          item_id: line.item_id,
            quantity,
            unit_cost: null,
            source_warehouse_id: sourceWarehouse,
            target_warehouse_id: targetWarehouse,
            supplier_document_number: includeSupplierDoc ? supplierDoc : null,
          };
        })
        .filter(
          (
            line
          ): line is {
            item_id: string;
            quantity: number;
            unit_cost: number | null;
            source_warehouse_id: string | null;
            target_warehouse_id: string | null;
            supplier_document_number: string | null;
          } => Boolean(line)
        );

      if (!sanitizedLines.length) {
        alert("יש להזין לפחות שורה אחת עם כמות תקינה.");
        return;
      }

      setDocumentSubmitting(true);
      try {
        const res = await fetch("/api/inventory/documents", {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action_type: form.action_type,
            supplier_identifier: form.supplier_identifier || undefined,
            donor_national_id:
              form.action_type === "DONATION"
                ? form.donor_national_id || undefined
                : undefined,
            supplier_document_type:
              form.action_type === "RECEIPT"
                ? form.supplier_document_type || undefined
                : undefined,
            notes: form.notes || undefined,
            external_party:
              form.action_type === "DISPOSAL"
                ? form.external_party || undefined
                : undefined,
            lines: sanitizedLines,
            document_id: editingId || undefined,
          }),
        });

        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "שגיאה בשמירת התעודה");
        }

        const draftId = currentDocumentDraftId;
        if (draftId) {
          deleteDocumentDraft(draftId);
          setCurrentDocumentDraftId(null);
        }
        closeDocumentModal();
        await Promise.all([fetchEquipment(), loadInventoryDocuments()]);
    } catch (err: any) {
        console.error("Error creating inventory document:", err);
        alert(err?.message || "שגיאה בשמירת התעודה");
      } finally {
        setDocumentSubmitting(false);
    }
    },
    [fetchEquipment, loadInventoryDocuments]
  );

  const mapDocumentDetailToForm = useCallback(
    (detail: InventoryDocumentDetail): InventoryDocumentFormState => {
      const base = createEmptyInventoryDocumentForm();
      base.action_type = detail.action_type;
      base.supplier_identifier = detail.supplier_identifier || "";
      base.supplier_document_type = detail.supplier_document_type || "";
      base.donor_national_id = detail.donor_national_id || "";
      base.external_party = detail.external_party || "";
      base.notes = detail.notes || "";
      base.lines =
        detail.lines && detail.lines.length
          ? detail.lines.map((line) => ({
              item_id: line.item_id,
              quantity: Math.abs(line.quantity).toString(),
              source_warehouse_id: line.source_warehouse_id || "",
              target_warehouse_id:
                detail.action_type === "DISPOSAL"
                  ? line.source_warehouse_id || ""
                  : line.target_warehouse_id || "",
              supplier_document_number: line.supplier_document_number || "",
              adjust_direction:
                detail.action_type === "STOCKTAKE_ADJUST" && line.quantity < 0
                  ? "decrease"
                  : "increase",
            }))
          : [createEmptyInventoryDocumentLine()];
      return base;
    },
    []
  );

  const handleEditInventoryDocument = useCallback(
    async (documentId: string) => {
      try {
        const detail = await loadInventoryDocumentDetail(documentId, {
          skipState: true,
        });
        const mapped = mapDocumentDetailToForm(detail);
        applyDocumentFormState(mapped, {
          draftId: null,
          editingId: documentId,
          editingNumber: detail.document_number,
        });
        setDocumentDraftPromptOpen(false);
        setDocumentModalOpen(true);
      } catch (err: any) {
        console.error("Error preparing document for edit:", err);
        alert(err?.message || "שגיאה בטעינת התעודה לעריכה");
      }
    },
    [applyDocumentFormState, loadInventoryDocumentDetail, mapDocumentDetailToForm]
  );

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

      const draftId = currentEquipmentDraftId;
      if (draftId) {
        deleteEquipmentDraft(draftId);
        setCurrentEquipmentDraftId(null);
      }
      closeEquipmentModal();
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
    if (normalizedCode && normalizedCode.length !== 2) {
      alert("קוד חייב להיות בן 2 תווים או להשאיר ריק ליצירה אוטומטית");
      return;
    }
    const trimmedName = structureForm.name.trim();
    if (!trimmedName) {
      alert("שם הוא שדה חובה");
      return;
    }

    const entityType = structureModalMode;
    let endpoint = "";
    let payload: Record<string, any> = {};

    if (entityType === "family") {
      payload = {
        code: normalizedCode.length === 2 ? normalizedCode : undefined,
        name: trimmedName,
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
        code: normalizedCode.length === 2 ? normalizedCode : undefined,
        name: trimmedName,
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
    if (isEditingWarehouse) {
    if (!code || code.length > 20) {
      alert("קוד המחסן נדרש (עד 20 תווים)");
        return;
      }
    } else if (code && code.length > 20) {
      alert("קוד המחסן חייב להיות עד 20 תווים");
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
      code: code || undefined,
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

  return (
    <div className="p-ds-spacing-6 flex flex-col gap-ds-spacing-5">
      {currentTabConfig &&
        (currentTabConfig.description || !activeTabPermission.canEdit) && (
        <Text className="text-sm" style={{ color: cssVar.text.muted }}>
          {currentTabConfig.description}
          {!activeTabPermission.canEdit && " · מצב קריאה בלבד"}
        </Text>
        )}

      {activeTab === "home" && (
        <HomeTab
          items={data.items}
          warehouses={data.warehouses}
          documents={inventoryDocuments}
          documentsLoading={documentsLoading}
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
          drafts={equipmentDrafts}
          onResumeDraft={handleResumeEquipmentDraft}
          onDeleteDraft={handleDeleteEquipmentDraft}
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
          documents={inventoryDocuments}
          documentsLoading={documentsLoading}
          canEdit={canEditInventory}
          drafts={documentDrafts}
          onResumeDraft={handleResumeDocumentDraft}
          onDeleteDraft={handleDeleteDocumentDraft}
          onOpenDocumentModal={openDocumentModal}
          onViewDocument={handleViewInventoryDocument}
          onEditDocument={handleEditInventoryDocument}
          onRefreshDocuments={loadInventoryDocuments}
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

      <InventoryDocumentModal
        open={documentModalOpen}
        onClose={requestCloseDocumentModal}
        submitting={documentSubmitting}
        items={data.items}
        warehouses={data.warehouses}
        suppliers={data.suppliers}
        donors={data.donors}
        initialState={documentFormState}
        editingDocumentId={editingDocumentId}
        editingDocumentNumber={editingDocumentNumber ?? undefined}
        onSubmit={handleSubmitInventoryDocument}
        onStateChange={handleDocumentStateChange}
        escEnabled={!documentDraftPromptOpen}
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

      <InventoryDocumentDetailModal
        open={documentDetailOpen}
        onClose={closeDocumentDetailModal}
        document={documentDetail}
        loading={documentDetailLoading}
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
        onClose={requestCloseEquipmentModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        formState={formState}
        formCategories={formCategories}
        families={data.families}
        editingItem={editingItem}
        canEdit={canEditCatalog}
        suppliers={data.suppliers}
        onChange={handleFormChange}
        escEnabled={!equipmentDraftPromptOpen}
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

      <EquipmentDraftPrompt
        open={equipmentDraftPromptOpen}
        onClose={handleDismissEquipmentPrompt}
        onSaveDraft={handleSaveEquipmentDraft}
        onDiscard={handleDiscardEquipmentDraft}
      />

      <DocumentDraftPrompt
        open={documentDraftPromptOpen}
        onClose={handleDismissDocumentPrompt}
        onSaveDraft={handleSaveDocumentDraft}
        onDiscard={handleDiscardDocumentDraft}
      />
    </div>
  );
}
