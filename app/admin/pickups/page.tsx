'use client';

import React, {  useEffect, useState } from 'react';
import DynamicTable from '@/components/shared/dashboardTable';
import api from '@/lib/axios';
import Loader from '@/components/common/loader';
import UserModal from '@/components/shared/userModal';
import ItemsModal from '@/components/shared/itemsModal';
import CourierSelectionModal from '../../../components/courierSelectionModal';
import OrderConfirmationModal from '@/components/admin/OrderConfirmationModal';
import DriverAssignmentModal from '@/components/admin/DriverAssignmentModal';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useUsers } from '@/hooks/useGetUsers';


export default function Page() {

  const [orders, setOrders] = useState<any[]>([]);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState<boolean>(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<null | any[]>(null);
  const [isCourierModalOpen, setIsCourierModalOpen] = useState<boolean>(false);
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<string | null>(null);
  const [couriers, setCouriers] = useState([]);
  
  // New state for order management
  const [activeTab, setActiveTab] = useState<'pending' | 'assigned' | 'all'>('pending');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedOrderForConfirm, setSelectedOrderForConfirm] = useState<any>(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState<boolean>(false);
  const [selectedOrderForDriver, setSelectedOrderForDriver] = useState<any>(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);

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
      // Mock data for orders
      const mockOrders = [
        {
          _id: 'order1',
          user: {
            userId: 'user1',
            userName: 'John Doe',
            phoneNumber: '+1234567890'
          },
          address: {
            city: 'Cairo',
            area: 'Maadi'
          },
          items: [
            { name: 'Plastic Bottles', quantity: 10, points: 50 }
          ],
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'order2',
          user: {
            userId: 'user2',
            userName: 'Jane Smith',
            phoneNumber: '+0987654321'
          },
          address: {
            city: 'Alexandria',
            area: 'Miami'
          },
          items: [
            { name: 'Paper', quantity: 5, points: 25 }
          ],
          status: 'assigntocourier',
          createdAt: new Date().toISOString()
        }
      ];
      setOrders(mockOrders);
      console.log('Mock orders loaded');
      
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // New function to get pending orders
  const getPendingOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Mock data for pending orders
      const mockPendingOrders = [
        {
          _id: 'order1',
          user: {
            userId: 'user1',
            userName: 'John Doe',
            phoneNumber: '+1234567890'
          },
          address: {
            city: 'Cairo',
            area: 'Maadi'
          },
          items: [
            { name: 'Plastic Bottles', quantity: 10, points: 50 }
          ],
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];
      setOrders(mockPendingOrders);
      console.log('Mock pending orders loaded');
      
    } catch (err) {
      console.error('Failed to fetch pending orders:', err);
      setError('Failed to fetch pending orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // New function to get assigned orders
  const getAssignedOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Mock data for assigned orders
      const mockAssignedOrders = [
        {
          _id: 'order2',
          user: {
            userId: 'user2',
            userName: 'Jane Smith',
            phoneNumber: '+0987654321'
          },
          address: {
            city: 'Alexandria',
            area: 'Miami'
          },
          items: [
            { name: 'Paper', quantity: 5, points: 25 }
          ],
          status: 'assigntocourier',
          createdAt: new Date().toISOString()
        }
      ];
      setOrders(mockAssignedOrders);
      console.log('Mock assigned orders loaded');
      
    } catch (err) {
      console.error('Failed to fetch assigned orders:', err);
      setError('Failed to fetch assigned orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const { data } = useUsers("delivery");

  // const getCouriers = async () => {
  //   try {
  //     const res = await api.get('/users?role=delivery'); 
  //     console.log(res);
      
  //     setCouriers(res.data.data || []);
  //   } catch (err) {
  //     console.error('Failed to fetch couriers:', err);
  //     toast.error('Failed to fetch couriers');
  //   }
  // };

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
        // Mock delete - just remove from local state
        Swal.fire('Deleted!', 'The order has been deleted.', 'success');
        setOrders((prev) => prev.filter((order: any) => order._id !== orderId));
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to delete order. Try again.', 'error');
      }
    }
  };

  // New function to confirm order
  const handleConfirmOrder = async (orderId: string, adminNotes?: string) => {
    try {
      // Mock confirmation - just update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: 'confirmed' }
          : order
      ));
      toast.success('Order confirmed successfully');
    } catch (err) {
      console.error('Failed to confirm order:', err);
      toast.error('Failed to confirm order');
    }
  };

  // New function to assign driver to confirmed order
  const handleAssignDriver = async (orderId: string, driverId: string, assignmentNotes?: string) => {
    try {
      // Mock driver assignment - just update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: 'assigntocourier' }
          : order
      ));
      toast.success('Driver assigned successfully');
      setIsCourierModalOpen(false);
      setSelectedOrderForCourier(null);
    } catch (err) {
      console.error('Failed to assign driver:', err);
      toast.error('Failed to assign driver to order');
    }
  };

  // Note: This endpoint is not implemented in backend yet
  // const handleAssignToCourier = async (orderId: string, courierId: string) => {
  //   try {
  //     await api.put(`/orders/${orderId}/assign-courier`, { 
  //       courierId: courierId,
  //       status: 'assignToCourier' 
  //     });
  //     toast.success('Order assigned to courier successfully');
  //     setIsCourierModalOpen(false);
  //     setSelectedOrderForCourier(null);
  //     await getOrdersByAdmin();
  //   } catch (err) {
  //     console.error('Failed to assign courier:', err);
  //     toast.error('Failed to assign courier to order');
  //   }
  // };

  useEffect(() => {
    getPendingOrders(); // Load pending orders by default
  }, []);

  const closingModalFn = ()=>{
    setIsModalOpen(false)
  }
 
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
  
  // Handle common variations
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
      return status; // Return original if no match
  }
};

const allowedStatusTransitions: Record<string, string[]> = {
  [STATUS.PENDING]: [STATUS.ASSIGN_TO_COURIER, STATUS.CANCELLED],
  [STATUS.ASSIGN_TO_COURIER]: [STATUS.COMPLETED, STATUS.CANCELLED],
  [STATUS.COMPLETED]: [],
  [STATUS.CANCELLED]: [],
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
    
    // New action buttons for order management
    onConfirm: () => {
      setSelectedOrderForConfirm(order);
      setIsConfirmModalOpen(true);
    },
    onAssignDriver: () => {
      setSelectedOrderForDriver(order);
      setIsDriverModalOpen(true);
    },
    
    // Safety reports and cancellation info
    safetyReports: order.safetyReports || [],
    cancellationReason: order.cancellationReason,
    cancelledAt: order.cancelledAt,
    isConfirmed: order.isConfirmed,
    driverId: order.driverId,
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
        
        // Show safety reports and cancellation info
        const hasSafetyReports = order.safetyReports && order.safetyReports.length > 0;
        const isCancelled = order.cancellationReason;
        
        return (
          <div className="space-y-2">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                currentStatus === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : currentStatus === "confirmed"
                  ? "bg-blue-100 text-blue-800"
                  : currentStatus === "assigned"
                  ? "bg-indigo-100 text-indigo-800"
                  : currentStatus === "assigntocourier"
                  ? "bg-purple-100 text-purple-800"
                  : currentStatus === "completed"
                  ? "bg-green-100 text-green-800"
                  : currentStatus === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </span>
              
              {/* Safety Reports Indicator */}
              {hasSafetyReports && (
                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                  ⚠️ Safety Reports ({order.safetyReports.length})
                </span>
              )}
              
              {/* Cancellation Indicator */}
              {isCancelled && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  ❌ Cancelled
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {currentStatus === 'pending' && (
                <button
                  onClick={order.onConfirm}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Confirm Order
                </button>
              )}
              
              {currentStatus === 'confirmed' && !order.driverId && (
                <button
                  onClick={order.onAssignDriver}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Assign Driver
                </button>
              )}
            </div>
          </div>
        );
      },
    },
    { 
      key: 'createdAt', 
      label: 'Date',
      render: (row: any) => (
        <div className="text-sm">
          <div>{row.createdAt}</div>
          {row.cancelledAt && (
            <div className="text-xs text-red-600">
              Cancelled: {new Date(row.cancelledAt).toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={row.onClickItemsId}
            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            View Items
          </button>
          <button
            onClick={row.onClickUser}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            View User
          </button>
          {row.safetyReports && row.safetyReports.length > 0 && (
            <button
              onClick={() => {
                // Show safety reports modal
                console.log('Safety reports:', row.safetyReports);
              }}
              className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            >
              Safety Reports
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => {
                setActiveTab('pending');
                getPendingOrders();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Orders
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {orders.filter((order: any) => order.status === 'pending').length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('assigned');
                getAssignedOrders();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assigned Orders
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {orders.filter((order: any) => order.status === 'assigned' || order.status === 'assigntocourier').length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('all');
                getOrdersByAdmin();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Orders
            </button>
          </nav>
        </div>
      </div>

      <DynamicTable
        data={transformedData}
        columns={columns}
        title={activeTab === 'pending' ? 'Pending Orders' : activeTab === 'assigned' ? 'Assigned Orders' : 'All Orders'}
        itemsPerPage={5}
        showAddButton={false}
        showFilter={false}
        onDelete={(id: string) => handleDeleteOrder(id)}
      />

      <UserModal selectedUser={selectedUser} show={isModalOpen} closingModalFn={closingModalFn}/>
      <ItemsModal selectedOrderItems={selectedOrderItems} show={isItemsModalOpen} onclose={()=>setIsItemsModalOpen(false)} />
      <CourierSelectionModal 
        show={isCourierModalOpen}
        couriers={data}
        onSelectCourier={(courierId: string) => {
          // TODO: Implement courier assignment when backend endpoint is ready
          console.log('Courier assignment not implemented yet');
          toast.info('Courier assignment feature coming soon');
        }}
        onClose={() => {
          setIsCourierModalOpen(false);
          setSelectedOrderForCourier(null);
        }}
      />
      
      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        show={isConfirmModalOpen}
        order={selectedOrderForConfirm}
        onConfirm={handleConfirmOrder}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedOrderForConfirm(null);
        }}
        isLoading={loading}
      />
      
      {/* Driver Assignment Modal */}
      <DriverAssignmentModal
        show={isDriverModalOpen}
        order={selectedOrderForDriver}
        onAssign={handleAssignDriver}
        onClose={() => {
          setIsDriverModalOpen(false);
          setSelectedOrderForDriver(null);
        }}
        isLoading={loading}
      />
    </>
  );
}