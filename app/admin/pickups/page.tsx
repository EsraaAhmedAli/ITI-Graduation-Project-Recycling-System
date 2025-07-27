'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DynamicTable from '@/components/shared/dashboardTable';
import api from '@/lib/axios';
import Loader from '@/components/common/loader';
import UserModal from '@/components/shared/userModal';
import ItemsModal from '@/components/shared/itemsModal';
import CourierSelectionModal from '../../../components/courierSelectionModal';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useUsers } from '@/hooks/useGetUsers';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '../../../components/tablePagination/tablePagination';

const fetchOrders = async (page: number, limit: number) => {
  const { data } = await api.get('/admin/orders', { params: { page, limit } });
  return data;
};

export default function Page() {
  const { currentPage, itemsPerPage, handlePageChange } = usePagination(1, 10);
  const limit = 10;

  // React Query fetch with pagination
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminOrders', currentPage],
    queryFn: () => fetchOrders(currentPage, itemsPerPage),
    keepPreviousData: true,
  });

   const orders = data?.data || [];
  const totalItems = data?.totalOrders || 0;
  const totalPages = data?.totalPages || 1;
 const paginationProps = {
    currentPage,
    totalPages,
    onPageChange: handlePageChange,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: currentPage * itemsPerPage,
    totalItems,
    isFetching
  };
  // Modal & selection states
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<null | any[]>(null);
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
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

  const { data: couriers } = useUsers("delivery");

  // Delete order handler
  const handleDeleteOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This order will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/orders/${orderId}`);
        Swal.fire('Deleted!', 'The order has been deleted.', 'success');
        refetch();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to delete order. Try again.', 'error');
      }
    }
  };

  // Assign courier handler
  const handleAssignToCourier = async (orderId: string, courierId: string) => {
    try {
      await api.put(`/orders/${orderId}/assign-courier`, {
        courierId,
        status: 'assignToCourier'
      });
      toast.success('Order assigned to courier successfully');
      setIsCourierModalOpen(false);
      setSelectedOrderForCourier(null);
      refetch();
    } catch (err) {
      console.error('Failed to assign courier:', err);
      toast.error('Failed to assign courier to order');
    }
  };

  // Cancel order handler with reason
  const handleCancelOrder = async (orderId: string) => {
    const { value: reason } = await Swal.fire({
      title: 'Cancel Order',
      input: 'text',
      inputPlaceholder: 'Enter cancellation reason...',
      showCancelButton: true,
      confirmButtonText: 'Cancel Order',
      cancelButtonText: 'Keep Order',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Cancellation reason is required';
        }
        if (value.trim().length < 5) {
          return 'Please provide a reason (at least 5 characters)';
        }
        return null;
      }
    });

    if (reason) {
      try {
        await api.put(`/admin/orders/${orderId}/status`, {
          status: 'cancelled',
          reason: reason.trim()
        });
        toast.success('Order cancelled successfully');
        refetch();
      } catch (err) {
        console.error('Failed to cancel order:', err);
        toast.error('Failed to cancel order');
      }
    }
  };

  const closingModalFn = () => {
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const base = 'px-2 py-1 text-xs font-semibold rounded-full';

    switch (status) {
      case 'pending':
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'assigntoCourier':
        return <span className={`${base} bg-blue-100 text-blue-800`}>Assigned</span>;
      case 'completed':
        return <span className={`${base} bg-green-100 text-green-800`}>Completed</span>;
      case 'cancelled':
        return <span className={`${base} bg-red-100 text-red-800`}>Cancelled</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const STATUS = {
    PENDING: 'pending',
    ASSIGN_TO_COURIER: 'assignToCourier',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  } as const;

  const normalizeStatus = (status: string): string => {
    const normalized = status.toLowerCase().trim();

    switch (normalized) {
      case 'pending':
        return STATUS.PENDING;
      case 'assigntocourier':
      case 'assignedtocourier':
      case 'assigned':
        return STATUS.ASSIGN_TO_COURIER;
      case 'completed':
      case 'complete':
        return STATUS.COMPLETED;
      case 'cancelled':
      case 'canceled':
        return STATUS.CANCELLED;
      default:
        return status;
    }
  };

  const allowedStatusTransitions: Record<string, string[]> = {
    [STATUS.PENDING]: [STATUS.ASSIGN_TO_COURIER, STATUS.CANCELLED],
    [STATUS.ASSIGN_TO_COURIER]: [STATUS.COMPLETED, STATUS.CANCELLED],
    [STATUS.COMPLETED]: [],
    [STATUS.CANCELLED]: [],
  };

  if (isLoading) {
    return <Loader title="orders" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h3>
        <p className="text-gray-600 mb-4 text-center">{(error as any)?.message || "Failed to load orders."}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          There are currently no orders in the system. Orders will appear here once customers start placing them.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Refresh
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
    userName: order.user?.userName || 'Unknown',
    onClickUser: () => {
      const user = order.user || {};
      setSelectedUser({
        name: user.userName || 'Unknown',
        email: user.email ?? 'Not Provided',
        phone: user.phoneNumber || 'N/A',
        imageUrl: user.imageUrl || null,
        address: order.address || {},
      });
      setIsModalOpen(true);
    },
    onDelete: () => handleDeleteOrder(order._id),
  }));

  const columns = [
    {
      key: 'userName',
      label: 'User',
      render: (row: any) => (
        <button
          onClick={row.onClickUser}
          className="text-green-600 hover:underline font-medium"
        >
          {row.userName}
        </button>
      ),
    },
    {
      key: 'orderId',
      label: 'Order ID',
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
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (order: any) => {
        const currentStatus = order.status.toLowerCase();
        const nextStatuses = allowedStatusTransitions[currentStatus] || [];

        if (currentStatus === 'cancelled') {
          return (
            <span className="px-5 py-2 text-xs font-semibold rounded-md bg-red-100 text-red-800">
              cancelled
            </span>
          );
        }

        if (currentStatus === 'completed') {
          return (
            <span className="px-5 py-2 text-xs font-semibold rounded-md bg-green-100 text-green-800">
              completed
            </span>
          );
        }

        const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
          const newStatus = e.target.value;
          if (newStatus === currentStatus) return;

          if (newStatus === 'assignToCourier') {
            setSelectedOrderForCourier(order.orderId);
            setIsCourierModalOpen(true);
            e.target.value = currentStatus;
            return;
          }

          // Handle cancellation with reason
          if (newStatus === 'cancelled') {
            e.target.value = currentStatus; // Reset select immediately
            await handleCancelOrder(order.orderId);
            return;
          }

          // Handle other status changes normally
          try {
            await api.put(`/admin/orders/${order.orderId}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            refetch();
          } catch {
            toast.error('Failed to update order status.');
          }
        };

        return (
          <select
            value={currentStatus}
            onChange={handleChange}
            disabled={nextStatuses.length === 0}
            className={`px-2 py-1 rounded border ${
              currentStatus === "pending"
                ? "border-yellow-400 bg-yellow-100 text-yellow-800"
                : currentStatus === "assigntocourier"
                ? "border-blue-400 bg-blue-100 text-blue-800"
                : currentStatus === "completed"
                ? "border-green-400 bg-green-100 text-green-800"
                : "border-gray-400 bg-gray-100 text-gray-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <option value={currentStatus}>
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </option>
            {nextStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        );
      },
    },
    { key: 'createdAt', label: 'Date' },
  ];

  return (
    <>
       <DynamicTable
        data={transformedData}
        columns={columns}
        title="Orders"
        itemsPerPage={itemsPerPage}
        showAddButton={false}
        showFilter={false}
        onDelete={(id: string) => handleDeleteOrder(id)}
      />
            {totalPages > 1 && <TablePagination {...paginationProps} />}


      

      <UserModal selectedUser={selectedUser} show={isModalOpen} closingModalFn={closingModalFn} />
      <ItemsModal selectedOrderItems={selectedOrderItems} show={isItemsModalOpen} onclose={() => setIsItemsModalOpen(false)} />
      <CourierSelectionModal
        show={isCourierModalOpen}
        couriers={couriers}
        onSelectCourier={(courierId: string) => handleAssignToCourier(selectedOrderForCourier!, courierId)}
        onClose={() => {
          setIsCourierModalOpen(false);
          setSelectedOrderForCourier(null);
        }}
      />
    </>
  );
}
