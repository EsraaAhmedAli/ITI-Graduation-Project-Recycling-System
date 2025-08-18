// app/marketplace/page.tsx (Server Component)
import { Metadata } from "next";
import { Suspense } from "react";
import MarketplaceClient from "./components/MarketPlaceClient";
import api from "@/lib/axios";
import Loader from "@/components/common/Loader";

// Enhanced SEO metadata
export const metadata: Metadata = {
  title: "Sustainable Marketplace - Eco-Friendly Products | GreenShop",
  description: "Discover thousands of eco-friendly products in our sustainable marketplace. Shop recycled items, green alternatives, and sustainable solutions with fast delivery.",
  keywords: "sustainable marketplace, eco-friendly products, recycled items, green shopping, environmentally friendly, sustainable living, zero waste",
  openGraph: {
    title: "Sustainable Marketplace - Eco-Friendly Products",
    description: "Browse thousands of eco-friendly products in our sustainable marketplace",
    type: "website",
    images: [
      {
        url: "/og-marketplace.jpg", // Add this image to your public folder
        width: 1200,
        height: 630,
        alt: "Sustainable Marketplace Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sustainable Marketplace - Eco-Friendly Products",
    description: "Browse thousands of eco-friendly products in our sustainable marketplace",
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface Item {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  points: number;
  price: number;
  measurement_unit: 1 | 2;
  image: string;
  categoryName: {
    en: string;
    ar: string;
  };
  quantity: number;
}

interface ServerData {
  items: Item[];
  categories: string[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Optimized server-side data fetching with better error handling and caching
async function getServerData(): Promise<ServerData> {
  const defaultData: ServerData = {
    items: [],
    categories: [],
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  try {
    // Use Promise.allSettled for better error resilience
    const [itemsResult, categoriesResult] = await Promise.allSettled([
      api.get("/categories/get-items?page=1&limit=10", {
        timeout: 5000, // 5 second timeout
        headers: {
          'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        }
      }),
      api.get("/categories/get-items?page=1&limit=50", {
        timeout: 8000, // 8 second timeout for larger request
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache categories for 5 minutes
        }
      }),
    ]);

    let items: Item[] = [];
    let pagination = defaultData.pagination;
    
    if (itemsResult.status === 'fulfilled') {
      items = itemsResult.value.data?.data || [];
      pagination = itemsResult.value.data?.pagination || defaultData.pagination;
    } else {
      console.error("Items fetch failed:", itemsResult.reason);
    }

    let categories: string[] = [];
    if (categoriesResult.status === 'fulfilled') {
      const allItems = categoriesResult.value.data?.data || [];
      categories = [...new Set(
        allItems.map((item: Item) => item.categoryName.en)
      )].sort();
    } else {
      console.error("Categories fetch failed:", categoriesResult.reason);
    }

    return {
      items,
      categories,
      pagination,
    };
  } catch (error) {
    console.error("Critical server data fetch error:", error);
    return defaultData;
  }
}

// Loading component optimized for marketplace
function MarketplaceLoader() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-6 text-center">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
      </div>
      
      {/* Search skeleton */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-lg w-full sm:w-40 animate-pulse" />
        </div>
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Main server component with streaming and error boundaries
export default async function MarketplacePage() {
  let serverData: ServerData;
  
  try {
    serverData = await getServerData();
  } catch (error) {
    console.error("Failed to fetch server data:", error);
    // Fallback to empty data rather than throwing
    serverData = {
      items: [],
      categories: [],
      pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Server-rendered header for better SEO and immediate content */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          ♻️ Sustainable Marketplace
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Discover eco-friendly products and sustainable solutions
        </p>
        {/* Add some server-rendered stats for instant content */}
        {serverData.pagination.totalItems > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Over {serverData.pagination.totalItems} sustainable products available
          </p>
        )}
      </header>

      {/* Suspense boundary with optimized loading */}
      <Suspense fallback={<MarketplaceLoader />}>
        <MarketplaceClient initialData={serverData} />
      </Suspense>
    </div>
  );
}

// Optional: Add revalidation for ISR if using App Router with static generation
export const revalidate = 300; // Revalidate every 5 minutes