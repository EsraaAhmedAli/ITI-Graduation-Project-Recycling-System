"use client";

import React, { Suspense, lazy } from "react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { StatCard } from "./component/StatCard";
import { ErrorBoundary } from "./component/errorboundary";
import Loader from "@/components/common/Loader";

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
    className="h-5 w-5 md:h-6 md:w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <rect x="5" y="7" width="14" height="10" rx="2" strokeWidth={2} />
    <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" strokeWidth={2} />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="h-5 w-5 md:h-6 md:w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" strokeWidth={2} />
    <path d="M6 20v-2a6 6 0 0112 0v2" strokeWidth={2} />
  </svg>
);

const MaterialsIcon = () => (
  <svg
    className="h-5 w-5 md:h-6 md:w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
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
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">Failed to load dashboard data</div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-7 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between lg:gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-green-900">
            Dashboard insights
          </h1>
          <p className="text-xs md:text-sm text-green-700">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
        <StatCard
          title="Materials Tracked"
          value={data.topMaterials?.length?.toLocaleString() || "0"}
          icon={<MaterialsIcon />}
          trend="up"
          trendValue="5%"
          loading={loading.materials}
        />
      </div>

      {/* Analytics Row - Fixed Height */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-7 h-80 lg:h-96">
        <ErrorBoundary
          fallback={
            <div className="text-red-500 flex items-center justify-center h-full">
              Error loading user growth chart
            </div>
          }>
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center">
                <Loader />
              </div>
            }>
            <div className="h-full">
              <UserGrowthChart
                userGrowth={data.userGrowth || []}
                loading={loading.userStats}
              />
            </div>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary
          fallback={
            <div className="text-red-500 flex items-center justify-center h-full">
              Error loading order status chart
            </div>
          }>
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center">
                <Loader />
              </div>
            }>
            <div className="h-full">
              <OrderStatusChart
                orderStatus={data.orderStatus || {}}
                loading={loading.analytics}
              />
            </div>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary
          fallback={
            <div className="text-red-500 flex items-center justify-center h-full">
              Error loading top recyclers
            </div>
          }>
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center">
                <Loader />
              </div>
            }>
            <div className="h-full">
              <TopRecyclersCard
                topUsers={data.topUsers || []}
                loading={loading.users}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Materials and Cities Charts - Fixed Height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-7 h-80 lg:h-96">
        <ErrorBoundary
          fallback={
            <div className="text-red-500 flex items-center justify-center h-full">
              Error loading materials chart
            </div>
          }>
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center">
                <Loader />
              </div>
            }>
            <div className="h-full">
              <MaterialsChart
                topMaterials={data.topMaterials || []}
                loading={loading.materials}
              />
            </div>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary
          fallback={
            <div className="text-red-500 flex items-center justify-center h-full">
              Error loading cities chart
            </div>
          }>
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center">
                <Loader />
              </div>
            }>
            <div className="h-full">
              <CitiesChart
                chartData={data.citiesData || { labels: [], datasets: [] }}
                loading={loading.cities}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Weekly Orders Chart - Fixed Height */}
      <div className="h-80 lg:h-96">
        <ErrorBoundary
          fallback={
            <div className="text-red-500 flex items-center justify-center h-full">
              Error loading weekly orders chart
            </div>
          }>
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center">
                <Loader />
              </div>
            }>
            <div className="h-full">
              <WeeklyOrdersChart
                ordersPerDay={data.ordersPerDay || []}
                loading={loading.analytics}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
