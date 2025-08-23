"use client";
import CourierOrderDetailsModal from "@/components/common/showUserModal";
import DynamicTable from "@/components/shared/dashboardTable";
import api from "@/lib/axios";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import {
  Camera,
  CheckCircle,
  Upload,
  X,
  Package,
  Clock,
  User,
  Truck,
  LogOut,
  Edit3,
  RotateCw,
  Settings,
} from "lucide-react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import Button from "@/components/common/Button";
import { useUserAuth } from "@/context/AuthFormContext";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import CourierProfile from "./DeliveryProfile";
import EditProfilePage from "@/app/(user)/editprofile/page";
import { useLanguage } from "@/context/LanguageContext";

export default function Page() {
  // const [orders, setOrders] = useState([])
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [userRole, setUserRole] = useState<any>(null);
  // Photo proof modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [proofPhoto, setProofPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [notes, setNotes] = useState("");
  const [completing, setCompleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New states for quantity management
  const [quantities, setQuantities] = useState<any>({});
  const [showQuantityForm, setShowQuantityForm] = useState(false);
  const [quantityNotes, setQuantityNotes] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { logout, user } = useUserAuth();
  const { t, locale,setLocale } = useLanguage();
  const dropdownRef = useRef(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await api.get("my-orders");
      return res.data.orders;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setShowPopup(false);
    };

    // Only add listener if dropdown is open
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]); // Depend on openProfile state

  // Handler for opening the modal with order details
  const handleViewOrderDetails = (order: any) => {
    setSelectedOrderDetails(order);
    setIsDetailsModalOpen(true);
  };

  // Handle complete order button click
  const handleCompleteOrder = (order: any) => {
    setSelectedOrder(order);
    setShowCompleteModal(true);
    setUserRole(order.user.role);

    // Initialize quantities with original order quantities
    if (order.user.role === "customer" && order.items) {
      const initialQuantities = {};

      order.items.forEach((item: any) => {
        console.log("Item data:", item); // Debug log to see the actual data structure

        // Use measurement_unit field to determine the correct unit (ignore the unit field as it's incorrect)
        const correctUnit =
          item.measurement_unit === 1 ? "kg" : t("common.piece");
        const isUnitMismatch = item.unit !== correctUnit;

        initialQuantities[item._id] = {
          originalQuantity: item.quantity,
          actualQuantity: item.quantity,
          name:
            item.name[locale] ||
            item.name ||
            item.productName ||
            t("common.item"),
          unit: correctUnit, // Use the correct unit based on measurement_unit
          measurement_unit: item.measurement_unit,
          hasUnitMismatch: isUnitMismatch, // Track if there was a mismatch
          originalUnit: item.unit, // Keep track of the original incorrect unit
          pointsPerUnit: item.points, // Points per single unit
          originalPoints: item.points * item.quantity, // Original total points
          currentPoints: item.points * item.quantity, // Current points (will update dynamically)
        };
      });

      console.log("Processed quantities:", initialQuantities);
      setQuantities(initialQuantities);
      setShowQuantityForm(true);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toLowerCase();
  };

  // Handle quantity change
  const handleQuantityChange = (
    itemId: string,
    value: string,
    measurementUnit: number
  ) => {
    // Allow empty string for deletion
    if (value === "") {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          actualQuantity: "",
          currentPoints: 0, // No points for empty quantity
        },
      }));
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return;

    // For pieces (measurement_unit = 2), ensure whole numbers only
    let adjustedQuantity;
    if (measurementUnit === 2) {
      adjustedQuantity = Math.max(0, Math.round(numericValue)); // Round and ensure non-negative
    } else {
      adjustedQuantity = Math.max(0, numericValue); // Just ensure non-negative for kg
    }

    setQuantities((prev) => {
      const item = prev[itemId];
      const newPoints = item.pointsPerUnit * adjustedQuantity;

      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          actualQuantity: adjustedQuantity,
          currentPoints: newPoints, // Update points based on new quantity
        },
      };
    });
  };

  // Handle photo selection
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setProofPhoto(file);
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        alert(t("courier.pleaseSelectImage"));
      }
    }
  };

  // Complete order with proof
  const completeOrderWithProof = async () => {
    if (!proofPhoto) {
      alert(t("courier.uploadProofPhoto"));
      return;
    }

    // Check if quantities have been reviewed for customer role
    if (userRole === "customer" && showQuantityForm) {
      const hasChanges = Object.values(quantities).some((item: any) => {
        const actualQty =
          item.actualQuantity === "" ? 0 : Number(item.actualQuantity);
        return item.originalQuantity !== actualQty;
      });

      if (hasChanges && !quantityNotes.trim()) {
        alert(t("courier.addQuantityNotes"));
        return;
      }

      // Validate that all quantities have values
      const hasEmptyQuantities = Object.values(quantities).some(
        (item: any) =>
          item.actualQuantity === "" ||
          item.actualQuantity === null ||
          item.actualQuantity === undefined
      );

      if (hasEmptyQuantities) {
        alert(t("courier.enterActualQuantities"));
        return;
      }
    }

    setCompleting(true);
    try {
      const formData = new FormData();
      formData.append("proofPhoto", proofPhoto);
      formData.append("notes", notes);

      // Add quantity data for customer orders
      if (userRole === "customer") {
        formData.append("updatedQuantities", JSON.stringify(quantities));
        formData.append("quantityNotes", quantityNotes);
      }

      const response = await api.post(
        `${selectedOrder._id}/complete-with-proof`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast(t("courier.orderCompletedSuccessfully"));
        setShowCompleteModal(false);
        resetModal();
        refetch();
        // getAssignedOrdersToDelivery(); // Refresh orders
      }
    } catch (error: any) {
      console.error("Error completing order:", error);
      alert(error.response?.data?.message || t("courier.errorCompletingOrder"));
    } finally {
      setCompleting(false);
    }
  };
  // Reset modal state
  const resetModal = () => {
    setSelectedOrder(null);
    setProofPhoto(null);
    setPhotoPreview("");
    setNotes("");
    setQuantities({});
    setShowQuantityForm(false);
    setQuantityNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      assigntocourier:
        "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200",
      completed:
        "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200",
      pending:
        "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200",
      cancelled:
        "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200",
    };

    const defaultStyle =
      "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200";

    const statusText =
      status === "assigntocourier"
        ? t("courier.readyForDelivery")
        : t(`courier.status.${status}`, {
            defaultValue: status.charAt(0).toUpperCase() + status.slice(1),
          });

    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          statusStyles[status] || defaultStyle
        }`}
      >
        {statusText}
      </span>
    );
  };

  const columns = [
    {
      key: "userName",
      label: t("courier.customer"),
      render: (row: any) => (
        <div className="flex items-center gap-3 py-2">
          <div className="relative">
            {row.user.image ? (
              <Image
                src={row.user.image}
                alt={row.user.userName}
                width={50}
                height={50}
                className="w-[50px] h-[50px] rounded-full border-2 border-white shadow-md ring-2 ring-gray-100 object-cover"
              />
            ) : (
              <div
                className="w-[50px] h-[50px] rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold uppercase ring-2 ring-gray-100 shadow-md"
                title={row.user.userName}
              >
                {getInitials(row.user.userName)}
              </div>
            )}

            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {row.user?.userName}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              {t(`courier.role.${row?.user?.role}`, row?.user?.role)}
            </span>
          </div>
        </div>
      ),
      priority: 1,
    },
    {
      key: "createdAt",
      label: t("courier.orderDate"),
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {new Date(row.createdAt).toLocaleDateString(
              locale === "ar" ? "ar-EG" : "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(row.createdAt).toLocaleTimeString(
              locale === "ar" ? "ar-EG" : "en-GB",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </span>
        </div>
      ),
      sortable: true,
      priority: 3,
    },
    {
      key: "orderDetails",
      label: t("courier.orderDetails"),
      render: (row: any) => (
        <button
          onClick={() => handleViewOrderDetails(row)}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
        >
          <Package className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          {t("courier.viewDetails")}
        </button>
      ),
    },
    {
      key: "status",
      label: t("courier.status.label"),
      render: (row: any) => getStatusBadge(row.status),
      priority: 4,
    },
    {
      key: "actions",
      label: t("courier.actions"),
      render: (row: any) => (
        <div className="flex gap-2">
          {row.status === "assigntocourier" && (
            <button
              onClick={() => handleCompleteOrder(row)}
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              {row.user.role == "customer"
                ? t("courier.collect")
                : t("courier.deliver")}
            </button>
          )}
          {row.status === "completed" && row.deliveryProof && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-50 text-green-800 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {t("courier.delivered")}
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];
  useEffect(() => {
    console.log("EDIT PROFILE CHANGES");
    console.log(editProfile);
  }, [editProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
  <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => {
                    setOpenProfile(false);
                    setEditProfile(false);
                    setShowPopup(false);
                  }}
                  className="text-left"
                >
                  <h1 className="text-xl sm:text-2xl font-bold truncate" style={{color:"var(--color-base-900)"}}>
                    {t("d.deliveryDashboard")}
                  </h1>
                </button>
                <p className="text-sm sm:text-base text-gray-600 truncate" >
                  {t("courier.manageAssignedOrders")}
                </p>
              </div>
            </div>

            {/* Right side - Orders count and User menu */}
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Orders count badge */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-blue-800 whitespace-nowrap">
                  {orders.length} {t("courier.orders")}
                </span>
              </div>

              {/* User Avatar Dropdown Trigger */}
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPopup(!showPopup);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                >
                  <div className="relative">
                    <Image
                      src={user?.attachments?.deliveryImage || ""}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                    {/* Online status indicator */}
                    <div className="absolute -bottom-0.5 -end-0.5 sm:-bottom-1 sm:-end-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showPopup && (
                  <div className="absolute end-0 mt-2 w-64 sm:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {/* User info section */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <Image
                            width={40}
                            height={40}
                            src={user?.attachments?.deliveryImage}
                            alt="User Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                            {user?.email || "user@example.com"}
                          </p>
                          {user?.role && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full mt-1 capitalize">
                              {user?.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          console.log("Profile clicked, closing dropdown");
                          setOpenProfile(true);
                          setShowPopup(false);
                          setEditProfile(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 sm:py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors w-full text-left"
                      >
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {t("navbar.profile")}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          console.log("Settings clicked, opening edit profile");
                          setEditProfile(true);
                          setShowPopup(false);
                          setOpenProfile(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 sm:py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors w-full text-left"
                      >
                        <Settings className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {t("navbar.settings")}
                        </span>
                      </button>

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                      <button
                        onClick={() => {
                          console.log("Logout clicked");
                          logout();
                        }}
                        className="flex items-center gap-3 px-4 py-3 sm:py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {t("navbar.signOut")}
                        </span>
                      </button>

                      {/* Language toggle - moved inside dropdown for mobile */}
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1 lg:hidden"></div>
                      
                      <div className="px-4 py-2 lg:hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Language
                          </span>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600">
                            <span
                              className={`text-xs font-medium ${
                                locale === "en"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                            >
                              EN
                            </span>
                            <button
                              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                              className="relative w-8 h-4 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              style={{
                                backgroundColor:
                                  locale === "ar" ? "#4B5563" : "#D1D5DB",
                              }}
                              title="Toggle Language"
                            >
                              <div
                                className="absolute top-0.5 left-0.5 w-3 h-3 bg-white dark:bg-gray-200 rounded-full shadow-sm transform transition-transform duration-200"
                                style={{
                                  transform:
                                    locale === "ar" ? "translateX(16px)" : "translateX(0)",
                                }}
                              />
                            </button>
                            <span
                              className={`text-xs font-medium ${
                                locale === "ar"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                            >
                              AR
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Language toggle - visible only on desktop */}
              <div className="language-toggle hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg border-gray-200 border hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <span
                  className={`text-xs font-medium ${
                    locale === "en"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  EN
                </span>
                <button
                  onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                  className="relative w-8 h-4 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{
                    backgroundColor:
                      locale === "ar" ? "#4B5563" : "#D1D5DB",
                  }}
                  title="Toggle Language"
                >
                  <div
                    className="absolute top-0.5 left-0.5 w-3 h-3 bg-white dark:bg-gray-200 rounded-full shadow-sm transform transition-transform duration-200"
                    style={{
                      transform:
                        locale === "ar" ? "translateX(16px)" : "translateX(0)",
                    }}
                  />
                </button>
                <span
                  className={`text-xs font-medium ${
                    locale === "ar"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  AR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!editProfile && !openProfile && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={`
              mb-4 w-full sm:w-auto
              flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg
              bg-gradient-to-r from-blue-600 to-blue-700
              text-white font-medium shadow-sm
              hover:from-blue-700 hover:to-blue-800 hover:shadow-md
              active:scale-95 transition-all duration-200
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
          >
            <RotateCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? t('d.refreshing') : t('d.refresh')}
          </button>

          {/* Orders table container */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {orders.length === 0 ? (
              <div className="py-12 sm:py-20 px-4 flex flex-col items-center justify-center text-gray-500">
                <Truck className="mb-4 w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-center">
                  {t("d.noAssignedOrders")}
                </h2>
                <p className="text-sm max-w-xs text-center leading-relaxed">
                  {t("d.noAssignedOrdersDesc")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <DynamicTable
                  data={orders}
                  title="Assigned Orders"
                  columns={columns}
                  showActions={false}
                  showAddButton={false}
                  showFilter={false}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <CourierOrderDetailsModal
        show={isDetailsModalOpen}
        order={selectedOrderDetails}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrderDetails(null);
        }}
      />

      {!editProfile && openProfile && (
        <CourierProfile setEdit={setEditProfile} />
      )}
      {editProfile && <EditProfilePage />}

      {/* Complete Order with Photo Proof Modal */}
      {showCompleteModal && (
        <Modal show={showCompleteModal} onClose={closeCompleteModal} size="lg" >
          <ModalHeader>{t("courier.completeDelivery")}</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2" style={{color: "var(--color-base-900)"}}>
                  {t("courier.orderNumber", {
                    id: selectedOrder?._id?.slice(-8),
                  })}
                </h3>
                <p className="text-sm "  style={{color: "var(--color-base-900)"}}>
                  {t("courier.customer")}: {selectedOrder?.user?.userName}
                </p>
              </div>
              {/* Quantity Review Form for Customer Orders */}
              {userRole === "customer" && showQuantityForm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit3 className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800" >
                      {t("courier.verifyQuantities")}
                    </h4>
                  </div>

                  {/* Items in a grid layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {Object.entries(quantities).map(
                      ([itemId, item]: [string, any]) => (
                        <div
                          key={itemId}
                          className="bg-white rounded p-3 border border-yellow-200"
                        >
                          <div className="mb-2">
                            <span className="font-medium text-gray-900 text-sm" style={{color: "var(--color-base-900)"}}>
                              {item.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({item.unit})
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1" >
                                {t("courier.original")}
                              </label>
                              <input
                                type="number"
                                value={item.originalQuantity}
                                disabled
                                className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                {t("courier.actual")} *
                              </label>
                              <input
                                type="number"
                                value={item.actualQuantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    itemId,
                                    e.target.value,
                                    item.measurement_unit
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                                step={item.measurement_unit === 2 ? "1" : "0.1"}
                                min="0"
                              />
                            </div>
                          </div>

                          {item.originalQuantity !== item.actualQuantity &&
                            item.actualQuantity !== "" && (
                              <div className="mt-2 p-1 bg-red-50 border border-red-200 rounded">
                                <span className="text-xs text-red-800 font-medium">
                                  {t("courier.difference")}:{" "}
                                  {item.measurement_unit === 2
                                    ? `${Math.round(
                                        Number(item.actualQuantity) -
                                          item.originalQuantity
                                      )} ${item.unit}`
                                    : `${(
                                        Number(item.actualQuantity) -
                                        item.originalQuantity
                                      ).toFixed(1)} ${item.unit}`}
                                </span>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Notes for quantity changes */}
                  {Object.values(quantities).some((item: any) => {
                    const actualQty =
                      item.actualQuantity === ""
                        ? 0
                        : Number(item.actualQuantity);
                    return item.originalQuantity !== actualQty;
                  }) && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t("courier.reasonForChanges")} *
                      </label>
                      <textarea
                        value={quantityNotes}
                        onChange={(e) => setQuantityNotes(e.target.value)}
                        placeholder={t("courier.explainQuantityDifferences")}
                        className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        rows={2}
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Estimated Weight Section - Compact for customer orders */}
              {userRole === "customer" && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {t("courier.estimatedWeight")} *:
                  </label>
                  <input
                    type="number"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("courier.weightPlaceholder")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
              )}

              {/* General Notes for Non-Customer Orders */}
              {userRole !== "customer" && (
                <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    {t("courier.estimatedWeight")}:
  </label>
  <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder={t("courier.orderWeight")}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
               rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
               focus:border-blue-500 
               placeholder-gray-400 dark:placeholder-gray-500
               text-gray-900 dark:text-gray-100
               bg-white dark:bg-gray-800"
    rows={3}
  />
</div>

              )}

              {/* Photo Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: "var(--color-base-900)"}}>
                  {t("courier.deliveryProofPhoto")} *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {photoPreview ? (
                    <div className="relative">
                      <Image
                        width={30}
                        height={30}
                        src={photoPreview}
                        alt={t("courier.deliveryProof")}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setProofPhoto(null);
                          setPhotoPreview("");
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        aria-label={t("courier.removePhoto")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm mb-2" style={{color: "var(--color-base-900)"}}>
                        {t("courier.takePhotoOfOrder", {
                          action:
                            userRole === "customer"
                              ? t("courier.collected")
                              : t("courier.delivered"),
                        })}
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center gap-2 mx-auto"
                      >
                        <Upload className="w-4 h-4" />
                        {t("courier.uploadPhoto")}
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={closeCompleteModal}
                  disabled={completing}
                  className="flex-1 bg-gray-400"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={completeOrderWithProof}
                  disabled={
                    !photoPreview ||
                    completing ||
                    (userRole === "customer" && !notes.trim())
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-2"
                >
                  {completing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t("courier.completing")}...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {userRole == "customer"
                        ? t("courier.markAsCollected")
                        : t("courier.markAsDelivered")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}
