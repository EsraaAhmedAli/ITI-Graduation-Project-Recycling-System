'use client';

import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Image from 'next/image';
import api from '@/lib/axios';
import { FaMedal } from "react-icons/fa";
import { BarChart3, DollarSign, Minus, ShoppingCart, TrendingDown, TrendingUp, Users } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // gold, silver, bronze

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const statusColorMap = {
  Pending:    '#f59e0b', // yellow
  accepted:   '#34d399', // light green
  completed:  '#10b981', // emerald green
  cancelled:  '#ef4444', // red
};
const recentActivity = [
  { user: 'Sarah Hassan', action: 'Completed an order', time: '2h ago' },
  { user: 'Ali Mohamed', action: 'Recycled 5 items', time: '5h ago' },
  { user: 'Nour Rahman', action: 'Gained 20 points', time: '1d ago' },
];



const lineOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#d1fae5' } },
    x: { grid: { color: '#d1fae5' } },
  },
};

const doughnutOptions = {
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    }
  }
};

const barOptions = lineOptions;

export default function DashboardCharts() {
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [orderStatus, setOrderStatus] = useState<{ [status: string]: number }>({});
  const [ordersPerDay, setOrdersPerDay] = useState<number[]>([]);
  const [topUsers, setTopUsers] = useState([]);
  const [materialCategory, setMaterialCategory] = useState<string>('All');
const [categories, setCategories] = useState<string[]>([]);

  
  const [topMaterials, setTopMaterials] = useState([]);
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
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { grid: { color: "#d1fae5" }, title: { display: true, text: 'Material' } },
    y: { grid: { color: "#d1fae5" }, title: { display: true, text: 'Quantity' }, beginAtZero: true },
  }
};

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.get("/orders/analytics");
        const json = res.data;

        if (json.success) {
          setTotalOrders(json.data.totalOrders);
          setOrderStatus(json.data.statusCounts);
          setOrdersPerDay(json.data.dailyOrders);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }

    async function fetchTopUsers() {
      try {
        const res = await api.get("/top-users-points");
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
    const res = await api.get("categories/category-names");
    if (res.data.success) setCategories(res.data.data);
  }
  fetchCategories();
    fetchAnalytics();
    fetchTopUsers();
    fetchTopMaterials();
  }, []);
const ordersChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Orders',
    data: ordersPerDay,
  }]
};


  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Dashboard insights</h1>
<p className="text-sm text-green-700">{new Date()?.toLocaleString()}</p>
        </div>
    
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* <StatCard title="Total Points" value={totalPoints?.toLocaleString()} icon={<PointsIcon />} trend="up" trendValue="12%" /> */}
        <StatCard title="Total Orders" value={totalOrders?.toLocaleString()} icon={<OrdersIcon />} trend="up" trendValue="8%" />
        <StatCard title="Active Users" value={topUsers.length?.toLocaleString()} icon={<UsersIcon />} trend="steady" />
        <StatCard title="Materials Tracked" value={topMaterials.length?.toLocaleString()} icon={<MaterialsIcon />} trend="up" trendValue="5%" />
      </div>

      {/* Analytics Row */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-7">
        <div className="bg-white rounded-xl p-6 shadow border border-green-100 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-green-800">Orders Trend</span>
            <span className="text-xs text-green-400">This Month</span>
          </div>
          <div className="h-32">
            <Line
              data={{
                labels: ordersPerDay.labels,
                datasets: [{
                  label: 'Orders',
                  data: ordersPerDay.data,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16,185,129,0.15)',
                  pointBackgroundColor: '#10b981',
                  tension: 0.4,
                }],
              }}
              options={lineOptions}
            />
          </div>
          <div className="mt-4 flex justify-between">
            <div>
{ordersPerDay.length > 0 && (
  <div className="text-lg font-bold text-green-900">
    {ordersPerDay.reduce((a, b) => a + b, 0)} Orders
  </div>
)}              <div className="text-xs text-green-500">This Month</div>
            </div>
          <div className="flex gap-6">
  <div className="text-center">
    <div className="text-xs text-green-700">Best Day</div>
    {ordersPerDay.length > 0 && (
      <div className="text-sm font-semibold text-green-900">
        {dayLabels[ordersPerDay.indexOf(Math.max(...ordersPerDay))]}
      </div>
    )}
  </div>
  <div className="text-center">
    <div className="text-xs text-green-700">Lowest</div>
    {ordersPerDay.length > 0 && (
      <div className="text-sm font-semibold text-green-900">
        {dayLabels[ordersPerDay.indexOf(Math.min(...ordersPerDay))]}
      </div>
    )}
  </div>
</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow border border-green-100 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-green-800">Order Status</span>
            <span className="text-xs text-green-400">Overview</span>
          </div>
          <div className="w-[260px] h-[250px] mx-auto">
    <Doughnut
      data={{
        labels: Object.keys(orderStatus),
        datasets: [{
          data: Object.values(orderStatus),
          backgroundColor: Object.keys(orderStatus).map(key => statusColorMap[key] || '#d1d5db'),
          borderWidth: 0,
        }]
      }}
      options={{
        cutout: '75%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 20,
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 14, weight: '600' },
              color: '#065f46',
            }
          }
        },
        animation: {
          easing: 'easeInOutQuad',
          duration: 700,
        },
      }}
    />

          </div>
          <div className="mt-4 flex flex-col gap-2">
            {Object.entries(orderStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${status === 'Pending' ? 'bg-yellow-400' : status === 'accepted' ? 'bg-green-500' : status=='completed' ? 'bg-green-900' : 'bg-red-500'}`}></span>
                  <span className="text-xs text-green-700">{status}</span>
                </div>
                <span className="text-xs font-semibold text-green-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow border border-green-100 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-green-800">Top Recyclers</span>
            <button className="text-xs text-green-500 hover:underline">View All</button>
          </div>
   <ul className="mt-3">
  {topUsers.map((u, idx) => (
    <li
      key={u.id}
      className={`flex items-center gap-3 py-3 px-2 rounded-lg transition hover:shadow-md
        ${idx === 0 ? "bg-green-50" : idx === 1 ? "bg-green-100" : idx === 2 ? "bg-yellow-50" : ""}
      `}
      style={{ marginBottom: idx < topUsers.length - 1 ? "8px" : "0" }}
    >
      <span className="font-bold text-lg" style={{ color: medalColors[idx] || "#10b981" }}>
        {idx < 3 ? <FaMedal style={{ verticalAlign: "middle", marginRight: 2 }} /> : null}
        {idx + 1}
      </span>
      {u.imageUrl ? (
        <Image
          src={u.imageUrl}
          alt={u.userName}
          width={38}
          height={38}
          className="rounded-full border-2 border-green-200 shadow-sm"
          title={u.email}
        />
      ) : (
        <div
          className="rounded-full border-2 border-green-200 shadow-sm bg-green-100 flex items-center justify-center"
          style={{ width: 38, height: 38 }}
          title={u.email}
        >
          <span className="text-green-700 font-bold text-lg">{u.userName?.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold text-green-900 truncate">{u.userName}</span>
        <span className="text-xs text-green-500">{u.totalPoints} points</span>
        {/* Optional progress bar */}
        <div className="w-full bg-green-100 rounded-full h-2 mt-1">
          <div
            className="bg-green-500 h-2 rounded-full"
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

      {/* Materials Table and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
<div className="bg-white rounded-xl p-6 shadow border border-green-100 flex-1 flex flex-col">
  <div className="flex justify-between items-center mb-2">
    <span className="font-medium text-green-800">Top Recycled Materials</span>
    <select className="text-xs border border-green-200 rounded px-2 py-1 focus:outline-none focus:ring-green-500 bg-white">
      <option>By Quantity</option>
      <option>By Category</option>
    </select>
  </div>
  {topMaterials.length > 0 && (
    <div className="w-full mb-4">
      <Bar data={barData} options={barOptions} />
    </div>
  )}
  <table className="w-full mt-2">
  </table>
</div>
        <div className="bg-white rounded-xl p-6 shadow border border-green-100 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-green-800">Recent Activity</span>
            <button className="text-xs text-green-500 hover:underline">See All</button>
          </div>
          <ul className="mt-3 space-y-4">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <ActivityIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-900 truncate">
                    {a.user} <span className="text-green-600 font-normal">{a.action}</span>
                  </p>
                  <p className="text-xs text-green-500">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Weekly Orders Bar Chart */}
      <div className="bg-white rounded-xl p-6 shadow border border-green-100">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-green-800">Weekly Orders</span>
          <select className="text-xs border border-green-200 rounded px-2 py-1 focus:outline-none focus:ring-green-500 bg-white">
            <option>This Week</option>
            <option>Last Week</option>
            <option>Last 4 Weeks</option>
          </select>
        </div>
        <div className="h-48">
          <Bar
            data={{
              labels: ordersPerDay.labels,
              datasets: [{
                label: 'Orders',
                data: ordersPerDay.data,
                backgroundColor: '#10b981',
                borderRadius: 6,
                borderSkipped: false
              }]
            }}
            options={barOptions}
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card
function StatCard({ title, value, icon, trend, trendValue }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend?: 'up' | 'down' | 'steady'; 
  trendValue?: string 
}) {
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

  // Enhanced trend icons
  const TrendUpIcon = () => <TrendingUp size={16} className="animate-pulse" />;
  const TrendDownIcon = () => <TrendingDown size={16} className="animate-pulse" />;
  const TrendSteadyIcon = () => <Minus size={16} />;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden backdrop-blur-sm">
      
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="w-full h-full bg-green-500 rounded-full transform translate-x-16 -translate-y-16" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-green-700 font-bold uppercase tracking-wider mb-2">{title}</p>
            <p className="text-3xl font-black text-green-900 mt-1 group-hover:scale-105 transition-transform duration-200 origin-left">{value}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 text-2xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className={`mt-4 flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-200 group-hover:scale-105 ${trendBgColors[trend]}`}>
            <div className={`flex items-center gap-2 ${trendColors[trend]}`}>
              {trend === 'up' && <TrendUpIcon />}
              {trend === 'down' && <TrendDownIcon />}
              {trend === 'steady' && <TrendSteadyIcon />}
              <span className="text-sm font-bold">{trend === 'steady' ? 'Steady' : trendValue}</span>
            </div>
            <div className="h-4 w-px bg-current opacity-30" />
            <span className="text-sm text-green-600 font-medium opacity-75">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}





// Icons
function OrdersIcon() { return <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="5" y="7" width="14" height="10" rx="2" strokeWidth={2} /><path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" strokeWidth={2} /></svg>; }
function UsersIcon() { return <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" strokeWidth={2} /><path d="M6 20v-2a6 6 0 0112 0v2" strokeWidth={2} /></svg>; }
function MaterialsIcon() { return <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} /><path d="M4 10h16" strokeWidth={2} /></svg>; }
function TrendUpIcon() { return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8" strokeWidth={2} /></svg>; }
function TrendDownIcon() { return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 7l-6 6-4-4-8 8" strokeWidth={2} /></svg>; }
function TrendSteadyIcon() { return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14" strokeWidth={2} /></svg>; }
function ActivityIcon() { return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path d="M12 8v4l3 3" strokeWidth={2} /></svg>; }