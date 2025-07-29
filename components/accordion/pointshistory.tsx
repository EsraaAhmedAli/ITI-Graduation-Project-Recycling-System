// src/components/points/PointsHistoryList.tsx
import { Clock, CheckCircle2, XCircle, PlusCircle } from "lucide-react";

export default function PointsHistoryList({ pointsHistory }: { pointsHistory: any[] }) {
  if (!pointsHistory?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h3 className="text-gray-500">No points activity yet</h3>
        <p className="text-sm text-gray-400 mt-2">
          Your points history will appear here when you earn or redeem points
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {pointsHistory.map((entry, index) => (
          <div 
            key={index} 
            className={`p-5 flex items-center justify-between border-b border-gray-100 last:border-b-0 hover:bg-green-50 transition-colors`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${entry.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {entry.points > 0 ? (
                  <PlusCircle size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800">{entry.reason}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className={`text-lg font-semibold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {entry.points > 0 ? '+' : ''}{entry.points} pts
            </div>
          </div>
        ))}
      </div>
      
      {pointsHistory.length > 5 && (
        <button className="w-full py-3 text-green-600 font-medium hover:bg-green-50 rounded-lg transition-colors">
          Load More Activity
        </button>
      )}
    </div>
  );
}