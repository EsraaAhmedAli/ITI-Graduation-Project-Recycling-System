"use client";

import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import Image from "next/image";
import React from "react";

interface Props {
  show: boolean;
  onClose: () => void;
  order: any;
}

export default function CourierOrderDetailsModal({
  show,
  onClose,
  order,
}: Props) {
  if (!order) return null;

  const { user, address, items, createdAt } = order;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal show={show} onClose={onClose} size="4xl" dismissible>
      <ModalHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <p className="text-sm text-gray-600">
                Complete order information
              </p>
            </div>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="p-0">
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Customer Information
                </h3>
              </div>

              <div className="flex items-start gap-4">
                {user?.imageUrl && (
                  <div className="flex-shrink-0">
                    <Image
                      src={user.imageUrl}
                      alt="Customer"
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-4 border-green-100"
                    />
                  </div>
                )}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">
                        {user?.userName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
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
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">
                        {user?.phoneNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Delivery Address
                </h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                        City:
                      </span>
                      <span className="text-gray-900">{address?.city}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                        Area:
                      </span>
                      <span className="text-gray-900">{address?.area}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                        Street:
                      </span>
                      <span className="text-gray-900">{address?.street}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[70px]">
                        Building:
                      </span>
                      <span className="text-gray-900">{address?.building}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[70px]">
                        Floor:
                      </span>
                      <span className="text-gray-900">{address?.floor}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[70px]">
                        Apartment:
                      </span>
                      <span className="text-gray-900">
                        {address?.apartment}
                      </span>
                    </div>
                  </div>
                </div>
                {address?.landmark && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">
                        Landmark:
                      </span>
                      <span className="text-gray-900">{address.landmark}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Items to Collect ({items?.length || 0})
                </h3>
              </div>

              <div className="space-y-3">
                {items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.itemName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0H4m16 0l-2-2m-14 2l2-2"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 capitalize mb-3">
                          {item.itemName}
                        </h4>

                        <div className="flex flex-wrap gap-2 text-sm">
                          {/* Quantity */}
                          <div className="flex items-center bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
                            <svg
                              className="w-4 h-4 mr-1.5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                              />
                            </svg>
                            <span className="text-blue-800 font-semibold">
                              Qty: {item.quantity}
                            </span>
                          </div>

                          {/* Unit */}
                          <div className="flex items-center bg-green-100 px-3 py-1.5 rounded-full border border-green-200">
                            <svg
                              className="w-4 h-4 mr-1.5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1-3-1"
                              />
                            </svg>
                            <span className="text-green-800 font-semibold">
                              {item.measurement_unit === 1 ? "KG" : "Piece"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {(!items || items.length === 0) && (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0H4m16 0l-2-2m-14 2l2-2"
                    />
                  </svg>
                  <p className="text-gray-500 font-medium">
                    No items found in this order
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
