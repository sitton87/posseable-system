"use client";

import { useState, useEffect, useMemo, useRef, useCallback, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home,
  Users,
  UserCircle,
  Calendar,
  Wrench,
  Handshake,
  Heart,
  Wallet,
  ArrowRightCircle,
  CalendarRange,
  Settings,
  ChevronDown,
  CheckSquare,
  LogOut,
  KeyRound,
  Pin,
  PinOff,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { hasSystemAdminAccess } from "@/lib/utils/roles";
import { usePermissions } from "@/app/hooks/usePagePermission";
import { numericValues, cssVar, tw } from "@/app/styles/design-system";

// הגדרות רוחב - מה-Design System
const NAV_MIN_WIDTH = numericValues.navbar.widthMin;
const NAV_MAX_WIDTH = numericValues.navbar.widthMax;
const NAV_DEFAULT_WIDTH = numericValues.navbar.width;
const NAV_COLLAPSED_WIDTH = numericValues.navbar.widthCollapsed;
const ORG_NAME = "עמותת PosSEAble";

// פונקציה לחישוב גודל פונט דינמי
const calcFontScale = (currentWidth: number): number => {
  // מחזיר ערך בין 0.75 (במינימום) ל-1 (במקסימום)
  const range = NAV_MAX_WIDTH - NAV_MIN_WIDTH;
  const position = currentWidth - NAV_MIN_WIDTH;
  return 0.75 + (position / range) * 0.25;
};

// פונקציה לחישוב גודל אייקון דינמי
const calcIconSize = (currentWidth: number): number => {
  const scale = calcFontScale(currentWidth);
  return Math.round(16 + (scale - 0.75) * 16); // בין 16 ל-20
};

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pinnedWidth, setPinnedWidth] = useState<number>(NAV_DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navRef = useRef<HTMLDivElement>(null);
  
  const [userInfo, setUserInfo] = useState<{
    full_name: string;
    role: string;
    role_group_code?: string | null;
  } | null>(null);

  // חישוב הרוחב הנוכחי
  const width = useMemo(() => {
    if (pinned) {
      return pinnedWidth;
    }
    return expanded ? NAV_DEFAULT_WIDTH : NAV_COLLAPSED_WIDTH;
  }, [pinned, pinnedWidth, expanded]);

  // חישוב סקאלת הפונט
  const fontScale = useMemo(() => {
    if (!pinned) return 1;
    return calcFontScale(pinnedWidth);
  }, [pinned, pinnedWidth]);

  // חישוב גודל אייקון
  const iconSize = useMemo(() => {
    if (!pinned) return 20;
    return calcIconSize(pinnedWidth);
  }, [pinned, pinnedWidth]);

  // טעינת הגדרות מ-localStorage
  useEffect(() => {
    const savedPinned = localStorage.getItem("nav_pinned") === "true";
    const savedWidth = localStorage.getItem("nav_width");
    
    setPinned(savedPinned);
    setExpanded(savedPinned);
    
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10);
      if (parsedWidth >= NAV_MIN_WIDTH && parsedWidth <= NAV_MAX_WIDTH) {
        setPinnedWidth(parsedWidth);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setUserInfo({
            full_name: data.user.full_name,
            role: data.user.role || "חבר צוות",
            role_group_code: data.user.role_group_code,
          });
        }
      } catch (err) {
        console.error("Failed to load user info", err);
      }
    };
    fetchUser();
  }, []);

  const togglePin = () => {
    const newVal = !pinned;
    setPinned(newVal);
    localStorage.setItem("nav_pinned", newVal.toString());
    setExpanded(newVal);
  };

  // שמירת רוחב ב-localStorage
  const saveWidth = useCallback((newWidth: number) => {
    localStorage.setItem("nav_width", newWidth.toString());
  }, []);

  // פונקציות לשינוי רוחב
  const increaseWidth = useCallback(() => {
    setPinnedWidth((prev) => {
      const newWidth = Math.min(prev + 20, NAV_MAX_WIDTH);
      saveWidth(newWidth);
      return newWidth;
    });
  }, [saveWidth]);

  const decreaseWidth = useCallback(() => {
    setPinnedWidth((prev) => {
      const newWidth = Math.max(prev - 20, NAV_MIN_WIDTH);
      saveWidth(newWidth);
      return newWidth;
    });
  }, [saveWidth]);

  const resetWidth = useCallback(() => {
    setPinnedWidth(NAV_DEFAULT_WIDTH);
    saveWidth(NAV_DEFAULT_WIDTH);
  }, [saveWidth]);

  // לוגיקת גרירה לשינוי רוחב
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!pinned) return;
    e.preventDefault();
    setIsResizing(true);
  }, [pinned]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !navRef.current) return;
    
    // חישוב הרוחב החדש (מימין לשמאל כי זה RTL)
    const navRect = navRef.current.getBoundingClientRect();
    const newWidth = navRect.right - e.clientX;
    
    // הגבלה לטווח המותר
    const clampedWidth = Math.max(NAV_MIN_WIDTH, Math.min(NAV_MAX_WIDTH, newWidth));
    setPinnedWidth(clampedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      saveWidth(pinnedWidth);
    }
  }, [isResizing, pinnedWidth, saveWidth]);

  // Event listeners לגרירה
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // עדכון CSS variable
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
    return () => {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        `${NAV_DEFAULT_WIDTH}px`
      );
    };
  }, [width]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to logout", err);
    } finally {
      window.location.href = "/login";
    }
  };

  const handleResetPassword = () => {
    window.location.href = "/reset-password";
  };

  const isAdmin = userInfo
    ? hasSystemAdminAccess(userInfo.role, userInfo.role_group_code)
    : false;

  // --- Types ---

  type IconType = "home" | "userCircle" | "users" | "heart" | "handshake" | "calendarRange" | "wrench" | "checkSquare" | "wallet" | "settings";

  type MenuChild = {
    pageKey?: string;
    href: string;
    label: string;
    query?: Record<string, string>;
  };

  type MenuItem = {
    pageKey: string;
    href?: string;
    iconType: IconType;
    label: string;
    children?: MenuChild[];
  };

  type MenuSection = {
    id: string;
    title?: string;
    items: MenuItem[];
  };

  // פונקציה לרנדור אייקון דינמי
  const renderIcon = (iconType: IconType, size: number) => {
    const props = { size, strokeWidth: 1.5 };
    switch (iconType) {
      case "home": return <Home {...props} />;
      case "userCircle": return <UserCircle {...props} />;
      case "users": return <Users {...props} />;
      case "heart": return <Heart {...props} />;
      case "handshake": return <Handshake {...props} />;
      case "calendarRange": return <CalendarRange {...props} />;
      case "wrench": return <Wrench {...props} />;
      case "checkSquare": return <CheckSquare {...props} />;
      case "wallet": return <Wallet {...props} />;
      case "settings": return <Settings {...props} />;
      default: return <Home {...props} />;
    }
  };

  // --- Menu Definitions ---

  const menuSections: MenuSection[] = [
    {
      id: "main",
      items: [
        {
          pageKey: "dashboard",
          href: "/dashboard",
          iconType: "home",
          label: "דף הבית",
        },
      ],
    },
    {
      id: "people",
      title: "אנשים ושותפים",
      items: [
        {
          pageKey: "surfers",
          href: "/surfers",
          iconType: "userCircle",
          label: "גולשים",
          children: [
            { href: "/surfers", label: "דף הבית", pageKey: "surfers" },
            {
              href: "/surfers",
              label: "רשימת גולשים",
              pageKey: "surfers-list",
              query: { view: "list" },
            },
            {
              href: "/surfers",
              label: "קבוצות",
              pageKey: "surfers-groups",
              query: { view: "groups" },
            },
            {
              href: "/surfers",
              label: "הגדרות",
              pageKey: "surfers-settings",
              query: { view: "settings" },
            },
          ],
        },
        {
          pageKey: "volunteers",
          href: "/volunteers",
          iconType: "users",
          label: "צוות ומתנדבים",
          children: [
            { href: "/volunteers", label: "דף הבית", pageKey: "volunteers" },
            {
              href: "/volunteers",
              label: "רשימת צוות ומתנדבים",
              pageKey: "volunteers-list",
              query: { view: "list" },
            },
            {
              href: "/volunteers",
              label: "הגדרות",
              pageKey: "volunteers-settings",
              query: { view: "settings" },
            },
          ],
        },
        {
          pageKey: "donors",
          href: "/donors",
          iconType: "heart",
          label: "תורמים",
          children: [
            { href: "/donors", label: "דף הבית", pageKey: "donors" },
            {
              href: "/donors",
              label: "רשימת תורמים",
              pageKey: "donors-list",
              query: { view: "list" },
            },
          ],
        },
        {
          pageKey: "suppliers",
          href: "/suppliers",
          iconType: "handshake",
          label: "ספקים",
          children: [
            { href: "/suppliers", label: "דף הבית", pageKey: "suppliers" },
            {
              href: "/suppliers",
              label: "רשימת ספקים",
              pageKey: "suppliers-list",
              query: { view: "list" },
            },
          ],
        },
      ],
    },
    {
      id: "activity",
      title: "ניהול פעילות",
      items: [
        {
          pageKey: "activities-module",
          href: "/activities",
          iconType: "calendarRange",
          label: "ניהול פעילות",
          children: [
            {
              href: "/activities",
              label: "דף הבית",
              pageKey: "activities-dashboard",
              query: { tab: "dashboard" },
            },
            {
              href: "/activities",
              label: "המוקד המבצעי",
              pageKey: "activities-operations",
              query: { tab: "operations" },
            },
            {
              href: "/activities",
              label: "תכנון והגדרות",
              pageKey: "activities-planning",
              query: { tab: "planning" },
            },
          ],
        },
      ],
    },
    {
      id: "logistics",
      title: "לוגיסטיקה ומשאבים",
      items: [
        {
          pageKey: "equipment",
          href: "/equipment",
          iconType: "wrench",
          label: "ציוד",
          children: [
            { href: "/equipment", label: "דף הבית", pageKey: "equipment" },
            {
              href: "/equipment",
              label: "קטלוג ציוד",
              pageKey: "equipment-catalog",
              query: { view: "catalog" },
            },
            {
              href: "/equipment",
              label: "מלאי ומחסנים",
              pageKey: "equipment-inventory",
              query: { view: "inventory" },
            },
            {
              href: "/equipment",
              label: "מבנה והגדרות",
              pageKey: "equipment-settings",
              query: { view: "structure" },
            },
          ],
        },
      ],
    },
    {
      id: "admin",
      title: "מנהלה",
      items: [
        {
          pageKey: "tasks",
          href: "/tasks",
          iconType: "checkSquare",
          label: "מרכז משימות",
        },
        {
          pageKey: "finance",
          href: "/finance",
          iconType: "wallet",
          label: "כספים",
        },
        {
          pageKey: "system-settings",
          href: "/system-settings",
          iconType: "settings",
          label: "הגדרות מערכת",
        },
      ],
    },
  ];

  const { permissions, loading: permissionsLoading } = usePermissions();

  const hasAccess = (key?: string, fallback?: string) => {
    if (permissionsLoading) return true;
    if (isAdmin) return true;
    if (key) {
      const level = permissions[key];
      if (level && level !== "none") {
        return true;
      }
    }
    if (fallback) {
      const fallbackLevel = permissions[fallback];
      if (fallbackLevel && fallbackLevel !== "none") {
        return true;
      }
    }
    return false;
  };

  const filteredSections = useMemo(() => {
    return menuSections
      .map((section) => {
        const visibleItems = section.items
          .map((item) => {
            if (item.children?.length) {
              const visibleChildren = item.children.filter((child) =>
                hasAccess(child.pageKey, item.pageKey)
              );
              if (visibleChildren.length === 0) return null;
              return { ...item, children: visibleChildren };
            }

            if (item.pageKey === "system-settings") {
              return isAdmin ? item : null;
            }
            if (hasAccess(item.pageKey)) {
              return item;
            }
            return null;
          })
          .filter(Boolean) as MenuItem[];

        return { ...section, items: visibleItems };
      })
      .filter((section) => section.items.length > 0);
  }, [menuSections, isAdmin, permissions, permissionsLoading]);

  // --- Logic for Open/Close Menus ---

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const currentTopLevel = useMemo(() => {
    if (!pathname) return undefined;
    for (const section of filteredSections) {
      for (const item of section.items) {
        if (item.href === "/" && pathname === "/") return item.pageKey;
        if (item.href && item.href !== "/" && pathname.startsWith(item.href)) {
          return item.pageKey;
        }
      }
    }
    return undefined;
  }, [pathname, filteredSections]);

  const previousTopLevelRef = useRef<string | undefined>(currentTopLevel);

  useEffect(() => {
    setOpenMenus((prev) => {
      let changed = false;
      const next = { ...prev };
      filteredSections.forEach((section) => {
        section.items.forEach((item) => {
          if (!item.children?.length) return;
          if (item.pageKey === currentTopLevel) {
            if (next[item.pageKey] !== true) {
              next[item.pageKey] = true;
              changed = true;
            }
          }
        });
      });
      return changed ? next : prev;
    });
  }, [currentTopLevel, filteredSections]);

  useEffect(() => {
    const prevTopLevel = previousTopLevelRef.current;
    if (prevTopLevel && prevTopLevel !== currentTopLevel) {
      setOpenMenus((prev) => {
        if (!prev[prevTopLevel]) return prev;
        return { ...prev, [prevTopLevel]: false };
      });
    }
    previousTopLevelRef.current = currentTopLevel;
  }, [currentTopLevel]);

  const previousPathnameRef = useRef<string | null>(pathname);
  useEffect(() => {
    const prevPath = previousPathnameRef.current;
    previousPathnameRef.current = pathname;
    if (prevPath === pathname) return;

    setOpenMenus((prev) => {
      let changed = false;
      const next: Record<string, boolean> = {};

      filteredSections.forEach((section) => {
        section.items.forEach((item) => {
          if (!item.children?.length) return;
          const shouldBeOpen = item.pageKey === currentTopLevel;
          next[item.pageKey] = shouldBeOpen;
          if (prev[item.pageKey] !== shouldBeOpen) {
            changed = true;
          }
        });
      });
      return changed ? next : prev;
    });
  }, [pathname, currentTopLevel, filteredSections]);

  const toggleMenu = (pageKey: string) => {
    setOpenMenus((prev) => {
      const isOpen = !!prev[pageKey];
      if (!isOpen) {
        return { [pageKey]: true };
      }
      return {};
    });
  };

  const handleParentTrigger = (pageKey: string) => {
    if (!expanded && !pinned) {
      setExpanded(true);
    }
    toggleMenu(pageKey);
  };

  // --- JSX Rendering Helpers ---

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = Boolean(item.children?.length);
    const childIsActive = (child: MenuChild) => {
      if (!pathname) return false;

      const pathMatch =
        child.href === "/" ? pathname === "/" : pathname.startsWith(child.href);
      if (!pathMatch) return false;

      if (
        child.pageKey === "activities-operations" &&
        pathname.startsWith("/activities/") &&
        pathname !== "/activities" &&
        pathname !== "/activities/new"
      ) {
        return true;
      }

      if (child.query && Object.keys(child.query).length > 0) {
        if (!searchParams) return false;

        if (
          child.pageKey === "activities-dashboard" &&
          pathname === "/activities" &&
          !searchParams.get("tab")
        ) {
          return true;
        }

        return Object.entries(child.query).every(
          ([key, value]) => searchParams.get(key) === value
        );
      }

      return true;
    };
    const isActive = hasChildren
      ? item.children!.some(childIsActive)
      : item.href === "/"
      ? pathname === "/"
      : item.href
      ? pathname?.startsWith(item.href)
      : false;

    const isOpen = openMenus[item.pageKey] ?? isActive;
    const showExpanded = expanded || pinned;

    // חישוב גודל פונט דינמי
    const dynamicFontSize = pinned ? `${fontScale}rem` : undefined;
    const dynamicChildFontSize = pinned ? `${fontScale * 0.75}rem` : undefined;

    if (!hasChildren) {
      return (
        <Link
          key={item.href}
          href={item.href || "#"}
          className={clsx(
            "flex items-center rounded-lg px-3 py-2.5 font-medium transition-all duration-200 group",
            showExpanded ? "gap-3" : "justify-center",
            isActive
              ? "bg-ds-brand-light text-ds-brand-text border border-ds-brand/20"
              : "text-ds-text-secondary hover:bg-ds-bg-hover hover:text-ds-text-primary"
          )}
          style={{ fontSize: dynamicFontSize }}
          title={!showExpanded ? item.label : undefined}
        >
          <span className={clsx(
            "transition-colors shrink-0",
            isActive ? "text-ds-brand" : "text-ds-text-muted group-hover:text-ds-text-secondary"
          )}>
            {renderIcon(item.iconType, iconSize)}
          </span>
          {showExpanded && <span className="truncate">{item.label}</span>}
        </Link>
      );
    }

    return (
      <div
        key={item.pageKey}
        className={clsx(
          "rounded-lg transition-all duration-200",
          isActive && "bg-ds-brand-light/50"
        )}
      >
        <div
          className={clsx(
            "flex items-center px-3 py-2.5 font-medium transition-all duration-200 cursor-pointer select-none rounded-lg",
            showExpanded ? "gap-3" : "justify-center",
            isActive 
              ? "text-ds-brand-text" 
              : "text-ds-text-secondary hover:bg-ds-bg-hover hover:text-ds-text-primary"
          )}
          style={{ fontSize: dynamicFontSize }}
          role="button"
          tabIndex={0}
          onClick={() => handleParentTrigger(item.pageKey)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleParentTrigger(item.pageKey);
            }
          }}
          title={!showExpanded ? item.label : undefined}
        >
          <div
            className={clsx(
              "flex flex-1 items-center min-w-0",
              showExpanded ? "gap-3" : "justify-center"
            )}
          >
            <span className={clsx(
              "transition-colors shrink-0",
              isActive ? "text-ds-brand" : "text-ds-text-muted"
            )}>
              {renderIcon(item.iconType, iconSize)}
            </span>
            {showExpanded && <span className="truncate">{item.label}</span>}
          </div>
          {showExpanded && (
            <ChevronDown
              size={Math.round(iconSize * 0.8)}
              strokeWidth={2}
              className={clsx(
                "text-ds-text-subtle transition-transform duration-200 shrink-0",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            />
          )}
        </div>

        {/* Children Container */}
        {showExpanded && (
          <div
            className={clsx(
              "flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ease-in-out",
              isOpen ? "max-h-96 opacity-100 mt-1 pb-2" : "max-h-0 opacity-0"
            )}
          >
            {item.children!.map((child) => {
              const childActive = childIsActive(child);
              const childHref =
                child.query && Object.keys(child.query).length
                  ? `${child.href}?${new URLSearchParams(
                      child.query
                    ).toString()}`
                  : child.href;
              return (
                <Link
                  key={`${child.href}-${child.label}`}
                  href={childHref}
                  className={clsx(
                    "mr-8 rounded-md px-3 py-2 font-medium transition-all duration-200 truncate",
                    childActive
                      ? "bg-ds-brand-light text-ds-brand-text border-r-2 border-ds-brand"
                      : "text-ds-text-muted hover:bg-ds-bg-hover hover:text-ds-text-secondary"
                  )}
                  style={{ fontSize: dynamicChildFontSize }}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const showExpanded = expanded || pinned;

  return (
    <div
      ref={navRef}
      className={clsx(
        "fixed right-0 top-0 h-full bg-ds-bg-primary border-l transition-all z-50",
        "border-ds-border shadow-ds-lg",
        isResizing ? "duration-0" : "duration-300"
      )}
      onMouseEnter={() => !pinned && setExpanded(true)}
      onMouseLeave={() => !pinned && setExpanded(false)}
      style={{ width }}
    >
      {/* Resize Handle - רק כשנעוץ */}
      {pinned && (
        <div
          className={clsx(
            "absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize group z-10",
            "hover:bg-ds-brand transition-colors",
            isResizing && "bg-ds-brand"
          )}
          onMouseDown={handleMouseDown}
        >
          <div className={clsx(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2",
            "w-4 h-8 rounded bg-ds-bg-tertiary border border-ds-border flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isResizing && "opacity-100 bg-ds-brand-light border-ds-brand"
          )}>
            <GripVertical size={12} className="text-ds-text-muted" />
          </div>
        </div>
      )}

      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="relative h-16 border-b border-ds-border-muted px-4 flex items-center justify-center overflow-hidden bg-ds-bg-secondary/50">
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-5"
            style={{ backgroundImage: "url('/logo.png')" }}
          />

          {showExpanded ? (
            <div className="relative z-10 flex flex-col items-center">
              <span 
                className="font-bold text-ds-text-primary tracking-tight truncate max-w-full transition-all"
                style={{ fontSize: pinned ? `${fontScale * 1}rem` : '1rem' }}
              >
                {ORG_NAME}
              </span>
              <span 
                className="uppercase tracking-widest text-ds-text-subtle font-semibold transition-all"
                style={{ fontSize: pinned ? `${fontScale * 0.625}rem` : '0.625rem' }}
              >
                System Manager
              </span>
            </div>
          ) : (
            <div className="relative z-10 w-9 h-9 rounded-lg bg-ds-brand flex items-center justify-center">
              <span className="font-bold text-ds-text-inverted text-lg">P</span>
            </div>
          )}
        </div>

        {/* Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <nav className="flex flex-col gap-6 px-3 py-4">
            {filteredSections.map((section, index) => (
              <div key={section.id} className="flex flex-col gap-1">
                {/* Section Title */}
                {showExpanded && section.title && (
                  <div 
                    className="px-3 mb-2 font-bold text-ds-text-subtle uppercase tracking-widest truncate transition-all"
                    style={{ fontSize: pinned ? `${fontScale * 0.625}rem` : '0.625rem' }}
                  >
                    {section.title}
                  </div>
                )}
                {/* Separator for collapsed mode if not first item */}
                {!showExpanded && index > 0 && (
                  <div className="my-2 mx-3 border-t border-ds-border" />
                )}

                {/* Section Items */}
                <div className="flex flex-col gap-1">
                  {section.items.map(renderMenuItem)}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer / User Panel */}
        <div className="border-t border-ds-border bg-ds-bg-secondary/80">
          {/* User Info */}
          <div className="px-4 py-3">
            <div
              className={clsx(
                "flex items-center",
                showExpanded ? "gap-3" : "justify-center"
              )}
            >
              <div 
                className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ds-brand to-ds-brand-hover text-ds-text-inverted font-bold shadow-ds-md transition-all"
                style={{ 
                  width: pinned ? `${Math.round(40 * fontScale)}px` : '40px',
                  height: pinned ? `${Math.round(40 * fontScale)}px` : '40px',
                  fontSize: pinned ? `${fontScale * 0.875}rem` : '0.875rem'
                }}
              >
                {(userInfo?.full_name || "U")[0]}
              </div>
              {showExpanded && (
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span 
                    className="truncate font-semibold text-ds-text-primary transition-all"
                    style={{ fontSize: pinned ? `${fontScale * 0.875}rem` : '0.875rem' }}
                  >
                    {userInfo?.full_name || "אורח"}
                  </span>
                  <span 
                    className="truncate text-ds-text-muted transition-all"
                    style={{ fontSize: pinned ? `${fontScale * 0.75}rem` : '0.75rem' }}
                  >
                    {userInfo?.role || "משתמש"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {showExpanded && (
            <div className="px-4 pb-3 flex gap-2">
              <button
                onClick={handleResetPassword}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-ds-border bg-ds-bg-primary py-2 font-medium text-ds-text-secondary shadow-ds-sm hover:bg-ds-bg-hover hover:text-ds-text-primary hover:border-ds-border-secondary transition-all duration-200"
                style={{ fontSize: pinned ? `${fontScale * 0.75}rem` : '0.75rem' }}
              >
                <KeyRound size={Math.round(iconSize * 0.7)} strokeWidth={1.5} />
                <span>סיסמה</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-ds-danger/30 bg-ds-danger-light py-2 font-medium text-ds-danger shadow-ds-sm hover:bg-ds-danger/10 hover:text-ds-danger-text hover:border-ds-danger/50 transition-all duration-200"
                style={{ fontSize: pinned ? `${fontScale * 0.75}rem` : '0.75rem' }}
              >
                <LogOut size={Math.round(iconSize * 0.7)} strokeWidth={1.5} />
                <span>יציאה</span>
              </button>
            </div>
          )}

          {/* Pin Button */}
          <button
            onClick={togglePin}
            className={clsx(
              "flex w-full items-center justify-center border-t py-3 transition-all duration-200",
              pinned 
                ? "border-ds-brand/30 bg-ds-brand-light/50 text-ds-brand hover:bg-ds-brand-light" 
                : "border-ds-border text-ds-text-subtle hover:bg-ds-bg-hover hover:text-ds-text-secondary"
            )}
            title={pinned ? "בטל נעיצה" : "נעץ תפריט"}
          >
            {showExpanded ? (
              <div 
                className="flex items-center gap-2 font-medium transition-all"
                style={{ fontSize: pinned ? `${fontScale * 0.75}rem` : '0.75rem' }}
              >
                {pinned ? (
                  <>
                    <PinOff size={Math.round(iconSize * 0.7)} strokeWidth={1.5} />
                    <span>בטל נעיצה</span>
                  </>
                ) : (
                  <>
                    <Pin size={Math.round(iconSize * 0.7)} strokeWidth={1.5} />
                    <span>נעץ תפריט</span>
                  </>
                )}
              </div>
            ) : (
              pinned ? <PinOff size={16} strokeWidth={1.5} /> : <Pin size={16} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
