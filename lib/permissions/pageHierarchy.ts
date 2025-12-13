export type PageHierarchyNode = {
  key: string;
  label: string;
  path?: string;
  category?: string;
  children?: PageHierarchyNode[];
};

export const PAGE_HIERARCHY: PageHierarchyNode[] = [
  {
    key: "dashboard",
    label: "דף הבית",
    path: "/dashboard",
    category: "Main",
  },
  {
    key: "surfers",
    label: "גולשים",
    path: "/surfers",
    category: "People",
    children: [
      {
        key: "surfers-list",
        label: "רשימת גולשים",
        path: "/surfers",
        category: "People",
      },
      {
        key: "surfers-groups",
        label: "קבוצות",
        path: "/surfers",
        category: "People",
      },
      {
        key: "surfers-settings",
        label: "הגדרות גולשים",
        path: "/surfers",
        category: "People",
      },
    ],
  },
  {
    key: "volunteers",
    label: "צוות ומתנדבים",
    path: "/volunteers",
    category: "People",
    children: [
      {
        key: "volunteers-list",
        label: "רשימת צוות ומתנדבים",
        path: "/volunteers",
        category: "People",
      },
      {
        key: "volunteers-settings",
        label: "הגדרות מתנדבים",
        path: "/volunteers",
        category: "People",
      },
    ],
  },
  {
    key: "donors",
    label: "תורמים",
    path: "/donors",
    category: "People",
    children: [
      {
        key: "donors-list",
        label: "רשימת תורמים",
        path: "/donors",
        category: "People",
      },
    ],
  },
  {
    key: "suppliers",
    label: "ספקים",
    path: "/suppliers",
    category: "People",
    children: [
      {
        key: "suppliers-list",
        label: "רשימת ספקים",
        path: "/suppliers",
        category: "People",
      },
    ],
  },
  {
    key: "activities",
    label: "פעילויות",
    path: "/activities",
    category: "Activity",
  },
  {
    key: "seasons",
    label: "עונות",
    path: "/seasons",
    category: "Activity",
  },
  {
    key: "equipment",
    label: "ציוד",
    path: "/equipment",
    category: "Logistics",
    children: [
      {
        key: "equipment-catalog",
        label: "קטלוג ציוד",
        path: "/equipment",
        category: "Logistics",
      },
      {
        key: "equipment-inventory",
        label: "מלאי ומחסנים",
        path: "/equipment",
        category: "Logistics",
      },
      {
        key: "equipment-settings",
        label: "מבנה והגדרות",
        path: "/equipment",
        category: "Logistics",
      },
    ],
  },
  {
    key: "finance",
    label: "כספים",
    path: "/finance",
    category: "Admin",
  },
  {
    key: "system-settings",
    label: "הגדרות מערכת",
    path: "/system-settings",
    category: "Admin",
  },
];

export function flattenHierarchy(
  nodes: PageHierarchyNode[]
): PageHierarchyNode[] {
  let flat: PageHierarchyNode[] = [];
  for (const node of nodes) {
    flat.push(node);
    if (node.children) {
      flat = flat.concat(flattenHierarchy(node.children));
    }
  }
  return flat;
}
