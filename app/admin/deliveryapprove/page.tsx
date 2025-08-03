"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Button from "@/components/common/Button";
import DynamicTable from "@/components/shared/dashboardTable";
import DeliveryAttachments from "@/components/shared/DeliveryAttachements";
import { toast } from "react-hot-toast";
import { Label, Modal, ModalBody, ModalHeader, Textarea, TextInput } from "flowbite-react";
import Loader from "@/components/common/loader";

// Compact Decline Modal Component
const DeclineModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName, 
  isLoading 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
  isLoading: boolean;
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason);
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={handleClose} size="sm" popup>
      <ModalHeader />
      <ModalBody className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                Decline Application
              </h3>
              <p className="text-sm text-gray-600">
                Decline <span className="font-medium">{userName}</span>'s application?
              </p>
            </div>

            <div>
              <TextInput
                id="reason"
                placeholder="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                sizing="sm"
                className="text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                isProcessing={isLoading}
                disabled={isLoading}
                className="flex-1 bg-red-600"
              >
                Decline
              </Button>
            </div>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default function Page() {
  const [deliveryData, setDeliveryData] = useState([]);
  const [activeAttachments, setActiveAttachments] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal state
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleApprove = async (item: any) => {
    const userId = item.userId;
    setActionLoading(userId);
    
    try {
      const response = await api.patch(`/delivery/approve/${userId}`);
      
      // ✅ FIX: Update the local state with proper currentStatus
      setDeliveryData(prevData => 
        prevData.map(user => 
          user.userId === userId 
            ? { 
                ...user, 
                isApproved: true,
                currentStatus: "approved", // ✅ Update currentStatus
                // Clear any previous decline information
                attachments: {
                  ...user.attachments,
                  status: "approved",
                  approvedAt: new Date().toISOString(),
                  // Remove decline fields if they exist
                  declineReason: undefined,
                  declinedAt: undefined
                }
              }
            : user
        )
      );

      // Show success toast
      toast.success(`${item.name} has been approved successfully!`, {
        duration: 4000,
        position: 'top-right',
      });
      
      console.log("Approval successful:", response.data);
      
    } catch (error: any) {
      console.error("Error approving delivery user:", error);
      
      // Show error toast
      const errorMessage = error.response?.data?.message || "Failed to approve user";
      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: 'top-right',
      });
      
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineClick = (item: any) => {
    setSelectedUser(item);
    setShowDeclineModal(true);
  };

  const handleDeclineConfirm = async (reason: string) => {
    if (!selectedUser) return;
    
    const userId = selectedUser.userId;
    setActionLoading(userId);
    
    try {
      const response = await api.patch(`/delivery/decline/${userId}`, {
        reason: reason || undefined
      });
      
      // ✅ FIX: Update the local state with proper currentStatus and decline info
      setDeliveryData(prevData => 
        prevData.map(user => 
          user.userId === userId 
            ? { 
                ...user, 
                isApproved: false,
                currentStatus: "declined", // ✅ Update currentStatus
                attachments: {
                  ...user.attachments,
                  status: "declined",
                  declineReason: reason || "Application declined",
                  declinedAt: new Date().toISOString(),
                  // Remove approval fields if they exist
                  approvedAt: undefined
                }
              }
            : user
        )
      );

      // Show success toast
      toast.success(`${selectedUser.name} has been declined successfully!`, {
        duration: 4000,
        position: 'top-right',
      });
      
      console.log("Decline successful:", response.data);
      
      // Close modal
      setShowDeclineModal(false);
      setSelectedUser(null);
      
    } catch (error: any) {
      console.error("Error declining delivery user:", error);
      
      // Show error toast
      const errorMessage = error.response?.data?.message || "Failed to decline user";
      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: 'top-right',
      });
      
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineCancel = () => {
    setShowDeclineModal(false);
    setSelectedUser(null);
  };

  const getAlldeliveryAttach = async () => {
    setLoading(true);
    try {
      const res = await api.get("/delivery-attachments");
      console.log("📊 Delivery data received:", res.data.data);
      setDeliveryData(res.data.data);
    } catch (err) {
      console.error("Error fetching delivery attachments:", err);
      toast.error("Failed to fetch delivery data", {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAlldeliveryAttach();
  }, []);

  const columns = [
    {
      key: "name",
      label: "User Name",
      sortable: true,
      priority: 1,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      priority: 2,
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      sortable: true,
      priority: 3,
    },
    {
      key: "currentStatus", // ✅ FIX: Use currentStatus instead of isApproved
      label: "Status",
      render: (item: any) => {
        // ✅ FIX: Use currentStatus from backend which has proper logic
        const status = item.currentStatus || "pending";
        
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "approved"
                ? "bg-green-100 text-green-800"
                : status === "declined"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status === "approved"
              ? "Approved"
              : status === "declined"
              ? "Declined"
              : "Pending"}
          </span>
        );
      },
    },
    {
      key: "statusAction",
      label: "Action",
      render: (item: any) => {
        const isProcessing = actionLoading === item.userId;
        // ✅ FIX: Use currentStatus to determine available actions
        const currentStatus = item.currentStatus || "pending";

        return (
          <select
            defaultValue=""
            disabled={isProcessing}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "approve") handleApprove(item);
              else if (value === "decline") handleDeclineClick(item);
              // Reset select after action
              e.target.value = "";
            }}
            className={`border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="" disabled>
              {isProcessing ? "Processing..." : "Select Action"}
            </option>
            
            {/* ✅ FIX: Show Approve option if not currently approved */}
            {currentStatus !== "approved" && (
              <option value="approve">
                {currentStatus === "declined" ? "Re-approve" : "Approve"}
              </option>
            )}
            
            {/* ✅ FIX: Show Decline option if not currently declined */}
            {currentStatus !== "declined" && (
              <option value="decline">
                {currentStatus === "approved" ? "Revoke Approval" : "Decline"}
              </option>
            )}
          </select>
        );
      },
    },
    {
      key: "createdAt", // ✅ ADD: Show when application was submitted
      label: "Applied Date",
      sortable: true,
      render: (item: any) => {
        const date = new Date(item.createdAt);
        return (
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: "userId",
      label: "User ID",
      sortable: false,
      render: (item: any) => (
        <span className="text-xs text-gray-500 font-mono">
          {item.userId.slice(-8)} {/* Show last 8 characters */}
        </span>
      ),
    },
    {
      key: "attachments",
      label: "Attachments",
      render: (item: any) => (
        <button
          className="text-green-500 hover:text-green-700 underline text-sm"
          onClick={() => setActiveAttachments(item.attachments)}
        >
          View Documents
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Applications</h1>
        <p className="text-gray-600 mt-1">
          Manage delivery driver applications and approvals
        </p>
      </div>

      {loading ? (
     <Loader title="delivery data"/>
      ) : (
        <>
          {/* ✅ ADD: Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm font-medium text-yellow-800">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">
                {deliveryData.filter(item => (item.currentStatus || "pending") === "pending").length}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800">Approved</div>
              <div className="text-2xl font-bold text-green-900">
                {deliveryData.filter(item => item.currentStatus === "approved").length}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-medium text-red-800">Declined</div>
              <div className="text-2xl font-bold text-red-900">
                {deliveryData.filter(item => item.currentStatus === "declined").length}
              </div>
            </div>
          </div>

          <DynamicTable
            title="Delivery Applications"
            data={deliveryData}
            columns={columns}
            showAddButton={false}
            showFilter={true} // ✅ Enable filtering
            showActions={false}
          />

          {activeAttachments && (
            <DeliveryAttachments
              show={true}
              onclose={() => setActiveAttachments(null)}
              attachments={activeAttachments}
            />
          )}

          {/* Decline Modal */}
          <DeclineModal
            isOpen={showDeclineModal}
            onClose={handleDeclineCancel}
            onConfirm={handleDeclineConfirm}
            userName={selectedUser?.name || ""}
            isLoading={actionLoading === selectedUser?.userId}
          />
        </>
      )}
    </div>
  );
}