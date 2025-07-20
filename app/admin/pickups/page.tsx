'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/shared/adminLayout';
import DynamicTable from '@/components/shared/dashboardTable';
import api from '@/lib/axios';
import { Modal, ModalBody, ModalHeader } from 'flowbite-react';

const allowedStatusTransitions: Record<string, string[]> = {
  pending: ["accepted", "cancelled"],    // admin can accept or cancel pending orders
  accepted: ["completed"],               // admin can complete accepted orders
  completed: [],                        // no further changes allowed
  cancelled: [],                        // no further changes allowed
};

export default function Page() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<null | {
    name: string;
    phone: string;
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
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrdersByAdmin();
  }, []);

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
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  // Show empty state
  if (!orders || orders.length === 0) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  const transformedData = orders.map((order: any) => ({
    orderId: order._id,
    status: order.status,
    createdAt: new Date(order.createdAt).toLocaleString(),
    userName: order.user?.userName || 'Unknown',
    onClickUser: () => {
      setSelectedUser({
        name: order.user?.userName || 'Unknown',
        email: order.user?.email || 'Unknown',
        phone: order.user?.phoneNumber || 'N/A',
        address: order.address || {},
      });
      setIsModalOpen(true);
    },
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
    { key: 'orderId', label: 'Order ID' },
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
            alert(`Order status updated to ${newStatus}`);
            await getOrdersByAdmin();
          } catch {
            alert('Failed to update order status.');
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
    <AdminLayout>
      <DynamicTable
        data={transformedData}
        columns={columns}
        title="Orders"
        itemsPerPage={5}
        showAddButton={false}
        showFilter={false}
      />

      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        dismissible
      >
        <ModalHeader className="border-b-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
              {selectedUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">User Details</h3>
              <p className="text-sm text-gray-500">Customer information and address</p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="pt-4">
          {selectedUser && (
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Personal Information</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                    </div>
                    <p className="text-gray-800 font-medium">{selectedUser.name}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                    </div>
                    <p className="text-gray-800 font-medium">{selectedUser.phone}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                     <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m0 0v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8m18 0L12 13 3 8"
                        />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                    </div>
                    <p className="text-gray-800 font-medium">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Address Information</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</p>
                    </div>
                    <p className="text-gray-800 font-medium">{selectedUser.address?.city || '-'}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Area</p>
                    </div>
                    <p className="text-gray-800 font-medium">{selectedUser.address?.area || '-'}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Street</p>
                    </div>
                    <p className="text-gray-800 font-medium">{selectedUser.address?.street || '-'}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Building</p>
                    </div>
                    <p className="text-gray-800 font-medium">{selectedUser.address?.building || '-'}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Floor</p>
                    </div>
                    <p className="text-gray-800 font-medium">{selectedUser.address?.floor || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              {selectedUser.address?.additionalInfo && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Additional Information</h4>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{selectedUser.address.additionalInfo}</p>
                  </div>
                </div>
              )}

              {/* Complete Address Preview */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Complete Address</h4>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    {[
                      selectedUser.address?.street,
                      selectedUser.address?.building && `Building ${selectedUser.address.building}`,
                      selectedUser.address?.floor && `Floor ${selectedUser.address.floor}`,
                      selectedUser.address?.area,
                      selectedUser.address?.city
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    </AdminLayout>
  );
}