"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "@/components/shared/dashboardTable";
import Loader from "@/components/common/loader";
import UserModal from "@/components/shared/userModal";
import ItemsModal from "@/components/shared/itemsModal";
import CourierSelectionModal from "../../../components/courierSelectionModal";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useUsers } from "@/hooks/useGetUsers";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "../../../components/tablePagination/tablePagination";
import { useUserAuth } from "@/context/AuthFormContext";
import Button from "@/components/common/Button";
import ProofOfDeliveryModal from "../../../components/proofDeliveryDetails";
import api from '../../../lib/axios'
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
type UserRole = "customer" | "buyer";
const STATUS = {
  PENDING: "pending",
  ASSIGN_TO_COURIER: "assignToCourier",
  COLLECTED: "collected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

const normalizeStatus = (status: string): string => {
  const normalized = status.toLowerCase().trim();

  switch (normalized) {
    case "pending":
      return STATUS.PENDING;
    case "assigntocourier":
    case "assignedtocourier":
    case "assigned":
      return STATUS.ASSIGN_TO_COURIER;
    case "collected":
      return STATUS.COLLECTED;
    case "completed":
    case "complete":
      return STATUS.COMPLETED;
    case "cancelled":
    case "canceled":
      return STATUS.CANCELLED;
    default:
      return status;
  }
};

const fetchOrders = async (
  page: number,
  limit: number,
  userRole?: UserRole,
  filters?: Record<string, any>
) => {
  const params: any = { page, limit };
  if (userRole) params.userRole = userRole;
  if (filters?.status?.length) params.status = filters.status.join(",");
  if (filters?.date?.[0]) params.date = filters.date[0];

  const { data } = await api.get("/admin/orders", { params });
  return data;
};

export default function Page() {
  const [filters, setFilters] = useState([
    {
      name: "status",
      title: "Status",
      type: "multi-select" as const,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Assign To Courier", value: "assigntocourier" },
        { label: "Collected", value: "collected" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
      active: [],
    },
    {
      name: "date",
      title: "Order Date",
      type: "date",
      options: [],
      active: [],
    },
  ]);

  const [activeTab, setActiveTab] = useState<UserRole>("customer");
  const { currentPage, itemsPerPage, handlePageChange } = usePagination(1, 5);
const [isProofModalOpen, setIsProofModalOpen] = useState(false);
const [selectedCompletedOrder, setSelectedCompletedOrder] = useState<any>(null);


  const getFilteredFilters = () => {
    return filters.map(filter => {
      if (filter.name === "status" && activeTab === "buyer") {
        return {
          ...filter,
          options: filter.options.filter(option => option.value !== "collected")
        };
      }
      return filter;
    });
  };
const handleOpenCompletedDetails = (order: any) => {
  setSelectedCompletedOrder({
    orderId: order.orderId,
    deliveryProof: order.deliveryProof,
    collectedAt: order.collectedAt,
    completedAt: order.completedAt,
    courier: order.courier,
    statusHistory: order.statusHistory,
  });
  setIsProofModalOpen(true);
};

  const activeFilters = useMemo(() => {
    const status = filters.find((f) => f.name === "status")?.active || [];
    const date = filters.find((f) => f.name === "date")?.active || [];
    
    // For buyers, automatically filter out 'collected' from active filters
    if (activeTab === "buyer") {
      const filteredStatus = status.filter(s => s !== "collected");
      return { status: filteredStatus, date };
    }
    
    return { status, date };
  }, [filters, activeTab]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["adminOrders", currentPage, activeTab, activeFilters],
    queryFn: () =>
      fetchOrders(currentPage, itemsPerPage, activeTab, activeFilters),
    keepPreviousData: true,
    refetchOnMount: true,
    refetchOnWindowFocus:true,
    staleTime : 2000
  });

  const { user } = useUserAuth();

  const rawOrders = data?.data || [];
  
  // Filter orders based on user role - buyers shouldn't see collected orders, but should see completed ones
  const orders = useMemo(() => {
    if (activeTab === "buyer") {
      // For buyers: show all statuses EXCEPT collected (they should see completed orders)
      return rawOrders.filter((order: any) => order.status.toLowerCase() !== "collected");
    }
    
    return rawOrders;
  }, [rawOrders, activeTab]);
  
  const totalItems = orders.length; // Use filtered count
  const totalPages = data?.totalPages || 1;

  const paginationProps = {
    currentPage,
    totalPages,
    onPageChange: handlePageChange,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: currentPage * itemsPerPage,
    totalItems,
    isFetching,
  };

  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<null | any[]>(null);
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);

  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<null | {
    name: string;
    phone: string;
    imageUrl: string;
    email: string;
    address: {
      city: string;
      area: string;
      street: string;
      building: string;
      floor: string;
      additionalInfo?: string;
    };
  }>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
const handleShowCancelReason = (statusHistory: any[]) => {
  const cancelledEntry = statusHistory.find(
    (entry: any) => entry.status === "cancelled"
  );
  setCancelReason(cancelledEntry?.reason || "Order cancelled by customer");
  setShowCancelReasonModal(true);
};

  const { data: couriers } = useUsers("delivery");

  const handleTabChange = (tab: UserRole) => {
    setActiveTab(tab);
    handlePageChange(1);
    
    // Clear collected filter when switching to buyers tab
    if (tab === "buyer") {
      setFilters((prev) =>
        prev.map((f) => {
          if (f.name === "status") {
            return {
              ...f,
              active: f.active.filter((status: string) => status !== "collected"),
            };
          }
          return f;
        })
      );
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This order will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/orders/${orderId.orderId}`);
        Swal.fire("Deleted!", "The order has been deleted.", "success");
        refetch();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete order. Try again.", "error");
      }
    }
  };

  const handleAssignToCourier = async (orderId: string, courierId: string) => {
    try {
      await api.put(`/orders/${orderId}/assign-courier`, {
        courierId,
        status: "assignToCourier",
      });
      toast.success("Order assigned to courier successfully");
      setIsCourierModalOpen(false);
      setSelectedOrderForCourier(null);
      refetch();
    } catch (err) {
      console.error("Failed to assign courier:", err);
      toast.error("Failed to assign courier to order");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const { value: reason } = await Swal.fire({
      title: "Cancel Order",
      input: "text",
      inputPlaceholder: "Enter cancellation reason...",
      showCancelButton: true,
      confirmButtonText: "Cancel Order",
      cancelButtonText: "Keep Order",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "Cancellation reason is required";
        }
        if (value.trim().length < 5) {
          return "Please provide a reason (at least 5 characters)";
        }
        return null;
      },
    });

    if (reason) {
      try {
        await api.put(`/admin/orders/${orderId}/status`, {
          status: "cancelled",
          reason: reason.trim(),
        });
        toast.success("Order cancelled successfully");
        refetch();
      } catch (err) {
        console.error("Failed to cancel order:", err);
        toast.error("Failed to cancel order");
      }
    }
  };

  const handleMarkAsCompleted = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Mark as Completed?",
      text: "This will mark the order as completed and finalize it.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, mark as completed",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/admin/orders/${orderId}/status`, {
          status: "completed",
        });
        toast.success("Order marked as completed successfully");
        refetch();
      } catch (err) {
        console.error("Failed to mark order as completed:", err);
        toast.error("Failed to mark order as completed");
      }
    }
  };

  const closingModalFn = () => {
    setIsModalOpen(false);
  };

  // Updated status transitions - buyers skip collected status
  const getAllowedStatusTransitions = (userRole: string): Record<string, string[]> => {
    if (userRole === "buyer") {
      // Buyers skip collected status - go directly to completed
      return {
        [STATUS.PENDING]: [STATUS.ASSIGN_TO_COURIER, STATUS.CANCELLED],
        [STATUS.ASSIGN_TO_COURIER]: [STATUS.COMPLETED, STATUS.CANCELLED], // Buyers can complete directly
        [STATUS.COLLECTED]: [STATUS.COMPLETED], // Should not occur for buyers
        [STATUS.COMPLETED]: [],
        [STATUS.CANCELLED]: [],
      };
    } else {
      // Customers use collected status flow
      return {
        [STATUS.PENDING]: [STATUS.ASSIGN_TO_COURIER, STATUS.CANCELLED],
        [STATUS.ASSIGN_TO_COURIER]: [STATUS.CANCELLED], // Delivery will update to collected directly
        [STATUS.COLLECTED]: [STATUS.COMPLETED], // Only admin can complete from collected
        [STATUS.COMPLETED]: [],
        [STATUS.CANCELLED]: [],
      };
    }
  };

  if (isLoading) {
    return <Loader title="orders" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Error Loading Orders
        </h3>
        <p className="text-gray-600 mb-4 text-center">
          {(error as any)?.message || "Failed to load orders."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

const transformedData = orders.map((order: any) => ({
  orderId: order._id,
  onClickItemsId: () => {
    setSelectedOrderItems(order.items);
    setIsItemsModalOpen(true);
  },
  status: order.status,
  createdAt: new Date(order.createdAt).toLocaleString(),
  orderDate: new Date(order.createdAt).toISOString().split("T")[0],
  userName: order.user?.userName || "Unknown",
  userRole: order.user?.role || "Unknown",
  // Add these new fields for proof of delivery (matching your API structure)
  deliveryProof: order.deliveryProof,
  collectedAt: order.collectedAt,
  completedAt: order.completedAt,
  courier: order.courier,
  statusHistory: order.statusHistory,
  onClickUser: () => {
    const user = order.user || {};
    setSelectedUser({
      name: user.userName || "Unknown",
      email: user.email ?? "Not Provided",
      phone: user.phoneNumber || "N/A",
      imageUrl: user.imageUrl || null,
      address: order.address || {},
    });
    setIsModalOpen(true);
  },
  onDelete: () => handleDeleteOrder(order._id),
}));

  const columns = [
    {
      key: "userName",
      label: "User",
      render: (row: any) => (
        <div className="flex flex-col">
          <button
            onClick={row.onClickUser}
            className="text-green-600 hover:underline font-medium text-left"
          >
            {row.userName}
          </button>
          <span className="text-xs text-gray-500 capitalize">
            {row.userRole}
          </span>
        </div>
      ),
    },
    {
      key: "orderId",
      label: "Order ID",
      render: (row: any) => (
        <button
          onClick={row.onClickItemsId}
          className="text-green-600 hover:underline font-medium"
        >
          {row.orderId}
        </button>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (order: any) => {
        const currentStatus = order.status.toLowerCase();
        const allowedStatusTransitions = getAllowedStatusTransitions(order.userRole);
        let nextStatuses = allowedStatusTransitions[currentStatus] || [];

        // Filter out cancel option for buyers
        if (order.userRole === "buyer") {
          nextStatuses = nextStatuses.filter(
            (status) => status !== STATUS.CANCELLED
          );
        }

        // Handle completed status
if (currentStatus === "completed") {
  return (
    <Button 
      onClick={() => handleOpenCompletedDetails(order)} 
      className="px-5 py-2 text-xs font-semibold rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
    >
      Completed
    </Button>
  );
}

        // Handle cancelled status
   if (currentStatus === "cancelled") {
  return (
    <button
      onClick={() => handleShowCancelReason(order.statusHistory)}
      className="px-5 py-2 text-xs font-semibold rounded-md bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
    >
      Cancelled
    </button>
  );
}


        // Handle collected status - show button for admin to complete (only for customers)
   if (currentStatus === "collected") {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleOpenCompletedDetails(order)}
        className="px-3 py-1 text-xs font-semibold rounded-md bg-purple-500 text-purple-800 hover:bg-purple-200 transition-colors"
      >
        Collected
      </Button>
      <button
        onClick={() => handleMarkAsCompleted(order.orderId)}
        className="px-3 py-1 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
        title="Mark as completed"
      >
        Complete
      </button>
    </div>
  );
}

        // For buyers on assigntocourier status, show status without complete button
        // Complete button will only appear in dropdown or when admin manually completes
        if (currentStatus === "assigntocourier" && order.userRole === "buyer") {
          return (
            <span className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800">
              Assigned to Courier
            </span>
          );
        }

        const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
          const newStatus = e.target.value;
          if (newStatus === currentStatus) return;

          if (newStatus === "assignToCourier") {
            setSelectedOrderForCourier(order.orderId);
            setIsCourierModalOpen(true);
            e.target.value = currentStatus;
            return;
          }

          if (newStatus === "cancelled") {
            e.target.value = currentStatus;
            await handleCancelOrder(order.orderId);
            return;
          }

          if (newStatus === "completed") {
            e.target.value = currentStatus;
            await handleMarkAsCompleted(order.orderId);
            return;
          }

          try {
            await api.put(`/admin/orders/${order.orderId}/status`, {
              status: newStatus,
            });
            toast.success(`Order status updated to ${newStatus}`);
            refetch();
          } catch {
            toast.error("Failed to update order status.");
          }
        };

        const getStatusColor = (status: string) => {
          switch (status) {
            case "pending":
              return "border-yellow-400 bg-yellow-100 text-yellow-800";
            case "assigntocourier":
              return "border-blue-400 bg-blue-100 text-blue-800";
            case "collected":
              return "border-purple-400 bg-purple-100 text-purple-800";
            case "completed":
              return "border-green-400 bg-green-100 text-green-800";
            default:
              return "border-gray-400 bg-gray-100 text-gray-800";
          }
        };

        return (
          <select
            value={currentStatus}
            onChange={handleChange}
            disabled={nextStatuses.length === 0}
            className={`px-2 py-1 rounded border ${getStatusColor(currentStatus)}`}
            onClick={(e) => e.stopPropagation()}
          >
            <option value={currentStatus}>
              {currentStatus === "assigntocourier" 
                ? "Assigned to Courier"
                : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
              }
            </option>
            {nextStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "assignToCourier" 
                  ? "Assign to Courier"
                  : status.charAt(0).toUpperCase() + status.slice(1)
                }
              </option>
            ))}
          </select>
        );
      },
    },
    { key: "createdAt", label: "Date" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => handleTabChange("customer")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "customer"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Customer Orders
              {activeTab === "customer" && (
                <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("buyer")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "buyer"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Buyer Orders
              {activeTab === "buyer" && (
                <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Orders Content */}
      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            No {activeTab} Orders Found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            There are currently no {activeTab} orders in the system. Orders will
            appear here once {activeTab}s start placing them.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          <DynamicTable
            data={transformedData}
            columns={columns}
            title={`${
              activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
            } Orders`}
            itemsPerPage={itemsPerPage}
            showAddButton={false}
            showFilter
            filtersConfig={getFilteredFilters()}
            externalFilters={activeFilters}
            onExternalFiltersChange={(updated) => {
              setFilters((prev) =>
                prev.map((f) => {
                  if (f.name === "status" && activeTab === "buyer") {
                    // For buyers, filter out 'collected' from any filter updates
                    const filteredActive = (updated[f.name] || []).filter((status: string) => status !== "collected");
                    return {
                      ...f,
                      active: filteredActive,
                    };
                  }
                  return {
                    ...f,
                    active: updated[f.name] || [],
                  };
                })
              );
              handlePageChange(1);
            }}
            activeFiltersCount={filters.reduce(
              (acc, f) => acc + (f.active?.length || 0),
              0
            )}
            onDelete={(id: string) => handleDeleteOrder(id)}
          />

          {totalPages > 1 && <TablePagination {...paginationProps} />}
        </>
      )}

      {/* Modals */}
      <UserModal
        selectedUser={selectedUser}
        show={isModalOpen}
        closingModalFn={closingModalFn}
      />
      <ItemsModal
        selectedOrderItems={selectedOrderItems}
        show={isItemsModalOpen}
        onclose={() => setIsItemsModalOpen(false)}
      />
      <CourierSelectionModal
        show={isCourierModalOpen}
        couriers={couriers}
        userRole={user?.role}
        onSelectCourier={(courierId: string) =>
          handleAssignToCourier(selectedOrderForCourier!, courierId)
        }
        onClose={() => {
          setIsCourierModalOpen(false);
          setSelectedOrderForCourier(null);
        }}
      />
      <ProofOfDeliveryModal
  show={isProofModalOpen}
  onClose={() => {
    setIsProofModalOpen(false);
    setSelectedCompletedOrder(null);
  }}
  orderDetails={selectedCompletedOrder}
/>
<Modal
dismissible
  show={showCancelReasonModal}
  size="md"
  popup={true}
  onClose={() => setShowCancelReasonModal(false)}
>
  <ModalHeader />
  <ModalBody>
    <div className="text-center">
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
        Cancellation Reason
      </h3>
      <p className="text-gray-700 dark:text-gray-300">{cancelReason}</p>
      <div className="mt-6">
        <button
          onClick={() => setShowCancelReasonModal(false)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  </ModalBody>
</Modal>

    </div>
  );
}