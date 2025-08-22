import React, { memo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StatCardProps } from "../../../../components/Types/dashboard.types";
import { TREND_COLORS, TREND_BG_COLORS } from "../../../../constants/theme";
import { useLanguage } from "@/context/LanguageContext";

const TrendIcon = ({ trend }: { trend: "up" | "down" | "steady" }) => {
  const iconProps = { size: 16, className: "animate-pulse" };

  switch (trend) {
    case "up":
      return <TrendingUp {...iconProps} />;
    case "down":
      return <TrendingDown {...iconProps} />;
    case "steady":
      return <Minus size={16} />;
    default:
      return null;
  }
};

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-full"></div>
  </div>
);

// Helper function to convert numbers to Eastern Arabic numerals
const convertToArabicNumerals = (value: string | number): string => {
  if (typeof value === "number") value = value.toString();
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return value.replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
};

export const StatCard = memo<StatCardProps>(
  ({ title, value, icon, trend, trendValue, loading = false }) => {
    const { t, locale } = useLanguage();
    const isRTL = locale === "ar";

    // Localize the main value
    const localizedValue =
      locale === "ar" ? convertToArabicNumerals(value) : value;

    // Localize trend value (percentage)
    const localizedTrendValue = trendValue
      ? trendValue.replace("%", t("charts.numbers.percent"))
      : "";

    if (loading) {
      return (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border-2 border-green-200">
          <LoadingSkeleton />
        </div>
      );
    }

    return (
      <div
        className={`bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border-2 border-green-200 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden backdrop-blur-sm`}
        style={{
          background: "var(--background)",
          direction: isRTL ? "rtl" : "ltr",
        }}>
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Decorative Circle */}
        <div
          className={`absolute ${
            isRTL ? "left-0" : "right-0"
          } w-24 md:w-32 h-24 md:h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300`}>
          <div className="w-full h-full bg-green-500 rounded-full transform translate-x-12 md:translate-x-16 -translate-y-12 md:-translate-y-16" />
        </div>

        <div className="relative z-10">
          {/* Main Content */}
          <div
            className={`flex justify-between items-center mb-3 md:mb-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-xs md:text-sm text-green-700 font-bold uppercase tracking-wider mb-1 md:mb-2">
                {title}
              </p>
              <p className="text-2xl md:text-3xl font-black text-green-900 mt-1 group-hover:scale-105 transition-transform duration-200 origin-left">
                {localizedValue}
              </p>
            </div>

            {/* Icon */}
            <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 text-xl md:text-2xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              {icon}
            </div>
          </div>

          {/* Trend Indicator */}
          {trend && (
            <div
              className={`mt-3 md:mt-4 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl border transition-all duration-200 group-hover:scale-105 ${
                TREND_BG_COLORS[trend]
              } ${isRTL ? "flex-row-reverse" : ""}`}>
              <div
                className={`flex items-center gap-2 ${TREND_COLORS[trend]} ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <TrendIcon trend={trend} />
                <span className="text-xs md:text-sm font-bold">
                  {trend === "steady"
                    ? t("charts.trends.steady")
                    : localizedTrendValue}
                </span>
              </div>
              <div className="h-3 md:h-4 w-px bg-current opacity-30" />
              <span className="text-xs text-green-600 font-medium opacity-75">
                {t("charts.vsLastPeriod")}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
