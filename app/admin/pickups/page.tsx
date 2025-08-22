"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "@/components/shared/dashboardTable";
import UserModal from "@/components/shared/userModal";
import ItemsModal from "@/components/shared/itemsModal";
import CourierSelectionModal from "../../../components/courierSelectionModal";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useUsers } from "@/hooks/useGetUsers";

import { useUserAuth } from "@/context/AuthFormContext";
import Button from "@/components/common/Button";
import ProofOfDeliveryModal from "../../../components/proofDeliveryDetails";
import api from "../../../lib/axios";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";

import { useLanguage } from "@/context/LanguageContext";
import Loader from "@/components/common/loader";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useValueDebounce } from "@/hooks/useValueDebounce";
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
  locale?:string,
  filters?: Record<string, any>,
  search?: string // Add search parameter
) => {
  const params: any = { page, limit };
  if (userRole) params.userRole = userRole;
  if(locale) params.lang = locale
  if (filters?.status?.length) params.status = filters.status.join(",");
  if (filters?.date?.[0]) params.date = filters.date[0];
  if (search && search.trim()) params.search = search.trim(); // Add search to params

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

  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  
  
  const [selectedCompletedOrder, setSelectedCompletedOrder] =
    useState<any>(null);
  const [orderStatus, setOrderStatus] = useState(null);
const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();
  const getFilteredFilters = () => {
    return filters.map((filter) => {
      if (filter.name === "status" && activeTab === "buyer") {
        return {
          ...filter,
          options: filter.options.filter(
            (option) => option.value !== "collected"
          ),
        };
      }
      return filter;
    });
  };
  const [activeTab, setActiveTab] = useState<UserRole>(
  (searchParams.get('tab') as UserRole) || 'customer'
);
const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const debouncedSearchTerm = useValueDebounce(searchTerm, 500); // 500ms delay


const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '5'));

const handlePageChange = (page: number) => {
  setCurrentPage(page);
  updateSearchParams({ page: page.toString() });
};

const handleItemsPerPageChange = (newItemsPerPage: number) => {
  setItemsPerPage(newItemsPerPage);
  setCurrentPage(1);
  updateSearchParams({ 
    limit: newItemsPerPage.toString(),
    page: '1'
  });
};



const updateSearchParams = (updates: Record<string, string | null>) => {
  const current = new URLSearchParams(Array.from(searchParams.entries()));
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === '') {
      current.delete(key);
    } else {
      current.set(key, value);
    }
  });

  const search = current.toString();
  const query = search ? `?${search}` : '';
  router.push(`${pathname}${query}`);
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
  const checkAndUpdateCourierOrders = async (courierId, isApproved) => {
    if (!isApproved) {
      try {
        const response = await api.get(`/orders/courier/${courierId}`);
        const assignedOrders = response.data.filter(
          (order) =>
            order.status.toLowerCase() === "assigntocourier" ||
            order.status.toLowerCase() === "assignedtocourier"
        );

        const updatePromises = assignedOrders.map((order) =>
          // FIXED: Use the correct endpoint for updating order status
          api.put(`admin/orders/${order._id}/status`, {
            status: "pending",
            reason: "Courier status changed to not approved",
          })
        );

        await Promise.all(updatePromises);

        if (assignedOrders.length > 0) {
          toast.info(
            `${assignedOrders.length} orders moved back to pending due to courier status change`
          );
        }

        return assignedOrders.length;
      } catch (error) {
        console.error("Failed to update courier orders:", error);
        return 0;
      }
    }
    return 0;
  };
  const cleanupRevokedCourierOrders = async () => {
    console.log("🧹 Cleaning up orders assigned to revoked couriers...");

    if (!couriers || !Array.isArray(couriers)) return;

    let totalUpdated = 0;

    for (const courier of couriers) {
      const isApproved = courier.attachments?.status === "approved";

      if (!isApproved) {
        console.log(
          `🔍 Checking orders for revoked courier: ${courier.name} (${courier.attachments?.status})`
        );

        try {
          const updatedCount = await checkAndUpdateCourierOrders(
            courier._id,
            false
          );
          totalUpdated += updatedCount;

          if (updatedCount > 0) {
            console.log(
              `✅ Updated ${updatedCount} orders for revoked courier ${courier.name}`
            );
          }
        } catch (error) {
          console.error(
            `❌ Error updating orders for courier ${courier.name}:`,
            error
          );
        }
      }
    }

    if (totalUpdated > 0) {
      toast.success(
        `Cleanup complete: ${totalUpdated} orders moved back to pending from revoked couriers`
      );
      refetch();
    } else {
      toast.info("Cleanup complete: No orders assigned to revoked couriers");
    }

    return totalUpdated;
  };

  const activeFilters = useMemo(() => {
    const status = filters.find((f) => f.name === "status")?.active || [];
    const date = filters.find((f) => f.name === "date")?.active || [];

    // For buyers, automatically filter out 'collected' from active filters
    if (activeTab === "buyer") {
      const filteredStatus = status.filter((s) => s !== "collected");
      return { status: filteredStatus, date };
    }

    return { status, date };
  }, [filters, activeTab]);
const { locale } = useLanguage();


// Key changes in the fetchOrders function call and DynamicTable usage

const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
  queryKey: [
    "adminOrders",
    currentPage,
    activeTab,
    activeFilters,
    locale,
    debouncedSearchTerm,
  ],
  queryFn: () =>
    fetchOrders(
      currentPage,
      itemsPerPage,
      activeTab,
      locale, // Fixed parameter order
      activeFilters,
      debouncedSearchTerm
    ),
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  staleTime: 0,
});
  

  const { user } = useUserAuth();

  const rawOrders = data?.data || [];

  // Filter orders based on user role - buyers shouldn't see collected orders, but should see completed ones
  const orders = useMemo(() => {
    if (activeTab === "buyer") {
      // For buyers: show all statuses EXCEPT collected (they should see completed orders)
      return rawOrders.filter(
        (order: any) => order.status.toLowerCase() !== "collected"
      );
    }

    return rawOrders;
  }, [rawOrders, activeTab]);
  const courierStatusRef = useRef(new Map());
  const isFirstLoadRef = useRef(true); // Track if this is the first load

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
  const [selectedOrderItems, setSelectedOrderItems] = useState<null | any[]>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<null | any[]>(null);
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);

  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<
    string | null
  >(null);
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

  useEffect(() => {
    if (couriers && Array.isArray(couriers)) {
      console.log("🔍 Checking courier statuses...");

      const processStatusChanges = async () => {
        for (const courier of couriers) {
          const isApproved = courier.attachments?.status === "approved";
          const previousStatus = courierStatusRef.current.get(courier._id);

          console.log(`Courier ${courier._id} (${courier.name}):`, {
            currentStatus: courier.attachments?.status,
            isApproved,
            previousStatus,
            isFirstLoad: isFirstLoadRef.current,
            shouldCheckChange:
              !isFirstLoadRef.current && previousStatus !== undefined,
          });

          // Only check for status changes after the first load
          // and only if we have a previous status recorded
          if (!isFirstLoadRef.current && previousStatus !== undefined) {
            // If courier status changed from approved to not approved
            if (previousStatus === true && !isApproved) {
              console.log(
                `🚨 DETECTED STATUS CHANGE: Courier ${courier._id} (${courier.name}) changed from approved to ${courier.attachments?.status}`
              );

              // Show immediate feedback
              toast.warning(
                `Courier ${courier.name} status changed to ${courier.attachments?.status}. Checking assigned orders...`
              );

              try {
                const updatedCount = await checkAndUpdateCourierOrders(
                  courier._id,
                  isApproved
                );
                if (updatedCount > 0) {
                  console.log(
                    `✅ Successfully updated ${updatedCount} orders for courier ${courier.name}`
                  );
                  refetch(); // Refresh the orders list
                } else {
                  console.log(
                    `ℹ️ No assigned orders found for courier ${courier.name}`
                  );
                  toast.info(
                    `Courier ${courier.name} has no assigned orders to update.`
                  );
                }
              } catch (error) {
                console.error(
                  `❌ Error updating orders for courier ${courier.name}:`,
                  error
                );
                toast.error(
                  `Failed to update orders for courier ${courier.name}`
                );
              }
            }

            // Also check for approved to approved changes (no action needed, just log)
            if (previousStatus === isApproved) {
              console.log(
                `📝 No status change for courier ${courier.name} (still ${courier.attachments?.status})`
              );
            } else if (previousStatus === false && isApproved) {
              console.log(
                `✅ Courier ${courier.name} was re-approved (${courier.attachments?.status})`
              );
            }
          }

          // Always update the stored status
          courierStatusRef.current.set(courier._id, isApproved);
        }

        // After first load, mark that we're no longer on first load
        if (isFirstLoadRef.current) {
          isFirstLoadRef.current = false;
          console.log(
            "📊 Initial courier statuses recorded:",
            Array.from(courierStatusRef.current.entries()).map(
              ([id, status]) => ({
                courierId: id,
                isApproved: status,
              })
            )
          );
        }
      };

      processStatusChanges();
    }
  }, [couriers, refetch]);


const handleTabChange = (tab: UserRole) => {
  setActiveTab(tab);
  handlePageChange(1);
  setSearchTerm('');
  updateSearchParams({
    tab,
    page: '1',
    search: null,
  });
};
const handleSearchChange = (value: string) => {
  setSearchTerm(value);
  handlePageChange(1);
  updateSearchParams({
    search: value || null,
    page: '1',
  });
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

  const handleAssignToCourier = async (orderId, courierId) => {
    try {
      const selectedCourier = couriers?.find(
        (courier) => courier._id === courierId
      );
      if (!selectedCourier) {
        toast.error("Selected courier not found");
        return;
      }

      // CHANGED: Check attachments.status instead of status
      if (selectedCourier.attachments?.status !== "approved") {
        toast.error("Cannot assign order to non-approved courier");
        return;
      }

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
  const getAllowedStatusTransitions = (
    userRole: string
  ): Record<string, string[]> => {
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


  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Try Again
        </button>
      </div>
    );
  }


if (isLoading) {
  return (
   <Loader />
  );
}
  const transformedData = orders.map((order: any) => ({
    orderId: order._id,
    onClickItemsId: () => {
      setOrderStatus(order.status);
      setSelectedOrderItems(order.items);
      setSelectedUser(order.user)
      setSelectedOrder(order);
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
            className="text-green-600 hover:underline font-medium text-left">
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
          className="text-green-600 hover:underline font-medium">
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
        const allowedStatusTransitions = getAllowedStatusTransitions(
          order.userRole
        );
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
              className="px-5 py-2 text-xs font-semibold rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
              Completed
            </Button>
          );
        }

        // Handle cancelled status
        if (currentStatus === "cancelled") {
          return (
            <button
              onClick={() => handleShowCancelReason(order.statusHistory)}
              className="px-5 py-2 text-xs font-semibold rounded-md bg-red-100 text-red-800 hover:bg-red-200 transition-colors">
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
                className="px-5 py-2 text-xs font-semibold rounded-md bg-purple-500 text-purple-800 hover:bg-purple-200 transition-colors">
                see collection
              </Button>
              <button
                onClick={() => handleMarkAsCompleted(order.orderId)}
                className="px-5 py-2 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                title="Mark as completed">
                click to complete
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

        const handleChange = async (
          e: React.ChangeEvent<HTMLSelectElement>
        ) => {
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
            className={`px-2 py-1 rounded border ${getStatusColor(
              currentStatus
            )}`}
            onClick={(e) => e.stopPropagation()}>
            <option value={currentStatus}>
              {currentStatus === "assigntocourier"
                ? "Assigned to Courier"
                : currentStatus.charAt(0).toUpperCase() +
                  currentStatus.slice(1)}
            </option>
            {nextStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "assignToCourier"
                  ? "Assign to Courier"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
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
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs" style={{ background: "var(--background)" }}>
            <button
              onClick={() => handleTabChange("customer")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "customer"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
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
              }`}>
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
      {!orders || (!filters.length && orders.length === 0) ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            No {activeTab} Orders Found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm
              ? `No orders found matching "${searchTerm}"`
              : `There are currently no ${activeTab} orders in the system. Orders will appear here once ${activeTab}s start placing them.`}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Refresh
          </button>
        </div>
      ) : (
        <>
      

   <DynamicTable
  data={transformedData}
  columns={columns}
  title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders`}
  itemsPerPage={itemsPerPage}
  showAddButton={false}
  
  showFilter
  showSearch={true}
  searchTerm={searchTerm}
  onSearchChange={handleSearchChange}
  filtersConfig={getFilteredFilters()}
  externalFilters={activeFilters}
  onExternalFiltersChange={(updated) => {
    // your existing filter logic
  }}
  activeFiltersCount={filters.reduce((acc, f) => acc + (f.active?.length || 0), 0)}
  onDelete={(id: string) => handleDeleteOrder(id)}
  paginationInfo={{
    currentPage: data?.currentPage || currentPage,
    totalPages: data?.totalPages || 1,
    totalItems: data?.totalOrders || 0,
    itemsPerPage: itemsPerPage,
    hasNextPage: currentPage < (data?.totalPages || 1),
    hasPrevPage: currentPage > 1,
  }}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handleItemsPerPageChange}
  disableClientSideSearch={true}
/>

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
        selectedOrder={selectedOrder}
        show={isItemsModalOpen}
        orderStatus={orderStatus}
        userRole={selectedUser}

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
        onClose={() => setShowCancelReasonModal(false)}>
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
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                Close
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
