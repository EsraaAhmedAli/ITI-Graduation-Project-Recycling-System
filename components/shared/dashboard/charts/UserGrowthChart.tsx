// components/charts/UserGrowthChart.tsx
import React, { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { UserGrowthItem } from '../../../../components/Types/dashboard.types';
import { BAR_CHART_OPTIONS, CHART_COLORS } from '../../../../constants/theme';
import { formatMonthLabel } from '../../../../utils/dataTransformers';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface UserGrowthChartProps {
  userGrowth: UserGrowthItem[];
  loading: boolean;
}

const UserGrowthChart = memo<UserGrowthChartProps>(({ userGrowth, loading }) => {
  const { t, convertNumber, locale } = useLanguage();

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!userGrowth || userGrowth.length === 0) return null;

    return {
      labels: userGrowth.map((item) => {
        const monthName = item.label || item.month || item.name || 'Unknown';
        
        // Use formatMonthLabel with locale and convert numbers
        const formattedLabel = formatMonthLabel(monthName, locale);
        return convertNumber(formattedLabel);
      }),
      datasets: [
        {
          label: t('charts.users'),
          data: userGrowth.map((item) => item.count || item.users || item.value || 0),
          backgroundColor: CHART_COLORS.primary,
          borderWidth: 0,
          borderRadius: 8,
          hoverBackgroundColor: CHART_COLORS.secondary,
          hoverBorderColor: CHART_COLORS.darkGreen,
        },
      ],
    };
  }, [userGrowth, t, locale, convertNumber]);

  // Memoize chart options with specific title
  const chartOptions = useMemo(() => ({
    ...BAR_CHART_OPTIONS,
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        title: { display: true, text: t('charts.users') },
        ticks: {
          ...BAR_CHART_OPTIONS.scales.y.ticks,
          callback: function(value: any) {
            return convertNumber(value.toString());
          }
        }
      },
      x: {
        ...BAR_CHART_OPTIONS.scales.x,
        title: { display: true, text: t('charts.month') }
      },
    },
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      tooltip: {
        ...BAR_CHART_OPTIONS.plugins?.tooltip,
        callbacks: {
          label: function(context: any) {
            return `${t('charts.users')}: ${convertNumber(context.parsed.y.toString())}`;
          }
        }
      }
    },
  }), [t, convertNumber]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-green-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-xs md:text-sm">{t('charts.loadingData')}</p>
          </div>
        </div>
      );
    }

    if (!chartData || userGrowth.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-2xl md:text-4xl mb-2">📊</div>
            <p className="text-xs md:text-sm">{t('charts.noData')}</p>
          </div>
        </div>
      );
    }

    return <Bar data={chartData} options={chartOptions} />;
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow border border-green-100" style={{ background: "var(--background)" }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-green-800">{t('charts.userGrowth')}</h2>
        <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
          {convertNumber(userGrowth.length.toString())} {t('charts.months')}
        </span>
      </div>
      <div className="h-48 md:h-64">
        {renderContent()}
      </div>
    </div>
  );
});

UserGrowthChart.displayName = 'UserGrowthChart';

export default UserGrowthChart;