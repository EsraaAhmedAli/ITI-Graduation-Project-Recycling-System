'use client';

import React, {  useEffect, useState } from 'react';
import DynamicTable from '@/components/shared/dashboardTable';
import api from '@/lib/axios';
import Loader from '@/components/common/loader';
import UserModal from '@/components/shared/userModal';
import ItemsModal from '@/components/shared/itemsModal';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const allowedStatusTransitions: Record<string, string[]> = {
  pending: ["accepted", "cancelled"],   
  accepted: ["completed"],               
  completed: [],                        // no further changes allowed
  cancelled: [],                        // no further changes allowed
};

export default function Page() {

  const [orders, setOrders] = useState([]);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState<boolean>(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<null | any[]>(null);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<null | {
    name: string;
    phone: string;
    imageUrl :string,
    email:string;
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

  const getOrdersByAdmin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/orders');
      setOrders(res.data.data || []);
      console.log(res.data.data[0].user.imageUrl);
      
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
const handleDeleteOrder = async (orderId: string) => {
  
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This order will be permanently deleted.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#10B981', // green
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/orders/${orderId.orderId}`);
      Swal.fire('Deleted!', 'The order has been deleted.', 'success');

      setOrders((prev) => prev.filter((order: any) => order._id !== orderId.orderId));
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete order. Try again.', 'error');
    }
  }
};


  useEffect(() => {
    getOrdersByAdmin();
  }, []);
 const closingModalFn = ()=>{
  setIsModalOpen(false)
 }
 
 const getStatusBadge = (status: string) => {
    const base = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'accepted':
        return <span className={`${base} bg-blue-100 text-blue-800`}>Accepted</span>;
      case 'completed':
        return <span className={`${base} bg-green-100 text-green-800`}>Completed</span>;
      case 'cancelled':
        return <span className={`${base} bg-red-100 text-red-800`}>Cancelled</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Loader title='orders'/>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button
            onClick={getOrdersByAdmin}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  // Show empty state
  if (!orders || orders.length === 0) {
    return (
      <>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Orders</h2>
              <button
                onClick={getOrdersByAdmin}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center min-h-96 p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              There are currently no orders in the system. Orders will appear here once customers start placing them.
            </p>
            <div className="flex gap-3">
              <button
                onClick={getOrdersByAdmin}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const transformedData = orders.map((order: any) => ({
    orderId: order._id,
    onClickItemsId:()=>{
      setSelectedOrderItems(order.items)
      console.log(order.items);
      setIsItemsModalOpen(true)
      
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
    { key: 'orderId', label: 'Order ID',    render: (row: any) => (
        <button
          onClick={row.onClickItemsId}
          className="text-green-600 hover:underline font-medium"
        >
          {row.orderId}
        </button>
      ), },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (order) => {
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

          try {
            await api.put(`/admin/orders/${order.orderId}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            await getOrdersByAdmin();
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
                : currentStatus === "accepted"
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
        itemsPerPage={5}
        showAddButton={false}
        showFilter={false}
         onDelete={(id: string) => handleDeleteOrder(id)}

     
        
      />

   <UserModal selectedUser={selectedUser} show={isModalOpen} closingModalFn={closingModalFn}/>
      <ItemsModal selectedOrderItems={selectedOrderItems} show={isItemsModalOpen} onclose={()=>setIsItemsModalOpen(false)} />
  
    </>
  );
}