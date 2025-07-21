"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import AdminSidebar from "@/components/sidebar/Sbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen">
        <AdminSidebar />
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
