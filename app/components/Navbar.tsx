"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
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
  UsersRound,
  Settings,
  ChevronDown,
} from "lucide-react";
import { hasSystemAdminAccess } from "@/lib/utils/roles";
import { usePermissions } from "@/app/hooks/usePagePermission";

const NAV_EXPANDED_WIDTH = 224; // Tailwind w-56
const NAV_COLLAPSED_WIDTH = 64; // Tailwind w-16
const ORG_NAME = "עמותת Posseable";

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

  const baseMenuItems: MenuItem[] = [
    {
      pageKey: "dashboard",
      href: "/dashboard",
      icon: <Home size={22} />,
      label: "דף הבית",
    },
    {
      pageKey: "surfers",
      href: "/surfers",
      icon: <UserCircle size={22} />,
      label: "גולשים",
    },
    {
      pageKey: "volunteers",
      href: "/volunteers",
      icon: <Users size={22} />,
      label: "מתנדבים",
    },
    {
      pageKey: "groups",
      href: "/groups",
      icon: <UsersRound size={22} />,
      label: "קבוצות",
    },
    {
      pageKey: "seasons",
      href: "/seasons",
      icon: <CalendarRange size={22} />,
      label: "עונות",
    },
    {
      pageKey: "activities",
      href: "/activities",
      icon: <Calendar size={22} />,
      label: "פעילויות",
    },
    {
      pageKey: "donors",
      href: "/donors",
      icon: <Heart size={22} />,
      label: "תורמים",
    },
    {
      pageKey: "finance",
      href: "/finance",
      icon: <Wallet size={22} />,
      label: "כספים",
    },
    {
      pageKey: "suppliers",
      href: "/suppliers",
      icon: <Handshake size={22} />,
      label: "ספקים",
    },
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
  ];

  const { permissions, loading: permissionsLoading } = usePermissions();

  const expandedMenuItems: MenuItem[] = isAdmin
    ? [
        ...baseMenuItems,
        {
          pageKey: "system-settings",
          href: "/system-settings",
          icon: <Settings size={22} />,
          label: "הגדרות מערכת",
        },
      ]
    : baseMenuItems;

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

  const filteredMenuItems = expandedMenuItems
    .map((item) => {
      if (!item.children?.length) return item;
      const visibleChildren = item.children.filter((child) =>
        hasAccess(child.pageKey, item.pageKey)
      );
      return { ...item, children: visibleChildren };
    })
    .filter((item) => {
      if (item.children?.length) {
        return item.children.length > 0;
      }
      if (item.pageKey === "system-settings") {
        return isAdmin;
      }
      return hasAccess(item.pageKey);
    });

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const currentTopLevel = filteredMenuItems.find((item) => {
    if (!pathname) return false;
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href || "");
  })?.pageKey;
  const previousTopLevelRef = useRef<string | undefined>(currentTopLevel);

  useEffect(() => {
    setOpenMenus((prev) => {
      let changed = false;
      const next = { ...prev };

      filteredMenuItems.forEach((item) => {
        if (!item.children?.length) return;
        if (item.pageKey === currentTopLevel) {
          if (next[item.pageKey] !== true) {
            next[item.pageKey] = true;
            changed = true;
          }
          return;
        }
      });

      return changed ? next : prev;
    });
  }, [currentTopLevel, filteredMenuItems]);

  useEffect(() => {
    const prevTopLevel = previousTopLevelRef.current;
    if (prevTopLevel === "equipment" && currentTopLevel !== "equipment") {
      setOpenMenus((prev) => {
        if (!prev.equipment) {
          return prev;
        }
        return { ...prev, equipment: false };
      });
    }
    previousTopLevelRef.current = currentTopLevel;
  }, [currentTopLevel]);

  const toggleMenu = (pageKey: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [pageKey]: !prev[pageKey],
    }));
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white shadow-lg border-l transition-all duration-300`}
      onMouseEnter={() => !pinned && setExpanded(true)}
      onMouseLeave={() => !pinned && setExpanded(false)}
      style={{ width }}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-lg font-bold text-white">
            P
          </div>
          {expanded && (
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {ORG_NAME}
              </div>
              <div className="text-xs text-gray-500">מערכת הניהול</div>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <nav className="flex flex-col gap-1">
            {filteredMenuItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const childIsActive = (child: MenuChild) => {
                if (!pathname) return false;
                const pathMatch =
                  child.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(child.href);
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
                      "flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition",
                      expanded ? "gap-3" : "justify-center",
                      isActive
                        ? "bg-sky-100 text-sky-700 shadow-inner"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
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
                    "rounded-lg",
                    isActive && "bg-sky-50 text-sky-700 shadow-inner"
                  )}
                >
                  <div
                    className={clsx(
                      "flex items-center px-3 py-2 text-sm font-semibold transition",
                      expanded ? "gap-3" : "justify-center",
                      isActive ? "text-sky-700" : "text-gray-600"
                    )}
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
                      <button
                        type="button"
                        onClick={(e) => {
                          toggleMenu(item.pageKey);
                        }}
                        className="text-gray-500 transition hover:text-gray-700"
                        aria-label={
                          isOpen
                            ? `סגירת תפריט ${item.label}`
                            : `פתיחת תפריט ${item.label}`
                        }
                      >
                        <ChevronDown
                          size={18}
                          className={clsx(
                            "transition-transform",
                            isOpen ? "rotate-180" : "rotate-0"
                          )}
                        />
                      </button>
                    )}
                  </div>
                  {expanded && (
                    <div
                      className={clsx(
                        "flex flex-col gap-1 overflow-hidden px-4 text-sm transition-all",
                        isOpen
                          ? "max-h-96 pb-2"
                          : "max-h-0 pb-0 opacity-0 pointer-events-none"
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
                              "rounded-md px-3 py-1 text-xs font-semibold transition",
                              childActive
                                ? "bg-sky-100 text-sky-700"
                                : "text-gray-600 hover:bg-gray-100"
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
            })}
          </nav>
        </div>

        {/* User Panel */}
        <div className="border-t px-4 py-3 text-right">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
              {(userInfo?.full_name || "א")[0]}
            </div>
            {expanded && (
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-gray-900">
                  {userInfo?.full_name || "משתמש"}
                </span>
                <span className="text-gray-500">
                  {userInfo?.role || "חבר צוות"}
                </span>
              </div>
            )}
          </div>
          <div
            className={`mt-3 flex ${
              expanded ? "flex-row gap-2" : "flex-col gap-2"
            }`}
          >
            <button
              onClick={handleResetPassword}
              className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
              title="החלפת סיסמה"
            >
              {expanded ? "החלפת סיסמה" : "🔒"}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 rounded-md bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              title="התנתקות"
            >
              {expanded ? "התנתקות" : "⏻"}
            </button>
          </div>
        </div>

        {/* Pin button */}
        <div className="border-t px-4 py-3">
          <button
            onClick={togglePin}
            className="flex w-full items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            <ArrowRightCircle
              size={20}
              className={pinned ? "rotate-180 transition" : "transition"}
            />
            {expanded && (
              <span className="mr-2">{pinned ? "בטל נעיצה" : "נעץ תפריט"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
