import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface Driver {
  _id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleInfo: {
    type: string;
    model?: string;
    plateNumber?: string;
    color?: string;
  };
  rating: number;
  status: string;
}

interface Order {
  _id: string;
  user?: {
    userName?: string;
  };
  address?: {
    building?: string;
    street?: string;
  };
  status?: string;
}

interface DriverAssignmentModalProps {
  show: boolean;
  order: Order;
  onAssign: (orderId: string, driverId: string, assignmentNotes: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function DriverAssignmentModal({
  show,
  order,
  onAssign,
  onClose,
  isLoading = false
}: DriverAssignmentModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  useEffect(() => {
    if (show) {
      fetchAvailableDrivers();
    }
  }, [show]);

  const fetchAvailableDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const response = await api.get('/admin/drivers?status=available');
      setDrivers(response.data.data.drivers || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  if (!show || !order) return null;

  const handleAssign = () => {
    if (!selectedDriverId) return;
    onAssign(order._id, selectedDriverId, assignmentNotes);
    setSelectedDriverId('');
    setAssignmentNotes('');
  };

  const handleClose = () => {
    setSelectedDriverId('');
    setAssignmentNotes('');
    onClose();
  };

  const selectedDriver = drivers.find(driver => driver._id === selectedDriverId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-blue-600">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold">Assign Driver</h3>
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

        {/* Order Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Order Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Order ID:</span>
              <p className="text-gray-800">{order._id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Customer:</span>
              <p className="text-gray-800">{order.user?.userName || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Address:</span>
              <p className="text-gray-800">{order.address?.building}, {order.address?.street}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Status:</span>
              <p className="text-gray-800">{order.status}</p>
            </div>
          </div>
        </div>

        {/* Driver Selection */}
        <div className="space-y-4">
          <div>
            <label htmlFor="driverSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Select Driver
            </label>
            {loadingDrivers ? (
              <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading drivers...</span>
              </div>
            ) : drivers.length === 0 ? (
              <div className="p-4 border border-gray-300 rounded-lg text-center text-gray-600">
                No available drivers found
              </div>
            ) : (
              <select
                id="driverSelect"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a driver...</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} - {driver.vehicleInfo?.type} ({driver.rating}⭐)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Driver Details */}
          {selectedDriver && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">Driver Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-600">Name:</span>
                  <p className="text-blue-800">{selectedDriver.name}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-600">Phone:</span>
                  <p className="text-blue-800">{selectedDriver.phone}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-600">License:</span>
                  <p className="text-blue-800">{selectedDriver.licenseNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-600">Rating:</span>
                  <p className="text-blue-800">{selectedDriver.rating} ⭐</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-blue-600">Vehicle:</span>
                  <p className="text-blue-800">
                    {selectedDriver.vehicleInfo?.type} {selectedDriver.vehicleInfo?.model}
                    {selectedDriver.vehicleInfo?.plateNumber && ` - ${selectedDriver.vehicleInfo.plateNumber}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Notes */}
          <div>
            <label htmlFor="assignmentNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Notes (Optional)
            </label>
            <textarea
              id="assignmentNotes"
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="Add any notes about this driver assignment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
            onClick={handleAssign}
            disabled={isLoading || !selectedDriverId}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Assigning...
              </div>
            ) : (
              'Assign Driver'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 