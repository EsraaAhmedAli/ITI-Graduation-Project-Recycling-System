"use client";

import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Layers,
  LogOutIcon,
  Check,
  Moon,
  Sun,
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
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const authContext = useContext(UserAuthContext);
  const logout = authContext?.logout;

  useEffect(() => {
    setIsHydrated(true);
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === "true");
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => {
      const newState = !prev;
      if (isHydrated) {
        localStorage.setItem("sidebarCollapsed", String(newState));
      }
      return newState;
    });
  }, [isHydrated]);

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newTheme;
    });
  }, []);

  const renderedMenuItems = useMemo(() => {
    return menuItems.map(({ label, icon: Icon, href }) => {
      const isActive = pathname === href;
      
      const content = (
        <>
          <Icon size={20} />
          {!collapsed && <span >{label}</span>}
        </>
      );

   const baseClasses = clsx(
  "flex items-center gap-3 px-6 py-3 transition-colors",
  "sidebar-link",
  collapsed && "justify-center px-4"
);


      return (
        <li key={label}>
          <Link
            href={href}
            prefetch={true}
            style={{color:"var(--color-700)"}}
            className={clsx(
              baseClasses,
             isActive && "active-link"

            )}
          >
            {content}
          </Link>
        </li>
      );
    });
  }, [pathname, collapsed]);

  if (!isHydrated) {
    return (
      <aside className="bg-white dark:bg-gray-900 shadow-lg h-full border-r border-gray-200 dark:border-gray-800 w-20 flex flex-col">
        <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          X
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={clsx(
        "shadow-lg h-full border-r transition-all duration-300 flex flex-col",
        "bg-white border-gray-200",
        "dark:bg-gray-900 dark:border-gray-800",
        collapsed ? "w-20" : "w-64"
      )}

      style={{ background:"var(--color-base-100)"}}
    >
      <div
        className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer flex-shrink-0"
        style={{ background:"var(--color-base-100)"}}
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
        <span className="text-green-600 dark:text-green-400 text-sm ml-auto">
          {collapsed ? "»" : "«"}
        </span>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1 "  style={{color:"var(--foreground)" }}>
          {renderedMenuItems}
          
          {/* Dark Mode and Logout buttons container */}
          <div className={clsx(
            "border-t border-gray-200 dark:border-gray-700 mt-auto" ,
            collapsed ? "pt-1" : "pt-2"
          )}>
            {/* Dark Mode Toggle Button */}
            <li>
              <button
                onClick={toggleTheme}
                className={clsx(
                  "flex items-center gap-3 w-full px-6 py-3 transition-colors",
                  "text-gray-700 hover:bg-green-50 hover:text-green-700",
                  "dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-400",
                  collapsed && "justify-center px-4"
                )}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                {!collapsed && <span>Dark Mode</span>}
              </button>
            </li>
            
            {/* Logout Button */}
            <li>
              <button
                onClick={logout}
                className={clsx(
                  "flex items-center gap-3 w-full px-6 py-3 transition-colors",
                  "text-gray-700 hover:bg-green-50 hover:text-green-700",
                  "dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-400",
                  collapsed && "justify-center px-4"
                )}
              >
                <LogOutIcon size={20} />
                {!collapsed && <span>Logout</span>}
              </button>
            </li>
          </div>
        </ul>
      </nav>
    </aside>
  );
}