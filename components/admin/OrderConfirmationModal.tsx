import React, { useState } from 'react';

interface OrderConfirmationModalProps {
  show: boolean;
  order: any;
  onConfirm: (orderId: string, adminNotes: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function OrderConfirmationModal({
  show,
  order,
  onConfirm,
  onClose,
  isLoading = false
}: OrderConfirmationModalProps) {
  const [adminNotes, setAdminNotes] = useState('');

  if (!show || !order) return null;

  const handleConfirm = () => {
    onConfirm(order._id, adminNotes);
    setAdminNotes(''); // Reset notes
  };

  const handleClose = () => {
    setAdminNotes(''); // Reset notes
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-green-600">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold">Confirm Order</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Order Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Order ID:</span>
                <p className="text-gray-800">{order._id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <p className="text-gray-800">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Customer:</span>
                <p className="text-gray-800">{order.user?.userName || 'Unknown'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Items:</span>
                <p className="text-gray-800">{order.items?.length || 0} items</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Pickup Address</h4>
            <div className="text-sm text-gray-700">
              <p>{order.address?.building}, {order.address?.street}</p>
              <p>{order.address?.area}, {order.address?.city}</p>
              {order.address?.floor && <p>Floor: {order.address.floor}</p>}
              {order.address?.apartment && <p>Apartment: {order.address.apartment}</p>}
              {order.address?.landmark && <p>Landmark: {order.address.landmark}</p>}
            </div>
          </div>

          {/* Safety Reports */}
          {order.safetyReports && order.safetyReports.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Safety Reports ({order.safetyReports.length})
              </h4>
              <div className="space-y-2">
                {order.safetyReports.map((report: any, index: number) => (
                  <div key={index} className="bg-white rounded p-3 border border-amber-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-amber-800">{report.type}</span>
                      <span className="text-xs text-amber-600">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700">{report.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancellation Info */}
          {order.cancellationReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Order Cancelled
              </h4>
              <div className="text-sm text-red-700">
                <p><span className="font-medium">Reason:</span> {order.cancellationReason}</p>
                {order.cancelledAt && (
                  <p><span className="font-medium">Cancelled on:</span> {new Date(order.cancelledAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes about this order confirmation..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirming...
              </div>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 