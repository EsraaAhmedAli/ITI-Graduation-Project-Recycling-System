import { useState } from "react";
import { AlertTriangle, X, Clock, MapPin, UserX, Calendar, Truck } from "lucide-react";

const reasons = [
  { id: "change_mind", label: "Changed my mind", description: "I no longer need the pickup", icon: X },
  { id: "driver_delay", label: "Driver is taking too long", description: "Driver hasn't arrived yet", icon: Clock },
  { id: "wrong_address", label: "Wrong address", description: "I entered the wrong pickup address", icon: MapPin },
  { id: "schedule_conflict", label: "Schedule conflict", description: "I have a scheduling conflict", icon: Calendar },
  { id: "driver_issue", label: "Issue with driver", description: "There's a problem with the driver", icon: UserX },
  { id: "other", label: "Other", description: "None of the above", icon: Truck },
];

export function CancelOrderDialog({ open, onClose, onConfirm, isLoading }: 
  { open:boolean, onClose:()=>void, onConfirm:(reason:string)=>void,isLoading:boolean}) {
  const [selected, setSelected] = useState("");
  const [customReason, setCustomReason] = useState("");
  
  const handle = () => { 
    if(selected) {
      const finalReason = selected === "other" && customReason.trim() ? customReason.trim() : selected;
      onConfirm(finalReason);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="mr-2"/>
            <h3 className="text-lg font-semibold">Cancel Pickup</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">Please select a cancellation reason to help us improve our service.</p>
        
        <div className="space-y-3 mb-6">
          {reasons.map(r => {
            const Icon = r.icon;
            return (
              <div key={r.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selected === r.id 
                    ? "border-red-500 bg-red-50 shadow-sm" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setSelected(r.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selected === r.id ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{r.label}</p>
                    <p className="text-sm text-gray-600">{r.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selected === "other" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please specify your reason
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Tell us why you need to cancel..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={3}
            />
          </div>
        )}
        
        <div className="flex gap-3">
          <button 
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            onClick={onClose} 
            disabled={isLoading}
          >
            Keep Order
          </button>
          <button 
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
            onClick={handle} 
            disabled={!selected || (selected === "other" && !customReason.trim()) || isLoading}
          >
            {isLoading ? "Cancelling..." : "Cancel Pickup"}
          </button>
        </div>
      </div>
    </div>
  );
} 