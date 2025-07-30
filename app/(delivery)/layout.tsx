"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/lib/userProtectedRoute";

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["delivery"]}>
      <main className="flex-1 bg-gray-50 mlg:p-6">{children}</main>
    </ProtectedRoute>
  );
}
