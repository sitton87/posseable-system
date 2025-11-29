"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { isAdminRole } from "@/lib/utils/roles";

const NAV_EXPANDED_WIDTH = 224; // Tailwind w-56
const NAV_COLLAPSED_WIDTH = 64; // Tailwind w-16
const ORG_NAME = "עמותת Posseable";

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const width = expanded ? NAV_EXPANDED_WIDTH : NAV_COLLAPSED_WIDTH;
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<{
    full_name: string;
    role: string;
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

  const isAdmin = userInfo?.role ? isAdminRole(userInfo.role) : false;

  const baseMenuItems = [
    { href: "/dashboard", icon: <Home size={22} />, label: "דף הבית" },
    { href: "/volunteers", icon: <Users size={22} />, label: "מתנדבים" },
    { href: "/surfers", icon: <UserCircle size={22} />, label: "גולשים" },
    { href: "/groups", icon: <UsersRound size={22} />, label: "קבוצות" },
    { href: "/activities", icon: <Calendar size={22} />, label: "פעילויות" },
    { href: "/seasons", icon: <CalendarRange size={22} />, label: "עונות" },
    { href: "/equipment", icon: <Wrench size={22} />, label: "ציוד" },
    { href: "/suppliers", icon: <Handshake size={22} />, label: "ספקים" },
    { href: "/donors", icon: <Heart size={22} />, label: "תורמים" },
    { href: "/finance", icon: <Wallet size={22} />, label: "כספים" },
  ];

  const menuItems = isAdmin
    ? [
        ...baseMenuItems,
        {
          href: "/system-settings",
          icon: <Settings size={22} />,
          label: "הגדרות מערכת",
        },
      ]
    : baseMenuItems;

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
            {menuItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
