"use client";

import DynamicBreadcrumbs from "@/components/breadcrumbs/breadcrumbs";


export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    < >
    
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <DynamicBreadcrumbs />
        </div>
      </div>
    {children}
    
    
    </>
  );
}
