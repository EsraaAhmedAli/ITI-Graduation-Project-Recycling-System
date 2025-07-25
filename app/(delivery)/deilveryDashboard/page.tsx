'use client'
import CourierOrderDetailsModal from '@/components/common/showUserModal'
import DynamicTable from '@/components/shared/dashboardTable'
import api from '@/lib/axios'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import { Camera, CheckCircle, Upload, X } from 'lucide-react'
import { Modal, ModalBody, ModalHeader } from 'flowbite-react'
import Button from '@/components/common/Button'

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
        alert('Order completed successfully!');
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

  const columns = [
    {
      key: 'userName',
      label: 'User',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Image
            src={row.user?.imageUrl || '/default-avatar.png'}
            alt={row.user?.userName}
            width={32}
            height={32}
            className="rounded-full border border-green-200"
          />
          <span>{row.user?.userName}</span>
        </div>
      ),
      priority: 1,
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (row: any) =>
        new Date(row.createdAt).toLocaleDateString("en-GB", {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      sortable: true,
      priority: 3,
    },
    {
      key: 'orderDetails',
      label: 'Order Details',
      render: (row: any) => (
        <button
          onClick={() => handleViewOrderDetails(row)}
          className="text-blue-600 hover:underline"
        >
          View
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      render: (row: any) => row.status,
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
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </button>
          )}
          {row.status === 'completed' && row.deliveryProof && (
            <span className="text-green-600 text-sm flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Delivered
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DynamicTable 
        data={orders} 
        title='assigned orders' 
        columns={columns} 
        showActions={false} 
        showAddButton={false} 
        showFilter={false}
      />

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
              className="flex-1 flex items-center justify-center gap-2"
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
    </>
  )
}