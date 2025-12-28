"use client";

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
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
} from "lucide-react";
import { hasSystemAdminAccess } from "@/lib/utils/roles";
import { usePermissions } from "@/app/hooks/usePagePermission";

const NAV_EXPANDED_WIDTH = 240; // מעט רחב יותר כדי להכיל כותרות בנוחות
const NAV_COLLAPSED_WIDTH = 64;
const ORG_NAME = "עמותת PosSEAble";

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const width = expanded ? NAV_EXPANDED_WIDTH : NAV_COLLAPSED_WIDTH;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<{
    full_name: string;
    role: string;
    role_group_code?: string | null;
  } | null>(null);

  // קריאה מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nav_pinned") === "true";
    setPinned(saved);
    setExpanded(saved);
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

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
    return () => {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        `${NAV_EXPANDED_WIDTH}px`
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

  type MenuChild = {
    pageKey?: string;
    href: string;
    label: string;
    query?: Record<string, string>;
  };

  type MenuItem = {
    pageKey: string;
    href?: string;
    icon: ReactNode;
    label: string;
    children?: MenuChild[];
  };

  type MenuSection = {
    id: string;
    title?: string;
    items: MenuItem[];
  };

  // --- Menu Definitions ---

  const menuSections: MenuSection[] = [
    {
      id: "main",
      items: [
        {
          pageKey: "dashboard",
          href: "/dashboard",
          icon: <Home size={22} />,
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
          icon: <UserCircle size={22} />,
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
          icon: <Users size={22} />,
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
          icon: <Heart size={22} />,
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
          icon: <Handshake size={22} />,
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
          pageKey: "activities",
          href: "/activities",
          icon: <Calendar size={22} />,
          label: "פעילויות",
          children: [
            { href: "/activities", label: "דף הבית", pageKey: "activities" },
            {
              href: "/activities",
              label: "רשימת פעילויות",
              pageKey: "activities-list",
              query: { view: "list" },
            },
            {
              href: "/activities",
              label: "גאנט פעילויות",
              pageKey: "activities-gantt",
              query: { view: "gantt" },
            },
          ],
        },
        {
          pageKey: "seasons",
          href: "/seasons",
          icon: <CalendarRange size={22} />,
          label: "עונות",
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
          icon: <Wrench size={22} />,
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
          pageKey: "finance",
          href: "/finance",
          icon: <Wallet size={22} />,
          label: "כספים",
        },
        {
          pageKey: "system-settings",
          href: "/system-settings",
          icon: <Settings size={22} />,
          label: "הגדרות מערכת",
        },
      ],
    },
  ];

  const { permissions, loading: permissionsLoading } = usePermissions();

  const hasAccess = (key?: string, fallback?: string) => {
    if (permissionsLoading) return true;
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

  // סינון הפריטים והסקשנים לפי הרשאות
  const filteredSections = useMemo(() => {
    return menuSections
      .map((section) => {
        const visibleItems = section.items
          .map((item) => {
            // 1. סינון ילדים
            if (item.children?.length) {
              const visibleChildren = item.children.filter((child) =>
                hasAccess(child.pageKey, item.pageKey)
              );
              if (visibleChildren.length === 0) return null; // אם אין ילדים רלוונטיים
              return { ...item, children: visibleChildren };
            }

            // 2. סינון פריטים רגילים
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
      .filter((section) => section.items.length > 0); // הסתרת סקשנים ריקים
  }, [menuSections, isAdmin, permissions, permissionsLoading]);

  // --- Logic for Open/Close Menus ---

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // מציאת ה-Top Level הנוכחי (איטרציה כפולה כי זה מקונן בתוך סקשנים)
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

  // פתיחה אוטומטית בטעינה ראשונית
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

  // סגירה של תפריט קודם כשעוברים למודול אחר
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

  // לוגיקה לטיפול בשינוי נתיב (למשל סגירת תפריטים לא רלוונטיים)
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
      // לוגיקת אקורדיון: אם פותחים אחד, סוגרים את האחרים
      if (!isOpen) {
        return { [pageKey]: true };
      }
      return {};
    });
  };

  const handleParentTrigger = (pageKey: string) => {
    if (!expanded) {
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
      if (!child.query) return true;
      if (!searchParams) return false;
      return Object.entries(child.query).every(
        ([key, value]) => searchParams.get(key) === value
      );
    };
    const isActive = hasChildren
      ? item.children!.some(childIsActive)
      : item.href === "/"
      ? pathname === "/"
      : item.href
      ? pathname?.startsWith(item.href)
      : false;

    const isOpen = openMenus[item.pageKey] ?? isActive;

    if (!hasChildren) {
      return (
        <Link
          key={item.href}
          href={item.href || "#"}
          className={clsx(
            "flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition group",
            expanded ? "gap-3" : "justify-center",
            isActive
              ? "bg-sky-100 text-sky-700 shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
          title={!expanded ? item.label : undefined}
        >
          {item.icon}
          {expanded && <span>{item.label}</span>}
        </Link>
      );
    }

    return (
      <div
        key={item.pageKey}
        className={clsx(
          "rounded-lg transition-colors",
          isActive && !expanded && "bg-sky-50", // הדגשה עדינה כשהתפריט סגור
          isActive && expanded && "bg-sky-50/50" // רקע עדין כשהתפריט פתוח והאבא פעיל
        )}
      >
        <div
          className={clsx(
            "flex items-center px-3 py-2 text-sm font-semibold transition cursor-pointer select-none",
            expanded ? "gap-3" : "justify-center",
            isActive ? "text-sky-700" : "text-gray-600 hover:text-gray-900",
            !isActive && "hover:bg-gray-100 rounded-lg" // Hover רק כשלא פעיל
          )}
          role="button"
          tabIndex={0}
          onClick={() => handleParentTrigger(item.pageKey)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleParentTrigger(item.pageKey);
            }
          }}
          title={!expanded ? item.label : undefined}
        >
          <div
            className={clsx(
              "flex flex-1 items-center",
              expanded ? "gap-3" : "justify-center"
            )}
          >
            {item.icon}
            {expanded && <span>{item.label}</span>}
          </div>
          {expanded && (
            <ChevronDown
              size={16}
              className={clsx(
                "text-gray-400 transition-transform duration-200",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            />
          )}
        </div>

        {/* Children Container */}
        {expanded && (
          <div
            className={clsx(
              "flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out",
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
                    "mr-9 rounded-md px-3 py-1.5 text-xs font-medium transition", // הזחה (Indentation)
                    childActive
                      ? "bg-sky-100 text-sky-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
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

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white shadow-xl border-l border-gray-100 transition-all duration-300 z-50`}
      onMouseEnter={() => !pinned && setExpanded(true)}
      onMouseLeave={() => !pinned && setExpanded(false)}
      style={{ width }}
    >
      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="relative h-16 border-b border-gray-100 px-4 flex items-center justify-center overflow-hidden">
          {/* ניתן להחזיר את תמונת הלוגו אם קיימת, כאן עיצוב נקי */}
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-10"
            style={{ backgroundImage: "url('/logo.png')" }}
          />

          {expanded ? (
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-lg font-bold text-gray-800 tracking-tight">
                {ORG_NAME}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                System Manager
              </span>
            </div>
          ) : (
            <div className="relative z-10 font-bold text-gray-800 text-xl">
              P
            </div>
          )}
        </div>

        {/* Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <nav className="flex flex-col gap-6 px-3 py-4">
            {filteredSections.map((section, index) => (
              <div key={section.id} className="flex flex-col gap-1">
                {/* Section Title */}
                {expanded && section.title && (
                  <div className="px-3 mb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                )}
                {/* Separator for collapsed mode if not first item */}
                {!expanded && index > 0 && (
                  <div className="my-2 mx-2 border-t border-gray-100" />
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
        <div className="border-t border-gray-100 bg-gray-50/50">
          {/* User Info */}
          <div className="px-4 py-3">
            <div
              className={clsx(
                "flex items-center",
                expanded ? "gap-3" : "justify-center"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-bold border-2 border-white shadow-sm">
                {(userInfo?.full_name || "U")[0]}
              </div>
              {expanded && (
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-semibold text-gray-700">
                    {userInfo?.full_name || "אורח"}
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {userInfo?.role || "משתמש"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {expanded && (
            <div className="px-4 pb-3 flex gap-2">
              <button
                onClick={handleResetPassword}
                className="flex-1 rounded-md border border-gray-200 bg-white py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition"
              >
                סיסמה
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-md border border-red-100 bg-red-50 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-100 hover:text-red-700 transition"
              >
                יציאה
              </button>
            </div>
          )}

          {/* Pin Button */}
          <button
            onClick={togglePin}
            className="flex w-full items-center justify-center border-t border-gray-100 py-3 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            title={pinned ? "בטל נעיצה" : "נעץ תפריט"}
          >
            {expanded ? (
              <div className="flex items-center gap-2 text-xs font-medium">
                <ArrowRightCircle
                  size={16}
                  className={clsx(
                    "transition-transform",
                    pinned && "rotate-180"
                  )}
                />
                <span>{pinned ? "מצב נעוץ" : "נעיצת תפריט"}</span>
              </div>
            ) : (
              <ArrowRightCircle size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
