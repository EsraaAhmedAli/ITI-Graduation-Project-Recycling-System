// components/charts/OrderStatusChart.tsx
import React, { memo, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { OrderStatus } from '../../../../components/Types/dashboard.types';
import { DOUGHNUT_OPTIONS, STATUS_COLOR_MAP } from '../../../../constants/theme';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrderStatusChartProps {
  orderStatus: OrderStatus;
  loading: boolean;
}

const StatusLegendItem = memo<{ status: string; count: number; color: string }>(({ 
  status, 
  count, 
  color 
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span 
        className="w-2 md:w-3 h-2 md:h-3 rounded-full" 
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-green-700 capitalize">{status}</span>
    </div>
    <span className="text-xs font-semibold text-green-900">{count}</span>
  </div>
));

StatusLegendItem.displayName = 'StatusLegendItem';

const LoadingDoughnut = () => (
  <div className="w-[180px] md:w-[220px] h-[120px] md:h-[150px] mx-auto flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-500"></div>
  </div>
);

const OrderStatusChart = memo<OrderStatusChartProps>(({ orderStatus, loading }) => {
  // Memoize chart data
const normalizedStatus = useMemo(() => {
  const normalized: Record<string, number> = {};
  Object.entries(orderStatus).forEach(([key, value]) => {
    const lower = key.toLowerCase();
    normalized[lower] = (normalized[lower] || 0) + value;
  });
  return normalized;
}, [orderStatus]);

const chartData = useMemo(() => {
  const statuses = Object.keys(normalizedStatus);
  const counts = Object.values(normalizedStatus);

  return {
    labels: statuses,
    datasets: [{
      data: counts,
      backgroundColor: statuses.map(status => STATUS_COLOR_MAP[status] || '#d1d5db'),
      borderWidth: 0,
      hoverBackgroundColor: statuses.map(status =>
        (STATUS_COLOR_MAP[status] || '#09c') + 'CC'
      ),
      hoverBorderWidth: 2,
      hoverBorderColor: '#ffffff',
    }]
  };
}, [normalizedStatus]);


  // Calculate total orders
  const totalOrders = useMemo(() => {
    return Object.values(orderStatus).reduce((sum, count) => sum + count, 0);
  }, [orderStatus]);

  // Memoize chart options with custom center text
  const chartOptions = useMemo(() => ({
    ...DOUGHNUT_OPTIONS,
    plugins: {
      ...DOUGHNUT_OPTIONS.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = totalOrders > 0 ? ((value / totalOrders) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    onHover: (event: any, elements: any[]) => {
      if (event.native?.target) {
        event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    }
  }), [totalOrders]);

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingDoughnut />
          <div className="mt-4 space-y-2 animate-pulse">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (!chartData || totalOrders === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500" style={{ background: "var(--background)" }}>
          <div className="text-center">
            <div className="text-2xl md:text-4xl mb-2">📊</div>
            <p className="text-xs md:text-sm">No order data</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Doughnut Chart with Center Text */}
        <div className="relative w-[180px] md:w-[220px] h-[120px] md:h-[150px] mx-auto" >
          <Doughnut data={chartData} options={chartOptions} />
          
         
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-col gap-2">
          {Object.entries(normalizedStatus)
            .sort((a, b) => b[1] - a[1]) // Sort by count descending
            .map(([status, count]) => (
              <StatusLegendItem
                key={status}
                status={status}
                count={count}
                color={STATUS_COLOR_MAP[status] || '#09c'}
              />
            ))}
        </div>
      </>
    );
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100 flex-1 flex flex-col" style={{ background: "var(--background)"}}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm md:text-base font-medium text-green-800">
          Order Status
        </span>
        <span className="text-xs text-green-400">Overview</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        {renderContent()}
      </div>

      {/* Summary Stats */}
      {!loading && totalOrders > 0 && (
        <div className="mt-4 pt-3 border-t border-green-100 text-xs text-gray-600">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Most Common: </span>
              <span className="text-green-700">
                {Object.entries(orderStatus)
                  .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium">Total: </span>
              <span className="text-green-700">{totalOrders}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OrderStatusChart.displayName = 'OrderStatusChart';

export default OrderStatusChart;