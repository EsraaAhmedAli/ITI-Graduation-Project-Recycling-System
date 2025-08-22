// components/charts/CitiesChart.tsx
import React, { memo, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { ChartData } from '../../../../components/Types/dashboard.types';
import { CHART_COLORS } from '../../../../constants/theme';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CitiesChartProps {
  chartData: ChartData | null;
  loading: boolean;
}

const CitiesChart = memo<CitiesChartProps>(({ chartData, loading }) => {
  const { t, convertNumber } = useLanguage();

  // Memoize chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#065f46',
        bodyColor: '#047857',
        borderColor: '#10b981',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            return `${context[0].label}`;
          },
          label: function(context: any) {
            return `${t('cities.orders')}: ${convertNumber(context.parsed.y.toLocaleString())}`;
          }
        }
      }
    },
    hover: {
      mode: 'nearest' as const,
      intersect: false,
      animationDuration: 200,
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#d1fae5',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: t('cities.numberOfOrders'),
          color: '#065f46',
          font: {
            size: 12,
            weight: 'bold' as const,
          }
        },
        ticks: {
          color: '#047857',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return convertNumber(value.toLocaleString());
          }
        }
      },
      x: {
        grid: {
          color: '#d1fae5',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: t('cities.cities'),
          color: '#065f46',
          font: {
            size: 12,
            weight: 'bold' as const,
          }
        },
        ticks: {
          color: '#047857',
          font: {
            size: 11,
          },
          maxRotation: 45,
          callback: function(value: any, index: number) {
            const label = this.getLabelForValue(value);
            // Truncate long city names
            return label.length > 12 ? label.substring(0, 12) + '...' : label;
          }
        }
      },
    },
    elements: {
      line: {
        tension: 0.1,
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const,
      },
      point: {
        backgroundColor: CHART_COLORS.darkGreen,
        borderColor: '#ffffff',
        borderWidth: 2,
        radius: 5,
        hoverRadius: 8,
        hoverBorderWidth: 3,
        hitRadius: 10,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    }
  }), [t, convertNumber]);

  // Calculate stats from chart data
  const stats = useMemo(() => {
    if (!chartData || !chartData.datasets[0]) {
      return { totalOrders: 0, averageOrders: 0, topCity: null };
    }

    const orders = chartData.datasets[0].data;
    const cities = chartData.labels;
    const totalOrders = orders.reduce((sum, val) => sum + val, 0);
    const averageOrders = totalOrders / orders.length;
    
    const maxIndex = orders.indexOf(Math.max(...orders));
    const topCity = cities[maxIndex];

    return {
      totalOrders,
      averageOrders: Math.round(averageOrders),
      topCity
    };
  }, [chartData]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-green-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-xs md:text-sm">{t('charts.loadingCitiesData')}</p>
          </div>
        </div>
      );
    }

    if (!chartData || !chartData.datasets[0] || chartData.datasets[0].data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-2xl md:text-4xl mb-2">🏙️</div>
            <p className="text-xs md:text-sm">{t('charts.noCitiesData')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('charts.checkBackLater')}</p>
          </div>
        </div>
      );
    }

    return <Line data={chartData} options={chartOptions} />;
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow border border-green-100" style={{ background: "var(--background)" }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm md:text-lg font-medium text-green-700">
          {t('cities.topCitiesByOrders')}
        </h2>
        {!loading && chartData && (
          <div className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
            {convertNumber(chartData.labels.length.toString())} {t('cities.cities')}
          </div>
        )}
      </div>
      
      <div className="h-48 md:h-64">
        {renderContent()}
      </div>

      {/* Stats Summary */}
      {!loading && chartData && stats.totalOrders > 0 && (
        <div className="mt-4 pt-3 border-t border-green-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-900">
                {convertNumber(stats.totalOrders.toLocaleString())}
              </div>
              <div className="text-green-600">{t('cities.totalOrders')}</div>
            </div>
            <div className="text-center p-2 bg-emerald-50 rounded">
              <div className="font-semibold text-emerald-900">
                {convertNumber(stats.averageOrders.toLocaleString())}
              </div>
              <div className="text-emerald-600">{t('cities.avgPerCity')}</div>
            </div>
            <div className="text-center p-2 bg-teal-50 rounded">
              <div className="font-semibold text-teal-900 truncate" title={stats.topCity || ''}>
                {stats.topCity || t('charts.notAvailable')}
              </div>
              <div className="text-teal-600">{t('cities.topCity')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CitiesChart.displayName = 'CitiesChart';

export default CitiesChart;