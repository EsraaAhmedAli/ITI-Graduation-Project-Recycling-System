"use client";

import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Layers,
  LogOutIcon,
  Check,
  
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { UserAuthContext } from "@/context/AuthFormContext";
import { FaMoneyBill } from "react-icons/fa";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Categories", icon: Layers, href: "/admin/categories" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/pickups" },
  { label: "Transactions", icon: FaMoneyBill, href: "/admin/transactions" },
  { label: "approve", icon: Check, href: "/admin/deliveryapprove" },
  { label: "Logout", icon: LogOutIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const authContext = useContext(UserAuthContext);
  const logout = authContext?.logout;

  // Handle hydration and initial localStorage read
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  // Memoized toggle function to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => {
      const newState = !prev;
      // Only update localStorage after hydration
      if (isHydrated) {
        localStorage.setItem("sidebarCollapsed", String(newState));
      }
      return newState;
    });
  }, [isHydrated]);

  // Memoize menu items to prevent re-rendering when props don't change
  const renderedMenuItems = useMemo(() => {
    return menuItems.map(({ label, icon: Icon, href }) => {
      const isLogout = label === "Logout";
      const isActive = pathname === href;
      
      const content = (
        <>
          <Icon size={20} />
          {!collapsed && <span>{label}</span>}
        </>
      );

      const baseClasses = clsx(
        "flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors",
        collapsed && "justify-center px-4"
      );

      return (
        <li key={label}>
          {isLogout ? (
            <button
              onClick={logout}
              className={clsx(baseClasses, "cursor-pointer w-full")}
              type="button"
            >
              {content}
            </button>
          ) : href ? (
            <Link
              href={href}
              prefetch={true}
              className={clsx(
                baseClasses,
                isActive && "bg-green-100 text-green-800 font-semibold"
              )}
            >
              {content}
            </Link>
          ) : null}
        </li>
      );
    });
  }, [pathname, collapsed, logout]);

  // Prevent hydration mismatch by showing consistent state initially
  if (!isHydrated) {
    return (
      <aside className="bg-white shadow-lg h-full border-r border-gray-200 w-20 flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 flex-shrink-0">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-accent-content to-success bg-clip-text text-transparent">
            X
          </span>
          <span className="text-green-600 text-sm ml-auto">»</span>
        </div>
        <nav className="mt-4 flex-1">
          <ul className="flex flex-col gap-1">
            {menuItems.map(({ label, icon: Icon }) => (
              <li key={label}>
                <div className="flex items-center justify-center px-4 py-3 text-gray-400">
                  <Icon size={20} />
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    );
  }

  return (
    <aside
      className={clsx(
        "bg-white shadow-lg h-full border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className="flex items-center gap-2 p-4 border-b border-gray-200 cursor-pointer flex-shrink-0"
        onClick={toggleSidebar}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSidebar();
          }
        }}
      >
        <span className="text-2xl font-extrabold bg-gradient-to-r from-accent-content to-success bg-clip-text text-transparent">
          {collapsed ? "X" : "Xchange"}
        </span>
        <span className="text-green-600 text-sm ml-auto">
          {collapsed ? "»" : "«"}
        </span>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {renderedMenuItems}
        </ul>
      </nav>
    </aside>
  );
}