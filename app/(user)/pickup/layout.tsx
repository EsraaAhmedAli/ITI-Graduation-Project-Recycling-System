// app/pickup/layout.tsx
"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/lib/userProtectedRoute"; // Adjust the path as needed

export default function PickupLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["customer", "buyer"]}>
      {children}
    </ProtectedRoute>
  );
}
