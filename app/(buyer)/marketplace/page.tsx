// app/marketplace/page.tsx (Server Component)
import { Metadata } from "next";
import { Suspense } from "react";
import MarketplaceClient from "./components/MarketPlaceClient";
import api from "@/lib/axios";

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
        url: "/og-marketplace.jpg",
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

// Optimized server-side data fetching
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
    // Single API call to get both items and categories
    const itemsResult = await api.get("/get-items?page=1&limit=50", {
      timeout: 8000,
      headers: {
        'Cache-Control': 'public, max-age=300',
      }
    });

    const items = itemsResult.data?.data || [];
    
    // Extract categories from items
    const categories = [...new Set(
      items.map((item: Item) => item.categoryName.en)
    )].sort();

    // Paginate items for initial display
    const paginatedItems = items.slice(0, 10);
    const pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / 10),
      hasNextPage: items.length > 10,
      hasPreviousPage: false,
    };

    return {
      items: paginatedItems,
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

// Main server component
export default async function MarketplacePage() {
  let serverData: ServerData;
  
  try {
    serverData = await getServerData();
  } catch (error) {
    console.error("Failed to fetch server data:", error);
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
      {/* Server-rendered header */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2"style={{color:"var(--color-base-800)"}}>
          ♻️ Sustainable Marketplace
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Discover eco-friendly products and sustainable solutions
        </p>
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

export const revalidate = 300;