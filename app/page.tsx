"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleDollarSign, Mic, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";

// Lazy load components that are below the fold
const CategoryList = lazy(() => import("@/components/shared/CategoryList"));
const SubscriptionForm = lazy(() => import("@/components/common/subscriptionForm/subscriptionForm"));

// Loading fallback components
const CategoryListSkeleton = () => (
  <div className="w-full h-32 bg-gray-200 animate-pulse rounded-lg" />
);

const SubscriptionFormSkeleton = () => (
  <div className="w-full max-w-md mx-auto">
    <div className="h-12 bg-gray-200 animate-pulse rounded-lg mb-4" />
    <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
  </div>
);

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      <motion.section className="relative w-full h-[90vh] min-h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/beautiful-tree.jpg"
            alt={t("indexPage.title.line1") + " " + t("indexPage.title.line2")}
            fill
            className="object-cover object-center scale-105"
            priority // Keep priority for above-the-fold hero image
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaeCCS3Yxu5VCfI7D9VpbGghcC0DlF0fkZZyrlstuDzM"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t("indexPage.title.line1")}
              <span className="block bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                {t("indexPage.title.line2")}
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {t("indexPage.description")}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/category"
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10">{t("indexPage.cta.drop")}</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
            <Link
              href="/about"
              className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              {t("indexPage.cta.learn")}
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000" />
      </motion.section>

      <section className="flex flex-col md:flex-row justify-between items-stretch gap-6 px-4 py-10 text-2xl bg-base-100 text-center rounded-2xl mx-15" style={{ background: "var(--color-green-100)" }}>
        <div className="flex-1 flex flex-col items-center">
          <Mic className="w-10 h-10 text-green-600 mx-auto md:mx-0 mb-2" />
          <h2 className="font-bold text-primary mb-2">
            {t("indexPage.features.voiceInput")}
          </h2>
          <p>{t("indexPage.features.voice")}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <CalendarCheck className="w-10 h-10 text-blue-600 mx-auto md:mx-0 mb-2" />
          <h2 className="font-bold text-info mb-2">
            {t("indexPage.features.pickupScheduling")}
          </h2>
          <p>{t("indexPage.features.schedule")}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <CircleDollarSign className="w-10 h-10 text-yellow-600 mx-auto md:mx-0 mb-2" />
          <h2 className="font-bold text-yellow-600 mb-2">
            {t("indexPage.features.earnorshare")}
          </h2>
          <p>{t("indexPage.features.earn")}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 "style={{ color: "var(--section-gradient)" }}>
          {t("indexPage.steps.howItWorks")}
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 md:gap-8">
          {/* Step 1 */}
          <div className="flex-1 flex flex-col items-center group max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-green-100 dark:bg-green-900/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-green-500 text-white text-2xl font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 w-full text-center border-2 border-green-200 dark:border-green-800 shadow-sm group-hover:shadow-xl transition-all duration-300 h-full min-h-[280px] flex flex-col justify-center">
              <h3 className="text-2xl md:text-2xl font-semibold mb-4 text-green-700 dark:text-green-400">
                {t("indexPage.steps.step1.title")}
              </h3>
              <p className="text-lg md:text-xl text-green-600 dark:text-green-300 leading-relaxed">
                {t("indexPage.steps.step1.desc")}
              </p>
            </div>
          </div>

          {/* Step 2 Connector */}
          <div className="hidden md:flex items-center justify-center py-16">
            <div className="flex items-center">
              <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
              <div className="w-4 h-4 rounded-full bg-green-400 mx-2"></div>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex-1 flex flex-col items-center group max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-blue-500 text-white text-2xl font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-10 w-full text-center border-2 border-blue-200 dark:border-blue-800 shadow-sm group-hover:shadow-xl transition-all duration-300 h-full min-h-[280px] flex flex-col justify-center">
              <h3 className="text-2xl md:text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-400">
                {t("indexPage.steps.step2.title")}
              </h3>
              <p className="text-lg md:text-xl text-blue-600 dark:text-blue-300 leading-relaxed">
                {t("indexPage.steps.step2.desc")}
              </p>
            </div>
          </div>

          {/* Step 3 Connector */}
          <div className="hidden md:flex items-center justify-center py-16">
            <div className="flex items-center">
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"></div>
              <div className="w-4 h-4 rounded-full bg-yellow-400 mx-2"></div>
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full"></div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex-1 flex flex-col items-center group max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-yellow-500 text-white text-2xl font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-10 w-full text-center border-2 border-yellow-200 dark:border-yellow-800 shadow-sm group-hover:shadow-xl transition-all duration-300 h-full min-h-[280px] flex flex-col justify-center">
              <h3 className="text-2xl md:text-2xl font-semibold mb-4 text-yellow-700 dark:text-yellow-400">
                {t("indexPage.steps.step3.title")}
              </h3>
              <p className="text-lg md:text-xl text-yellow-600 dark:text-yellow-300 leading-relaxed">
                {t("indexPage.steps.step3.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Lazy loaded CategoryList with fallback */}
      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryList maxToShow={20} basePath="/category" horizontal />
      </Suspense>


  <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-blue-50/40 to-purple-50/60 dark:from-emerald-950/20 dark:via-blue-950/10 dark:to-purple-950/15 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 rounded-2xl mx-4 sm:mx-6 lg:mx-12 my-8 sm:my-12 border border-white/20 dark:border-white/5 backdrop-blur-sm">
  {/* Modern background decorative elements */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 dark:from-emerald-400/10 dark:to-blue-400/10 rounded-full blur-2xl animate-pulse"></div>
    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-400/15 to-pink-400/15 dark:from-purple-400/8 dark:to-pink-400/8 rounded-full blur-2xl animate-pulse delay-1000"></div>
    <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 dark:from-blue-400/5 dark:to-emerald-400/5 rounded-full blur-xl"></div>
  </div>

  <div className="relative max-w-3xl mx-auto text-center">
    {/* Compact header with modern typography */}
    <div className="mb-8 sm:mb-10">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
        {t("indexPage.community.title")}{" "}
        <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          {t("indexPage.community.highlight")}
        </span>
      </h2>
      <div className="space-y-2">
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {t("indexPage.community.desc1")}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-medium">
          {t("indexPage.community.desc2").replace(/<1>(.*?)<\/1>/g, "$1")}
        </p>
      </div>
    </div>

    {/* Subscription form with enhanced spacing */}
    <div className="relative">
      <Suspense fallback={<SubscriptionFormSkeleton />}>
        <SubscriptionForm />
      </Suspense>
    </div>
  </div>
</section>
    </>
  );
}