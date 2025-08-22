// components/dashboard/DashboardChartsComponent.tsx
"use client";

import React, { Suspense, useMemo } from "react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { StatCard } from "./component/StatCard";
import { ErrorBoundary } from "./component/errorboundary";
import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";
import Loader from "@/components/common/loader";

// Create a reusable loading component to reduce duplication
const ChartLoader = () => (
  <div className="bg-white rounded-lg border h-64 sm:h-72 md:h-80 flex items-center justify-center">
    <Loader />
  </div>
);

// Dynamic import the bundle
const ChartsBundle = dynamic(() => import("../../chartsBundle"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <ChartLoader key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <ChartLoader key={i} />
        ))}
      </div>
      <ChartLoader />
    </div>
  )
});

// Memoize icons to prevent unnecessary re-renders
const OrdersIcon = React.memo(() => (
  <svg
    className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="5" y="7" width="14" height="10" rx="2" strokeWidth={2} />
    <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" strokeWidth={2} />
  </svg>
));

OrdersIcon.displayName = 'OrdersIcon';

const UsersIcon = React.memo(() => (
  <svg
    className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="4" strokeWidth={2} />
    <path d="M6 20v-2a6 6 0 0112 0v2" strokeWidth={2} />
  </svg>
));

UsersIcon.displayName = 'UsersIcon';

const MaterialsIcon = React.memo(() => (
  <svg
    className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
    <path d="M4 10h16" strokeWidth={2} />
  </svg>
));

MaterialsIcon.displayName = 'MaterialsIcon';

export default function DashboardChartsComponent() {
  const { data, loading, error, refetch } = useDashboardData();
  const { convertNumber, t, locale } = useLanguage();
  
  // Memoize computed values to prevent unnecessary recalculations
  const globalLoading = useMemo(() => Object.values(loading).some(Boolean), [loading]);
  const allFailed = useMemo(() => 
    Object.values(loading).every((v) => v === false) &&
    !data.totalOrders &&
    !data.topUsers.length &&
    !data.topMaterials.length,
    [loading, data]
  );
  
  // Memoize the formatted date
  const formattedDate = useMemo(() => 
    new Date().toLocaleDateString(locale === 'ar' ? 'ar-eg' : 'en-US', {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    [locale]
  );

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
          aria-label="Retry loading dashboard data"
          onClick={refetch}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white text-sm sm:text-base rounded hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:bg-transparent" style={{ background: "var(--background)" }}>
      <div className="px-3 py-4 sm:px-4 sm:py-6 md:p-6 space-y-4 sm:space-y-6 md:space-y-7 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold " style={{ color: "var(--color-green-900)" }}>
              {t('charts.dashboardTitle')}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-green-700 mt-1">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <StatCard
            title={t('charts.totalOrders')}
            value={convertNumber(data.totalOrders?.toLocaleString()) || "0"}
            icon={<OrdersIcon />}
            trend="up"
            trendValue={`${convertNumber(8)}%`}
            loading={loading.analytics}
          />
          <StatCard
            title={t('charts.activeUsers')}
            value={convertNumber(data.topUsers?.length) || "0"}
            icon={<UsersIcon />}
            trend="steady"
            loading={loading.users}
          />
          <div className="xs:col-span-2 lg:col-span-1">
            <StatCard
              title={t('charts.materialTrack')}
              value={convertNumber(data.topMaterials?.length)|| "0"}
              icon={<MaterialsIcon />}
              trend="up"
              trendValue={`${convertNumber(5)}%`}
              loading={loading.materials}
            />
          </div>
        </div>

        {/* Charts Bundle */}
        <ErrorBoundary
          fallback={
            <div className="bg-white rounded-lg border border-red-200 p-4 text-red-500 text-center text-sm">
              Error loading charts
            </div>
          }
        >
          <Suspense fallback={
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ChartLoader key={i} />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <ChartLoader key={i} />
                ))}
              </div>
              <ChartLoader />
            </div>
          }>
            <ChartsBundle data={data} loading={loading} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}