import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import Image from "next/image";
import React, { useState } from "react";
import {
  FileText,
  Car,
  Shield,
  User,
  CreditCard,
  Hash,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DeliveryAttachments({ show, onclose, attachments }) {
  const { t } = useLanguage();

  const [expandedSections, setExpandedSections] = useState({
    images: false,
    info: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const imageItems = [
    {
      title: t("deliveryAttachments.images.deliveryPhoto.title"),
      image: attachments?.deliveryImage,
      icon: <User className="w-4 h-4" />,
      description: t("deliveryAttachments.images.deliveryPhoto.description"),
    },
    {
      title: t("deliveryAttachments.images.criminalRecord.title"),
      image: attachments?.criminalRecord,
      icon: <Shield className="w-4 h-4" />,
      description: t("deliveryAttachments.images.criminalRecord.description"),
    },
    {
      title: t("deliveryAttachments.images.vehicleImage.title"),
      image: attachments?.vehicleImage,
      icon: <Car className="w-4 h-4" />,
      description: t("deliveryAttachments.images.vehicleImage.description"),
    },
  ];

  const infoItems = [
    {
      label: t("deliveryAttachments.info.licenseNumber"),
      value: attachments?.licenseNumber,
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      label: t("deliveryAttachments.info.nationalId"),
      value: attachments?.nationalId,
      icon: <Hash className="w-4 h-4" />,
    },
    {
      label: t("deliveryAttachments.info.vehicleType"),
      value: attachments?.vehicleType,
      icon: <Car className="w-4 h-4" />,
    },
  ];

  return (
    <Modal
      dismissible
      show={show}
      onClose={onclose}
      size="2xl"
      className="backdrop-blur-sm"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
        <div className="flex items-center gap-3 flex-1 pr-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("deliveryAttachments.title")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("deliveryAttachments.subtitle")}
            </p>
          </div>
        </div>

        <button
          onClick={onclose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 flex-shrink-0"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ModalBody className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Images Accordion Section */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection("images")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-start">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t("deliveryAttachments.sections.verificationImages.title")}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t(
                      "deliveryAttachments.sections.verificationImages.description"
                    )}
                  </p>
                </div>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {expandedSections.images ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </button>

            <div
              className={`transition-all duration-300 ease-in-out ${
                expandedSections.images
                  ? "max-h-[400px] opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="px-6 pb-6 overflow-y-auto max-h-[350px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageItems.map((item, index) => (
                    <div
                      key={index}
                      className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md shadow-sm"
                    >
                      {/* Header with icon and title */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
                            {item.title}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Compact image container */}
                      {item.image ? (
                        <div className="relative w-full h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 500px) 100vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 rounded-lg"></div>
                        </div>
                      ) : (
                        <div className="w-full h-20 rounded-lg bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t("deliveryAttachments.noImage")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Information Accordion Section */}
          <div>
            <button
              onClick={() => toggleSection("info")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-start">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t("deliveryAttachments.sections.personalInfo.title")}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("deliveryAttachments.sections.personalInfo.description")}
                  </p>
                </div>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {expandedSections.info ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </button>

            <div
              className={`transition-all duration-300 ease-in-out ${
                expandedSections.info
                  ? "max-h-[400px] opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="px-6 pb-6 overflow-y-auto max-h-[350px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {infoItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-gray-500 dark:text-gray-400">
                          {item.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium break-all">
                        {item.value || t("deliveryAttachments.notProvided")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
