/**
 * PosSEAble Design System - TypeScript Theme
 * ==========================================
 *
 * קובץ זה מספק:
 * 1. Type definitions לכל ה-tokens
 * 2. Constants לשימוש ב-TypeScript/JavaScript
 * 3. Helper functions ליצירת styles
 * 4. Tailwind class mappings לנוחות
 */

// ===================================================================
// TYPE DEFINITIONS
// ===================================================================

/** צבעי טקסט */
export type TextColor =
  | "primary"
  | "secondary"
  | "muted"
  | "subtle"
  | "inverted";

/** צבעי רקע */
export type BgColor = "primary" | "secondary" | "tertiary" | "hover" | "active";

/** צבעי מותג */
export type BrandColor =
  | "primary"
  | "hover"
  | "active"
  | "light"
  | "muted"
  | "text";

/** צבעים סמנטיים */
export type SemanticColor = "success" | "warning" | "danger" | "info";

/** גדלי פונט */
export type FontSize =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";

/** משקלי פונט */
export type FontWeight =
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";

/** גדלי ריווח */
export type Spacing =
  | "0"
  | "0.5"
  | "1"
  | "1.5"
  | "2"
  | "2.5"
  | "3"
  | "3.5"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "12"
  | "14"
  | "16"
  | "20"
  | "24";

/** גדלי פינות מעוגלות */
export type Radius =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "full";

/** גדלי צל */
export type Shadow =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "inner";

/** משכי מעבר */
export type Duration =
  | "instant"
  | "fast"
  | "normal"
  | "slow"
  | "slower"
  | "slowest";

/** גדלי אייקון */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/** גדלי מודל */
export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

// ===================================================================
// CSS VARIABLE REFERENCES
// ===================================================================

/**
 * CSS Variable references לשימוש ב-inline styles
 *
 * @example
 * <div style={{ color: cssVar.text.primary }}>טקסט</div>
 */
export const cssVar = {
  // Text Colors
  text: {
    primary: "var(--color-text-primary)",
    secondary: "var(--color-text-secondary)",
    muted: "var(--color-text-muted)",
    subtle: "var(--color-text-subtle)",
    inverted: "var(--color-text-inverted)",
  },

  // Background Colors
  bg: {
    primary: "var(--color-bg-primary)",
    secondary: "var(--color-bg-secondary)",
    tertiary: "var(--color-bg-tertiary)",
    hover: "var(--color-bg-hover)",
    active: "var(--color-bg-active)",
  },

  // Brand Colors
  brand: {
    primary: "var(--color-brand-primary)",
    hover: "var(--color-brand-primary-hover)",
    active: "var(--color-brand-primary-active)",
    light: "var(--color-brand-primary-light)",
    muted: "var(--color-brand-primary-muted)",
    text: "var(--color-brand-primary-text)",
  },

  // Semantic Colors
  success: {
    DEFAULT: "var(--color-success)",
    hover: "var(--color-success-hover)",
    light: "var(--color-success-light)",
    text: "var(--color-success-text)",
  },
  warning: {
    DEFAULT: "var(--color-warning)",
    hover: "var(--color-warning-hover)",
    light: "var(--color-warning-light)",
    text: "var(--color-warning-text)",
  },
  danger: {
    DEFAULT: "var(--color-danger)",
    hover: "var(--color-danger-hover)",
    light: "var(--color-danger-light)",
    text: "var(--color-danger-text)",
  },
  info: {
    DEFAULT: "var(--color-info)",
    hover: "var(--color-info-hover)",
    light: "var(--color-info-light)",
    text: "var(--color-info-text)",
  },

  // Status Colors (alias for semantic colors)
  status: {
    success: "var(--color-success)",
    successLight: "var(--color-success-light)",
    warning: "var(--color-warning)",
    warningLight: "var(--color-warning-light)",
    danger: "var(--color-danger)",
    dangerLight: "var(--color-danger-light)",
    info: "var(--color-info)",
    infoLight: "var(--color-info-light)",
  },

  // Border Colors
  border: {
    primary: "var(--color-border-primary)",
    secondary: "var(--color-border-secondary)",
    muted: "var(--color-border-muted)",
    focus: "var(--color-border-focus)",
  },

  // Typography
  font: {
    family: {
      primary: "var(--font-family-primary)",
      heading: "var(--font-family-heading)",
      mono: "var(--font-family-mono)",
    },
    size: {
      xs: "var(--font-size-xs)",
      sm: "var(--font-size-sm)",
      base: "var(--font-size-base)",
      lg: "var(--font-size-lg)",
      xl: "var(--font-size-xl)",
      "2xl": "var(--font-size-2xl)",
      "3xl": "var(--font-size-3xl)",
      "4xl": "var(--font-size-4xl)",
    },
    weight: {
      normal: "var(--font-weight-normal)",
      medium: "var(--font-weight-medium)",
      semibold: "var(--font-weight-semibold)",
      bold: "var(--font-weight-bold)",
      extrabold: "var(--font-weight-extrabold)",
    },
  },

  // Spacing
  spacing: {
    0: "var(--spacing-0)",
    0.5: "var(--spacing-0-5)",
    1: "var(--spacing-1)",
    1.5: "var(--spacing-1-5)",
    2: "var(--spacing-2)",
    2.5: "var(--spacing-2-5)",
    3: "var(--spacing-3)",
    3.5: "var(--spacing-3-5)",
    4: "var(--spacing-4)",
    5: "var(--spacing-5)",
    6: "var(--spacing-6)",
    7: "var(--spacing-7)",
    8: "var(--spacing-8)",
    9: "var(--spacing-9)",
    10: "var(--spacing-10)",
    12: "var(--spacing-12)",
    14: "var(--spacing-14)",
    16: "var(--spacing-16)",
    20: "var(--spacing-20)",
    24: "var(--spacing-24)",
  },

  // Border Radius
  radius: {
    none: "var(--radius-none)",
    xs: "var(--radius-xs)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    "2xl": "var(--radius-2xl)",
    "3xl": "var(--radius-3xl)",
    full: "var(--radius-full)",
  },

  // Shadows
  shadow: {
    none: "var(--shadow-none)",
    xs: "var(--shadow-xs)",
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    xl: "var(--shadow-xl)",
    "2xl": "var(--shadow-2xl)",
    inner: "var(--shadow-inner)",
  },

  // Transitions
  duration: {
    instant: "var(--duration-instant)",
    fast: "var(--duration-fast)",
    normal: "var(--duration-normal)",
    slow: "var(--duration-slow)",
    slower: "var(--duration-slower)",
    slowest: "var(--duration-slowest)",
  },

  // Z-Index
  z: {
    base: "var(--z-base)",
    dropdown: "var(--z-dropdown)",
    sticky: "var(--z-sticky)",
    fixed: "var(--z-fixed)",
    navbar: "var(--z-navbar)",
    modalBackdrop: "var(--z-modal-backdrop)",
    modal: "var(--z-modal)",
    popover: "var(--z-popover)",
    tooltip: "var(--z-tooltip)",
  },

  // Layout
  layout: {
    navbar: {
      width: "var(--navbar-width)",
      widthCollapsed: "var(--navbar-width-collapsed)",
      widthMin: "var(--navbar-width-min)",
      widthMax: "var(--navbar-width-max)",
    },
    content: {
      maxWidth: "var(--content-max-width)",
      padding: "var(--content-padding)",
    },
  },

  // Components
  card: {
    padding: "var(--card-padding)",
    paddingSm: "var(--card-padding-sm)",
    paddingLg: "var(--card-padding-lg)",
    radius: "var(--card-radius)",
    shadow: "var(--card-shadow)",
    shadowHover: "var(--card-shadow-hover)",
    bg: "var(--card-bg)",
  },

  modal: {
    padding: "var(--modal-padding)",
    radius: "var(--modal-radius)",
    shadow: "var(--modal-shadow)",
    width: {
      xs: "var(--modal-width-xs)",
      sm: "var(--modal-width-sm)",
      md: "var(--modal-width-md)",
      lg: "var(--modal-width-lg)",
      xl: "var(--modal-width-xl)",
      full: "var(--modal-width-full)",
    },
  },

  input: {
    height: "var(--input-height)",
    heightSm: "var(--input-height-sm)",
    heightLg: "var(--input-height-lg)",
    paddingX: "var(--input-padding-x)",
    radius: "var(--input-radius)",
  },

  button: {
    height: "var(--button-height)",
    heightSm: "var(--button-height-sm)",
    heightLg: "var(--button-height-lg)",
    paddingX: "var(--button-padding-x)",
    radius: "var(--button-radius)",
  },

  icon: {
    xs: "var(--icon-size-xs)",
    sm: "var(--icon-size-sm)",
    md: "var(--icon-size-md)",
    lg: "var(--icon-size-lg)",
    xl: "var(--icon-size-xl)",
    "2xl": "var(--icon-size-2xl)",
  },

  avatar: {
    xs: "var(--avatar-size-xs)",
    sm: "var(--avatar-size-sm)",
    md: "var(--avatar-size-md)",
    lg: "var(--avatar-size-lg)",
    xl: "var(--avatar-size-xl)",
  },
} as const;

// ===================================================================
// TAILWIND CLASS MAPPINGS
// ===================================================================

/**
 * Tailwind class mappings לשימוש נוח
 *
 * @example
 * <span className={tw.text.primary}>טקסט ראשי</span>
 * <div className={tw.bg.secondary}>רקע משני</div>
 */
export const tw = {
  // Text Colors
  text: {
    primary: "text-ds-text-primary",
    secondary: "text-ds-text-secondary",
    muted: "text-ds-text-muted",
    subtle: "text-ds-text-subtle",
    inverted: "text-ds-text-inverted",
    brand: "text-ds-brand",
    brandText: "text-ds-brand-text",
    success: "text-ds-success",
    successText: "text-ds-success-text",
    warning: "text-ds-warning",
    warningText: "text-ds-warning-text",
    danger: "text-ds-danger",
    dangerText: "text-ds-danger-text",
    info: "text-ds-info",
    infoText: "text-ds-info-text",
    label: "text-sm font-medium text-ds-text-secondary",
  },

  // Background Colors
  bg: {
    primary: "bg-ds-bg-primary",
    secondary: "bg-ds-bg-secondary",
    tertiary: "bg-ds-bg-tertiary",
    hover: "bg-ds-bg-hover",
    active: "bg-ds-bg-active",
    brand: "bg-ds-brand",
    brandHover: "bg-ds-brand-hover",
    brandLight: "bg-ds-brand-light",
    brandMuted: "bg-ds-brand-muted",
    success: "bg-ds-success",
    successLight: "bg-ds-success-light",
    warning: "bg-ds-warning",
    warningLight: "bg-ds-warning-light",
    danger: "bg-ds-danger",
    dangerLight: "bg-ds-danger-light",
    info: "bg-ds-info",
    infoLight: "bg-ds-info-light",
  },

  // Border Colors
  border: {
    primary: "border-ds-border",
    secondary: "border-ds-border-secondary",
    muted: "border-ds-border-muted",
    focus: "border-ds-border-focus",
    brand: "border-ds-brand",
    success: "border-ds-success",
    warning: "border-ds-warning",
    danger: "border-ds-danger",
  },

  // Shadows
  shadow: {
    xs: "shadow-ds-xs",
    sm: "shadow-ds-sm",
    md: "shadow-ds-md",
    lg: "shadow-ds-lg",
    xl: "shadow-ds-xl",
    card: "shadow-ds-card",
    cardHover: "shadow-ds-card-hover",
    modal: "shadow-ds-modal",
  },

  // Border Radius
  rounded: {
    xs: "rounded-ds-xs",
    sm: "rounded-ds-sm",
    md: "rounded-ds-md",
    lg: "rounded-ds-lg",
    xl: "rounded-ds-xl",
    "2xl": "rounded-ds-2xl",
    full: "rounded-ds-full",
    card: "rounded-ds-card",
    modal: "rounded-ds-modal",
    input: "rounded-ds-input",
    button: "rounded-ds-button",
  },

  // Input styles
  input: {
    base: "w-full py-2 px-3 text-sm rounded-lg border border-ds-border focus:ring-2 focus:ring-ds-brand focus:border-ds-brand outline-none transition-all",
    error: "w-full py-2 px-3 text-sm rounded-lg border border-ds-danger focus:ring-2 focus:ring-ds-danger outline-none transition-all",
    disabled: "w-full py-2 px-3 text-sm rounded-lg border border-ds-border bg-ds-bg-secondary cursor-not-allowed opacity-60",
  },

  // Button styles
  button: {
    primary: "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all bg-ds-brand text-ds-text-inverted hover:bg-ds-brand-hover active:scale-95",
    secondary: "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all bg-ds-bg-secondary text-ds-text-secondary border border-ds-border hover:bg-ds-bg-tertiary active:scale-95",
    ghost: "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all bg-transparent text-ds-text-secondary hover:bg-ds-bg-secondary active:scale-95",
    danger: "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all bg-ds-danger text-ds-text-inverted hover:bg-ds-danger-emphasis active:scale-95",
  },

  // Modal styles
  modal: {
    overlay: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center",
    panel: "bg-ds-bg-primary rounded-ds-modal shadow-ds-modal border border-ds-border overflow-hidden",
    header: "flex justify-between items-center px-6 py-4 border-b border-ds-border bg-ds-bg-secondary",
    body: "p-6 overflow-y-auto",
    footer: "flex justify-end gap-3 px-6 py-4 bg-ds-bg-secondary border-t border-ds-border",
  },

  // Table styles
  table: {
    base: "w-full border-collapse text-sm",
    head: "bg-ds-bg-secondary",
    th: "text-right py-3 px-4 font-medium text-ds-text-secondary bg-ds-bg-secondary border-b border-ds-border",
    td: "py-3 px-4 border-b border-ds-border",
    tr: "hover:bg-ds-bg-hover transition-colors",
    trClickable: "hover:bg-ds-bg-hover transition-colors cursor-pointer",
  },

  // Label styles
  label: {
    base: "block text-sm font-medium text-ds-text-secondary mb-1",
    required: "block text-sm font-medium text-ds-text-secondary mb-1 after:content-['*'] after:text-ds-danger after:mr-1",
  },
} as const;

// ===================================================================
// NUMERIC VALUES (for JavaScript calculations)
// ===================================================================

/**
 * ערכים נומריים לחישובים ב-JavaScript
 *
 * @example
 * const iconSize = numericValues.icon.md; // 20
 */
export const numericValues = {
  spacing: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    "2xl": 16,
    "3xl": 24,
  },

  icon: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 40,
  },

  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  },

  navbar: {
    width: 200,
    widthCollapsed: 72,
    widthMin: 150,
    widthMax: 250,
  },

  modal: {
    xs: 320,
    sm: 400,
    md: 500,
    lg: 700,
    xl: 900,
  },

  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 500,
    slowest: 700,
  },

  z: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    navbar: 40,
    modalBackdrop: 50,
    modal: 60,
    popover: 70,
    tooltip: 80,
    notification: 90,
    max: 9999,
  },
} as const;

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * יוצר transition string
 *
 * @example
 * style={{ transition: createTransition('normal', 'all') }}
 */
export function createTransition(
  duration: Duration = "normal",
  property: "all" | "colors" | "transform" | "opacity" = "all"
): string {
  const durationValue = `var(--duration-${duration})`;
  const easing = "var(--ease-in-out)";

  const propertyMap = {
    all: "all",
    colors: "color, background-color, border-color",
    transform: "transform",
    opacity: "opacity",
  };

  return `${propertyMap[property]} ${durationValue} ${easing}`;
}

/**
 * מחזיר גודל אייקון בפיקסלים
 *
 * @example
 * <Icon size={getIconSize('md')} /> // size={20}
 */
export function getIconSize(size: IconSize): number {
  return numericValues.icon[size];
}

/**
 * מחזיר רוחב מודל בפיקסלים
 *
 * @example
 * style={{ maxWidth: getModalWidth('lg') }} // maxWidth: 700
 */
export function getModalWidth(size: ModalSize): number | string {
  if (size === "full") return "100%";
  return numericValues.modal[size];
}

/**
 * יוצר class string מותנה
 *
 * @example
 * className={cn(tw.text.primary, isActive && tw.text.brand)}
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ===================================================================
// COMPONENT STYLE PRESETS
// ===================================================================

/**
 * Presets מוכנים לקומפוננטות נפוצות
 */
export const presets = {
  /** Primary button style preset */
  buttonPrimary: {
    className:
      "bg-ds-brand hover:bg-ds-brand-hover text-ds-text-inverted rounded-ds-button font-medium transition-colors duration-fast",
  },

  /** Secondary button style preset */
  buttonSecondary: {
    className:
      "bg-ds-bg-secondary hover:bg-ds-bg-hover text-ds-text-secondary border border-ds-border rounded-ds-button font-medium transition-colors duration-fast",
  },

  /** Danger button style preset */
  buttonDanger: {
    className:
      "bg-ds-danger hover:bg-ds-danger-hover text-ds-text-inverted rounded-ds-button font-medium transition-colors duration-fast",
  },

  /** Input style preset */
  input: {
    className:
      "bg-ds-bg-primary border border-ds-border rounded-ds-input focus:border-ds-border-focus focus:ring-1 focus:ring-ds-brand transition-colors duration-fast",
  },

  /** Badge style presets */
  badge: {
    default: "bg-ds-bg-tertiary text-ds-text-secondary",
    success: "bg-ds-success-light text-ds-success-text",
    warning: "bg-ds-warning-light text-ds-warning-text",
    danger: "bg-ds-danger-light text-ds-danger-text",
    info: "bg-ds-info-light text-ds-info-text",
    brand: "bg-ds-brand-light text-ds-brand-text",
  },

  /** Text style presets */
  text: {
    heading: "text-ds-text-primary font-semibold",
    body: "text-ds-text-secondary",
    muted: "text-ds-text-muted text-sm",
    label: "text-ds-text-muted text-sm font-medium",
  },
} as const;

// ===================================================================
// CARD PRESETS - סגנונות כרטיסים
// ===================================================================

/**
 * Card Presets - סגנונות מוכנים לכרטיסים
 *
 * @example
 * // כרטיס בסיסי
 * <div className={card.base}>...</div>
 *
 * // כרטיס עם header ו-body
 * <div className={card.base}>
 *   <div className={card.header}>כותרת</div>
 *   <div className={card.body}>תוכן</div>
 * </div>
 *
 * // שורת מידע
 * <div className={card.infoRow}>
 *   <span className={card.infoLabel}>טלפון</span>
 *   <span className={card.infoValue}>050-1234567</span>
 * </div>
 */
export const card = {
  // === Base Card Styles ===

  /** כרטיס בסיסי */
  base: "bg-white border border-slate-200 rounded-lg shadow-sm",

  /** כרטיס עם אפקט hover */
  interactive:
    "bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200",

  /** כרטיס נבחר */
  selected: "bg-blue-50 border-2 border-blue-500 rounded-lg shadow-sm",

  /** כרטיס מושבת */
  disabled:
    "bg-white border border-slate-200 rounded-lg shadow-sm opacity-60 pointer-events-none",

  // === Card Sections ===

  /** Header של כרטיס */
  header: "px-4 py-3 bg-slate-50 border-b border-slate-100 rounded-t-lg",

  /** Header ללא רקע */
  headerTransparent: "px-4 py-3 border-b border-slate-100",

  /** Body של כרטיס */
  body: "p-4",

  /** Body עם padding קטן */
  bodySm: "p-3",

  /** Body עם padding גדול */
  bodyLg: "p-6",

  /** Footer של כרטיס */
  footer: "px-4 py-3 bg-slate-50 border-t border-slate-100 rounded-b-lg",

  /** Footer ללא רקע */
  footerTransparent: "px-4 py-3 border-t border-slate-100",

  // === Card Content ===

  /** כותרת כרטיס */
  title: "text-lg font-semibold text-slate-800",

  /** כותרת משנה */
  subtitle: "text-sm text-slate-500",

  /** תיאור */
  description: "text-sm text-slate-600",

  // === Info Rows (שורות מידע) ===

  /** שורת מידע - container */
  infoRow:
    "flex justify-between items-center py-2 border-b border-slate-100 last:border-0",

  /** שורת מידע - עם gap קטן */
  infoRowCompact:
    "flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0",

  /** שורת מידע - ללא גבול */
  infoRowNoBorder: "flex justify-between items-center py-2",

  /** Label של שורת מידע */
  infoLabel: "text-sm text-slate-500",

  /** ערך של שורת מידע */
  infoValue: "text-sm text-slate-800 font-medium",

  /** ערך משני */
  infoValueMuted: "text-sm text-slate-600",

  // === Info Grid (רשת מידע) ===

  /** Grid של שדות מידע - 2 עמודות */
  infoGrid2: "grid grid-cols-2 gap-3",

  /** Grid של שדות מידע - 3 עמודות */
  infoGrid3: "grid grid-cols-3 gap-3",

  /** שדה בודד ב-grid */
  infoField: "flex flex-col gap-1",

  /** Label של שדה ב-grid */
  infoFieldLabel: "text-xs text-slate-400 font-medium",

  /** ערך של שדה ב-grid */
  infoFieldValue: "text-sm text-slate-700",

  // === Status Indicators ===

  /** נקודת סטטוס - פעיל */
  statusDotActive: "w-2 h-2 rounded-full bg-green-500",

  /** נקודת סטטוס - לא פעיל */
  statusDotInactive: "w-2 h-2 rounded-full bg-slate-300",

  /** נקודת סטטוס - אזהרה */
  statusDotWarning: "w-2 h-2 rounded-full bg-amber-500",

  /** נקודת סטטוס - שגיאה */
  statusDotDanger: "w-2 h-2 rounded-full bg-red-500",

  /** Badge סטטוס - פעיל */
  statusBadgeActive:
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium",

  /** Badge סטטוס - לא פעיל */
  statusBadgeInactive:
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium",

  /** Badge סטטוס - אזהרה */
  statusBadgeWarning:
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium",

  /** Badge סטטוס - שגיאה */
  statusBadgeDanger:
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium",

  // === Card Actions ===

  /** כפתורי פעולה - container */
  actions: "flex items-center gap-2",

  /** כפתור פעולה - ראשי */
  actionPrimary:
    "px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors",

  /** כפתור פעולה - משני */
  actionSecondary:
    "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md transition-colors",

  /** כפתור פעולה - סכנה */
  actionDanger:
    "px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors",

  /** כפתור אייקון */
  actionIcon:
    "p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-md transition-colors",

  // === Card Avatar/Icon ===

  /** אייקון כרטיס - קטן */
  iconSm:
    "w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600",

  /** אייקון כרטיס - בינוני */
  iconMd:
    "w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600",

  /** אייקון כרטיס - גדול */
  iconLg:
    "w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600",

  /** אייקון כרטיס - צבעוני */
  iconBrand:
    "w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600",

  /** Avatar - קטן */
  avatarSm:
    "w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm",

  /** Avatar - בינוני */
  avatarMd:
    "w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium",

  /** Avatar - גדול */
  avatarLg:
    "w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-lg",

  // === Card Layouts ===

  /** Layout - header עם אייקון וכותרת */
  headerWithIcon: "flex items-center gap-3",

  /** Layout - header עם כותרת ופעולות */
  headerWithActions: "flex items-center justify-between",

  /** Layout - תוכן עם sidebar */
  contentWithSidebar: "flex gap-4",

  /** Layout - רשימת כרטיסים */
  list: "flex flex-col gap-3",

  /** Layout - grid של כרטיסים - 2 עמודות */
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-4",

  /** Layout - grid של כרטיסים - 3 עמודות */
  grid3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",

  /** Layout - grid של כרטיסים - 4 עמודות */
  grid4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
} as const;

/** Type for card preset keys */
export type CardPresetKey = keyof typeof card;

// ===================================================================
// DRAFT PRESETS - סגנונות טיוטות
// ===================================================================

/**
 * Draft Presets - סגנונות מוכנים לרשימת טיוטות
 *
 * @example
 * <div className={draft.container}>
 *   <div className={draft.header}>טיוטות</div>
 *   <div className={draft.row}>
 *     <span className={draft.badge}>טיוטה</span>
 *     <span className={draft.title}>שם הטיוטה</span>
 *   </div>
 * </div>
 */
export const draft = {
  // === Container ===

  /** Container ראשי של רשימת טיוטות */
  container: "border border-green-300 rounded-lg p-3 bg-green-50",

  /** Header של רשימת טיוטות */
  header: "flex flex-col gap-1 mb-3",

  /** כותרת רשימת טיוטות */
  title: "font-semibold text-slate-800",

  /** תיאור רשימת טיוטות */
  description: "text-xs text-slate-500",

  // === Draft Row ===

  /** שורת טיוטה בודדת */
  row: "flex justify-between items-center gap-3 py-2 border-b border-green-300 last:border-0",

  /** תוכן שורת טיוטה */
  rowContent: "flex flex-col gap-1 min-w-0",

  /** Header של שורת טיוטה (badge + title) */
  rowHeader: "flex items-center gap-2 flex-wrap",

  // === Draft Badge ===

  /** Badge של טיוטה */
  badge:
    "inline-flex items-center justify-center px-2 py-0.5 rounded bg-green-600 text-white text-xs font-semibold",

  // === Draft Text ===

  /** כותרת טיוטה */
  itemTitle: "text-sm font-semibold text-slate-800",

  /** תאריך/subtitle של טיוטה */
  itemSubtitle: "text-xs text-slate-500",

  // === Draft Actions ===

  /** Container של כפתורי פעולה */
  actions: "flex gap-2 flex-wrap",

  // === Empty State ===

  /** הודעת ריק */
  empty: "py-3 text-center text-slate-500 text-sm",
} as const;

/** Type for draft preset keys */
export type DraftPresetKey = keyof typeof draft;

// ===================================================================
// TASK PRESETS - סגנונות משימות
// ===================================================================

/**
 * Task Presets - סגנונות מוכנים למשימות
 *
 * @example
 * // Task Card (Grid View)
 * <div className={task.card}>
 *   <div className={task.cardHeader}>
 *     <span className={task.cardTitle}>כותרת המשימה</span>
 *   </div>
 *   <div className={task.cardBody}>תוכן</div>
 *   <div className={task.cardFooter}>פעולות</div>
 * </div>
 *
 * // Task List Item (Compact View)
 * <div className={task.listItem}>
 *   <span className={task.checkbox} />
 *   <span className={task.listTitle}>כותרת</span>
 * </div>
 */
export const task = {
  // === Task Card (Grid View) ===

  /** כרטיס משימה */
  card: "bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden",

  /** כרטיס משימה - הושלם */
  cardCompleted:
    "bg-slate-50 rounded-lg border border-slate-200 shadow-sm overflow-hidden opacity-70",

  /** Header של כרטיס משימה */
  cardHeader:
    "px-3 py-2 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center",

  /** Header של כרטיס משימה - הושלם */
  cardHeaderCompleted:
    "px-3 py-2 border-b border-slate-200 bg-transparent flex justify-between items-center",

  /** כותרת כרטיס משימה */
  cardTitle: "font-semibold text-[15px] flex items-center gap-2",

  /** כותרת כרטיס משימה - הושלם */
  cardTitleCompleted:
    "font-semibold text-[15px] flex items-center gap-2 line-through",

  /** Body של כרטיס משימה */
  cardBody: "p-3",

  /** תוכן טקסט של משימה */
  cardText: "text-sm text-slate-800 whitespace-pre-wrap leading-relaxed",

  /** תוכן טקסט של משימה - הושלם */
  cardTextCompleted:
    "text-sm text-slate-800 whitespace-pre-wrap leading-relaxed line-through",

  /** Footer של כרטיס משימה */
  cardFooter:
    "px-5 py-1 border-t border-slate-200 bg-white flex justify-end gap-3",

  /** Footer של כרטיס משימה - הושלם */
  cardFooterCompleted:
    "px-5 py-1 border-t border-slate-200 bg-transparent flex justify-end gap-3",

  // === Task List Item (Compact View) ===

  /** פריט משימה ברשימה */
  listItem:
    "flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-md transition-all",

  /** פריט משימה ברשימה - הושלם */
  listItemCompleted:
    "flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md opacity-60 transition-all",

  /** Checkbox של משימה */
  checkbox: "cursor-pointer flex items-center text-slate-400",

  /** Checkbox של משימה - מסומן */
  checkboxChecked: "cursor-pointer flex items-center text-green-600",

  /** כותרת משימה ברשימה */
  listTitle: "flex-1 font-medium text-sm cursor-pointer truncate",

  /** כותרת משימה ברשימה - הושלם */
  listTitleCompleted:
    "flex-1 font-medium text-sm cursor-pointer truncate line-through",

  /** תג משויך ברשימה */
  listAssignee:
    "text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 whitespace-nowrap",

  // === Task Status Badges ===

  /** סטטוס - טרם התחיל */
  statusNotStarted:
    "text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold",

  /** סטטוס - פתוח */
  statusOpen:
    "text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold",

  /** סטטוס - בתהליך */
  statusInProgress:
    "text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700 font-semibold",

  /** סטטוס - נדחה */
  statusPostponed:
    "text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold",

  /** סטטוס - הסתיים */
  statusDone:
    "text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold",

  /** סטטוס - בוטל */
  statusCancelled:
    "text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold",

  // === Task Due Date ===

  /** תאריך יעד */
  dueDate:
    "flex items-center gap-1.5 text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500",

  /** תאריך יעד - עבר */
  dueDateOverdue:
    "flex items-center gap-1.5 text-xs px-2 py-0.5 bg-red-100 rounded-full text-red-600",

  // === Task Metadata ===

  /** Grid של מטא-דאטה */
  metaGrid:
    "grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 text-xs text-slate-500",

  /** פריט מטא-דאטה */
  metaItem: "flex items-center gap-1.5",

  // === Task Actions ===

  /** כפתור פעולה בכרטיס */
  action:
    "flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer text-slate-500 hover:text-slate-700",

  /** כפתור פעולה - ראשי */
  actionPrimary:
    "flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer text-blue-600 hover:text-blue-700",

  /** כפתור פעולה - סכנה */
  actionDanger:
    "flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer text-red-600 hover:text-red-700",

  /** כפתור פעולה קטן (icon only) */
  actionIcon:
    "p-1 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600",

  // === Task Form ===

  /** Container של טופס יצירת משימה */
  form: "bg-slate-100 p-3 rounded-lg border border-slate-200 mb-4",

  /** Grid של שדות בטופס */
  formGrid: "grid grid-cols-2 gap-3",

  /** שורת פעולות בטופס */
  formActions: "flex justify-end gap-2 mt-3",

  // === Task Sections ===

  /** כותרת סקשן (משימות פתוחות / הושלמו) */
  sectionTitle: "text-sm font-medium text-slate-500 mb-3",

  /** מפריד בין סקשנים */
  sectionDivider: "border-t border-slate-200 pt-5 mt-5",

  // === Task Empty State ===

  /** הודעת ריק */
  empty: "text-center text-slate-500 py-5",

  // === Task Layouts ===

  /** רשימת כרטיסי משימות */
  cardList: "flex flex-col gap-3",

  /** רשימת פריטי משימות (compact) */
  itemList: "flex flex-col gap-2",
} as const;

/** Type for task preset keys */
export type TaskPresetKey = keyof typeof task;

// Export types for external use
export type CssVar = typeof cssVar;
export type TwClasses = typeof tw;
export type NumericValues = typeof numericValues;
export type Presets = typeof presets;
