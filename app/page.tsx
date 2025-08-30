"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleDollarSign, Mic, CalendarCheck } from "lucide-react";
import { memo, lazy, Suspense, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";

// Lazy load components that are below the fold
const SubscriptionForm = lazy(
  () => import("@/components/common/subscriptionForm/subscriptionForm")
);

// Lazy load FloatingRecorderButton for voice processing with loading disabled
const FloatingRecorderButton = dynamic(
  () => import("@/components/Voice Processing/FloatingRecorderButton"),
  { ssr: false, loading: () => null }
);

// Memoized loading fallback component
const SubscriptionFormSkeleton = memo(() => (
  <div className="w-full max-w-md mx-auto">
    <div className="h-12 bg-gray-200 animate-pulse rounded-lg mb-4" />
    <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
  </div>
));

// Memoized feature component to prevent unnecessary re-renders
const FeatureCard = memo(({ icon: Icon, title, description, colorClass }) => (
  <div className="flex-1 flex flex-col items-center">
    <Icon className={`w-10 h-10 ${colorClass} mx-auto md:mx-0 mb-2`} />
    <h2 className={`font-bold ${colorClass === 'text-green-600' ? 'text-primary' : colorClass === 'text-blue-600' ? 'text-info' : 'text-yellow-600'} mb-2`}>
      {title}
    </h2>
    <p>{description}</p>
  </div>
));

// Memoized step component
const StepCard = memo(({ stepNumber, title, description, bgColor, iconColor, icon }) => (
  <div className="flex-1 flex flex-col items-center group max-w-md mx-auto">
    <div className="relative mb-6">
      <div className={`absolute -inset-4 ${bgColor} rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity`}></div>
      <div className={`relative flex items-center justify-center w-24 h-24 rounded-full ${iconColor} text-white text-2xl font-bold shadow-lg transform group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div className={`${bgColor.replace('/30', '/20')} rounded-2xl p-8 w-full text-center border-2 ${bgColor.replace('bg-', 'border-').replace('/30', '').replace('900', '200')} dark:border-${bgColor.split('-')[1]}-800 shadow-sm group-hover:shadow-xl transition-all duration-300 h-full min-h-[280px] flex flex-col justify-center`}>
      <h3 className={`text-2xl md:text-2xl font-semibold mb-4 text-${bgColor.split('-')[1]}-700 dark:text-${bgColor.split('-')[1]}-400`}>
        {title}
      </h3>
      <p className={`text-lg md:text-xl text-${bgColor.split('-')[1]}-600 dark:text-${bgColor.split('-')[1]}-300 leading-relaxed`}>
        {description}
      </p>
    </div>
  </div>
));

// Memoized connector component
const StepConnector = memo(() => (
  <div className="hidden md:flex items-center justify-center py-16">
    <div className="flex items-center">
      <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
      <div className="w-4 h-4 rounded-full bg-green-400 mx-2"></div>
      <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"></div>
    </div>
  </div>
));

export default function Home() {
  const { t } = useLanguage();

  // Pre-define step icons to avoid recreating them on each render
  const stepIcons = useMemo(() => [
    <svg key="step1" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>,
    <svg key="step2" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>,
    <svg key="step3" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ], []);

  return (
    <>
      {/* Hero Section - Optimized image and removed expensive effects */}
      <section className="relative w-full h-[90vh] min-h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/beautiful-tree.jpg"
            alt={`${t("indexPage.title.line1")} ${t("indexPage.title.line2")}`}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaeCCS3Yxu5VCfI7D9VpbGghcC0DlF0fkZZyrlstuDzM"
            quality={75} // Reduced quality for better performance
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <div className="text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t("indexPage.title.line1")}
              <span className="block bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                {t("indexPage.title.line2")}
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {t("indexPage.description")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/category"
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              prefetch={false}
            >
              <span className="relative z-10">{t("indexPage.cta.drop")}</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
            <Link
              href="/about"
              className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105"
              prefetch={false}
            >
              {t("indexPage.cta.learn")}
            </Link>
          </div>
        </div>

        {/* Reduced blur intensity for floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-400/5 rounded-full blur-md" />
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-blue-400/5 rounded-full blur-md" />
      </section>

      {/* Features Section */}
      <section
        className="flex flex-col md:flex-row justify-between items-stretch gap-6 px-4 py-10 text-2xl bg-base-100 text-center rounded-2xl mx-15"
        style={{ background: "var(--color-green-100)" }}
      >
        <FeatureCard
          icon={Mic}
          title={t("indexPage.features.voiceInput")}
          description={t("indexPage.features.voice")}
          colorClass="text-green-600"
        />
        <FeatureCard
          icon={CalendarCheck}
          title={t("indexPage.features.pickupScheduling")}
          description={t("indexPage.features.schedule")}
          colorClass="text-blue-600"
        />
        <FeatureCard
          icon={CircleDollarSign}
          title={t("indexPage.features.earnorshare")}
          description={t("indexPage.features.earn")}
          colorClass="text-yellow-600"
        />
      </section>

      {/* Steps Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <h2
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          style={{ color: "var(--section-gradient)" }}
        >
          {t("indexPage.steps.howItWorks")}
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 md:gap-8">
          <StepCard
            stepNumber={1}
            title={t("indexPage.steps.step1.title")}
            description={t("indexPage.steps.step1.desc")}
            bgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="bg-green-500"
            icon={stepIcons[0]}
          />

          <StepConnector />

          <StepCard
            stepNumber={2}
            title={t("indexPage.steps.step2.title")}
            description={t("indexPage.steps.step2.desc")}
            bgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="bg-blue-500"
            icon={stepIcons[1]}
          />

          <StepConnector />

          <StepCard
            stepNumber={3}
            title={t("indexPage.steps.step3.title")}
            description={t("indexPage.steps.step3.desc")}
            bgColor="bg-yellow-100 dark:bg-yellow-900/30"
            iconColor="bg-yellow-500"
            icon={stepIcons[2]}
          />
        </div>
      </section>

      {/* Marketplace Section - Add this after the Steps Section and before Community Section */}
<section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
  <div className="text-center mb-16">
    <h2
      className="text-4xl md:text-5xl font-bold mb-6"
      style={{ color: "var(--section-gradient)" }}
    >
      {t("indexPage.marketplace.title")}
    </h2>
    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
      {t("indexPage.marketplace.subtitle")}
    </p>
  </div>

  <div className="grid md:grid-cols-3 gap-8 mb-12">
    {/* Buyers Card */}
    <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M8 11v6a4 4 0 008 0v-6M8 11h8" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {t("indexPage.marketplace.buyers.title")}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {t("indexPage.marketplace.buyers.description")}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
            {t("indexPage.marketplace.buyers.feature1")}
          </div>
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
            {t("indexPage.marketplace.buyers.feature2")}
          </div>
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
            {t("indexPage.marketplace.buyers.feature3")}
          </div>
        </div>
      </div>
    </div>

    {/* Crafters Card */}
    <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {t("indexPage.marketplace.crafters.title")}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {t("indexPage.marketplace.crafters.description")}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
            {t("indexPage.marketplace.crafters.feature1")}
          </div>
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
            {t("indexPage.marketplace.crafters.feature2")}
          </div>
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
            {t("indexPage.marketplace.crafters.feature3")}
          </div>
        </div>
      </div>
    </div>

    {/* Raw Materials Card */}
    <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-900/20 dark:to-orange-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {t("indexPage.marketplace.rawMaterials.title")}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {t("indexPage.marketplace.rawMaterials.description")}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-amber-400 rounded-full mr-3" />
            {t("indexPage.marketplace.rawMaterials.feature1")}
          </div>
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-amber-400 rounded-full mr-3" />
            {t("indexPage.marketplace.rawMaterials.feature2")}
          </div>
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <div className="w-2 h-2 bg-amber-400 rounded-full mr-3" />
            {t("indexPage.marketplace.rawMaterials.feature3")}
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* CTA Section */}
  <div className="text-center">
    <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl border border-gray-200 dark:border-gray-600 shadow-lg">
      <div className="text-center sm:text-left sm:flex-1">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          {t("indexPage.marketplace.cta.title")}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {t("indexPage.marketplace.cta.description")}
        </p>
      </div>
      
      <Link
        href="/marketplace"
        className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
        prefetch={false}
      >
        <span className="relative z-10 flex items-center gap-2">
          {t("indexPage.marketplace.cta.button")}
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </Link>
    </div>
  </div>
</section>

      {/* Community Section - Reduced blur effects */}
      <section  style={{ background: "var(--color-green-100)" }} className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-blue-50/40 to-purple-50/60 dark:from-emerald-950/20 dark:via-blue-950/10 dark:to-purple-950/15 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 rounded-2xl mx-4 sm:mx-6 lg:mx-12 my-8 sm:my-12 border border-white/20 dark:border-white/5">
        {/* Reduced background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 dark:from-emerald-400/5 dark:to-blue-400/5 rounded-full blur-sm"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 dark:from-purple-400/5 dark:to-pink-400/5 rounded-full blur-sm"></div>
        </div>

        <div className="relative max-w-3xl mx-auto text-center" >
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100 leading-tight tracking-tight" style={{ color: "var(--color-base-800)" }}>
              {t("indexPage.community.title")}{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t("indexPage.community.highlight")}
              </span>
            </h2>
            <div className="space-y-2">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--color-base-800)" }}>
                {t("indexPage.community.desc1")}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-medium">
                {t("indexPage.community.desc2").replace(/<1>(.*?)<\/1>/g, "$1")}
              </p>
            </div>
          </div>

          <div className="relative">
            <Suspense fallback={<SubscriptionFormSkeleton />}>
              <SubscriptionForm />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Voice Processing Component */}
      <FloatingRecorderButton />
    </>
  );
}