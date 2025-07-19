// app/admin/layout.tsx
"use client";

import { ProtectedRoute } from "@/lib/userProtectedRoute"; // or wherever your component lives

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>{children}</ProtectedRoute>
  );
}
