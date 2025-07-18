"use client";

import { ReactNode } from "react";
import AdminSidebar from "../sidebar/Sbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
    
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
