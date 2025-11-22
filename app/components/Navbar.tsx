"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);

  // קריאה מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nav_pinned") === "true";
    setPinned(saved);
    setExpanded(saved);
  }, []);

  const togglePin = () => {
    const newVal = !pinned;
    setPinned(newVal);
    localStorage.setItem("nav_pinned", newVal.toString());
    setExpanded(newVal);
  };

  const menuItems = [
    { href: "/dashboard", icon: <Home size={22} />, label: "דף הבית" },
    { href: "/volunteers", icon: <Users size={22} />, label: "מתנדבים" },
    { href: "/surfers", icon: <UserCircle size={22} />, label: "גולשים" },
    { href: "/activities", icon: <Calendar size={22} />, label: "פעילויות" },
    { href: "/equipment", icon: <Wrench size={22} />, label: "ציוד" },
    { href: "/suppliers", icon: <Handshake size={22} />, label: "ספקים" },
    { href: "/donors", icon: <Heart size={22} />, label: "תורמים" },
    { href: "/finance", icon: <Wallet size={22} />, label: "כספים" },
  ];

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white shadow-lg border-l transition-all duration-300
        ${expanded ? "w-56" : "w-16"}
      `}
      onMouseEnter={() => !pinned && setExpanded(true)}
      onMouseLeave={() => !pinned && setExpanded(false)}
    >
      {/* Logo */}
      <div className="p-4 font-bold text-xl border-b">P</div>

      {/* Menu */}
      <div className="flex flex-col mt-4 gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md transition"
          >
            {item.icon}
            {expanded && <span className="text-base">{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* Pin button */}
      <button
        onClick={togglePin}
        className="absolute bottom-4 right-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition"
      >
        <ArrowRightCircle
          size={22}
          className={pinned ? "rotate-180 transition" : "transition"}
        />
      </button>
    </div>
  );
}
