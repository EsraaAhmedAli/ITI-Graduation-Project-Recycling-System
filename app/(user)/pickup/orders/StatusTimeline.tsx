import { CheckCircle, Clock, MapPin, Package, User, Route } from "lucide-react";

interface OrderUpdate { id: string; message: string; timestamp?: string; }
interface StatusTimelineProps {
  status: string;
  updates?: OrderUpdate[];
}

const statusSteps = [
  { key: "pending", label: "Order Confirmed", icon: CheckCircle },
  { key: "confirmed", label: "Driver Assigned", icon: User },
  { key: "assigned", label: "Driver Assigned", icon: User },
  { key: "en_route", label: "En Route", icon: Route },
  { key: "arrived", label: "Arrived", icon: MapPin },
  { key: "collected", label: "Items Collected", icon: Package },
  { key: "completed", label: "Complete", icon: CheckCircle },
];

export default function StatusTimeline({ status, updates = [] }: StatusTimelineProps) {
  const getStepStatus = (stepKey: string) => {
    const stepIndex = statusSteps.findIndex(step => step.key === stepKey);
    const currentIndex = statusSteps.findIndex(step => step.key === status);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const getStepColor = (stepKey: string) => {
    const stepIndex = statusSteps.findIndex(step => step.key === stepKey);
    const currentIndex = statusSteps.findIndex(step => step.key === status);
    
    // If order is cancelled, use red colors
    if (status === "cancelled") {
      return {
        completed: "bg-red-500",
        active: "bg-red-600",
        pending: "bg-red-200"
      };
    }
    
    // If step is completed, use green
    if (stepIndex < currentIndex) {
      return {
        completed: "bg-green-500",
        active: "bg-green-600",
        pending: "bg-green-300"
      };
    }
    
    // If step is current, use blue
    if (stepIndex === currentIndex) {
      return {
        completed: "bg-green-500",
        active: "bg-blue-600",
        pending: "bg-blue-300"
      };
    }
    
    // If step is pending, use gray
    return {
      completed: "bg-green-500",
      active: "bg-blue-600",
      pending: "bg-gray-300"
    };
  };

  const getStepIcon = (step: typeof statusSteps[0], stepStatus: string) => {
    const Icon = step.icon;
    const colors = getStepColor(step.key);
    
    if (stepStatus === "completed") {
      return (
        <div className={`w-6 h-6 ${colors.completed} rounded-full flex items-center justify-center`}>
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      );
    }
    
    if (stepStatus === "active") {
      return (
        <div className={`w-6 h-6 ${colors.active} rounded-full flex items-center justify-center animate-pulse`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      );
    }
    
    return (
      <div className={`w-6 h-6 ${colors.pending} rounded-full flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Clock className="text-green-600 mr-2" />
        Pickup Status
      </h2>
      
      <div className="space-y-4">
        {statusSteps.map((step) => {
          const stepStatus = getStepStatus(step.key);
          
          return (
            <div key={step.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {getStepIcon(step, stepStatus)}
                <div className="flex-1">
                  <p className={`font-medium ${
                    stepStatus === "completed" ? "text-green-800" : 
                    stepStatus === "active" ? (status === "cancelled" ? "text-red-600" : "text-blue-600") : 
                    "text-gray-600"
                  }`}>
                    {step.label}
                  </p>
                  {stepStatus === "active" && (
                    <p className="text-sm text-gray-600">Currently in progress</p>
                  )}
                </div>
              </div>
              
              {stepStatus === "active" && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Live Updates */}
      {updates.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Clock className="text-green-600 mr-2 w-4 h-4" />
            Live Updates
          </h3>
          <div className="space-y-3">
            {updates.slice(0, 3).map((update) => (
              <div key={update.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{update.message}</p>
                  <p className="text-xs text-gray-500">
                    {update.timestamp ? new Date(update.timestamp).toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 