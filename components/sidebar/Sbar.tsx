"use client";

import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Layers,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useContext, useState } from "react";
import { UserAuthContext } from "@/context/AuthFormContext";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Categories", icon: Layers, href: "/admin/categories" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/pickups" },
  { label: "Logout", icon: LogOutIcon },
];


export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const{logout}=useContext(UserAuthContext) ??{}

  return (
    <aside
      className={clsx(
        "bg-white shadow-lg h-screen border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
<div
  className="flex items-center gap-2 p-4 border-b border-gray-200 cursor-pointer"
  onClick={() => setCollapsed(!collapsed)}
>
  <span className="text-2xl font-extrabold bg-gradient-to-r from-accent-content to-success bg-clip-text text-transparent">
    {collapsed ? "X" : "Xchange"}
  </span>
  <span className="text-green-600 text-sm ml-auto">{collapsed ? "»" : "«"}</span>
</div>


      <nav className="mt-4">
        <ul className="flex flex-col gap-1">
        {menuItems.map(({ label, icon: Icon, href }) => {
  const isLogout = label === "Logout";

  return (
    <li key={label}>
      {isLogout ? (
        <button
          onClick={logout}
          className={clsx(
            "flex cursor-pointer w-full items-center gap-3 px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors",
            collapsed && "justify-center px-4"
          )}
        >
          <Icon size={20} />
          {!collapsed && <span>{label}</span>}
        </button>
      ) : (
        <Link
          href={href}
          className={clsx(
            "flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors",
            pathname === href && "bg-green-100 text-green-800 font-semibold",
            collapsed && "justify-center px-4"
          )}
        >
          <Icon size={20} />
          {!collapsed && <span>{label}</span>}
        </Link>
      )}
    </li>
  );
})}

        </ul>
      </nav>
    </aside>
  );
}
