// ItemDetailsPageSkeleton.tsx
"use client";

const ItemDetailsPageSkeleton = () => {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image Skeleton */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-xl bg-gray-200 overflow-hidden shadow-sm animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            {/* Category and Title Skeleton */}
            <div className="animate-pulse">
              <div className="inline-block px-3 py-1 rounded-full bg-gray-200 h-6 w-24 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>

            {/* Price Skeleton */}
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Stock Status Skeleton */}
            <div className="pt-4 border-t border-gray-200 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>

              {/* Stock Indicator Bar */}
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse">
                  <div className="h-2 bg-gray-300 rounded-full w-1/2"></div>
                </div>
                <div className="flex justify-between mt-1">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>

            {/* Quantity Selector Skeleton */}
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="w-20 h-10 bg-gray-200 rounded-lg"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>

            {/* Add to Cart Button Skeleton */}
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Additional Product Info Skeleton */}
        <div className="mt-16 space-y-8">
          {/* Recycling Process Skeleton */}
          <div className="rounded-xl p-8 animate-pulse" style={{ background: "var(--text-gray-100)" }}>
            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsPageSkeleton;