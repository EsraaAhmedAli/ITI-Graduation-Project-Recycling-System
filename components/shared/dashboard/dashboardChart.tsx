"use client";

import React, { Suspense, lazy } from "react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { StatCard } from "./component/StatCard";
import { ErrorBoundary } from "./component/errorboundary";
import Loader from "@/components/common/loader";

// Lazy load chart components
const UserGrowthChart = lazy(() => import("./charts/UserGrowthChart"));
const OrderStatusChart = lazy(() => import("./charts/OrderStatusChart"));
const TopRecyclersCard = lazy(() => import("./component/TopRecyclersCard"));
const MaterialsChart = lazy(() => import("./charts/MaterialsChart"));
const CitiesChart = lazy(() => import("./charts/CitiesChart"));
const WeeklyOrdersChart = lazy(() => import("./charts/WeeklyOrdersChart"));

// Icons
const OrdersIcon = () => (
  <svg
    className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="5" y="7" width="14" height="10" rx="2" strokeWidth={2} />
    <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" strokeWidth={2} />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="4" strokeWidth={2} />
    <path d="M6 20v-2a6 6 0 0112 0v2" strokeWidth={2} />
  </svg>
);

const MaterialsIcon = () => (
  <svg
    className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
    <path d="M4 10h16" strokeWidth={2} />
  </svg>
);

export default function DashboardCharts() {
  const { data, loading, error, refetch } = useDashboardData();

  const globalLoading = Object.values(loading).some(Boolean);
  const allFailed =
    Object.values(loading).every((v) => v === false) &&
    !data.totalOrders &&
    !data.topUsers.length &&
    !data.topMaterials.length;

  if (globalLoading) {
    return <Loader />;
  }

  if (error && allFailed) {
    return (
      <div className="p-4 sm:p-6 text-center" style={{background:"var(--background"}}>
        <div className="text-red-600 mb-4 text-sm sm:text-base">
          Failed to load dashboard data
        </div>
        <button
          onClick={refetch}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white text-sm sm:text-base rounded hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:bg-transparent" style={{ background: "var(--color-base-100)" }}>
      <div className="px-3 py-4 sm:px-4 sm:py-6 md:p-6 space-y-4 sm:space-y-6 md:space-y-7 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-900">
              Dashboard Insights
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-green-700 mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <StatCard
            title="Total Orders"
            value={data.totalOrders?.toLocaleString() || "0"}
            icon={<OrdersIcon />}
            trend="up"
            trendValue="8%"
            loading={loading.analytics}
          />
          <StatCard
            title="Active Users"
            value={data.topUsers?.length?.toLocaleString() || "0"}
            icon={<UsersIcon />}
            trend="steady"
            loading={loading.users}
          />
          <div className="xs:col-span-2 lg:col-span-1">
            <StatCard
              title="Materials Tracked"
              value={data.topMaterials?.length?.toLocaleString() || "0"}
              icon={<MaterialsIcon />}
              trend="up"
              trendValue="5%"
              loading={loading.materials}
            />
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <ErrorBoundary
            fallback={
              <div className="bg-white rounded-lg border border-red-200 p-4 text-red-500 text-center text-sm">
                Error loading user growth chart
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 flex items-center justify-center">
                  <Loader />
                </div>
              }
            >
              <div className="h-64 sm:h-72 md:h-80 lg:h-96">
                <UserGrowthChart
                  userGrowth={data.userGrowth || []}
                  loading={loading.userStats}
                />
              </div>
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary
            fallback={
              <div className="bg-white rounded-lg border border-red-200 p-4 text-red-500 text-center text-sm">
                Error loading order status chart
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 flex items-center justify-center">
                  <Loader />
                </div>
              }
            >
              <div className="h-64 sm:h-72 md:h-80 lg:h-96">
                <OrderStatusChart
                  orderStatus={data.orderStatus || {}}
                  loading={loading.analytics}
                />
              </div>
            </Suspense>
          </ErrorBoundary>

          <div className="md:col-span-2 xl:col-span-1">
            <ErrorBoundary
              fallback={
                <div className="bg-white rounded-lg border border-red-200 p-4 text-red-500 text-center text-sm">
                  Error loading top recyclers
                </div>
              }
            >
              <Suspense
                fallback={
                  <div className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 flex items-center justify-center">
                    <Loader />
                  </div>
                }
              >
                <div className="h-64 sm:h-72 md:h-80 lg:h-96">
                  <TopRecyclersCard
                    topUsers={data.topUsers || []}
                    loading={loading.users}
                  />
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Materials and Cities Charts - Responsive Layout */}
        <div className="space-y-4 sm:space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          {/* Materials Chart */}
          <div className="w-full">
            <ErrorBoundary
              fallback={
                <div className="bg-white rounded-lg border border-red-200 p-4 text-red-500 text-center text-sm">
                  Error loading materials chart
                </div>
              }
            >
              <Suspense
                fallback={
                  <div className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 flex items-center justify-center">
                    <Loader />
                  </div>
                }
              >
                <div className="h-64 sm:h-72 md:h-80 lg:h-96">
                  <MaterialsChart
                    topMaterials={data.topMaterials || []}
                    loading={loading.materials}
                  />
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Cities Chart */}
          <div className="w-full">
            <ErrorBoundary
              fallback={
                <div className="bg-white rounded-lg border border-red-200 p-4 text-red-500 text-center text-sm">
                  Error loading cities chart
                </div>
              }
            >
              <Suspense
                fallback={
                  <div className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 flex items-center justify-center">
                    <Loader />
                  </div>
                }
              >
                <div className="h-64 sm:h-72 md:h-80 lg:h-96">
                  <CitiesChart
                    chartData={data.citiesData || { labels: [], datasets: [] }}
                    loading={loading.cities}
                  />
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Weekly Orders Chart */}
        <div className="w-full">
          <ErrorBoundary
            fallback={
              <div className="bg-white rounded-lg border border-red-200 p-4 text-red-500 text-center text-sm">
                Error loading weekly orders chart
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 flex items-center justify-center">
                  <Loader />
                </div>
              }
            >
              <div className="h-64 sm:h-72 md:h-80 lg:h-96">
                <WeeklyOrdersChart
                  ordersPerDay={data.ordersPerDay || []}
                  loading={loading.analytics}
                />
              </div>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
