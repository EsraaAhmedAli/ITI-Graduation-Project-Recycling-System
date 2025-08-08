// Updated version of your existing component with revoke functionality

"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Button from "@/components/common/Button";
import DynamicTable from "@/components/shared/dashboardTable";
import DeliveryAttachments from "@/components/shared/DeliveryAttachements";
import { toast } from "react-hot-toast";
import { Label, Modal, ModalBody, ModalHeader, Textarea, TextInput } from "flowbite-react";
import Loader from "@/components/common/loader";
import { useQuery } from "@tanstack/react-query";

// Enhanced Decline/Revoke Modal Component
const ActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName, 
  isLoading,
  actionType = "decline" // "decline" or "revoke"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
  isLoading: boolean;
  actionType?: "decline" | "revoke";
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

  const isRevoke = actionType === "revoke";

  return (
    <Modal show={isOpen} onClose={handleClose} size="sm" popup>
      <ModalHeader />
      <ModalBody className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {isRevoke ? "Revoke Access" : "Decline Application"}
              </h3>
              <p className="text-sm text-gray-600">
                {isRevoke ? "Revoke" : "Decline"} <span className="font-medium">{userName}</span>'s {isRevoke ? "delivery access" : "application"}?
              </p>
              {isRevoke && (
                <p className="text-xs text-orange-600 mt-1">
                  Note: Active orders will be preserved
                </p>
              )}
            </div>

            <div>
              <TextInput
                id="reason"
                placeholder={`Reason ${isRevoke ? "(required)" : "(optional)"}`}
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
                disabled={isLoading || (isRevoke && !reason.trim())}
                className={`flex-1 ${isRevoke ? "bg-orange-600" : "bg-red-600"}`}
              >
                {isRevoke ? "Revoke" : "Decline"}
              </Button>
            </div>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default function Page() {
  // const [deliveryData, setDeliveryData] = useState([]);
  const [activeAttachments, setActiveAttachments] = useState<any | null>(null);
  // const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"decline" | "revoke">("decline");

  const handleApprove = async (item: any) => {
    const userId = item.userId;
    setActionLoading(userId);
    
    try {
      const response = await api.patch(`/delivery/approve/${userId}`);
      
      // Update the local state with proper currentStatus
      // setDeliveryData(prevData => 
      //   prevData.map(user => 
      //     user.userId === userId 
      //       ? { 
      //           ...user, 
      //           isApproved: true,
      //           currentStatus: "approved",
      //           attachments: {
      //             ...user.attachments,
      //             status: "approved",
      //             approvedAt: new Date().toISOString(),
      //             // Clear previous decline/revoke information
      //             declineReason: undefined,
      //             declinedAt: undefined,
      //             revokeReason: undefined,
      //             revokedAt: undefined
      //           }
      //         }
      //       : user
      //   )
      // );
      await refetch();


      toast.success(`${item.name} has been approved successfully!`, {
        duration: 4000,
        position: 'top-right',
      });
      
    } catch (error: any) {
      console.error("Error approving delivery user:", error);
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
    setActionType("decline");
    setShowActionModal(true);
  };

  const handleRevokeClick = (item: any) => {
    setSelectedUser(item);
    setActionType("revoke");
    setShowActionModal(true);
  };

  const handleActionConfirm = async (reason: string) => {
    if (!selectedUser) return;
    
    const userId = selectedUser.userId;
    setActionLoading(userId);
    
    try {
      let response;
      let successMessage;
      let newStatus;

      if (actionType === "revoke") {
        // Call revoke endpoint
        response = await api.patch(`/delivery/revoke/${userId}`, {
          reason: reason || "Access revoked by admin"
        });
        successMessage = `${selectedUser.name} has been revoked successfully!`;
        newStatus = "revoked";
      } else {
        // Call decline endpoint
        response = await api.patch(`/delivery/decline/${userId}`, {
          reason: reason || undefined
        });
        successMessage = `${selectedUser.name} has been declined successfully!`;
        newStatus = "declined";
      }
      
      // Update the local state
      // setDeliveryData(prevData => 
      //   prevData.map(user => 
      //     user.userId === userId 
      //       ? { 
      //           ...user, 
      //           isApproved: false,
      //           currentStatus: newStatus,
      //           attachments: {
      //             ...user.attachments,
      //             status: newStatus,
      //             ...(actionType === "revoke" 
      //               ? {
      //                   revokeReason: reason || "Access revoked by admin",
      //                   revokedAt: new Date().toISOString()
      //                 }
      //               : {
      //                   declineReason: reason || "Application declined",
      //                   declinedAt: new Date().toISOString()
      //                 }
      //             )
      //           }
      //         }
      //       : user
      //   )
      // );

      await refetch()
      toast.success(successMessage, {
        duration: 4000,
        position: 'top-right',
      });
      
      // Show additional info for revoke
      if (actionType === "revoke" && response.data.activeOrdersCount > 0) {
        toast.error(`User has ${response.data.activeOrdersCount} active orders that will be preserved`, {
          duration: 6000,
          position: 'top-right',
        });
      }

      // Close modal
      setShowActionModal(false);
      setSelectedUser(null);
      
    } catch (error: any) {
      console.error(`Error ${actionType}ing delivery user:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${actionType} user`;
      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleActionCancel = () => {
    setShowActionModal(false);
    setSelectedUser(null);
  };
  const fetchDeliveryAttachments = async () => {
  const res = await api.get("/delivery-attachments");
  return res.data.data;
};

  // const getAlldeliveryAttach = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await api.get("/delivery-attachments");
  //     console.log("📊 Delivery data received:", res.data.data);
  //     setDeliveryData(res.data.data);
  //   } catch (err) {
  //     console.error("Error fetching delivery attachments:", err);
  //     toast.error("Failed to fetch delivery data", {
  //       duration: 5000,
  //       position: 'top-right',
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const {
  data: deliveryData = [],
  isLoading: loading,
  error,
  refetch,
} = useQuery({
  queryKey: ["delivery-attachments"],
  queryFn: fetchDeliveryAttachments,
  onError: (err: any) => {
    console.error("Error fetching delivery attachments:", err);
    toast.error("Failed to fetch delivery data", {
      duration: 5000,
      position: 'top-right',
    });
  },
  refetchOnMount:true,
  refetchOnWindowFocus:true,
  staleTime:2000
});

  // useEffect(() => {
  //   getAlldeliveryAttach();
  // }, []);

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
      key: "currentStatus",
      label: "Status",
      render: (item: any) => {
        const status = item.currentStatus || "pending";
        
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "approved"
                ? "bg-green-100 text-green-800"
                : status === "declined"
                ? "bg-red-100 text-red-800"
                : status === "revoked"
                ? "bg-orange-100 text-orange-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status === "approved"
              ? "Approved"
              : status === "declined"
              ? "Declined"
              : status === "revoked"
              ? "Revoked"
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
        const currentStatus = item.currentStatus || "pending";

        return (
          <select
            defaultValue=""
            disabled={isProcessing}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "approve") handleApprove(item);
              else if (value === "decline") handleDeclineClick(item);
              else if (value === "revoke") handleRevokeClick(item);
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
            
            {/* Show Approve option if not currently approved */}
            {currentStatus !== "approved" && (
              <option value="approve">
                {currentStatus === "declined" || currentStatus === "revoked" ? "Re-approve" : "Approve"}
              </option>
            )}
            
            {/* Show Decline option if not currently declined */}
            {currentStatus !== "declined" && currentStatus !== "revoked" && (
              <option value="decline">
                Decline
              </option>
            )}

            {/* Show Revoke option only for approved users */}
            {currentStatus === "approved" && (
              <option value="revoke">
                Revoke Access
              </option>
            )}
          </select>
        );
      },
    },
    {
      key: "canReapply",
      label: "Reapply Status",
      render: (item: any) => {
        const currentStatus = item.currentStatus || "pending";
        const canReapply = item.canReapply;
        
        if (canReapply) {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Can Reapply
            </span>
          );
        } else if (currentStatus === "approved") {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          );
        } else {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              N/A
            </span>
          );
        }
      },
    },
    {
      key: "createdAt",
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
          Manage delivery driver applications, approvals, and access
        </p>
      </div>

      {loading ? (
        <Loader title="delivery data"/>
      ) : (
        <>
          {/* Enhanced Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm font-medium text-orange-800">Revoked</div>
              <div className="text-2xl font-bold text-orange-900">
                {deliveryData.filter(item => item.currentStatus === "revoked").length}
              </div>
            </div>
          </div>

          <DynamicTable
            title="Delivery Applications"
            data={deliveryData}
            columns={columns}
            showAddButton={false}
            showFilter={true}
            showActions={false}
          />

          {activeAttachments && (
            <DeliveryAttachments
              show={true}
              onclose={() => setActiveAttachments(null)}
              attachments={activeAttachments}
            />
          )}

          {/* Enhanced Action Modal */}
          <ActionModal
            isOpen={showActionModal}
            onClose={handleActionCancel}
            onConfirm={handleActionConfirm}
            userName={selectedUser?.name || ""}
            isLoading={actionLoading === selectedUser?.userId}
            actionType={actionType}
          />
        </>
      )}
    </div>
  );
}