import React, { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { UserGrowthItem } from '../../../../components/Types/dashboard.types';
import { BAR_CHART_OPTIONS, CHART_COLORS } from '../../../../constants/theme';
import { formatMonthLabel, useFormatMonthLabel } from '../../../../utils/dataTransformers';
import { useLanguage } from '@/context/LanguageContext'; // <-- Import translation hook

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface UserGrowthChartProps {
  userGrowth: UserGrowthItem[];
  loading: boolean;
  title?: string;
}

const UserGrowthChart = memo<UserGrowthChartProps>(({ userGrowth, loading, title }) => {
  const { t, locale } = useLanguage(); // Get translation function & current language
  const formatMonthLabel = useFormatMonthLabel(); // hook called here at top level

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!userGrowth || userGrowth.length === 0) return null;

    return {
  labels: userGrowth.map((item) => {
  const monthName = item.label || item.month || item.name || 'Unknown';
  const formatted = formatMonthLabel(monthName);
  console.log('Month:', monthName, 'Formatted:', formatted);
  return formatted;
}),

      datasets: [
        {
          label: t("users"),
          data: userGrowth.map((item) => item.count || item.users || item.value || 0),
          backgroundColor: CHART_COLORS.primary,
          borderWidth: 0,
          borderRadius: 8,
          hoverBackgroundColor: CHART_COLORS.secondary,
          hoverBorderColor: CHART_COLORS.darkGreen,
        },
      ],
    };
  }, [userGrowth, formatMonthLabel, t])// locale is used inside useFormatMonthLabel hook so no need to add it explicitly


  // Chart options with translated axis titles
  const chartOptions = useMemo(() => ({
    ...BAR_CHART_OPTIONS,
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        title: { display: true, text: t("users") },
      },
      x: {
        ...BAR_CHART_OPTIONS.scales.x,
        title: { display: true, text: t("month") },
      },
    },
  }), [t]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-green-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-xs md:text-sm">{t("loadingChart")}</p>
          </div>
        </div>
      );
    }

    if (!chartData || userGrowth.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-2xl md:text-4xl mb-2">📊</div>
            <p className="text-xs md:text-sm">{t("noData")}</p>
          </div>
        </div>
      );
    }

    return <Bar data={chartData} options={chartOptions} />;
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow border border-green-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-green-800">
          {title || t("userGrowth")}
        </h2>
        <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
          {userGrowth.length} {t("months")}
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
