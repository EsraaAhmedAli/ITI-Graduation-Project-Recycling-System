import { useState } from "react";
import { AlertTriangle, Shield, UserX, Clock, Truck, Phone } from "lucide-react";

interface SafetyDialogProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  driverName?: string;
}

const safetyIssues = [
  { id: "unsafe_behavior", label: "Unsafe Driving/Behavior", icon: AlertTriangle, description: "Reckless driving, speeding, or unsafe conduct" },
  { id: "harassment", label: "Harassment or Inappropriate Behavior", icon: UserX, description: "Verbal abuse, discrimination, or inappropriate comments" },
  { id: "property_damage", label: "Property Damage", icon: Truck, description: "Damage to your property or belongings" },
  { id: "late_arrival", label: "Excessive Delay", icon: Clock, description: "Driver is significantly late without communication" },
  { id: "no_show", label: "Driver No-Show", icon: UserX, description: "Driver failed to arrive for scheduled pickup" },
  { id: "other", label: "Other Safety Concern", icon: Shield, description: "Any other safety-related issue" }
];

export function SafetyDialog({ open, onClose, orderNumber, driverName }: SafetyDialogProps) {
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  const selectedIssue = safetyIssues.find(issue => issue.id === reportType);

  const handleReport = async () => {
    if (!reportType || !description.trim()) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/orders/${orderNumber}/safety-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reportType, description: description.trim() }),
      });

      if (!res.ok) throw new Error("Failed to submit safety report");

      alert("Safety report submitted successfully!");
      setReportType("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            This will contact emergency services and EcoPickup support. Only use this for real emergencies.
          </p>
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" onClick={() => setShowEmergencyConfirm(false)}>Cancel</button>
            <button className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg">Contact Emergency</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
        <h3 className="text-lg font-semibold text-orange-600 mb-4">Report Safety Issue</h3>
        <p className="text-gray-600 mb-6">Help us keep the community safe by reporting issues.</p>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Order:</span> {orderNumber}
              {driverName && <><br /><span className="font-medium">Driver:</span> {driverName}</>}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type of Issue</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full p-3 border rounded-lg">
              <option value="">Select...</option>
              {safetyIssues.map(issue => <option key={issue.id} value={issue.id}>{issue.label}</option>)}
            </select>
            {selectedIssue && <p className="text-sm mt-1">{selectedIssue.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-lg" rows={4} />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 border rounded-lg" onClick={onClose}>Cancel</button>
            <button className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-lg" onClick={() => setShowEmergencyConfirm(true)}>Emergency</button>
          </div>
          <button className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg" onClick={handleReport} disabled={!reportType || !description.trim() || isLoading}>
            {isLoading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
