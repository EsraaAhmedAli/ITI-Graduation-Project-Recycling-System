// app/marketplace/page.tsx (Server Component)
import { Metadata } from "next";
import { Suspense } from "react";
import MarketplaceClient from "./components/MarketPlaceClient";
import api from "@/lib/axios";
import Loader from "@/components/common/Loader";

// SEO: Static metadata
export const metadata: Metadata = {
  title: "Sustainable Marketplace - Eco-Friendly Products",
  description:
    "Browse our sustainable marketplace with eco-friendly products. Find recycled items, green alternatives, and sustainable solutions.",
  keywords: "sustainable, marketplace, eco-friendly, recycling, green products",
  openGraph: {
    title: "Sustainable Marketplace",
    description: "Browse eco-friendly products in our sustainable marketplace",
    type: "website",
  },
};

interface Item {
  _id: string;
  name: string;
  points: number;
  price: number;
  measurement_unit: number;
  image: string;
  categoryName: string;
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

// Server-side data fetching
async function getServerData(): Promise<ServerData> {
  try {
    // Fetch initial data on server (no user context yet)
    const [itemsResponse, categoriesResponse] = await Promise.all([
      api.get("/categories/get-items?page=1&limit=10"),
      api.get("/categories/get-items?page=1&limit=50"), // Get all for categories
    ]);

    const items = itemsResponse.data?.data || [];
    const allItems = categoriesResponse.data?.data || [];
    console.log(allItems);
    

    const categories = Array.from(
      new Set(allItems.map((item: Item) => item.categoryName))
    ).sort();

    return {
      items,
      categories,
      pagination: itemsResponse.data?.pagination || {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  } catch (error) {
    console.error("Server data fetch error:", error);
    return {
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
}

// Main server component
export default async function MarketplacePage() {
  const serverData = await getServerData();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Server-rendered header for SEO */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          ♻️ Sustainable Marketplace
        </h1>
        <p className="text-gray-600 text-sm">
          Discover eco-friendly products and sustainable solutions
        </p>
      </header>

      {/* Suspense boundary for client component */}
      <Suspense fallback={<Loader title="items" />}>
        <MarketplaceClient initialData={serverData} />
      </Suspense>
    </div>
  );
}
