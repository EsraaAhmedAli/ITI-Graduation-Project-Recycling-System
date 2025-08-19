"use client";
import React, { useState, useEffect } from "react";
import { Star, Gift, Recycle, Trophy, Infinity } from "lucide-react";
import { rewardLevels } from "@/constants/rewardsTiers";
import { useUserAuth } from "@/context/AuthFormContext";
import { useUserPoints } from "@/context/UserPointsContext";
import { useLanguage } from "@/context/LanguageContext"; // Add this import

const RecyclingRewardsSystem = () => {
  // Add language hook
  const { t, locale, convertNumber } = useLanguage();

  // Sample customer data - replace with real data from your API
  const { user } = useUserAuth();
  const { userPoints, getUserPoints, silentRefresh, totalCompletedOrders } =
    useUserPoints();

  // Function to calculate current level based on points
  const calculateCurrentLevel = (recycles) => {
    for (const level of rewardLevels) {
      // console.log(`${level.minRecycles} Vs  ${points} Vs ${level.maxPoints}`);
      if (recycles >= level.minRecycles && recycles <= level.maxRecycles) {
        return level;
      }
    }
    return rewardLevels[0]; // Default to first level if no match
  };

  // Function to calculate next level based on current points
  const calculateNextLevel = (points) => {
    const currentLevelIndex = rewardLevels.findIndex(
      (level) => points >= level.minRecycles && points <= level.maxRecycles
    );
    return rewardLevels[currentLevelIndex + 1] || null;
  };

  // Function to calculate points needed for next level
  const calculatePointsToNext = (orders) => {
    const nextLevel = calculateNextLevel(orders);
    if (nextLevel) {
      return nextLevel.minRecycles - orders;
    }
    return 0; // Already at max level
  };

  useEffect(() => {
    silentRefresh();
  }, [silentRefresh]);

  // Recompute customer data whenever points or orders update
  useEffect(() => {
    const currentUserPoints = userPoints?.totalPoints || 0;
    const currentTotalCompletedOrders = totalCompletedOrders || 0;
    const currentLevelData = calculateCurrentLevel(currentTotalCompletedOrders);
    const nextLevelData = calculateNextLevel(currentTotalCompletedOrders);
    const pointsToNextLevel = calculatePointsToNext(
      currentTotalCompletedOrders
    );

    setCustomerData({
      name: user?.name || t("program.guestUser"),
      currentPoints: currentUserPoints,
      totalOrders: currentTotalCompletedOrders,
      currentLevel: currentLevelData?.name || t("program.ecoStarter"),
      nextLevel: nextLevelData?.name || t("program.maxLevelReached"),
      pointsToNext: pointsToNextLevel,
    });
  }, [userPoints, totalCompletedOrders, user, t]);

  // Initialize customer data with calculations
  const currentUserPoints = userPoints?.totalPoints || 0;
  const currentTotalCompletedOrders = totalCompletedOrders || 0;
  const currentLevelData = calculateCurrentLevel(currentUserPoints);
  const nextLevelData = calculateNextLevel(userPoints);
  const pointsToNextLevel = calculatePointsToNext(userPoints);

  const [customerData, setCustomerData] = useState({
    name: user?.name || t("program.guestUser"),
    currentPoints: userPoints?.totalPoints || 0,
    totalOrders: currentTotalCompletedOrders,
    currentLevel: currentLevelData?.name || t("program.ecoStarter"),
    nextLevel: nextLevelData?.name || t("program.maxLevelReached"),
    pointsToNext: pointsToNextLevel,
  });

  // Get current level details
  const getCurrentLevel = () => {
    return rewardLevels.find(
      (level) =>
        customerData.totalOrders >= level.minRecycles &&
        customerData.totalOrders <= level.maxRecycles
    );
  };

  const getNextLevel = () => {
    const currentLevelIndex = rewardLevels.findIndex(
      (level) =>
        customerData.totalOrders >= level.minRecycles &&
        customerData.totalOrders <= level.maxRecycles
    );
    return rewardLevels[currentLevelIndex + 1] || null;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressPercentage = currentLevel
    ? ((customerData.totalOrders - currentLevel.minRecycles) /
        (currentLevel.maxRecycles - currentLevel.minRecycles)) *
      100
    : 0;

  // Helper function to format numbers based on locale
  const formatNumber = (number) => {
    return convertNumber(number);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                {t("program.welcomeBack", { name: customerData.name })}
              </h2>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-3 py-1 rounded-lg border border-emerald-200/50">
                <currentLevel.badge className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-700">
                  {t(
                    `profile.tires.${currentLevel?.name
                      .replace(/\s+/g, "")
                      .toLowerCase()}`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Points Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <p className="text-3xl font-bold mb-1">
              {formatNumber(customerData.currentPoints)}
            </p>
            <p className="text-emerald-100 font-medium text-sm uppercase tracking-wide">
              {t("program.points")}
            </p>
          </div>

          {/* Orders Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full shadow-inner">
                {formatNumber(customerData.totalOrders)}
              </div>
              <span className="text-sm font-semibold uppercase tracking-wide">
                {t("program.recyclingOrders")}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        {nextLevel && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            {/* Progress Path */}
            <div className="flex items-center justify-between relative mb-4">
              {/* Current Level */}
              <div className="flex flex-col items-center z-20">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <currentLevel.badge className="w-6 h-6" />
                </div>
                <span className="mt-2 text-xs font-bold text-gray-700 text-center">
                  {t(
                    `profile.tires.${currentLevel?.name
                      .replace(/\s+/g, "")
                      .toLowerCase()}`
                  )}
                </span>
              </div>

              {/* Clean Progress Line */}
              <div className="flex-1 mx-4 relative">
                {/* Background line */}
                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 rounded-full -translate-y-1/2"></div>

                {/* Green progress fill - no text */}
                <div
                  className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>

              {/* Next Level */}
              <div className="flex flex-col items-center z-20">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <nextLevel.badge className="w-6 h-6" />
                </div>
                <span className="mt-2 text-xs font-bold text-gray-700 text-center">
                  {t(
                    `profile.tires.${nextLevel?.name
                      .replace(/\s+/g, "")
                      .toLowerCase()}`
                  )}
                </span>
              </div>
            </div>

            {/* Remaining Recycles Message */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
                <div className="flex items-center justify-center w-6 h-6 bg-white/20 backdrop-blur-sm rounded-lg">
                  <span className="text-sm font-bold">
                    {formatNumber(
                      nextLevel.minRecycles - customerData.totalOrders
                    )}
                  </span>
                </div>

                <p className="font-semibold text-sm">
                  {t("program.onlyMoreRecycles", {
                    count: formatNumber(
                      nextLevel.minRecycles - customerData.totalOrders
                    ),
                    level: t(
                      `profile.tires.${nextLevel.name
                        .replace(/\s+/g, "")
                        .toLowerCase()}`
                    ),
                  })}
                </p>

                <nextLevel.badge className="w-4 h-4 text-white/80" />
              </div>
            </div>
          </div>
        )}
        {/* Levels Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t("program.rewardLevelsTitle")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {rewardLevels.map((level, idx) => {
              const isCurrentLevel = level.name === currentLevel?.name;
              const isUnlocked = customerData.totalOrders >= level.minRecycles;
              const isLast = idx === rewardLevels.length - 1;

              // Map benefits to icons
              const getBenefitIcon = (text: string) => {
                if (text.toLowerCase().includes("bonus")) return "💎";
                if (text.toLowerCase().includes("order")) return "🚀";
                if (text.toLowerCase().includes("discount")) return "🪙";
                if (text.toLowerCase().includes("pickup")) return "♻️";
                return "⭐";
              };

              return (
                <div
                  key={level.id}
                  className={`relative rounded-xl overflow-hidden w-full max-w-sm p-5 border-4 transition-all duration-300
          ${
            isUnlocked
              ? "bg-gradient-to-br from-green-50 to-green-100 border-green-400"
              : "bg-gray-100 border-gray-300 opacity-80"
          }
          ${isCurrentLevel ? "ring-4 ring-primary scale-105 animate-pulse" : ""}
          ${isLast ? "lg:col-start-2" : ""}
        `}
                >
                  {/* Current level banner */}
                  {isCurrentLevel && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold rounded-bl-lg shadow">
                      {t("program.currentLevelBanner")}
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex items-center gap-2 mt-${
                        isCurrentLevel ? 2 : 0
                      }`}
                    >
                      <level.badge className="w-8 h-8 text-green-600 mr-3 drop-shadow" />
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900">
                          {t(
                            `profile.tires.${level.name
                              .replace(/\s+/g, "")
                              .toLowerCase()}`
                          )}{" "}
                        </h3>
                      </div>
                    </div>
                    {!isUnlocked && (
                      <div className="text-gray-400 text-2xl">🔒</div>
                    )}
                  </div>

                  {/* Tier range */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-4 shadow bg-white border border-gray-200">
                    <span>
                      {formatNumber(level.minRecycles)}
                      <span> - </span>
                      {level.maxRecycles === 999999 ? (
                        <Infinity className="w-4 h-4 inline-block ml-1" />
                      ) : (
                        formatNumber(level.maxRecycles)
                      )}
                    </span>
                    <span>{t("program.recycles")}</span>
                  </div>

                  {/* Benefits list */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {t("program.benefits")}
                    </h4>
                    {level.benefits[locale].map((benefit, bIdx) => (
                      <div
                        key={bIdx}
                        className="flex items-center text-sm text-gray-700"
                      >
                        <span className="mr-2 text-lg">
                          {getBenefitIcon(benefit)}
                        </span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("program.howToEarnTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Recycle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {t("program.earnRecyclingOrders")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("program.earnRecyclingOrdersDesc")}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {t("program.earnMonthlyBonuses")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("program.earnMonthlyBonusesDesc")}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {t("program.earnReferrals")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("program.earnReferralsDesc")}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {t("program.earnSpecialEvents")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("program.earnSpecialEventsDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Redemption Options */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("program.pointRedemptionTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-green-600 mr-2">💰</span>
                {t("program.cashRedemption")}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {t("program.cashRedemptionDesc")}
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t("program.cashRedemptionList.baseRate")}</li>
                <li>• {t("program.cashRedemptionList.silver")}</li>
                <li>• {t("program.cashRedemptionList.gold")}</li>
                <li>• {t("program.cashRedemptionList.platinum")}</li>
                <li>• {t("program.cashRedemptionList.diamond")}</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">🎟️</span>
                {t("program.vouchersRewards")}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {t("program.vouchersRewardsDesc")}
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t("program.vouchersRewardsList.ecoProduct")}</li>
                <li>• {t("program.vouchersRewardsList.restaurant")}</li>
                <li>• {t("program.vouchersRewardsList.sustainable")}</li>
                <li>• {t("program.vouchersRewardsList.local")}</li>
                <li>• {t("program.vouchersRewardsList.charity")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclingRewardsSystem;
