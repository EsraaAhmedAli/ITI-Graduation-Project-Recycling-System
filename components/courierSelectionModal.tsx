"use client";

import React from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface Courier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  isApproved?:boolean
  imgUrl?: StaticImport  |string
}

interface CourierSelectionModalProps {
  show: boolean;
  couriers: Courier[];
  onSelectCourier: (courierId: string) => void;
  onClose: () => void;
}

const CourierSelectionModal: React.FC<CourierSelectionModalProps> = ({
  show,
  couriers,
  onSelectCourier,
  onClose,
}) => {
 
    
  return (
    <Modal show={show} onClose={onClose} size="2xl" dismissible={true}>
      <ModalHeader>
        <span className="text-xl font-semibold text-gray-800">Select Courier</span>
      </ModalHeader>
      <ModalBody className="max-h-[70vh] overflow-y-auto">  
        {couriers?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Couriers Available</h3>
            <p className="text-gray-600">There are currently no available couriers to assign.</p>
          </div>
        ) : (
          <div className="space-y-3">
      {couriers
  .filter(courier => courier.isApproved === true)
  .map((courier) => (
    <div
      key={courier._id}
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
      onClick={() => onSelectCourier(courier._id)}
    >
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {courier.imageUrl ? (
            <Image
              height={30}
              width={30}
              className="rounded-full object-cover"
              src={courier.imgUrl}
              alt={courier.name}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800 truncate">{courier.name}</h3>
            {courier.isAvailable !== false && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </span>
            )}
          </div>

          <div className="mt-1 space-y-1 text-sm text-gray-600">
            {courier.email && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                {courier.email}
              </div>
            )}
            {courier.phone && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {courier.phone}
              </div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
))}

          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default CourierSelectionModal;
