"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Button from "@/components/common/Button";
import DynamicTable from "@/components/shared/dashboardTable";
import DeliveryAttachments from "@/components/shared/DeliveryAttachements";
import { toast } from "react-hot-toast"; // Make sure to install: npm install react-hot-toast
import { Label, Modal, ModalBody, ModalHeader, Textarea, TextInput } from "flowbite-react";

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
      
      // Update the local state to reflect the approval
      setDeliveryData(prevData => 
        prevData.map(user => 
          user.userId === userId 
            ? { ...user, isApproved: true }
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
      
      // Update the local state to reflect the decline
      setDeliveryData(prevData => 
        prevData.map(user => 
          user.userId === userId 
            ? { ...user, isApproved: false }
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
      key: "isApproved",
      label: "Status",
      render: (item: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.isApproved === true
              ? "bg-green-100 text-green-800"
              : item.isApproved === false
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {item.isApproved === true
            ? "Approved"
            : item.isApproved === false
            ? "Declined"
            : "Pending"}
        </span>
      ),
    },
 {
  key: "statusAction",
  label: "Action",
  render: (item: any) => {
    const isProcessing = actionLoading === item.userId;

    // Disable select if pending (isApproved is null or undefined)
    const isPending = item.isApproved === null || item.isApproved === undefined;

    return (
      <select
        defaultValue=""
        disabled={isProcessing || isPending}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "approve") handleApprove(item);
          else if (value === "decline") handleDeclineClick(item);
          // Reset select after action
          e.target.value = "";
        }}
        className={`border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
          isProcessing || isPending ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <option value="" disabled>
          {isProcessing ? "Processing..." : isPending ? "Pending" : "Action"}
        </option>
        {/* Only show Approve if not approved and not pending */}
        {!isPending && item.isApproved !== true && (
          <option value="approve">Approve</option>
        )}
        {/* Only show Decline if not declined and not pending */}
        {!isPending && item.isApproved !== false && (
          <option value="decline">Decline</option>
        )}
      </select>
    );
  },
}
,
    {
      key: "userId",
      label: "User ID",
      sortable: false,
      render: (item: any) => (
        <span className="text-xs text-gray-500 font-mono">
          {item.userId}
        </span>
      ),
    },
    {
      key: "attachments",
      label: "Attachments",
      render: (item: any) => (
        <button
          className="text-green-500 hover:text-green-700 underline"
          onClick={() => setActiveAttachments(item.attachments)}
        >
          View Attachments
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading delivery data...</div>
        </div>
      ) : (
        <>
          <DynamicTable
            title="Delivery Attachments"
            data={deliveryData}
            columns={columns}
            showAddButton={false}
            showFilter={false}
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