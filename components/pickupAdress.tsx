import React from "react";
import { MapPin, Phone, User } from "lucide-react";

export default function PickupAddressCard({ order }) {
  // Clean phone number for tel: link (remove spaces, parens, dashes)
  const formattedPhone = order?.courier?.phoneNumber
    ? order.courier.phoneNumber.replace(/[^\d+]/g, "")
    : "";

  return (
    <div>
      {/* Pickup Address Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pickup Address</h2>
            <p className="text-sm text-gray-500">Order location details</p>
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-3 mb-6">
          <div className="text-gray-800 font-medium">
            {order.address?.street}, {order.address?.building}
          </div>
          <div className="text-gray-600">
            Floor {order.address?.floor} • Apartment {order.address?.apartment}
          </div>
          <div className="text-gray-600">
            {order.address?.area}, {order.address?.city}
          </div>
          {order.address?.landmark && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <MapPin className="w-4 h-4" />
              <span>Landmark: {order.address.landmark}</span>
            </div>
          )}
        </div>

        {/* Courier Information */}
        {order.courier && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Your Delivery Hero
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order?.courier?.name}</p>
                </div>
              </div>

              <a
                href={`tel:${formattedPhone}`}
                aria-label={`Call ${order?.courier?.name}`}
                className="flex items-center gap-2 w-auto bg-gradient-to-br from-green-100 to-green-50 rounded-full px-4 py-2 hover:from-green-200 hover:to-green-100 transition-colors duration-200 cursor-pointer"
              >
                <Phone className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-semibold text-sm select-none">
                  {order?.courier?.phoneNumber}
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
