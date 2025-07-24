// components/shared/ChartWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('./dashboard/dashboardChart'), {
  ssr: false,
});

export default DashboardCharts;
