import React from 'react';

interface DeliveryTableSkeletonProps {
  rows?: number;
}

const DeliveryTableSkeleton: React.FC<DeliveryTableSkeletonProps> = ({ 
  rows = 5
}) => {
  return (
    <div className="p-4 sm:p-6">
      {/* Summary Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="h-4 bg-yellow-200 rounded animate-pulse w-16 mb-2"></div>
          <div className="h-8 bg-yellow-300 rounded animate-pulse w-8"></div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="h-4 bg-green-200 rounded animate-pulse w-16 mb-2"></div>
          <div className="h-8 bg-green-300 rounded animate-pulse w-8"></div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="h-4 bg-red-200 rounded animate-pulse w-16 mb-2"></div>
          <div className="h-8 bg-red-300 rounded animate-pulse w-8"></div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="h-4 bg-orange-200 rounded animate-pulse w-16 mb-2"></div>
          <div className="h-8 bg-orange-300 rounded animate-pulse w-8"></div>
        </div>
      </div>

      {/* Table Container with responsive wrapper */}
      <div className="w-full overflow-hidden">
        <div className="bg-white rounded-lg shadow-sm border border-green-100 w-full max-w-full overflow-hidden">
      

          {/* Mobile Card Skeleton */}
          <div className="block md:hidden p-4 space-y-4">
            {Array.from({ length: rows }).map((_, index) => (
              <div key={index} className="bg-white border border-green-100 rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 space-y-3">
                    {/* Name */}
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                    {/* Status badge */}
                    <div className="h-6 bg-yellow-200 rounded-full animate-pulse w-20"></div>
                  </div>
                  <div className="ml-4">
                    {/* Action dropdown */}
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  {/* Additional info lines */}
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
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
                    {/* Delivery page specific columns */}
                    <th className="px-4 py-3 text-left">
                      <div className="h-4 bg-green-200 rounded animate-pulse w-24"></div>
                    </th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">
                      <div className="h-4 bg-green-200 rounded animate-pulse w-16"></div>
                    </th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">
                      <div className="h-4 bg-green-200 rounded animate-pulse w-20"></div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <div className="h-4 bg-green-200 rounded animate-pulse w-16"></div>
                    </th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">
                      <div className="h-4 bg-green-200 rounded animate-pulse w-20"></div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <div className="h-4 bg-green-200 rounded animate-pulse w-16"></div>
                    </th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">
                      <div className="h-4 bg-green-200 rounded animate-pulse w-24"></div>
                    </th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">
                      <div className="h-4 bg-green-200 rounded animate-pulse w-24"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {Array.from({ length: rows }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-green-25">
                      {/* Name column */}
                      <td className="px-4 py-4">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-28"></div>
                      </td>
                      {/* Email column (hidden on mobile) */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-36"></div>
                      </td>
                      {/* Phone column (hidden on mobile) */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      {/* Status column */}
                      <td className="px-4 py-4">
                        <div className="h-6 bg-yellow-200 rounded-full animate-pulse w-20"></div>
                      </td>
                      {/* Reviews/Rating column (hidden on mobile) */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="h-4 bg-green-200 rounded animate-pulse w-24"></div>
                      </td>
                      {/* Action column */}
                      <td className="px-4 py-4">
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
                      </td>
                      {/* Reapply status (hidden on mobile) */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="h-6 bg-blue-200 rounded animate-pulse w-20"></div>
                      </td>
                      {/* Attachments (hidden on mobile) */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="h-4 bg-green-200 rounded animate-pulse w-28"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTableSkeleton;