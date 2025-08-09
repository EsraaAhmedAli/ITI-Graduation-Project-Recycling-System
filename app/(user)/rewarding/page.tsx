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
} from "lucide-react";
import { useUserAuth } from "@/context/AuthFormContext";

const RecyclingRewardsSystem = () => {
  // Sample customer data - replace with real data from your API
  const { user, userRewards } = useUserAuth();

  // Define your reward levels and badges
  const rewardLevels = [
    {
      id: 1,
      name: "Eco Starter",
      minPoints: 0,
      maxPoints: 499,
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: Recycle,
      benefits: [
        "5 points per recycling order",
        "Welcome bonus: 50 points",
        "Basic recycling tips",
      ],
      badge: "🌱",
    },
    {
      id: 2,
      name: "Green Helper",
      minPoints: 500,
      maxPoints: 999,
      color: "bg-green-100 text-green-800 border-green-300",
      icon: Target,
      benefits: [
        "7 points per recycling order",
        "Monthly bonus: 25 points",
        "Free pickup scheduling",
        "Eco-friendly tips newsletter",
      ],
      badge: "♻️",
    },
    {
      id: 3,
      name: "Silver Recycler",
      minPoints: 1000,
      maxPoints: 1999,
      color: "bg-gray-200 text-gray-700 border-gray-400",
      icon: Award,
      benefits: [
        "10 points per recycling order",
        "Priority customer support",
        "Monthly bonus: 50 points",
        "5% cash redemption bonus",
        "Quarterly eco-product vouchers",
      ],
      badge: "🥈",
    },
    {
      id: 4,
      name: "Gold Guardian",
      minPoints: 2000,
      maxPoints: 3999,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Star,
      benefits: [
        "15 points per recycling order",
        "VIP customer support",
        "Monthly bonus: 100 points",
        "10% cash redemption bonus",
        "Free eco-product samples",
        "Referral bonus: 200 points",
      ],
      badge: "🥇",
    },
    {
      id: 5,
      name: "Platinum Pioneer",
      minPoints: 4000,
      maxPoints: 7999,
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: Trophy,
      benefits: [
        "20 points per recycling order",
        "Dedicated account manager",
        "Monthly bonus: 150 points",
        "15% cash redemption bonus",
        "Exclusive eco-events invitation",
        "Custom pickup scheduling",
        "Sustainability consultation",
      ],
      badge: "💎",
    },
    {
      id: 6,
      name: "Diamond Elite",
      minPoints: 8000,
      maxPoints: 999999,
      color: "bg-purple-100 text-purple-800 border-purple-300",
      icon: Crown,
      benefits: [
        "25 points per recycling order",
        "Personal sustainability advisor",
        "Monthly bonus: 250 points",
        "20% cash redemption bonus",
        "Annual eco-trip voucher",
        "Beta access to new services",
        "Environmental impact reports",
        "Community ambassador program",
      ],
      badge: "👑",
    },
  ];
  // Function to calculate current level based on points
  const calculateCurrentLevel = (points) => {
    for (const level of rewardLevels) {
      console.log(`${level.minPoints} Vs  ${points} Vs ${level.maxPoints}`);
      if (points >= level.minPoints && points <= level.maxPoints) {
        return level;
      }
    }
    return rewardLevels[0]; // Default to first level if no match
  };

  // Function to calculate next level based on current points
  const calculateNextLevel = (points) => {
    const currentLevelIndex = rewardLevels.findIndex(
      (level) => points >= level.minPoints && points <= level.maxPoints
    );
    return rewardLevels[currentLevelIndex + 1] || null;
  };

  // Function to calculate points needed for next level
  const calculatePointsToNext = (points) => {
    const nextLevel = calculateNextLevel(points);
    if (nextLevel) {
      return nextLevel.minPoints - points;
    }
    return 0; // Already at max level
  };

  // Initialize customer data with calculations
  const userPoints = userRewards?.currentPoints || 0;
  const totalCompletedOrders = userRewards?.totalOrders || 0;
  const currentLevelData = calculateCurrentLevel(userPoints);
  const nextLevelData = calculateNextLevel(userPoints);
  const pointsToNextLevel = calculatePointsToNext(userPoints);

  const [customerData, setCustomerData] = useState({
    name: user?.name || "Guest User",
    currentPoints: userPoints,
    totalOrders: totalCompletedOrders,
    currentLevel: currentLevelData?.name || "Eco Starter",
    nextLevel: nextLevelData?.name || "Max Level Reached",
    pointsToNext: pointsToNextLevel,
  });

  // Get current level details
  const getCurrentLevel = () => {
    return rewardLevels.find(
      (level) =>
        customerData.currentPoints >= level.minPoints &&
        customerData.currentPoints <= level.maxPoints
    );
  };

  const getNextLevel = () => {
    const currentLevelIndex = rewardLevels.findIndex(
      (level) =>
        customerData.currentPoints >= level.minPoints &&
        customerData.currentPoints <= level.maxPoints
    );
    return rewardLevels[currentLevelIndex + 1] || null;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressPercentage = currentLevel
    ? ((customerData.currentPoints - currentLevel.minPoints) /
        (currentLevel.maxPoints - currentLevel.minPoints)) *
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
                <span className="text-2xl ml-2">{currentLevel?.badge}</span>
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
              <p className="text-sm text-gray-500">
                {customerData.totalOrders} Recycling Orders
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {nextLevel && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{currentLevel?.name}</span>
                <span>{nextLevel.name}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {nextLevel.minPoints - customerData.currentPoints} points to
                reach {nextLevel.name}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
          </div>
        </div>

        {/* Levels Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Reward Levels & Benefits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewardLevels.map((level, index) => {
              const IconComponent = level.icon;
              const isCurrentLevel = level.name === currentLevel?.name;
              const isUnlocked = customerData.currentPoints >= level.minPoints;

              return (
                <div
                  key={level.id}
                  className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                    isCurrentLevel
                      ? "ring-4 ring-green-400 shadow-xl scale-105"
                      : ""
                  } ${!isUnlocked ? "opacity-75" : ""}`}
                >
                  {isCurrentLevel && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                      Current Level
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <IconComponent className="w-8 h-8 text-gray-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {level.name}
                          </h3>
                          <span className="text-2xl">{level.badge}</span>
                        </div>
                      </div>
                      {!isUnlocked && <div className="text-gray-400">🔒</div>}
                    </div>

                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-4 ${level.color}`}
                    >
                      {level.minPoints.toLocaleString()} -{" "}
                      {level.maxPoints === 999999
                        ? "∞"
                        : level.maxPoints.toLocaleString()}{" "}
                      points
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Benefits:
                      </h4>
                      {level.benefits.map((benefit, benefitIndex) => (
                        <div
                          key={benefitIndex}
                          className="flex items-start text-sm text-gray-600"
                        >
                          <span className="text-green-500 mr-2 mt-1">•</span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
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
