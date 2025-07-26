import { useState } from "react";
import { AlertTriangle, Shield, UserX, Clock, Truck, Phone } from "lucide-react";

interface SafetyDialogProps {
  open: boolean;
  onClose: () => void;
  onReport: (report: SafetyReportData) => void;
  onEmergency: () => void;
  isLoading?: boolean;
  orderNumber: string;
  driverName?: string;
}

export interface SafetyReportData {
  type: string;
  description: string;
}

const safetyIssues = [
  {
    id: "unsafe_behavior",
    label: "Unsafe Driving/Behavior",
    icon: AlertTriangle,
    description: "Reckless driving, speeding, or unsafe conduct"
  },
  {
    id: "harassment",
    label: "Harassment or Inappropriate Behavior",
    icon: UserX,
    description: "Verbal abuse, discrimination, or inappropriate comments"
  },
  {
    id: "property_damage",
    label: "Property Damage",
    icon: Truck,
    description: "Damage to your property or belongings"
  },
  {
    id: "late_arrival",
    label: "Excessive Delay",
    icon: Clock,
    description: "Driver is significantly late without communication"
  },
  {
    id: "no_show",
    label: "Driver No-Show",
    icon: UserX,
    description: "Driver failed to arrive for scheduled pickup"
  },
  {
    id: "other",
    label: "Other Safety Concern",
    icon: Shield,
    description: "Any other safety-related issue"
  }
];

export function SafetyDialog({ 
  open, 
  onClose, 
  onReport, 
  onEmergency,
  isLoading = false,
  orderNumber,
  driverName
}: SafetyDialogProps) {
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  const selectedIssue = safetyIssues.find(issue => issue.id === reportType);

  const handleReport = () => {
    if (!reportType || !description.trim()) return;
    
    onReport({
      type: reportType,
      description: description.trim()
    });
    
    // Reset form
    setReportType("");
    setDescription("");
  };

  const handleEmergencyClick = () => {
    setShowEmergencyConfirm(true);
  };

  const confirmEmergency = () => {
    onEmergency();
    setShowEmergencyConfirm(false);
  };

  if (!open) return null;

  if (showEmergencyConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center text-red-600 mb-4">
            <Phone className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-semibold">Emergency Alert</h3>
          </div>
          <p className="text-gray-600 mb-4">
            This will immediately contact emergency services and EcoPickup support. 
            Only use this for genuine emergencies requiring immediate assistance.
          </p>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
            <p className="text-sm text-red-800 font-medium mb-2">
              Emergency services will be contacted for:
            </p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Immediate physical danger or threats</li>
              <li>• Medical emergencies</li>
              <li>• Criminal activity</li>
              <li>• Any situation requiring police intervention</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              onClick={() => setShowEmergencyConfirm(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors font-medium"
              onClick={confirmEmergency}
              disabled={isLoading}
            >
              {isLoading ? "Contacting..." : "Contact Emergency Services"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center text-orange-600 mb-4">
          <Shield className="w-5 h-5 mr-2" />
          <h3 className="text-lg font-semibold">Report Safety Issue</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Report any safety concerns with your pickup. Your report helps keep our community safe.
        </p>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Order:</span> {orderNumber}
              {driverName && (
                <>
                  <br />
                  <span className="font-medium">Driver:</span> {driverName}
                </>
              )}
            </p>
          </div>

          {/* Issue Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type of Issue</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select the type of safety issue...</option>
              {safetyIssues.map((issue) => {
                const Icon = issue.icon;
                return (
                  <option key={issue.id} value={issue.id}>
                    {issue.label}
                  </option>
                );
              })}
            </select>
            
            {selectedIssue && (
              <p className="text-sm text-gray-600 mt-1">{selectedIssue.description}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description
            </label>
            <textarea
              id="description"
              placeholder="Please provide specific details about what happened. Include times, locations, and any relevant information that can help us investigate."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows={4}
            />
          </div>


        </div>

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={handleEmergencyClick}
              disabled={isLoading}
            >
              <Phone className="w-4 h-4 mr-2 inline" />
              Emergency
            </button>
          </div>
          <button
            className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={handleReport}
            disabled={!reportType || !description.trim() || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              "Submit Report"
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 