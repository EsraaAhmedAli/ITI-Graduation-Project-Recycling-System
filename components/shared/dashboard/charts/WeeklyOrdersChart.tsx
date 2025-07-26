// components/charts/WeeklyOrdersChart.tsx
import React, { memo, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { BAR_CHART_OPTIONS, CHART_COLORS } from '../../../../constants/theme';
import { getCurrentDayLabels } from '../../../../utils/dataTransformers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface WeeklyOrdersChartProps {
  ordersPerDay: number[];
  loading: boolean;
}

type TimePeriod = 'thisWeek' | 'lastWeek' | 'last4Weeks';

const WeeklyOrdersChart = memo<WeeklyOrdersChartProps>(({ ordersPerDay, loading }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('thisWeek');
  
  // Get current day labels
  const dayLabels = useMemo(() => getCurrentDayLabels(), []);
  
  // Get current day in Egypt timezone
  const getEgyptCurrentDay = useMemo(() => {
    const now = new Date();
    // Convert to Egypt timezone (Africa/Cairo)
    const egyptTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
    const jsDay = egyptTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Convert JS day to match dayLabels array (assuming it starts with Monday)
    // Monday should be index 0, Tuesday index 1, etc.
    return jsDay === 0 ? 6 : jsDay - 1; // Sunday becomes 6, Monday becomes 0, etc.
  }, []);
  
  // Get current day name for Egypt timezone
  const currentDayName = useMemo(() => {
    const now = new Date();
    const egyptTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
    return egyptTime.toLocaleDateString('en-US', { weekday: 'short' });
  }, []);
  
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
        label: 'Orders',
        data: data,
        backgroundColor: dayLabels.map((_, index) => {
          return index === getEgyptCurrentDay 
            ? CHART_COLORS.accent 
            : CHART_COLORS.primary;
        }),
        hoverBackgroundColor: dayLabels.map((_, index) => {
          return index === getEgyptCurrentDay 
            ? '#f59e0b' 
            : CHART_COLORS.secondary;
        }),
        borderRadius: 6,
        borderSkipped: false,
        borderWidth: 0,
        maxBarThickness: 60,
      }]
    };
  }, [dayLabels, generateMockData, getEgyptCurrentDay]);

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
            const dayName = context[0].label;
            return `${dayName}${dayName === currentDayName ? ' (Today)' : ''}`;
          },
          label: function(context: any) {
            return `Orders: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        title: { display: true, text: 'Number of Orders' },
        ticks: {
          ...BAR_CHART_OPTIONS.scales.y.ticks,
          callback: function(value: any) {
            return value.toLocaleString();
          }
        }
      },
      x: {
        ...BAR_CHART_OPTIONS.scales.x,
        title: { display: true, text: 'Day of Week' },
        ticks: {
          ...BAR_CHART_OPTIONS.scales.x.ticks,
          color: (context: any) => {
            return context.index === getEgyptCurrentDay ? '#f59e0b' : '#047857';
          },
          font: {
            ...BAR_CHART_OPTIONS.scales.x.ticks.font,
            weight: (context: any) => {
              return context.index === getEgyptCurrentDay ? 'bold' : 'normal';
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
  }), [getEgyptCurrentDay, currentDayName]);

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
            <p className="text-xs md:text-sm">Loading weekly data...</p>
          </div>
        </div>
      );
    }

    return <Bar data={chartData} options={chartOptions} />;
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'thisWeek': return 'This Week';
      case 'lastWeek': return 'Last Week';
      case 'last4Weeks': return 'Last 4 Weeks Avg';
      default: return 'This Week';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <span className="text-sm md:text-base font-medium text-green-800">
          Weekly Orders Distribution
        </span>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
          className="text-xs border border-green-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-colors"
          disabled={loading}
        >
          <option value="thisWeek">This Week</option>
          <option value="lastWeek">Last Week</option>
          <option value="last4Weeks">Last 4 Weeks</option>
        </select>
      </div>
      
      <div className="h-40 md:h-48">
        {renderContent()}
      </div>
      
      {/* Current day indicator */}
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>
            Current day: <span className="font-medium text-amber-600">
              {currentDayName}
            </span>
          </span>
          <span>Period: {getPeriodLabel(selectedPeriod)}</span>
        </div>
      </div>

      {/* Statistics Summary */}
      {!loading && (
        <div className="mt-4 pt-3 border-t border-green-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-900">{stats.total}</div>
              <div className="text-green-600">Total</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-900">{stats.average}</div>
              <div className="text-blue-600">Daily Avg</div>
            </div>
            <div className="text-center p-2 bg-amber-50 rounded">
              <div className="font-semibold text-amber-900">{stats.maxDay}</div>
              <div className="text-amber-600">Peak Day</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className={`font-semibold ${stats.changePercent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent}%
              </div>
              <div className="text-purple-600">vs Previous</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

WeeklyOrdersChart.displayName = 'WeeklyOrdersChart';

export default WeeklyOrdersChart;