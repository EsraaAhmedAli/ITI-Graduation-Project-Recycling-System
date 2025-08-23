"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Clean dynamic imports - let components handle their own loading
const CategoryList = dynamic(() => import("@/components/shared/CategoryList"), {
  ssr: true // Keep SSR for SEO
});

const FloatingRecorderButton = dynamic(
  () => import('@/components/Voice Processing/FloatingRecorderButton')
    .catch(() => ({ default: () => null })),
  { 
    ssr: false,
    loading: () => null
  }
);

export default function UserCategoriesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Main content - let CategoryList handle its own loading state */}
      <Suspense fallback={null}>
        <CategoryList 
          basePath="user" 
          horizontal={false}
          maxToShow={10} // Limit initial render for performance
        />
      </Suspense>

      {/* Voice recorder - load after main content */}
      <Suspense fallback={null}>
        <FloatingRecorderButton />
      </Suspense>
    </main>
  );
}