// components/shared/ChartWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Add error boundary and proper loading state
const DashboardCharts = dynamic(() => import('./dashboard/dashboardChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-lg text-gray-500">Loading charts...</div>
    </div>
  ),
  onError: (error) => {
    console.error('Failed to load charts:', error);
    return () => (
      <div className="flex items-center justify-center h-64 bg-red-50">
        <div className="text-red-500">Failed to load charts</div>
      </div>
    );
  }
});

// Also wrap in Suspense for better error handling
export default function ChartWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading charts...</div>
      </div>
    }>
      <DashboardCharts />
    </Suspense>
  );
}