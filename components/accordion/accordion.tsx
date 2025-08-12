import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function PointsActivity({ userPoints }: { userPoints: any }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!userPoints || !userPoints.pointsHistory?.length) return null;
  console.log(userPoints.pointsHistory , 'hhhiss');
  

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl shadow-sm">
      {/* Accordion header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold text-green-800">Recent Points Activity</h3>
        <ChevronDown
          className={`w-5 h-5 text-green-700 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion content */}
      {isOpen && (
        <>
          <div className="space-y-2 max-h-64 overflow-y-auto mt-4">
            {userPoints.pointsHistory.map((entry: any, index: number) => (
            entry.reason == 'Points awarded' || entry.reason == 'Points deducted' ?   <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
              >
           
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{entry.reason}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`font-bold text-sm ${
                    entry.points > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {entry.points > 0 ? "+" : ""}
                  {entry.points} pts
                </div>
              </div> :''
            ))}
          </div>

          {/* Optional: View All button could be repurposed to open a modal or scroll */}
          {userPoints.pointsHistory.length > 3 && (
            <button className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium">
              View full history →
            </button>
          )}
        </>
      )}
    </div>
  );
}
