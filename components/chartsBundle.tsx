// components/dashboard/ChartsBundle.tsx
'use client';

import { memo } from 'react';
import UserGrowthChart from './shared/dashboard/charts/UserGrowthChart';
import OrderStatusChart from './shared/dashboard/charts/OrderStatusChart';
import TopRecyclersCard from './shared/dashboard/component/TopRecyclersCard';
import MaterialsChart from './shared/dashboard/charts/MaterialsChart';
import CitiesChart from './shared/dashboard/charts/CitiesChart';
import WeeklyOrdersChart from './shared/dashboard/charts/WeeklyOrdersChart';


interface ChartsBundleProps {
  data: any;
  loading: any;
}

const ChartsBundle = memo(({ data, loading }: ChartsBundleProps) => {
  return (
    <>
      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="h-64 sm:h-72 md:h-80 lg:h-96">
          <UserGrowthChart
            userGrowth={data.userGrowth || []}
            loading={loading.userStats}
          />
        </div>
        
        <div className="h-64 sm:h-72 md:h-80 lg:h-96">
          <OrderStatusChart
            orderStatus={data.orderStatus || {}}
            loading={loading.analytics}
          />
        </div>

        <div className="md:col-span-2 xl:col-span-1">
          <div className="h-64 sm:h-72 md:h-80 lg:h-96">
            <TopRecyclersCard
              topUsers={data.topUsers || []}
              loading={loading.users}
            />
          </div>
        </div>
      </div>

      {/* Materials and Cities Charts */}
      <div className="space-y-4 sm:space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <div className="w-full">
          <div className="h-64 sm:h-72 md:h-80 lg:h-96">
            <MaterialsChart
              topMaterials={data.topMaterials || []}
              loading={loading.materials}
            />
          </div>
        </div>

        <div className="w-full">
          <div className="h-64 sm:h-72 md:h-80 lg:h-96">
            <CitiesChart
              chartData={data.citiesData || { labels: [], datasets: [] }}
              loading={loading.cities}
            />
          </div>
        </div>
      </div>

      {/* Weekly Orders Chart */}
      <div className="w-full">
        <div className="h-64 sm:h-72 md:h-80 lg:h-96">
          <WeeklyOrdersChart
            ordersPerDay={data.ordersPerDay || []}
            loading={loading.analytics}
          />
        </div>
      </div>
    </>
  );
});

ChartsBundle.displayName = 'ChartsBundle';

export default ChartsBundle;