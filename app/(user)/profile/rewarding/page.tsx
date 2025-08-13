"use client";
import React, { useState, useEffect, use } from "react";
import {
  Star,
  Award,
  Gift,
  Recycle,
  Crown,
  Trophy,
  Zap,
  Target,
  Infinity,
  ArrowRight,
  Medal,
  Leaf,
  Lock,
} from "lucide-react";
import { rewardLevels } from "@/constants/rewardsTiers";
import { useUserAuth } from "@/context/AuthFormContext";
import { useUserPoints } from "@/context/UserPointsContext";

const RecyclingRewardsSystem = () => {
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
      name: user?.name || "Guest User",
      currentPoints: currentUserPoints,
      totalOrders: currentTotalCompletedOrders,
      currentLevel: currentLevelData?.name || "Eco Starter",
      nextLevel: nextLevelData?.name || "Max Level Reached",
      pointsToNext: pointsToNextLevel,
    });
  }, [userPoints, totalCompletedOrders, user]);

  // Initialize customer data with calculations
  const currentUserPoints = userPoints?.totalPoints || 0;
  const currentTotalCompletedOrders = totalCompletedOrders || 0;
  const currentLevelData = calculateCurrentLevel(currentUserPoints);
  const nextLevelData = calculateNextLevel(userPoints);
  const pointsToNextLevel = calculatePointsToNext(userPoints);

  const [customerData, setCustomerData] = useState({
    name: user?.name || "Guest User",
    currentPoints: userPoints?.totalPoints || 0,
    totalOrders: currentTotalCompletedOrders,
    currentLevel: currentLevelData?.name || "Eco Starter",
    nextLevel: nextLevelData?.name || "Max Level Reached",
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Recycling Rewards Program
          </h1>
          <p className="text-lg text-gray-600">
            Earn points, unlock badges, and help save the planet!
          </p>
        </div>
        {/* Customer Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back, {customerData.name}!
              </h2>
              <p className="text-lg text-gray-600">
                Current Level:{" "}
                <span className="font-semibold text-green-600">
                  {currentLevel?.name}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600 mb-1">
                {customerData.currentPoints.toLocaleString()} Points
              </p>
              <p className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-sm">
                <span className="flex items-center justify-center w-7 h-7 bg-green-500 text-white font-bold rounded-full mr-2">
                  {customerData.totalOrders}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide">
                  Recycling Orders
                </span>
              </p>
            </div>
          </div>
          {/* progress */}
          {nextLevel && (
            <div className="mb-8">
              {/* Progress Path */}
              <div className="flex items-center justify-between relative">
                {/* Current Level */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                    <currentLevel.badge className="w-8 h-8" />
                  </div>
                  <span className="mt-2 text-sm font-semibold text-gray-700">
                    {currentLevel?.name}
                  </span>
                </div>

                {/* Progress Line */}
                <div className="flex-1 mx-4 relative">
                  {/* Background line */}
                  <div className="absolute top-1/2 left-0 w-full h-3 bg-gray-300 rounded-full -translate-y-1/2"></div>

                  {/* Filled progress */}
                  <div
                    className="absolute top-1/2 left-0 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full -translate-y-1/2 transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>

                {/* Next Level */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-14 h-14 bg-yellow-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                    <nextLevel.badge className="w-8 h-8" />
                  </div>
                  <span className="mt-2 text-sm font-semibold text-gray-700">
                    {nextLevel.name}
                  </span>
                </div>
              </div>

              {/* Remaining Recycles */}
              <p className="w-fit mt-4 text-green-700 font-semibold text-sm bg-green-50 px-4 py-2 rounded-lg shadow-sm mx-auto text-center">
                🚀 Only{" "}
                <span className="font-bold">
                  {nextLevel.minRecycles - customerData.totalOrders}
                </span>{" "}
                more recycles to unlock{" "}
                <span className="underline">{nextLevel.name}</span>!
              </p>
            </div>
          )}
          {/* Quick Actions */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
              <Gift className="w-5 h-5 mr-2" />
              Redeem Points
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
              <Recycle className="w-5 h-5 mr-2" />
              Schedule Pickup
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
              <Zap className="w-5 h-5 mr-2" />
              View History
            </button>
          </div> */}
        </div>
        {/* Levels Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Reward Levels & Benefits
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
                      CURRENT LEVEL
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <level.icon className="w-8 h-8 text-green-600 mr-3 drop-shadow" />
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900">
                          {level.name}
                        </h3>
                        {/* <level.badge /> */}
                      </div>
                    </div>
                    {!isUnlocked && (
                      <div className="text-gray-400 text-2xl">🔒</div>
                    )}
                  </div>

                  {/* Tier range */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-4 shadow
          bg-white border border-gray-200"
                  >
                    <span>
                      {level.minRecycles}
                      <span> - </span>
                      {level.maxRecycles === 999999 ? (
                        <Infinity className="w-4 h-4 inline-block ml-1" />
                      ) : (
                        level.maxRecycles
                      )}
                    </span>
                    <span>Recycles</span>
                  </div>

                  {/* Benefits list */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Benefits
                    </h4>
                    {level.benefits.map((benefit, bIdx) => (
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
            How to Earn Points
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Recycle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Recycling Orders
              </h3>
              <p className="text-sm text-gray-600">
                Earn points for every recycling pickup based on your level
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Monthly Bonuses
              </h3>
              <p className="text-sm text-gray-600">
                Get bonus points every month based on your activity
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Referrals</h3>
              <p className="text-sm text-gray-600">
                Earn bonus points when you refer friends to our service
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Special Events
              </h3>
              <p className="text-sm text-gray-600">
                Participate in eco-challenges and special promotions
              </p>
            </div>
          </div>
        </div>
        {/* Redemption Options */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Point Redemption Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-green-600 mr-2">💰</span>
                Cash Redemption
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Convert your points to cash with level-based bonuses:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Base rate: 100 points = $1</li>
                <li>• Silver+: 5% bonus</li>
                <li>• Gold+: 10% bonus</li>
                <li>• Platinum+: 15% bonus</li>
                <li>• Diamond: 20% bonus</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">🎟️</span>
                Vouchers & Rewards
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Redeem points for eco-friendly products and services:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Eco-product vouchers</li>
                <li>• Restaurant gift cards</li>
                <li>• Sustainable brands discounts</li>
                <li>• Local business coupons</li>
                <li>• Environmental charity donations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclingRewardsSystem;
