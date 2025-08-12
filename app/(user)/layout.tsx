"use client";
import DynamicBreadcrumbs from "@/components/breadcrumbs/breadcrumbs";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Using custom CSS variables instead of Tailwind dark: classes */}
      <div className="bg-card border-b border-card">
        <div className="container mx-auto px-4 py-3">
          <DynamicBreadcrumbs />
        </div>
      </div>
      {children}
    </>
  );
}