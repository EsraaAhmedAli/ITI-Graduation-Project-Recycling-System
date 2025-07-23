'use client';

import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Image from 'next/image';
import api from '@/lib/axios';
import { FaMedal } from "react-icons/fa";
import {  Minus, TrendingDown, TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

// TypeScript interfaces
interface TopUser {
  id: string;
  userName: string;
  email: string;
  imageUrl?: string;
  totalPoints: number;
}

interface TopMaterial {
  _id: {
    itemName: string;
  };
  totalQuantity: number;
}

interface UserGrowthItem {
  label?: string;
  month?: string;
  name?: string;
  count?: number;
  users?: number;
  value?: number;
}

interface UserStats {
  total: number;
  thisMonth: number;
  lastMonth: number;
}

interface OrderStatus {
  [status: string]: number;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'steady';
  trendValue?: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    backgroundColor: string;
    tension: number;
    borderWidth: number;
    pointRadius: number;
    pointBackgroundColor: string;
    pointHoverRadius: number;
    pointHitRadius: number;
    pointBorderWidth: number;
    pointBorderColor: string;
  }>;
}

const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // gold, silver, bronze

// Get dynamic day labels based on current day
const getCurrentDayLabels = (): string[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Reorder array to start from Monday and end with today
  const mondayIndex = 0;
  const reorderedDays: string[] = [];
  
  // Start from Monday (index 1)
  for (let i = 0; i < 7; i++) {
    const dayIndex = (mondayIndex + i) % 7;
    reorderedDays.push(days[dayIndex]);
  }
  
  return reorderedDays;
};

const dayLabels = getCurrentDayLabels();

const statusColorMap: { [key: string]: string } = {
  Pending: '#f59e0b', // yellow
  accepted: '#34d399', // light green
  completed: '#10b981', // emerald green
  cancelled: '#ef4444', // red
};

const userGrowthBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { display: false },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    }
  },
  scales: {
    y: { 
      beginAtZero: true, 
      grid: { color: '#d1fae5' },
      ticks: {
        stepSize: 1
      },
      title: { display: true, text: 'Users' }
    },
    x: {
      grid: { color: '#d1fae5' },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        autoSkip: false,
        font: {
          size: 12,
          weight: 'bold' as const,
        },
      },
      title: { display: true, text: 'Month' }
    },
  },
  barThickness: 50
};

const doughnutOptions = {
  cutout: '75%',
  plugins: {
    legend: {
      display: false
    }
  },
  animation: {
    easing: 'easeInOutQuad' as const,
    duration: 700,
  },
};

export default function DashboardCharts() {
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>({});
  const [ordersPerDay, setOrdersPerDay] = useState<number[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [topMaterials, setTopMaterials] = useState<TopMaterial[]>([]);

  // Prepare data for Bar chart
  const barData = {
    labels: topMaterials.map(m => m._id.itemName),
    datasets: [
      {
        label: "Quantity",
        data: topMaterials.map(m => m.totalQuantity),
        backgroundColor: [
          "#10b981", "#34d399", "#f59e0b", "#6366f1", "#f43f5e"
        ],
        borderRadius: 8,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: "#d1fae5" }, title: { display: true, text: 'Material' } },
      y: { grid: { color: "#d1fae5" }, title: { display: true, text: 'Quantity' }, beginAtZero: true },
    },
    barThickness: 50,
  };

  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
  });

  useEffect(() => {
    async function fetchUserStats() {
      try {
        const res = await api.get("/stats");
        const data = res.data;
        
        console.log("Raw API response:", data);

        // Handle different response structures
        let processedData = data;
        
        // If data is wrapped in a success object
        if (data && data.success && data.data) {
          processedData = data.data;
        }
        
        // If data is directly an array or has different structure
        if (Array.isArray(processedData) && processedData.length > 0) {
          console.log("Processing data:", processedData);
          
          // Sort data by date to ensure proper order
          const sortedData = processedData.sort((a: UserGrowthItem, b: UserGrowthItem) => {
            const dateA = new Date(a.label || a.month || a.name || '');
            const dateB = new Date(b.label || b.month || b.name || '');
            return dateA.getTime() - dateB.getTime();
          });

          console.log("Sorted data:", sortedData);
          setUserGrowth(sortedData);

          const total = sortedData.reduce((sum: number, item: UserGrowthItem) => sum + (item.count || item.users || item.value || 0), 0);
          const thisMonth = sortedData[sortedData.length - 1]?.count || sortedData[sortedData.length - 1]?.users || sortedData[sortedData.length - 1]?.value || 0;
          const lastMonth = sortedData[sortedData.length - 2]?.count || sortedData[sortedData.length - 2]?.users || sortedData[sortedData.length - 2]?.value || 0;

          setUserStats({ total, thisMonth, lastMonth });
        } else {
          console.log("Data not in expected format:", processedData);
          setUserGrowth([]);
        }
      } catch (error) {
        console.error("Error fetching user growth:", error);
        setUserGrowth([]);
      }
    }

    async function fetchAnalytics() {
      try {
        const res = await api.get("/orders/analytics");
        const json = res.data;
        console.log("Analytics data:", json.data);
        
        if (json.success) {
          setTotalOrders(json.data.totalOrders);
          setOrderStatus(json.data.statusCounts);
          
          const dailyOrders = json.data.dailyOrders || [];
          console.log("Daily orders from API:", dailyOrders);
          
          setOrdersPerDay(dailyOrders);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }

    async function fetchTopUsers() {
      try {
        const res = await api.get("/users/points/leaderboard");
        const json = res.data;
        if (json.success) {
          setTopUsers(json.data);
        }
      } catch (error) {
        console.error("Error fetching top users:", error);
      }
    }

    async function fetchTopMaterials(category = 'All') {
      try {
        const params = category !== 'All' ? { category } : {};
        const res = await api.get("/top-materials-recycled", { params });
        const json = res.data;
        if (json.success) {
          setTopMaterials(json.data);
        }
      } catch (error) {
        console.error("Error fetching top materials:", error);
      }
    }

    async function fetchCategories() {
      try {
        const res = await api.get("categories/category-names");
        if (res.data.success) setCategories(res.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    async function fetchTopCities() {
      try {
        const res = await api.get('/orders/analytics/top-cities');
        const data = res.data.data || res.data;
        
        console.log("Top cities data:", data);
        
        if (data && data.length > 0) {
          const cities = data.map((entry: any) => entry.city || entry._id);
          const orderCounts = data.map((entry: any) => entry.totalOrders);
          
          setChartData({
            labels: cities,
            datasets: [
              {
                label: 'Total Orders by City',
                data: orderCounts,
                fill: false,
                borderColor: '#22c55e',
                backgroundColor: '#16a34a',
                tension: 0,
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: '#15803d',
                pointHoverRadius: 7,
                pointHitRadius: 10,
                pointBorderWidth: 2,
                pointBorderColor: '#fff',
              },
            ],
          });
        } else {
          console.log("No data received for top cities");
          setChartData(null);
        }
      } catch (error) {
        console.error("Error fetching top cities:", error);
        setChartData(null);
      }
    }

    fetchCategories();
    fetchAnalytics();
    fetchTopUsers();
    fetchTopMaterials();
    fetchUserStats();
    fetchTopCities();
  }, []);

  // Fixed orders chart data with proper day labels
  const ordersChartData = {
    labels: dayLabels,
    datasets: [{
      label: 'Orders',
      data: ordersPerDay,
      backgroundColor: '#10b981',
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  // Updated user growth data for bar chart
  const userGrowthData = {
    labels: userGrowth.map((item) => {
      const monthName = item.label || item.month || item.name || 'Unknown';
      if (monthName.includes('-') || monthName.includes('/')) {
        try {
          const date = new Date(monthName);
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch {
          return monthName;
        }
      }
      return monthName;
    }),
    datasets: [
      {
        label: "Users",
        data: userGrowth.map((item) => {
          return item.count || item.users || item.value || 0;
        }),
        backgroundColor: "#10b981",
        borderWidth: 0,
        borderRadius: 8,
        hoverBackgroundColor: "#22c55e",
        hoverBorderColor: "#15803d",
      },
    ],
  };

  console.log("Final userGrowthData:", userGrowthData);

  return (
    <div className="space-y-4 md:space-y-7  md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between lg:gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-green-900">Dashboard insights</h1>
          <p className="text-xs md:text-sm text-green-700">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stat Cards - Mobile: Single column, Desktop: 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard title="Total Orders" value={totalOrders?.toLocaleString()} icon={<OrdersIcon />} trend="up" trendValue="8%" />
        <StatCard title="Active Users" value={topUsers.length?.toLocaleString()} icon={<UsersIcon />} trend="steady" />
        <StatCard title="Materials Tracked" value={topMaterials.length?.toLocaleString()} icon={<MaterialsIcon />} trend="up" trendValue="5%" />
      </div>

      {/* Analytics Row - Mobile: Single column, Desktop: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-7">
        {/* User Growth Chart */}
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow border border-green-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-green-800">User Growth</h2>
            <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
              {userGrowth.length} months
            </span>
          </div>
          <div className="h-48 md:h-64">
            {userGrowth && userGrowth.length > 0 ? (
              <Bar data={userGrowthData} options={userGrowthBarOptions} />
            ) : userGrowth && userGrowth.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-2xl md:text-4xl mb-2">📊</div>
                  <p className="text-xs md:text-sm">No data available</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-green-500">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                  <p className="text-xs md:text-sm">Loading chart data...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm md:text-base font-medium text-green-800">Order Status</span>
            <span className="text-xs text-green-400">Overview</span>
          </div>
          <div className="w-[180px] md:w-[220px] h-[120px] md:h-[150px] mx-auto">
            <Doughnut
              data={{
                labels: Object.keys(orderStatus),
                datasets: [{
                  data: Object.values(orderStatus),
                  backgroundColor: Object.keys(orderStatus).map(key => statusColorMap[key] || '#d1d5db'),
                  borderWidth: 0,
                }]
              }}
              options={doughnutOptions}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {Object.entries(orderStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 md:w-3 h-2 md:h-3 rounded-full ${status === 'Pending' ? 'bg-yellow-400' : status === 'accepted' ? 'bg-green-500' : status === 'completed' ? 'bg-green-900' : 'bg-red-500'}`}></span>
                  <span className="text-xs text-green-700">{status}</span>
                </div>
                <span className="text-xs font-semibold text-green-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recyclers */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm md:text-base font-medium text-green-800">Top Recyclers</span>
            <button className="text-xs text-green-500 hover:underline">View All</button>
          </div>
          <ul className="mt-3 space-y-2">
            {topUsers.map((u, idx) => (
              <li
                key={u.id}
                className={`flex items-center gap-2 md:gap-3 py-2 md:py-3 px-2 rounded-lg transition hover:shadow-md
                  ${idx === 0 ? "bg-green-50" : idx === 1 ? "bg-green-100" : idx === 2 ? "bg-yellow-50" : ""}
                `}
              >
              
                <span className="font-bold text-sm md:text-lg" style={{ color: medalColors[idx] || "#10b981" }}>
                  {idx < 3 ? <FaMedal className="inline mr-1" /> : null}
                  {idx + 1}
                </span>
                {u.imageUrl ? (
                  <Image
                    src={u.imageUrl}
                    alt={u.userName}
                    width={32}
                    height={32}
                    className="md:w-[38px] md:h-[38px] rounded-full border-2 border-green-200 shadow-sm"
                    title={u.email}
                  />
                ) : (
                  <div
                    className="w-8 h-8 md:w-[38px] md:h-[38px] rounded-full border-2 border-green-200 shadow-sm bg-green-100 flex items-center justify-center"
                    title={u.email}
                  >
                    <span className="text-green-700 font-bold text-sm md:text-lg">{u.userName?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-green-900 truncate text-sm md:text-base">{u.userName}</span>
                  <span className="text-xs text-green-500">{u.totalPoints} points</span>
                  <div className="w-full bg-green-100 rounded-full h-1.5 md:h-2 mt-1">
                    <div
                      className="bg-green-500 h-1.5 md:h-2 rounded-full"
                      style={{
                        width: `${Math.round((u.totalPoints / (topUsers[0]?.totalPoints ?? 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Materials Table and Cities Chart - Mobile: Single column, Desktop: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-7">
        <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <span className="text-sm md:text-base font-medium text-green-800">Top Recycled Materials</span>
            <select className="text-xs border border-green-200 rounded px-2 py-1 focus:outline-none focus:ring-green-500 bg-white">
              <option>By Quantity</option>
              <option>By Category</option>
            </select>
          </div>
          {topMaterials.length > 0 && (
            <div className="h-48 md:h-64 w-full mb-4">
              <Bar data={barData} options={barOptions} />
            </div>
          )}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow border border-green-100">
          <h2 className="text-sm md:text-lg font-medium mb-4 text-green-700">Top Cities by Orders</h2>
          {chartData ? (
            <div className="h-48 md:h-64">
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      mode: 'index' as const,
                      intersect: false,
                    }
                  },
                  hover: {
                    mode: 'nearest' as const,
                    intersect: true
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: '#d1fae5',
                      },
                      title: {
                        display: true,
                        text: 'Number of Orders',
                      },
                    },
                    x: {
                      grid: {
                        color: '#d1fae5',
                      },
                      title: {
                        display: true,
                        text: 'Cities',
                      },
                    },
                  },
                  elements: {
                    line: {
                      tension: 0
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-48 md:h-64 flex items-center justify-center text-gray-500">
              {chartData === null ? 'No data available' : 'Loading chart...'}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Orders Bar Chart */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <span className="text-sm md:text-base font-medium text-green-800">Weekly Orders</span>
          <select className="text-xs border border-green-200 rounded px-2 py-1 focus:outline-none focus:ring-green-500 bg-white">
            <option>This Week</option>
            <option>Last Week</option>
            <option>Last 4 Weeks</option>
          </select>
        </div>
        <div className="h-40 md:h-48">
          <Bar
            data={ordersChartData}
            options={barOptions}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Current day: {new Date().toLocaleDateString('en-US', { weekday: 'short' })} | 
          Chart shows Monday to Sunday order distribution
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, trend, trendValue }: StatCardProps) {
  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    steady: 'text-amber-500',
  };

  const trendBgColors = {
    up: 'bg-emerald-50 border-emerald-200',
    down: 'bg-red-50 border-red-200',
    steady: 'bg-amber-50 border-amber-200',
  };

  const TrendUpIcon = () => <TrendingUp size={16} className="animate-pulse" />;
  const TrendDownIcon = () => <TrendingDown size={16} className="animate-pulse" />;
  const TrendSteadyIcon = () => <Minus size={16} />;

  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border-2 border-green-200 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="w-full h-full bg-green-500 rounded-full transform translate-x-12 md:translate-x-16 -translate-y-12 md:-translate-y-16" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <div>
            <p className="text-xs md:text-sm text-green-700 font-bold uppercase tracking-wider mb-1 md:mb-2">{title}</p>
            <p className="text-2xl md:text-3xl font-black text-green-900 mt-1 group-hover:scale-105 transition-transform duration-200 origin-left">{value}</p>
          </div>
          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 text-xl md:text-2xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className={`mt-3 md:mt-4 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl border transition-all duration-200 group-hover:scale-105 ${trendBgColors[trend]}`}>
            <div className={`flex items-center gap-2 ${trendColors[trend]}`}>
              {trend === 'up' && <TrendUpIcon />}
              {trend === 'down' && <TrendDownIcon />}
              {trend === 'steady' && <TrendSteadyIcon />}
              <span className="text-xs md:text-sm font-bold">{trend === 'steady' ? 'Steady' : trendValue}</span>
            </div>
            <div className="h-3 md:h-4 w-px bg-current opacity-30" />
            <span className="text-xs text-green-600 font-medium opacity-75">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Icon Components
function OrdersIcon() { 
  return (
    <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="5" y="7" width="14" height="10" rx="2" strokeWidth={2} />
      <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" strokeWidth={2} />
    </svg>
  ); 
}

function UsersIcon() { 
  return (
    <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" strokeWidth={2} />
      <path d="M6 20v-2a6 6 0 0112 0v2" strokeWidth={2} />
    </svg>
  ); 
}

function MaterialsIcon() { 
  return (
    <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
      <path d="M4 10h16" strokeWidth={2} />
    </svg>
  ); 
}