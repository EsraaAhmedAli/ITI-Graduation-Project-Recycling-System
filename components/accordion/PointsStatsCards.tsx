// src/components/points/PointsStatsCards.tsx
import { TrendingUp, Calendar, Award } from "lucide-react";

export default function PointsStatsCards({ 
  totalPoints, 
  monthlyPoints 
}: { 
  totalPoints: number; 
  monthlyPoints: number; 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Total Points Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 font-medium">Total Points</h3>
          <Award className="text-green-500" size={24} />
        </div>
        <p className="text-3xl font-bold text-green-600 mt-2">
          {totalPoints?.toLocaleString() || 0}
        </p>
      </div>
      
      {/* Monthly Points Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 font-medium">This Month</h3>
          <Calendar className="text-blue-500" size={24} />
        </div>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          {monthlyPoints?.toLocaleString() || 0}
        </p>
      </div>
      
      {/* Progress Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 font-medium">Next Tier</h3>
          <TrendingUp className="text-purple-500" size={24} />
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-purple-600 h-2.5 rounded-full" 
              style={{ width: `${Math.min((totalPoints / 1000) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {1000 - (totalPoints % 1000)} pts to next level
          </p>
        </div>
      </div>
    </div>
  );
}