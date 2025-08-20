"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import AdminSidebar from "@/components/sidebar/Sbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen">
        <AdminSidebar/>
        <main className="flex-1 min-h-screen mlg:p-6" style={{background: "var(--color-base-100)"}}>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
