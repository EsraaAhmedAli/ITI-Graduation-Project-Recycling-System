"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleDollarSign, Mic, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";
import CategoryList from "@/components/shared/CategoryList";
import SubscriptionForm from "@/components/common/subscriptionForm/subscriptionForm";
import { useLanguage } from "@/context/LanguageContext";

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

      <section className="flex flex-col md:flex-row justify-between items-stretch gap-6 px-4 py-10 text-2xl bg-base-100 text-center rounded-2xl mx-15">
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

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-accent-content">
          {t("indexPage.steps.howItWorks")}
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8">
          {/* Step 1 */}
          <div className="flex-1 max-w-md flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-md opacity-75"></div>
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold shadow-lg">
                1
              </div>
            </div>
            <div className="bg-base-200 rounded-2xl p-8 w-full text-center shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <h3 className="text-2xl font-semibold mb-4">
                {t("indexPage.steps.step1.title")}
              </h3>
              <p className="text-lg opacity-90">
                {t("indexPage.steps.step1.desc")}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="hidden md:flex items-center justify-center py-16">
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary"></div>
          </div>
          <div className="flex-1 max-w-md flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-secondary/10 rounded-full blur-md opacity-75"></div>
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-white text-2xl font-bold shadow-lg">
                2
              </div>
            </div>
            <div className="bg-base-200 rounded-2xl p-8 w-full text-center shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <h3 className="text-2xl font-semibold mb-4">
                {t("indexPage.steps.step2.title")}
              </h3>
              <p className="text-lg opacity-90">
                {t("indexPage.steps.step2.desc")}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="hidden md:flex items-center justify-center py-16">
            <div className="w-16 h-1 bg-gradient-to-r from-secondary to-accent"></div>
          </div>
          <div className="flex-1 max-w-md flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-accent/10 rounded-full blur-md opacity-75"></div>
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-accent text-white text-2xl font-bold shadow-lg">
                3
              </div>
            </div>
            <div className="bg-base-200 rounded-2xl p-8 w-full text-center shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <h3 className="text-2xl font-semibold mb-4">
                {t("indexPage.steps.step3.title")}
              </h3>
              <p className="text-lg opacity-90">
                {t("indexPage.steps.step3.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <CategoryList basePath="/category" maxToShow={5} horizontal />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 sm:mx-8 lg:mx-16 my-12 sm:my-16 lg:my-20">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/5 rounded-full blur-xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Header with enhanced typography */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-accent-content leading-tight">
              {t("indexPage.community.title")}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("indexPage.community.highlight")}
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-2 text-gray-700 max-w-2xl mx-auto leading-relaxed">
              {t("indexPage.community.desc1")}
            </p>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              {/* For the embedded HTML like <1>10,000+</1>, we'll need to handle it specially */}
              {t("indexPage.community.desc2").replace(/<1>(.*?)<\/1>/g, "$1")}
            </p>
          </div>

          <SubscriptionForm />
        </div>
      </section>
    </>
  );
}
