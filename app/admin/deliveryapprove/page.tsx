// Enhanced version of your delivery applications page with delivery reviews
"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Button from "@/components/common/Button";
import DynamicTable from "@/components/shared/dashboardTable";
import DeliveryAttachments from "@/components/shared/DeliveryAttachements";
import { toast } from "react-hot-toast";
import { Label, Modal, ModalBody, ModalHeader, Textarea, TextInput } from "flowbite-react";
import Loader from "@/components/common/loader";
import { useQuery } from "@tanstack/react-query";
import { Star, Eye, User, Calendar, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { RatingModal } from "@/components/ratingModal";

// Rating Display Component

const RatingDisplay = ({ rating, totalReviews, size = "sm" }: {
  rating: number;
  totalReviews: number;
  size?: "sm" | "md" | "lg";
}) => {
  const starSize = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3 h-3";
  const textSize = size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";
  
  if (totalReviews === 0) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`${starSize} text-gray-300`} />
          ))}
        </div>
        <span className={`${textSize} text-gray-500 ml-1`}>No reviews</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className={`${textSize} text-gray-700 ml-1 font-medium`}>
        {rating.toFixed(1)}
      </span>
      <span className={`${textSize} text-gray-500`}>
        ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
      </span>
    </div>
  );
};

// Reviews Modal Component
const ReviewsModal = ({ 
  isOpen, 
  onClose, 
  courierId,
  courierName 
}: {
  isOpen: boolean;
  onClose: () => void;
  courierId: string;
  courierName: string;
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courierStats, setCourierStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const fetchReviews = async (pageNum = 1) => {
    if (!courierId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/reviews/courier/${courierId}?page=${pageNum}&limit=5`);
      const data = response.data;
      
      setReviews(data.reviews || []);
      setCourierStats({
        averageRating: data.courier?.averageRating || 0,
        totalReviews: data.courier?.totalReviews || 0
      });
      setPagination(data.pagination || {
        currentPage: pageNum,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && courierId) {
      fetchReviews(1);
    }
  }, [isOpen, courierId]);

  const handlePageChange = (newPage: number) => {
    fetchReviews(newPage);
  };


  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Reviews for {courierName}
            </h3>
            <RatingDisplay 
              rating={courierStats.averageRating} 
              totalReviews={courierStats.totalReviews} 
              size="md" 
            />
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="p-0">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">No reviews yet</p>
              <p className="text-sm">This courier hasn't received any reviews.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {reviews.map((review: any, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.customerName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.stars
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {review.stars} star{review.stars !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.reviewedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Order: {new Date(review.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {review.comment && (
                      <div className="pl-13">
                        <p className="text-sm text-gray-700 italic">
                          "{review.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

// Enhanced Decline/Revoke Modal Component
const ActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName, 
  isLoading,
  actionType = "decline"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
  isLoading: boolean;
  actionType?: "decline" | "revoke";
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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
                {isRevoke ? "Revoke Access" : "Decline Application"}
              </h3>
              <p className="text-sm text-gray-600">
                {isRevoke ? "Revoke" : "Decline"} <span className="font-medium">{userName}</span>'s {isRevoke ? "delivery access" : "application"}?
              </p>
              {isRevoke && (
                <p className="text-xs text-orange-600 mt-1">
                  Note: Active orders will be preserved
                </p>
              )}
            </div>

            <div>
              <TextInput
                id="reason"
                placeholder={`Reason ${isRevoke ? "(required)" : "(optional)"}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                sizing="sm"
                className="text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                isProcessing={isLoading}
                disabled={isLoading || (isRevoke && !reason.trim())}
                className={`flex-1 ${isRevoke ? "bg-orange-600" : "bg-red-600"}`}
              >
                {isRevoke ? "Revoke" : "Decline"}
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
  
  // Modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"decline" | "revoke">("decline");
  
  // Reviews modal state
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<{ id: string; name: string } | null>(null);
  const [ratingModal,setRatingModal] = useState(false)
  const handleOpenRatingModal =(selectedCourierId)=>{
setSelectedCourier(selectedCourierId);
    
    console.log('modal opend');
    setRatingModal(true)
    
  }
  const handleApprove = async (item: any) => {
    const userId = item.userId;
    setActionLoading(userId);
    
    try {
      const response = await api.patch(`/delivery/approve/${userId}`);
      await refetch();

      toast.success(`${item.name} has been approved successfully!`, {
        duration: 4000,
        position: 'top-right',
      });
      
    } catch (error: any) {
      console.error("Error approving delivery user:", error);
      const errorMessage = error.response?.data?.message || "Failed to approve user";
      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: 'top-right',
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
          reason: reason || "Access revoked by admin"
        });
        successMessage = `${selectedUser.name} has been revoked successfully!`;
      } else {
        response = await api.patch(`/delivery/decline/${userId}`, {
          reason: reason || undefined
        });
        successMessage = `${selectedUser.name} has been declined successfully!`;
      }
      
      await refetch();
      toast.success(successMessage, {
        duration: 4000,
        position: 'top-right',
      });
      
      if (actionType === "revoke" && response.data.activeOrdersCount > 0) {
        toast.error(`User has ${response.data.activeOrdersCount} active orders that will be preserved`, {
          duration: 6000,
          position: 'top-right',
        });
      }

      setShowActionModal(false);
      setSelectedUser(null);
      
    } catch (error: any) {
      console.error(`Error ${actionType}ing delivery user:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${actionType} user`;
      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: 'top-right',
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
  } = useQuery({
    queryKey: ["delivery-attachments"],
    queryFn: fetchDeliveryAttachments,
    onError: (err: any) => {
      console.error("Error fetching delivery attachments:", err);
      toast.error("Failed to fetch delivery data", {
        duration: 5000,
        position: 'top-right',
      });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 2000
  });

  const columns = [
    {
      key: "name",
      label: "User Name",
      sortable: true,
      priority: 1,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      priority: 2,
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      sortable: true,
      priority: 3,
    },
    {
      key: "rating",
      label: "Reviews & Rating",
      render: (item: any) => {
        const rating = item.rating || 0;
        const totalReviews = item.totalReviews || 0;
        const currentStatus = item.currentStatus || "pending";
        
        // Only show ratings for approved couriers or those who have reviews
        if (currentStatus !== "approved" && totalReviews === 0) {
          return (
            <span className="text-gray-400 text-sm">Not available</span>
          );
        }
        
        return (
 <>
          <div className="flex items-center gap-2">
        <button           className="text-green-500 hover:text-green-700 underline text-sm"
 onClick={()=>handleOpenRatingModal(item.userId)}>view ratings</button>
          </div>
 </>
        );
      },
    },
    {
      key: "currentStatus",
      label: "Status",
      render: (item: any) => {
        const status = item.currentStatus || "pending";
        
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "approved"
                ? "bg-green-100 text-green-800"
                : status === "declined"
                ? "bg-red-100 text-red-800"
                : status === "revoked"
                ? "bg-orange-100 text-orange-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status === "approved"
              ? "Approved"
              : status === "declined"
              ? "Declined"
              : status === "revoked"
              ? "Revoked"
              : "Pending"}
          </span>
        );
      },
    },
    {
      key: "statusAction",
      label: "Action",
      render: (item: any) => {
        const isProcessing = actionLoading === item.userId;
        const currentStatus = item.currentStatus || "pending";

        return (
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
            className={`border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="" disabled>
              {isProcessing ? "Processing..." : "Select Action"}
            </option>
            
            {currentStatus !== "approved" && (
              <option value="approve">
                {currentStatus === "declined" || currentStatus === "revoked" ? "Re-approve" : "Approve"}
              </option>
            )}
            
            {currentStatus !== "declined" && currentStatus !== "revoked" && (
              <option value="decline">
                Decline
              </option>
            )}

            {currentStatus === "approved" && (
              <option value="revoke">
                Revoke Access
              </option>
            )}
          </select>
        );
      },
    },
    {
      key: "canReapply",
      label: "Reapply Status",
      render: (item: any) => {
        const currentStatus = item.currentStatus || "pending";
        const canReapply = item.canReapply;
        
        if (canReapply) {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Can Reapply
            </span>
          );
        } else if (currentStatus === "approved") {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          );
        } else {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              N/A
            </span>
          );
        }
      },
    },
    {
      key: "createdAt",
      label: "Applied Date",
      sortable: true,
      render: (item: any) => {
        const date = new Date(item.createdAt);
        return (
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: "attachments",
      label: "Attachments",
      render: (item: any) => (
        <button
          className="text-green-500 hover:text-green-700 underline text-sm"
          onClick={() => setActiveAttachments(item.attachments)}
        >
          View Documents
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Applications</h1>
        <p className="text-gray-600 mt-1">
          Manage delivery driver applications, approvals, reviews, and access
        </p>
      </div>

      {loading ? (
        <Loader title="delivery data"/>
      ) : (
        <>
          {/* Enhanced Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm font-medium text-yellow-800">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">
                {deliveryData.filter(item => (item.currentStatus || "pending") === "pending").length}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800">Approved</div>
              <div className="text-2xl font-bold text-green-900">
                {deliveryData.filter(item => item.currentStatus === "approved").length}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-medium text-red-800">Declined</div>
              <div className="text-2xl font-bold text-red-900">
                {deliveryData.filter(item => item.currentStatus === "declined").length}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm font-medium text-orange-800">Revoked</div>
              <div className="text-2xl font-bold text-orange-900">
                {deliveryData.filter(item => item.currentStatus === "revoked").length}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800">With Reviews</div>
              <div className="text-2xl font-bold text-blue-900">
                {deliveryData.filter(item => (item.totalReviews || 0) > 0).length}
              </div>
            </div>
          </div>

          <DynamicTable
            title="Delivery Applications"
            data={deliveryData}
            columns={columns}
            showAddButton={false}
            showFilter={true}
            showActions={false}
          />

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

          {/* Reviews Modal */}
          <ReviewsModal
            isOpen={showReviewsModal}
            onClose={() => {
              setShowReviewsModal(false);
              setSelectedCourier(null);
            }}
            courierId={selectedCourier?.id || ""}
            courierName={selectedCourier?.name || ""}
          />
                    <RatingModal courierId={selectedCourier} show={ratingModal} onclose={()=>setRatingModal(false)} />

        </>
      )}
    </div>
  );
}