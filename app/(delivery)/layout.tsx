"use client";

import { ReactNode } from "react";

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return (
      <main className="flex-1 bg-gray-50 mlg:p-6">{children}</main>
  );
}
