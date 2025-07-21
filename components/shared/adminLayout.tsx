// app/admin/layout.tsx
import { ReactNode } from "react";
import AdminSidebar from "@/components/sidebar/Sbar";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
