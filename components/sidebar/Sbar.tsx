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
import { useLanguage } from "@/context/LanguageContext";

const menuItemsConfig = [
  { key: "dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { key: "categories", icon: Layers, href: "/admin/categories" },
  { key: "users", icon: Users, href: "/admin/users" },
  { key: "orders", icon: ShoppingCart, href: "/admin/pickups" },
  { key: "transactions", icon: FaMoneyBill, href: "/admin/transactions" },
  { key: "approve", icon: Check, href: "/admin/deliveryapprove" },
];

export default function AdminSidebar() {
  const { t, locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const authContext = useContext(UserAuthContext);
  const logout = authContext?.logout;

  const menuItems = useMemo(
    () =>
      menuItemsConfig.map((item) => ({
        ...item,
        label: t(`sidebar.${item.key}`),
      })),
    [t]
  );

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

      return (
        <li key={href}>
          <Link
            href={href}
            prefetch={true}
            style={{ color: "var(--color-700)" }}
            className={clsx(
              "flex items-center gap-3 px-6 py-3 transition-colors sidebar-link",
              collapsed && "justify-center px-4",
              isActive && "active-link"
            )}
          >
            <Icon size={20} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        </li>
      );
    });
  }, [pathname, collapsed, menuItems]);

  if (!isHydrated) {
    return (
      <aside className="bg-white dark:bg-gray-900  min-h-screen border-r border-gray-200 dark:border-gray-800 w-20 flex flex-col flex-shrink-0">
        <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          X
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={clsx(
        " min-h-screen border-r transition-all duration-300 flex flex-col flex-shrink-0",
        "bg-white border-gray-200",
        "dark:bg-gray-900 dark:border-gray-800",
        collapsed ? "w-20" : "w-64"
      )}
      style={{ background: "var(--background)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer flex-shrink-0"
        style={{ color: "var(--color-green-600)" }}
        onClick={toggleSidebar}
      >
        <span className="text-2xl font-extrabold brand-gradient-text bg-clip-text text-transparent">
          {collapsed ? "K" : "KaraKeeb"}
        </span>

        <span className="text-green-600 dark:text-green-400 text-sm ml-auto flex-shrink-0">
          {collapsed ? "»" : "«"}
        </span>




      </div>

      {/* Language Toggle - Only show when expanded */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-center gap-1 px-1 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors mx-auto max-w-[120px]">
            <span
              className={`text-xs font-medium ${locale === "en"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500"
                }`}
            >
              EN
            </span>
            <button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              className="relative w-6 h-3 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{
                backgroundColor:
                  locale === "ar" ? "#3B82F6" : darkMode ? "#4B5563" : "#D1D5DB",
              }}
              title="Toggle Language"
            >
              <div
                className="absolute top-0.5 left-0.5 w-2 h-2 bg-white dark:bg-gray-200 rounded-full shadow-sm transform transition-transform duration-200"
                style={{
                  transform:
                    locale === "ar" ? "translateX(12px)" : "translateX(0)",
                }}
              />
            </button>
            <span
              className={`text-xs font-medium ${locale === "ar"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500"
                }`}
            >
              AR
            </span>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1" style={{ color: "var(--foreground)" }}>
          {renderedMenuItems}

          {/* Footer buttons */}
          <div
            className={clsx(
              "border-t border-gray-200 dark:border-gray-700 mt-auto",
              collapsed ? "pt-1" : "pt-2"
            )}
          >
            {/* Dark Mode */}
            <li>
              <button
                onClick={toggleTheme}
                className={clsx(
                  "flex items-center gap-3 w-full px-6 py-3 transition-colors",
                  "text-gray-700 hover:bg-green-50 hover:text-green-700",
                  "dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-400",
                  collapsed && "justify-center px-4"
                )}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                {!collapsed && <span className="truncate">{t("sidebar.dark_mode")}</span>}
              </button>
            </li>

            {/* Logout */}
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
                {!collapsed && <span className="truncate">{t("sidebar.logout")}</span>}
              </button>
            </li>
          </div>
        </ul>
      </nav>
    </aside>
  );
}