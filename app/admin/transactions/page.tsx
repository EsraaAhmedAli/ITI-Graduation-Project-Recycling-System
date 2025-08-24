"use client";
import React, { useState, useMemo, JSX } from "react";
import DynamicTable from "@/components/shared/dashboardTable";
import {
  usePayments,
  PaymentData,
  usePrefetchPayments,
} from "@/hooks/useGetPayment";
import {
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  X,
  Calendar,
  DollarSign,
  Globe,
  Mail,
  Check,
} from "lucide-react";
import { TablePagination } from "@/components/tablePagination/tablePagination";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import RefundModal from "@/components/shared/refundModal";
import { useLanguage } from "@/context/LanguageContext";
import TableSkeleton from "@/components/shared/tableSkeleton";

// Toast notification types
interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface PaymentFilters {
  page: number;
  limit: number;
  status: string;
  startDate: string;
  endDate: string;
  search: string;
  currency: string;
  country: string;
  refunded: string;
  disputed: string;
}

const Transactions: React.FC = () => {
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 5,
    status: "",
    startDate: "",
    endDate: "",
    search: "",
    currency: "",
    country: "",
    refunded: "",
    disputed: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<PaymentFilters>(filters);
  const [refundModal, setRefundModal] = useState<{
    isOpen: boolean;
    payment: PaymentData | null;
  }>({
    isOpen: false,
    payment: null,
  });
  
  // Toast state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const {
    payments,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    refundPayment,
    isRefunding,
    refundError,
    isFetching,
  } = usePayments(filters);

  const prefetchPayments = usePrefetchPayments();

  // Toast utilities
  const addToast = (toast: Omit<ToastNotification, 'id'>): void => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastNotification = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  };

  const removeToast = (id: string): void => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Helper function to format amount (Stripe amounts are in cents)
  const formatAmount = (amount: number, currency: string = "egp"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Helper function to format date
  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
const{t}=useLanguage()
  // Helper function to get payment status
  const getPaymentStatus = (payment: PaymentData): string => {
    if (payment.refunded) return "refunded";
    if (payment.disputed) return "disputed";
    if (payment.failure_code) return "failed";
    if (payment.amount_captured === payment.amount) return "succeeded";
    if (payment.amount_captured > 0) return "partially_captured";
    return payment.status || "pending";
  };

  // Helper function to render status with appropriate styling
  const renderStatus = (payment: PaymentData): JSX.Element => {
    const status = getPaymentStatus(payment);
    const statusConfig = {
      succeeded: {
        icon: CheckCircle,
        color: "text-green-600 bg-green-100",
        label: "Succeeded",
      },
      pending: {
        icon: Clock,
        color: "text-yellow-600 bg-yellow-100",
        label: "Pending",
      },
      failed: {
        icon: XCircle,
        color: "text-red-600 bg-red-100",
        label: "Failed",
      },
      refunded: {
        icon: AlertCircle,
        color: "text-orange-600 bg-orange-100",
        label: "Refunded",
      },
      disputed: {
        icon: AlertCircle,
        color: "text-purple-600 bg-purple-100",
        label: "Disputed",
      },
      partially_captured: {
        icon: Clock,
        color: "text-blue-600 bg-blue-100",
        label: "Partial",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (payment: PaymentData): void => {
    console.log("View payment details:", payment);
    // You can implement a modal or navigation to detailed view here
  };

  const handleRefund = (payment: PaymentData): void => {
    console.log("=== REFUND DEBUG ===");
    console.log("Full payment object:", payment);
    console.log("Payment ID:", payment.id);
    console.log("Payment ID type:", typeof payment.id);
    console.log("Payment ID starts with:", payment.id.substring(0, 3));
    console.log("====================");

    // Open refund modal
    setRefundModal({
      isOpen: true,
      payment: payment,
    });
  };

  const handleRefundConfirm = async (
    paymentId: string,
    amount: number,
    reason: string,
    customerEmail?: string
  ): Promise<void> => {
    try {
      console.log("=== REFUND CONFIRMATION DEBUG ===");
      console.log("Payment ID:", paymentId);
      console.log("Amount (in cents):", amount);
      console.log("Reason:", reason);
      console.log("Customer Email:", customerEmail);
      console.log("================================");

      const result = await refundPayment({
        paymentId,
        amount,
        reason,
        customerEmail,
      });

      // Close modal
      setRefundModal({ isOpen: false, payment: null });

      // Show success toast
      const refundType = refundModal.payment && amount < (refundModal.payment.amount - refundModal.payment.amount_refunded) 
        ? 'partial' : 'full';
        
      addToast({
        type: 'success',
        title: `${refundType === 'partial' ? 'Partial' : 'Full'} Refund Processed`,
        message: `${formatAmount(amount, refundModal.payment?.currency)} refunded successfully. Email notifications have been sent.`,
        duration: 6000,
      });

      // Show additional toast for email notification status
      if (customerEmail || refundModal.payment?.billing_details?.email) {
        setTimeout(() => {
          addToast({
            type: 'info',
            title: 'Email Notifications Sent',
            message: `Refund confirmation emails sent to customer${customerEmail ? ` (${customerEmail})` : ''} and admin.`,
            duration: 4000,
          });
        }, 1000);
      } else {
        setTimeout(() => {
          addToast({
            type: 'info',
            title: 'Admin Notification Sent',
            message: 'Refund notification sent to admin. Customer email not available.',
            duration: 4000,
          });
        }, 1000);
      }

      // Refresh the payments list
      refetch();

    } catch (error: any) {
      console.error("Refund confirmation error:", error);
      
      // Close modal
      setRefundModal({ isOpen: false, payment: null });
      
      // Show error toast
      addToast({
        type: 'error',
        title: 'Refund Failed',
        message: error.message || 'Failed to process refund. Please try again.',
        duration: 6000,
      });
    }
  };

  const handleRefundModalClose = (): void => {
    setRefundModal({ isOpen: false, payment: null });
  };

  const handleFilterChange = (
    key: keyof PaymentFilters,
    value: string | number
  ): void => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = (): void => {
    setFilters({ ...tempFilters, page: 1 }); // Reset to first page when applying filters
    setShowFilters(false);
  };

  const clearFilters = (): void => {
    const resetFilters = {
      page: 1,
      limit: filters.limit, // Keep the current page size
      status: "",
      startDate: "",
      endDate: "",
      search: "",
      currency: "",
      country: "",
      refunded: "",
      disputed: "",
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setShowFilters(false);
  };

  const cancelFilters = (): void => {
    setTempFilters(filters); // Reset temp filters to current applied filters
    setShowFilters(false);
  };

  // Handle pagination
  const handlePageChange = (newPage: number): void => {
    setFilters((prev) => ({ ...prev, page: newPage }));

    // Prefetch next page
    if (newPage < pagination.totalPages) {
      prefetchPayments({ ...filters, page: newPage + 1 });
    }
  };

  // Quick search from table header
  const handleQuickSearch = (searchTerm: string): void => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
    setTempFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) => key !== "page" && key !== "limit" && value !== ""
    ).length;
  }, [filters]);

  // Generate active filter chips
  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.search)
      chips.push({
        key: "search",
        label: `Search: ${filters.search}`,
        value: filters.search,
      });
    if (filters.status)
      chips.push({
        key: "status",
        label: `Status: ${filters.status}`,
        value: filters.status,
      });
    if (filters.currency)
      chips.push({
        key: "currency",
        label: `Currency: ${filters.currency.toUpperCase()}`,
        value: filters.currency,
      });
    if (filters.country)
      chips.push({
        key: "country",
        label: `Country: ${filters.country}`,
        value: filters.country,
      });
    if (filters.startDate)
      chips.push({
        key: "startDate",
        label: `From: ${filters.startDate}`,
        value: filters.startDate,
      });
    if (filters.endDate)
      chips.push({
        key: "endDate",
        label: `To: ${filters.endDate}`,
        value: filters.endDate,
      });
    return chips;
  }, [filters]);

  const removeFilter = (filterKey: string): void => {
    const newFilters = { ...filters, [filterKey]: "", page: 1 };
    setFilters(newFilters);
    setTempFilters(newFilters);
  };

  // Define table columns with proper typing
  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "Transaction ID",
        sortable: true,
        priority: 1,
        render: (payment: PaymentData) => (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span className="font-mono text-sm">{payment.id.slice(-8)}</span>
          </div>
        ),
      },
      {
        key: "email",
        label: "Customer Email",
        sortable: true,
        priority: 2,
        render: (payment: PaymentData) => (
          <div className="max-w-xs">
            <div className="text-sm font-medium text-gray-900 truncate">
              {payment.billing_details?.email || "N/A"}
            </div>
            {payment.billing_details?.name && (
              <div className="text-xs text-gray-500 truncate">
                {payment.billing_details.name}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        sortable: true,
        type: "price" as const,
        priority: 3,
        render: (payment: PaymentData) => {
          const baseAmount = payment.amount / 100;
          return (
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {baseAmount} {payment?.currency?.toUpperCase()}
              </div>
              {payment.amount_refunded > 0 && (
                <div className="text-xs text-red-600">
                  -{formatAmount(payment.amount_refunded, payment.currency)}{" "}
                  refunded
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        type: "status" as const,
        hideOnMobile: false,
        priority: 4,
        render: (payment: PaymentData) => renderStatus(payment),
      },
      {
        key: "created",
        label: "Date",
        sortable: true,
        hideOnMobile: true,
        render: (payment: PaymentData) => (
          <div className="text-sm text-gray-600">
            {formatDate(payment.created)}
          </div>
        ),
      },
    ],
    []
  );

  // Toast component
  const ToastNotification: React.FC<{ toast: ToastNotification }> = ({ toast }) => {
    const icons = {
      success: Check,
      error: XCircle,
      info: Mail,
    };
    
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };
    
    const Icon = icons[toast.type];
    
    return (
      <div className={`flex items-start p-4 mb-3 rounded-lg border ${colors[toast.type]} shadow-lg max-w-md`}>
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5 mt-0.5" />
        </div>
        <div className="ml-3 flex-1">
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          <p className="text-xs mt-1 opacity-90">{toast.message}</p>
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Loading state
  if (isLoading && payments.length === 0) {
    return<TableSkeleton rows={5} columns={columns.length} showActions={true} />;
  }

  // Error state
  if (isError && error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span>{error.message}</span>
          <button
            onClick={() => refetch()}
            className="ml-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Refund error notification
  if (refundError) {
    console.error("Refund error:", refundError);
  }

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} />
        ))}
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Volume</p>
              <p className="text-3xl font-bold text-green-600">
                {formatAmount(stats.totalAmount)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                {formatAmount(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-3xl font-bold text-green-600">{stats.successRate}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div> */}

      {/* Active Filters Chips */}
      {activeFilterChips.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-green-100 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              Active filters:
            </span>
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {chip.label}
                <button
                  onClick={() => removeFilter(chip.key)}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-600 hover:text-gray-800 underline">
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-green-100">
        <DynamicTable<PaymentData>
          data={payments}
          columns={columns}
          title="transactions"
          itemsPerPage={payments.length}
          showActions={true}
          showSearch={true}
          showFilter={true} // Changed to true to show your custom filter
          showAddButton={false}
          onViewDetails={handleViewDetails}
          onEdit={handleRefund}
          // Add these new props for your custom filter logic
          filters={filters}
          setFilters={setFilters}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
          refetch={refetch}
          isFetching={isFetching}
          searchTerm={filters.search}
          onSearchChange={handleQuickSearch}
        />

        {/* NEW: Custom TablePagination component */}
        <TablePagination
          isFetching={isFetching}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          startIndex={(pagination.page - 1) * pagination.limit}
          endIndex={Math.min(
            pagination.page * pagination.limit,
            pagination.total
          )}
          totalItems={pagination.total}
        />
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <Modal
            show={showFilters}
            dismissible
            onClose={() => setShowFilters((pre) => !pre)}>
            {/* Modal Header */}
            <ModalHeader className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Filter Transactions
              </h2>
            </ModalHeader>

            {/* Modal Body */}
            <ModalBody className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-2" />
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Email, ID, name, or description..."
                    value={tempFilters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Status
                  </label>
                  <select
                    value={tempFilters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="">All Status</option>
                    <option value="succeeded">Succeeded</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Currency
                  </label>
                  <select
                    value={tempFilters.currency}
                    onChange={(e) =>
                      handleFilterChange("currency", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="">All Currencies</option>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                    <option value="egp">EGP</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={tempFilters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={tempFilters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Country
                  </label>
                  <select
                    value={tempFilters.country}
                    onChange={(e) =>
                      handleFilterChange("country", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="">All Countries</option>
                    <option value="US">United States</option>
                    <option value="EG">Egypt</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>
              </div>
            </ModalBody>

            {/* Modal Footer */}
            <ModalFooter className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Clear All Filters
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={cancelFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Apply Filters
                </button>
              </div>
            </ModalFooter>
          </Modal>
        </div>
      )}
      
      {/* Enhanced Refund Modal */}
      <RefundModal
        isOpen={refundModal.isOpen}
        payment={refundModal.payment}
        
        isRefunding={isRefunding}
        onClose={handleRefundModalClose}
        onConfirm={handleRefundConfirm}
      />


    </div>
  );
};

export default Transactions;