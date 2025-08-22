"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Remove the loading skeleton - let CategoryList handle its own loading
const CategoryList = dynamic(() => import("@/components/shared/CategoryList"), {
  ssr: true // Keep SSR for better SEO
});

const FloatingRecorderButton = dynamic(
  () => import('@/components/Voice Processing/FloatingRecorderButton')
    .catch(() => ({ default: () => null })), // Graceful fallback
  { 
    ssr: false, // This component doesn't need SSR
    loading: () => null // No loading state needed for floating button
  }
);

export default function UserCategoriesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Main content with error boundary */}
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        }
      >
        <CategoryList basePath="user" horizontal={false} />
      </Suspense>

      {/* Voice recorder - non-critical, can load later */}
      <Suspense fallback={null}>
        <FloatingRecorderButton />
      </Suspense>
    </main>
  );
}