// Add this component at the top of your file or create a separate file
export  const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50 sm:bg-transparent" style={{ background: "var(--background)" }}>
    <div className="px-3 py-4 sm:px-4 sm:py-6 md:p-6 space-y-4 sm:space-y-6 md:space-y-7 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 p-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
          <div className="h-full bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);