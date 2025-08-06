import React from "react";
import { X } from "lucide-react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from "flowbite-react";

interface ProofOfDeliveryModalProps {
  show: boolean;
  onClose: () => void;
  orderDetails: {
    orderId: string;
    deliveryProof?: {
      photoUrl?: string;
      photoPath?: string;
      uploadedAt?: string;
      notes?: string;
      completedBy?: string;
    };
    collectedAt?: string;
    completedAt?: string;
    courier?: string;
    statusHistory?: Array<{
      status: string;
      timestamp: string;
      updatedBy: string;
      notes?: string;
    }>;
  } | null;
}

export default function ProofOfDeliveryModal({
  show,
  onClose,
  orderDetails,
}: ProofOfDeliveryModalProps) {
  if (!orderDetails) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Determine if order is completed or just collected
  const isCompleted = orderDetails.completedAt && orderDetails.statusHistory?.some(h => h.status === 'completed');
  const isCollected = orderDetails.collectedAt && orderDetails.statusHistory?.some(h => h.status === 'collected');

  // Get the current status for display
  const getCurrentStatus = () => {
    if (isCompleted) return 'completed';
    if (isCollected) return 'collected';
    return 'unknown';
  };

  const currentStatus = getCurrentStatus();

  return (
    <Modal show={show} onClose={onClose} dismissible size="2xl">
      <ModalHeader>
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentStatus === 'completed' ? 'Proof of Delivery' : 'Collection Proof'} - Order #{orderDetails.orderId.slice(-8)}
          </h3>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-6">
        {/* Proof of Delivery Photo */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {currentStatus === 'completed' ? 'Proof of Delivery Photo' : 'Collection Proof Photo'}
          </h4>
          {orderDetails.deliveryProof?.photoUrl ? (
            <div className="border w-1/2 mx-auto border-gray-200 rounded-lg overflow-hidden">
              <img
                src={orderDetails.deliveryProof.photoUrl}
                alt={currentStatus === 'completed' ? 'Proof of Delivery' : 'Collection Proof'}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/api/placeholder/400/300";
                }}
              />
              {/* Delivery Notes */}
              {orderDetails.deliveryProof.notes && (
                <div className="p-3  border-t">
                  <p className="text-sm font-bold text-gray-600 ">
                    <span className="font-bold">Estimated Weight: </span>
                    {orderDetails.deliveryProof.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg
                  className="mx-auto h-12 w-12"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-gray-500">
                No {currentStatus === 'completed' ? 'proof of delivery' : 'collection proof'} photo available
              </p>
            </div>
          )}
        </div>

        {/* Delivery Details */}
        <div className={`grid grid-cols-1 ${isCompleted ? 'md:grid-cols-2' : ''} gap-6`}>
          {/* Collection Details - Always show */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">
              Collection Details
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Collected At
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {formatDate(orderDetails.collectedAt || "")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Collected By (Courier)
              </label>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-900">
                  {orderDetails.courier || "Unknown Courier"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Courier ID: {orderDetails.courier || "N/A"}
                </p>
                {/* Show collection notes from status history */}
                {orderDetails.statusHistory?.find(h => h.status === 'collected')?.notes && (
                  <p className="text-xs text-gray-600 mt-1">
                    Notes: {orderDetails.statusHistory.find(h => h.status === 'collected')?.notes}
                  </p>
                )}
              </div>
            </div>

            {orderDetails.deliveryProof?.uploadedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Proof Uploaded At
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {formatDate(orderDetails.deliveryProof.uploadedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Completion Details - Only show if completed */}
          {isCompleted && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 border-b pb-2">
                Completion Details
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Completed At
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {formatDate(orderDetails.completedAt || "")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Completed By
                </label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    {orderDetails.statusHistory?.find(h => h.status === 'completed')?.updatedBy === 'admin' 
                      ? 'System Admin' 
                      : orderDetails.statusHistory?.find(h => h.status === 'completed')?.updatedBy || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated By: {orderDetails.statusHistory?.find(h => h.status === 'completed')?.updatedBy || "N/A"}
                  </p>
                </div>
              </div>

              {orderDetails.deliveryProof?.completedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Proof Submitted By
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500">
                      Courier ID: {orderDetails.deliveryProof.completedBy}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex justify-center pt-4 border-t">
          {isCompleted ? (
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Order Completed Successfully
            </span>
          ) : (
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
              Order Collected - Awaiting Completion
            </span>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
