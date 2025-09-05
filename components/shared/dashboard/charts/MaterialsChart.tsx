// components/charts/MaterialsChart.tsx
import React, { memo, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { BAR_CHART_OPTIONS, CHART_COLORS } from '../../../../constants/theme';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Updated interface to match new backend response
interface TopMaterial {
  _id: string;
  displayName: string;
  name: {
    en: string;
    ar: string;
  };
  totalQuantity: number;
  totalPoints: number;
  image: string;
  categoryName: {
    en: string;
    ar: string;
  };
  unit: string;
  orderCount: number;
}

interface MaterialsChartProps {
  topMaterials: TopMaterial[];
  loading: boolean;
}

const MaterialsChart = memo<MaterialsChartProps>(({ topMaterials, loading }) => {
  const [sortBy, setSortBy] = useState<'quantity' | 'category' | 'points'>('quantity');
  const { locale, t, convertNumber } = useLanguage();

  // Memoize chart data
  const chartData = useMemo(() => {
    if (!topMaterials || topMaterials.length === 0) return null;

    // Sort materials based on selected criteria
    const sortedMaterials = [...topMaterials].sort((a, b) => {
      if (sortBy === 'quantity') {
        return b.totalQuantity - a.totalQuantity;
      } else if (sortBy === 'points') {
        return b.totalPoints - a.totalPoints;
      }

    });

    return {
      labels: sortedMaterials.map(m => {
        const materialName = m.name[locale] || m.name.en || m.displayName;
        return materialName;
      }),
      datasets: [
        {
          label: sortBy === 'points' ? t('common.points') : t('common.quantity'),
          data: sortedMaterials.map(m => sortBy === 'points' ? m.totalPoints : m.totalQuantity),
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
  }, [topMaterials, sortBy, locale, t]);

  // Memoize chart options
  const chartOptions = useMemo(() => ({
    ...BAR_CHART_OPTIONS,
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        title: { 
          display: true, 
          text: sortBy === 'points' ? t('common.points') : t('common.quantity')
        },
        ticks: {
          callback: function(value: any) {
            return convertNumber(value);
          }
        }
      },
      x: {
        ...BAR_CHART_OPTIONS.scales.x,
        title: { display: true, text: t('materials.material') }
      },
    },
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const material = topMaterials[context.dataIndex];
            if (material) {
              const categoryName = material.categoryName[locale] || material.categoryName.en;
              return [
                `${t('materials.category')}: ${categoryName}`,
                `${t('common.unitKg')}: ${material.unit}`,
                `${t('courier.orders')}: ${convertNumber(material.orderCount.toString())}`,
                sortBy !== 'points' 
                  ? `${t('common.points')}: ${convertNumber(material.totalPoints.toLocaleString())}` 
                  : `${t('common.quantity')}: ${convertNumber(material.totalQuantity.toString())}`
              ];
            }
            return '';
          }
        }
      }
    }
  }), [topMaterials, sortBy, locale, t, convertNumber]);

  // Debug logging
  React.useEffect(() => {
    if (topMaterials && topMaterials.length > 0) {
      console.log('MaterialsChart received data:', topMaterials);
      
      // Debug specific materials
      const newspaperMaterial = topMaterials.find(m => 
        m._id.toLowerCase().includes('news') || 
        m.displayName.toLowerCase().includes('news') ||
        (m.name[locale] && m.name[locale].toLowerCase().includes('news'))
      );
      if (newspaperMaterial) {
        console.log('Newspaper material data:', newspaperMaterial);
      }
    }
  }, [topMaterials, locale]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-green-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-xs md:text-sm">{t('charts.loadingMaterials')}</p>
          </div>
        </div>
      );
    }

    if (!chartData || topMaterials.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-2xl md:text-4xl mb-2">📦</div>
            <p className="text-xs md:text-sm">{t('charts.noMaterialsData')}</p>
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
          {t('charts.topRecycledMaterials')}
        </span>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'quantity' | 'points')}
          className="text-xs border border-green-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-colors"
          disabled={loading}
        >
          <option value="quantity">{t('materials.sortByQuantity')}</option>
          <option value="points">{t('common.points')}</option>
        </select>
      </div>
      
      <div className="h-48 md:h-64 w-full mb-4">
        {renderContent()}
      </div>
      
      {/* Enhanced summary stats */}
      {!loading && topMaterials.length > 0 && (
        <div className="mt-2 text-xs text-gray-600 border-t border-green-100 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span>{t('materials.totalMaterials')}:</span>
              <span className="font-medium">{convertNumber(topMaterials.length.toString())}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('charts.totalOrders')}:</span>
              <span className="font-medium">
                {convertNumber(topMaterials.reduce((sum, m) => sum + m.orderCount, 0).toLocaleString())}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('materials.totalQuantity')}:</span>
              <span className="font-medium">
                {convertNumber(topMaterials.reduce((sum, m) => sum + m.totalQuantity, 0).toLocaleString())}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('charts.total')} {t('common.points')}:</span>
              <span className="font-medium">
                {convertNumber(topMaterials.reduce((sum, m) => sum + m.totalPoints, 0).toLocaleString())}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MaterialsChart.displayName = 'MaterialsChart';

export default MaterialsChart;