// Enhanced version of your delivery applications page with optimized column sizing
"use client";
import React, { useState } from "react";
import api from "@/lib/axios";
import Button from "@/components/common/Button";
import DynamicTable from "@/components/shared/dashboardTable";
import DeliveryAttachments from "@/components/shared/DeliveryAttachements";
import { toast } from "react-hot-toast";
import { Modal, ModalBody, ModalHeader, TextInput } from "flowbite-react";
import { Loader } from '@/components/common'
import { useQuery } from "@tanstack/react-query";
import ReviewsModal from "@/components/ratingModal";
import { useLanguage } from "@/context/LanguageContext";
import TableSkeleton from "@/components/shared/tableSkeleton";
import DeliveryTableSkeleton from "@/components/shared/deliveryTableSkeleton";

export interface DeliveryItem {
  userId: string; // unique user or courier ID
  name: string; // courier / applicant name
  currentStatus?: "pending" | "approved" | "declined" | "revoked"; // status
  attachments?: string[]; // if you open attachments
  createdAt?: string; // timestamp (optional)
  updatedAt?: string; // timestamp (optional)
  // ...add any other fields your API actually returns
}

const ActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading,
  actionType = "decline",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
  isLoading: boolean;
  actionType?: "decline" | "revoke";
}) => {
  const [reason, setReason] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onConfirm(reason);
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  const isRevoke = actionType === "revoke";

  return (
    <Modal show={isOpen} onClose={handleClose} size="sm" popup>
      <ModalHeader />
      <ModalBody className="p-4">
        <div>
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {isRevoke ? t('delivery.modal.revokeAccess') : t('delivery.modal.declineApplication')}
              </h3>
              <p className="text-sm text-gray-600">
                {isRevoke ? t('delivery.modal.revokeConfirm') : t('delivery.modal.declineConfirm')}{" "}
                <span className="font-medium">{userName}</span>
                {isRevoke ? t('delivery.modal.deliveryAccess') : t('delivery.modal.application')}?
              </p>
              {isRevoke && (
                <p className="text-xs text-orange-600 mt-1">
                  {t('delivery.modal.activeOrdersNote')}
                </p>
              )}
            </div>

            <div>
              <TextInput
                id="reason"
                placeholder={`${t('delivery.modal.reason')} ${isRevoke ? t('delivery.modal.required') : t('delivery.modal.optional')}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                sizing="sm"
                className="text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading || (isRevoke && !reason.trim())}
                className={`flex-1 ${
                  isRevoke ? "bg-orange-600" : "bg-red-600"
                }`}
              >
                {isRevoke ? t('delivery.actions.revoke') : t('delivery.actions.decline')}
              </Button>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default function Page() {
  const [activeAttachments, setActiveAttachments] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { t } = useLanguage();

  // Modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"decline" | "revoke">("decline");

  // Reviews modal state
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleApprove = async (item: any) => {
    const userId = item.userId;
    setActionLoading(userId);

    try {
      const response = await api.patch(`/delivery/approve/${userId}`);
      await refetch();

      toast.success(t('delivery.toasts.approveSuccess', { name: item.name }), {
        duration: 4000,
        position: "top-right",
      });
    } catch (error: any) {
      console.error("Error approving delivery user:", error);
      const errorMessage =
        error.response?.data?.message || t('delivery.toasts.approveError');
      toast.error(`${t('common.error')}: ${errorMessage}`, {
        duration: 5000,
        position: "top-right",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineClick = (item: any) => {
    setSelectedUser(item);
    setActionType("decline");
    setShowActionModal(true);
  };

  const handleRevokeClick = (item: any) => {
    setSelectedUser(item);
    setActionType("revoke");
    setShowActionModal(true);
  };

  const handleActionConfirm = async (reason: string) => {
    if (!selectedUser) return;

    const userId = selectedUser.userId;
    setActionLoading(userId);

    try {
      let response;
      let successMessage;

      if (actionType === "revoke") {
        response = await api.patch(`/delivery/revoke/${userId}`, {
          reason: reason || t('delivery.defaultReason.revoke'),
        });
        successMessage = t('delivery.toasts.revokeSuccess', { name: selectedUser.name });
      } else {
        response = await api.patch(`/delivery/decline/${userId}`, {
          reason: reason || undefined,
        });
        successMessage = t('delivery.toasts.declineSuccess', { name: selectedUser.name });
      }

      await refetch();
      toast.success(successMessage, {
        duration: 4000,
        position: "top-right",
      });

      if (actionType === "revoke" && response.data.activeOrdersCount > 0) {
        toast.error(
          t('delivery.toasts.activeOrdersWarning', { count: response.data.activeOrdersCount }),
          {
            duration: 6000,
            position: "top-right",
          }
        );
      }

      setShowActionModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error(`Error ${actionType}ing delivery user:`, error);
      const errorMessage =
        error.response?.data?.message || t(`delivery.toasts.${actionType}Error`);
      toast.error(`${t('common.error')}: ${errorMessage}`, {
        duration: 5000,
        position: "top-right",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleActionCancel = () => {
    setShowActionModal(false);
    setSelectedUser(null);
  };

  const fetchDeliveryAttachments = async () => {
    const res = await api.get("/delivery-attachments");
    return res.data.data;
  };

  const {
    data: deliveryData = [],
    isLoading: loading,
    refetch,
  } = useQuery<DeliveryItem[]>({
    queryKey: ["delivery-attachments"],
    queryFn: fetchDeliveryAttachments,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 2000,
  });

  // OPTIMIZED COLUMN CONFIGURATION TO PREVENT HORIZONTAL SCROLL
  const columns = [
    {
      key: "name",
      label: t('delivery.columns.userName'),
      sortable: true,
      priority: 1,
      minWidth: "120px",
      maxWidth: "140px", // Prevent expanding too much
    },
    {
      key: "email",
      label: t('delivery.columns.email'),
      sortable: true,
      priority: 2,
      minWidth: "150px",
      maxWidth: "200px",
      hideOnMobile: true, // Hide on mobile to save space
    },
    {
      key: "phoneNumber",
      label: t('delivery.columns.phoneNumber'),
      sortable: true,
      priority: 3,
      minWidth: "110px",
      maxWidth: "130px",
      hideOnMobile: true, // Hide on mobile
    },
    {
      key: "currentStatus",
      label: t('delivery.columns.status'),
      priority: 2, // Higher priority for mobile
      minWidth: "90px",
      maxWidth: "110px",
      render: (item: any) => {
        const status = item.currentStatus || "pending";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              status === "approved"
                ? "bg-green-100 text-green-800"
                : status === "declined"
                ? "bg-red-100 text-red-800"
                : status === "revoked"
                ? "bg-orange-100 text-orange-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {t(`delivery.status.${status}`)}
          </span>
        );
      },
    },
    {
      key: "rating",
      label: t('delivery.columns.reviewsRating'),
      minWidth: "100px",
      maxWidth: "120px",
      hideOnMobile: true, // Hide on mobile
      render: (item: any) => {
        const rating = item.rating || 0;
        const totalReviews = item.totalReviews || 0;
        const currentStatus = item.currentStatus || "pending";

        // Only show ratings for approved couriers or those who have reviews
        if (currentStatus !== "approved" && totalReviews === 0) {
          return <span className="text-gray-400 text-xs">{t('delivery.notAvailable')}</span>;
        }

        return (
          <button
            className="text-green-500 hover:text-green-700 underline text-xs whitespace-nowrap"
            onClick={() => {
              setSelectedCourier({ id: item.userId, name: item.name });
              setShowReviewsModal(true);
            }}
          >
            {t('delivery.viewRatings')}
          </button>
        );
      },
    },
    {
      key: "statusAction",
      label: t('delivery.columns.action'),
      minWidth: "120px", // Reduced from 200px
      maxWidth: "140px", // Limit maximum width
      priority: 1, // High priority for mobile
      render: (item: any) => {
        const isProcessing = actionLoading === item.userId;
        const currentStatus = item.currentStatus || "pending";

        return (
          <div className="w-full">
            <select
              defaultValue=""
              disabled={isProcessing}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "approve") handleApprove(item);
                else if (value === "decline") handleDeclineClick(item);
                else if (value === "revoke") handleRevokeClick(item);
                e.target.value = "";
              }}
              className={`border border-gray-300 rounded-md px-1 py-1 text-xs text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 w-full max-w-[130px] ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="" disabled>
                {isProcessing ? t('delivery.processing') : t('delivery.selectAction')}
              </option>

              {currentStatus !== "approved" && (
                <option value="approve">
                  {currentStatus === "declined" || currentStatus === "revoked"
                    ? t('delivery.actions.reapprove')
                    : t('delivery.actions.approve')}
                </option>
              )}

              {currentStatus !== "declined" && currentStatus !== "revoked" && (
                <option value="decline">{t('delivery.actions.decline')}</option>
              )}

              {currentStatus === "approved" && (
                <option value="revoke">{t('delivery.actions.revokeAccess')}</option>
              )}
            </select>
          </div>
        );
      },
    },
    {
      key: "canReapply",
      label: t('delivery.columns.reapplyStatus'),
      minWidth: "80px",
      maxWidth: "100px",
      hideOnMobile: true, // Hide on mobile
      render: (item: any) => {
        const currentStatus = item.currentStatus || "pending";
        const canReapply = item.canReapply;

        if (canReapply) {
          return (
            <span className="px-1 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
              {t('delivery.reapplyStatus.canReapply')}
            </span>
          );
        } else if (currentStatus === "approved") {
          return (
            <span className="px-1 py-1 rounded text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
              {t('delivery.reapplyStatus.active')}
            </span>
          );
        } else {
          return (
            <span className="px-1 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
              {t('delivery.reapplyStatus.na')}
            </span>
          );
        }
      },
    },
    {
      key: "attachments",
      label: t('delivery.columns.attachments'),
      minWidth: "100px",
      maxWidth: "120px",
      hideOnMobile: true, // Hide on mobile
      render: (item: any) => (
        <button
          className="text-green-500 hover:text-green-700 underline text-xs whitespace-nowrap"
          onClick={() => setActiveAttachments(item.attachments)}
        >
          {t('delivery.viewDocuments')}
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6">

      {loading ? (
  <DeliveryTableSkeleton 
    rows={5}
  />    ) : (
        <>
          {/* Enhanced Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm font-medium text-yellow-800">{t('delivery.status.pending')}</div>
              <div className="text-2xl font-bold text-yellow-900">
                {
                  deliveryData.filter(
                    (item) => (item.currentStatus || "pending") === "pending"
                  ).length
                }
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800">{t('delivery.status.approved')}</div>
              <div className="text-2xl font-bold text-green-900">
                {
                  deliveryData.filter(
                    (item) => item.currentStatus === "approved"
                  ).length
                }
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-medium text-red-800">{t('delivery.status.declined')}</div>
              <div className="text-2xl font-bold text-red-900">
                {
                  deliveryData.filter(
                    (item) => item.currentStatus === "declined"
                  ).length
                }
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm font-medium text-orange-800">{t('delivery.status.revoked')}</div>
              <div className="text-2xl font-bold text-orange-900">
                {
                  deliveryData.filter(
                    (item) => item.currentStatus === "revoked"
                  ).length
                }
              </div>
            </div>
          </div>

          {/* Use a responsive wrapper for the table */}
          <div className="w-full overflow-hidden">
            <DynamicTable
              title={t('delivery.tableTitle')}
              data={deliveryData}
              columns={columns}
              showAddButton={false}
              showFilter={false}
              showActions={false}
              itemsPerPage={10} // Reasonable default
            />
          </div>

          {activeAttachments && (
            <DeliveryAttachments
              show={true}
              onclose={() => setActiveAttachments(null)}
              attachments={activeAttachments}
            />
          )}

          {/* Action Modal */}
          <ActionModal
            isOpen={showActionModal}
            onClose={handleActionCancel}
            onConfirm={handleActionConfirm}
            userName={selectedUser?.name || ""}
            isLoading={actionLoading === selectedUser?.userId}
            actionType={actionType}
          />

          <ReviewsModal
            isOpen={showReviewsModal}
            onClose={() => {
              setShowReviewsModal(false);
              setSelectedCourier(null);
            }}
            courierId={selectedCourier?.id || ""}
            courierName={selectedCourier?.name || ""}
          />
        </>
      )}
    </div>
  );
}