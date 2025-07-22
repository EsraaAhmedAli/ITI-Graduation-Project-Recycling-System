// app/admin/layout.tsx
import { ReactNode } from "react";
import AdminSidebar from "@/components/sidebar/Sbar";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}