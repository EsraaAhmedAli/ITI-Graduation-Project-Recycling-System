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
import { useLanguage } from "@/context/LanguageContext";

const menuItems = [
  { key: "dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { key: "Categories", icon: Layers, href: "/admin/categories" },
  { key: "users", icon: Users, href: "/admin/users" },
  { key: "orders", icon: ShoppingCart, href: "/admin/pickups" },
  { key: "transactions", icon: FaMoneyBill, href: "/admin/transactions" },
  { key: "approve", icon: Check, href: "/admin/deliveryapprove" },
  { key: "logout", icon: LogOutIcon },
];


export default function AdminSidebar() {
  const {locale,setLocale,t} = useLanguage()
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
  return menuItems.map(({ key, icon: Icon, href }) => {
    const label = t(key); // ✅ translate
    const isLogout = key === "logout";
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
      <li key={key}>
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
}, [pathname, collapsed, logout, t])

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
             <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <span
                className={`text-xs font-medium ${
                  locale === "en"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                EN
              </span>
              <button
                onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                className="relative w-8 h-4 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{
                  backgroundColor:
                    locale === "ar" ? "#3B82F6": "#D1D5DB",
                }}
                title="Toggle Language"
              >
                <div
                  className="absolute top-0.5 left-0.5 w-3 h-3 bg-white dark:bg-gray-200 rounded-full shadow-sm transform transition-transform duration-200"
                  style={{
                    transform:
                      locale === "ar" ? "translateX(16px)" : "translateX(0)",
                  }}
                />
              </button>
              <span
                className={`text-xs font-medium ${
                  locale === "ar"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                AR
              </span>
            </div>
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