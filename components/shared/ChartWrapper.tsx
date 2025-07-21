// components/shared/ChartWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('./dashboardChart'), {
  ssr: false,
});

export default DashboardCharts;
