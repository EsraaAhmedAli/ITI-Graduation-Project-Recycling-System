// src/components/points/PointsActivityHeader.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PointsActivityHeader({ totalPoints }: { totalPoints: number }) {
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/profile" className="flex items-center text-green-600 hover:text-green-800">
          <ArrowLeft className="mr-2" size={20} />
          Back to Profile
        </Link>
        
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
          Your Points Balance
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-900 mb-2">Points Activity</h1>
        <div className="text-5xl font-extrabold text-green-600">
          {totalPoints?.toLocaleString() || 0}
          <span className="text-2xl text-green-500 ml-1">pts</span>
        </div>
      </div>
    </div>
  );
}