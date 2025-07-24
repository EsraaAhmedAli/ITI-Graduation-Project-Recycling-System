// components/charts/MaterialsChart.tsx
import React, { memo, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { TopMaterial } from '../../../../components/Types/dashboard.types'
import { BAR_CHART_OPTIONS, CHART_COLORS } from '../../../../constants/theme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface MaterialsChartProps {
  topMaterials: TopMaterial[];
  loading: boolean;
}

const MaterialsChart = memo<MaterialsChartProps>(({ topMaterials, loading }) => {
  const [sortBy, setSortBy] = useState<'quantity' | 'category'>('quantity');

  // Memoize chart data
  const chartData = useMemo(() => {
    if (!topMaterials || topMaterials.length === 0) return null;

    // Sort materials based on selected criteria
    const sortedMaterials = [...topMaterials].sort((a, b) => {
      if (sortBy === 'quantity') {
        return b.totalQuantity - a.totalQuantity;
      }
      return a._id.itemName.localeCompare(b._id.itemName);
    });

    return {
      labels: sortedMaterials.map(m => m._id.itemName),
      datasets: [
        {
          label: "Quantity",
          data: sortedMaterials.map(m => m.totalQuantity),
          backgroundColor: [
            CHART_COLORS.primary,
            CHART_COLORS.secondary,
            CHART_COLORS.accent,
            CHART_COLORS.purple,
            CHART_COLORS.red,
          ],
          borderRadius: 8,
          hoverBackgroundColor: CHART_COLORS.emerald,
        }
      ]
    };
  }, [topMaterials, sortBy]);

  // Memoize chart options
  const chartOptions = useMemo(() => ({
    ...BAR_CHART_OPTIONS,
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        title: { display: true, text: 'Quantity' }
      },
      x: {
        ...BAR_CHART_OPTIONS.scales.x,
        title: { display: true, text: 'Material' }
      },
    },
  }), []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-green-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-xs md:text-sm">Loading materials...</p>
          </div>
        </div>
      );
    }

    if (!chartData || topMaterials.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-2xl md:text-4xl mb-2">📦</div>
            <p className="text-xs md:text-sm">No materials data</p>
          </div>
        </div>
      );
    }

    return <Bar data={chartData} options={chartOptions} />;
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <span className="text-sm md:text-base font-medium text-green-800">
          Top Recycled Materials
        </span>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'quantity' | 'category')}
          className="text-xs border border-green-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-colors"
          disabled={loading}
        >
          <option value="quantity">By Quantity</option>
          <option value="category">By Name</option>
        </select>
      </div>
      
      <div className="h-48 md:h-64 w-full mb-4">
        {renderContent()}
      </div>
      
      {/* Summary stats */}
      {!loading && topMaterials.length > 0 && (
        <div className="mt-2 text-xs text-gray-600 border-t border-green-100 pt-2">
          <div className="flex justify-between">
            <span>Total Materials: {topMaterials.length}</span>
            <span>
              Total Quantity: {topMaterials.reduce((sum, m) => sum + m.totalQuantity, 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

MaterialsChart.displayName = 'MaterialsChart';

export default MaterialsChart;