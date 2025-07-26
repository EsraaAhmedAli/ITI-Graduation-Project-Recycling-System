'use client'
import CourierOrderDetailsModal from '@/components/common/showUserModal'
import DynamicTable from '@/components/shared/dashboardTable'
import api from '@/lib/axios'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import { Camera, CheckCircle, Upload, X, Package, Clock, User, MapPin, Truck, LogOut } from 'lucide-react'
import { Modal, ModalBody, ModalHeader } from 'flowbite-react'
import Button from '@/components/common/Button'
import { useUserAuth } from '@/context/AuthFormContext'
import toast from 'react-hot-toast'

export default function Page() {
  const [orders, setOrders] = useState([])
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  
  // Photo proof modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [proofPhoto, setProofPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [notes, setNotes] = useState('');
  const [completing, setCompleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
 const{logout}= useUserAuth()
  const getAssignedOrdersToDelivery = async () => {
    const res = api.get('my-orders').then(res => {
      setOrders(res.data.orders)
      console.log(res.data.orders)
    }).catch(err => console.log(err))
  }

  useEffect(() => {
    getAssignedOrdersToDelivery()
  }, [])

  // Handler for opening the modal with order details
  const handleViewOrderDetails = (order: any) => {
    setSelectedOrderDetails(order);
    setIsDetailsModalOpen(true);
  };

  // Handle complete order button click
  const handleCompleteOrder = (order: any) => {
    setSelectedOrder(order);
    setShowCompleteModal(true);
  };

  // Handle photo selection
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setProofPhoto(file);
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  // Complete order with proof
  const completeOrderWithProof = async () => {
    if (!proofPhoto) {
      alert('Please upload a delivery proof photo');
      return;
    }

    setCompleting(true);
    try {
      const formData = new FormData();
      formData.append('proofPhoto', proofPhoto);
      formData.append('notes', notes);

      const response = await api.post(`${selectedOrder._id}/complete-with-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        toast('Order completed successfully!');
        setShowCompleteModal(false);
        resetModal();
        getAssignedOrdersToDelivery(); // Refresh orders
      }
    } catch (error: any) {
      console.error('Error completing order:', error);
      alert(error.response?.data?.message || 'Error completing order');
    } finally {
      setCompleting(false);
    }
  };

  // Reset modal state
  const resetModal = () => {
    setSelectedOrder(null);
    setProofPhoto(null);
    setPhotoPreview('');
    setNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close modal
  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    resetModal();
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'assigntocourier': 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200',
      'completed': 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200',
      'pending': 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200',
      'cancelled': 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200'
    };

    const defaultStyle = 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyles[status] || defaultStyle}`}>
        {status === 'assigntocourier' ? 'Ready for Delivery' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'userName',
      label: 'Customer',
      render: (row: any) => (
        <div className="flex items-center gap-3 py-2">
          <div className="relative">
       
      <Image
  src={row.user?.image }
  alt={row.user?.image}
  width={100}
  height={100}
  className=" max-w-[50px] rounded-full border-2 border-white shadow-md ring-2 ring-gray-100"
/>

            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{row.user?.userName}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              Customer
            </span>
          </div>
        </div>
      ),
      priority: 1,
    },
    {
      key: 'createdAt',
      label: 'Order Date',
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {new Date(row.createdAt).toLocaleDateString("en-GB", {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(row.createdAt).toLocaleTimeString("en-GB", {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ),
      sortable: true,
      priority: 3,
    },
    {
      key: 'orderDetails',
      label: 'Order Details',
      render: (row: any) => (
        <button
          onClick={() => handleViewOrderDetails(row)}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
        >
          <Package className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          View Details
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => getStatusBadge(row.status),
      priority: 4,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <div className="flex gap-2">
          {row.status === 'assigntocourier' && (
            <button
              onClick={() => handleCompleteOrder(row)}
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              Complete
            </button>
          )}
          {row.status === 'completed' && row.deliveryProof && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-50 text-green-800 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Delivered</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
                <p className="text-gray-600">Manage your assigned delivery orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">{orders.length} Orders</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={logout}>
              <LogOut/>

              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
    {orders.length === 0 ? (
      <div className="py-20 flex flex-col items-center justify-center text-gray-500">
        <Truck className="mb-4 w-12 h-12 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">No orders assigned yet</h2>
        <p className="text-sm max-w-xs text-center">
          Once orders are assigned to you, they will appear here.
        </p>
      </div>
    ) : (
      <DynamicTable 
        data={orders} 
        title="Assigned Orders" 
        columns={columns} 
        showActions={false} 
        showAddButton={false} 
        showFilter={false}
      />
    )}
  </div>
</div>

      <CourierOrderDetailsModal
        show={isDetailsModalOpen}
        order={selectedOrderDetails}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrderDetails(null);
        }}
      />

      {/* Complete Order with Photo Proof Modal */}
      {showCompleteModal && (
<Modal show={showCompleteModal} onClose={closeCompleteModal} size="md">
      <ModalHeader>
        Complete Delivery
        <button
          onClick={closeCompleteModal}
          className="ml-auto text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Order #{selectedOrder?._id?.slice(-8)}
            </h3>
            <p className="text-sm text-gray-600">
              Customer: {selectedOrder?.user?.userName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Proof Photo *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Delivery proof"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setProofPhoto(null);
                      setPhotoPreview("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Take a photo of the delivered order
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center gap-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the delivery..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              color="gray"
              onClick={closeCompleteModal}
              disabled={completing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              color="success"
              onClick={completeOrderWithProof}
              disabled={!photoPreview || completing}
              className="flex-1 flex items-center justify-center gap-2 py-2"
            >
              {completing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Delivery
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
      )}
    </div>
  )
}