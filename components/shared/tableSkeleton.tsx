import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showActions?: boolean;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 6, 
  showActions = true 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-green-100 w-full max-w-full overflow-hidden">
      {/* Header Skeleton */}
      <div className="p-4 md:p-6 border-b border-green-100 bg-gradient-to-r from-green-100 to-emerald-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-8 bg-green-200 rounded animate-pulse w-32"></div>
            <div className="h-6 bg-green-200 rounded-full animate-pulse w-20"></div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-48"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
            <div className="h-10 bg-green-200 rounded-lg animate-pulse w-32"></div>
          </div>
        </div>
      </div>

      {/* Mobile Card Skeleton */}
      <div className="block md:hidden p-4 space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="bg-white border border-green-100 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full table-auto">
            <thead className="bg-green-50">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-4 py-3 text-left">
                    <div className="h-4 bg-green-200 rounded animate-pulse w-20"></div>
                  </th>
                ))}
                {showActions && (
                  <th className="px-4 py-3 text-left">
                    <div className="h-4 bg-green-200 rounded animate-pulse w-16"></div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-green-100">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-green-25">
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-4">
                      {colIndex === 0 ? (
                        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                      ) : (
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full max-w-[120px]"></div>
                      )}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 py-4">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center items-center gap-2 p-4 border-t border-green-100">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-20"></div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-16"></div>
      </div>
    </div>
  );
};

export default TableSkeleton;