// components/charts/WeeklyOrdersChart.tsx
import React, { memo, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { BAR_CHART_OPTIONS, CHART_COLORS } from '../../../../constants/theme';
import { getCurrentDayLabels } from '../../../../utils/dataTransformers';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface WeeklyOrdersChartProps {
  ordersPerDay: number[];
  loading: boolean;
}

type TimePeriod = 'thisWeek' | 'lastWeek' | 'last4Weeks';

const WeeklyOrdersChart = memo<WeeklyOrdersChartProps>(({ ordersPerDay, loading }) => {
  const { t, convertNumber } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('thisWeek');
  
  // Get current day labels (this should return current week days starting from Monday)
  const dayLabels = useMemo(() => {
    const labels = getCurrentDayLabels();
    // Translate day names if in Arabic
    return labels.map(label => {
      const parts = label.split(' ');
      const dayName = parts[0];
      const dayNumber = parts[1] || '';
      
      // Translate English day names to Arabic
      const translatedDay = t(`days.${dayName.toLowerCase()}`) || dayName;
      
      return dayNumber ? `${translatedDay} ${dayNumber}` : translatedDay;
    });
  }, [t]);
  
  // Get current day info for Egypt timezone
  const currentDayInfo = useMemo(() => {
    const now = new Date();
    // Convert to Egypt timezone (Africa/Cairo)
    const egyptTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
    
    // Get the current day name
    const currentDayName = egyptTime.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Find the index of current day in dayLabels array
    const currentDayIndex = dayLabels.findIndex(label => {
      // Extract day name from label (assuming format like "Mon 28" or just "Mon")
      const labelDay = label.split(' ')[0];
      return labelDay === currentDayName;
    });
    
    console.log('Egypt Time:', egyptTime);
    console.log('Current Day Name:', currentDayName);
    console.log('Day Labels:', dayLabels);
    console.log('Current Day Index:', currentDayIndex);
    
    return {
      name: currentDayName,
      index: currentDayIndex >= 0 ? currentDayIndex : -1 // -1 if not found
    };
  }, [dayLabels]);
  
  // Generate mock data for different periods
  const generateMockData = useMemo(() => {
    const baseData = ordersPerDay.length > 0 ? ordersPerDay : [12, 19, 8, 15, 22, 18, 9];
    
    switch (selectedPeriod) {
      case 'lastWeek':
        return baseData.map(val => Math.max(0, val + Math.floor(Math.random() * 10 - 5)));
      case 'last4Weeks':
        return baseData.map(val => Math.round(val * 0.8 + Math.random() * val * 0.4));
      default:
        return baseData;
    }
  }, [ordersPerDay, selectedPeriod]);

  // Memoize chart data
  const chartData = useMemo(() => {
    const data = generateMockData;

    return {
      labels: dayLabels,
      datasets: [{
        label: t('charts.orders'),
        data: data,
        backgroundColor: dayLabels.map((_, index) => {
          return index === currentDayInfo.index 
            ? CHART_COLORS.accent 
            : CHART_COLORS.primary;
        }),
        hoverBackgroundColor: dayLabels.map((_, index) => {
          return index === currentDayInfo.index 
            ? '#f59e0b' 
            : CHART_COLORS.secondary;
        }),
        borderRadius: 6,
        borderSkipped: false,
        borderWidth: 0,
        maxBarThickness: 60,
      }]
    };
  }, [dayLabels, generateMockData, currentDayInfo.index, t]);

  // Enhanced chart options
  const chartOptions = useMemo(() => ({
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#065f46',
        bodyColor: '#047857',
        borderColor: '#10b981',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            const dayLabel = context[0].label;
            const dayName = dayLabel.split(' ')[0]; // Extract day name from label
            const isToday = context[0].dataIndex === currentDayInfo.index;
            return `${dayLabel}${isToday ? ` (${t('common.today')})` : ''}`;
          },
          label: function(context: any) {
            return `${t('charts.orders')}: ${convertNumber(context.parsed.y.toString())}`;
          }
        }
      }
    },
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        title: { display: true, text: t('charts.numberOfOrders') },
        ticks: {
          ...BAR_CHART_OPTIONS.scales.y.ticks,
          callback: function(value: any) {
            return convertNumber(value.toString());
          }
        }
      },
      x: {
        ...BAR_CHART_OPTIONS.scales.x,
        title: { display: true, text: t('charts.dayOfWeek') },
        ticks: {
          ...BAR_CHART_OPTIONS.scales.x.ticks,
          color: (context: any) => {
            return context.index === currentDayInfo.index ? '#f59e0b' : '#047857';
          },
          font: {
            ...BAR_CHART_OPTIONS.scales.x.ticks.font,
            weight: (context: any) => {
              return context.index === currentDayInfo.index ? 'bold' : 'normal';
            }
          }
        }
      },
    },
    animation: {
      duration: 800,
      easing: 'easeInOutQuart' as const,
    },
    onHover: (event: any, elements: any[]) => {
      if (event.native?.target) {
        event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    }
  }), [currentDayInfo.index, t, convertNumber]);

  // Calculate statistics
  const stats = useMemo(() => {
    const data = generateMockData;
    const total = data.reduce((sum, val) => sum + val, 0);
    const average = Math.round(total / data.length);
    const max = Math.max(...data);
    const maxDayIndex = data.indexOf(max);
    const maxDay = dayLabels[maxDayIndex];
    
    // Compare with previous period (mock calculation)
    const previousTotal = total - Math.floor(Math.random() * 20 - 10);
    const change = total - previousTotal;
    const changePercent = previousTotal > 0 ? ((change / previousTotal) * 100).toFixed(1) : '0';
    
    return {
      total,
      average,
      maxDay,
      maxOrders: max,
      change,
      changePercent: parseFloat(changePercent),
    };
  }, [generateMockData, dayLabels]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-green-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-xs md:text-sm">{t('charts.loadingWeeklyData')}</p>
          </div>
        </div>
      );
    }

    return <Bar data={chartData} options={chartOptions} />;
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'thisWeek': return t('charts.thisWeek');
      case 'lastWeek': return t('charts.lastWeek');
      case 'last4Weeks': return t('charts.last4WeeksAvg');
      default: return t('charts.thisWeek');
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100" style={{ background:"var(--background)" }}>
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <span className="text-sm md:text-base font-medium text-green-800">
          {t('charts.weeklyOrdersDistribution')}
        </span>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
          className="text-xs border border-green-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-colors"
          disabled={loading}
        >
          <option value="thisWeek">{t('charts.thisWeek')}</option>
          <option value="lastWeek">{t('charts.lastWeek')}</option>
          <option value="last4Weeks">{t('charts.last4Weeks')}</option>
        </select>
      </div>
      
      <div className="h-40 md:h-48">
        {renderContent()}
      </div>
      
      {/* Current day indicator with debug info */}
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>
            {t('charts.currentDay')}: <span className="font-medium text-amber-600">
              {currentDayInfo.name} {currentDayInfo.index >= 0 ? `(${t('charts.index')}: ${currentDayInfo.index})` : ''}
            </span>
          </span>
          <span>{t('charts.period')}: {getPeriodLabel(selectedPeriod)}</span>
        </div>
      </div>

      {/* Statistics Summary */}
      {!loading && (
        <div className="mt-4 pt-3 border-t border-green-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-900">{convertNumber(stats.total.toString())}</div>
              <div className="text-green-600">{t('charts.total')}</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-900">{convertNumber(stats.average.toString())}</div>
              <div className="text-blue-600">{t('charts.dailyAvg')}</div>
            </div>
            <div className="text-center p-2 bg-amber-50 rounded">
              <div className="font-semibold text-amber-900">{stats.maxDay}</div>
              <div className="text-amber-600">{t('charts.peakDay')}</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className={`font-semibold ${stats.changePercent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {stats.changePercent >= 0 ? '+' : ''}{convertNumber(stats.changePercent.toString())}%
              </div>
              <div className="text-purple-600">{t('charts.vsPrevious')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

WeeklyOrdersChart.displayName = 'WeeklyOrdersChart';

export default WeeklyOrdersChart;