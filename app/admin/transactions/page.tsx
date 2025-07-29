'use client'
import React, { useState, useMemo, JSX } from 'react';
import DynamicTable from '@/components/shared/dashboardTable';
import { usePayments, PaymentData, usePrefetchPayments } from '@/hooks/useGetPayment';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw, 

  Filter,
  Search,
  X,
  Calendar,
  DollarSign,
  Globe
} from 'lucide-react';
import Loader from '@/components/common/loader';
import { TablePagination } from '@/components/tablePagination/tablePagination';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'flowbite-react';
import RefundModal from '@/components/shared/refundModal';

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
    limit: 25,
    status: '',
    startDate: '',
    endDate: '',
    search: '',
    currency: '',
    country: '',
    refunded: '',
    disputed: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<PaymentFilters>(filters);
 const [refundModal, setRefundModal] = useState<{
    isOpen: boolean;
    payment: PaymentData | null;
  }>({
    isOpen: false,
    payment: null
  });
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
    isPreviousData,
  } = usePayments(filters);

  const prefetchPayments = usePrefetchPayments();

  // Helper function to format amount (Stripe amounts are in cents)
  const formatAmount = (amount: number, currency: string = 'usd'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Helper function to format date
  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to get payment status
  const getPaymentStatus = (payment: PaymentData): string => {
    if (payment.refunded) return 'refunded';
    if (payment.disputed) return 'disputed';
    if (payment.failure_code) return 'failed';
    if (payment.amount_captured === payment.amount) return 'succeeded';
    if (payment.amount_captured > 0) return 'partially_captured';
    return payment.status || 'pending';
  };

  // Helper function to render status with appropriate styling
  const renderStatus = (payment: PaymentData): JSX.Element => {
    const status = getPaymentStatus(payment);
    const statusConfig = {
      succeeded: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Succeeded' },
      pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
      failed: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Failed' },
      refunded: { icon: AlertCircle, color: 'text-orange-600 bg-orange-100', label: 'Refunded' },
      disputed: { icon: AlertCircle, color: 'text-purple-600 bg-purple-100', label: 'Disputed' },
      partially_captured: { icon: Clock, color: 'text-blue-600 bg-blue-100', label: 'Partial' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  
  const handleViewDetails = (payment: PaymentData): void => {
    console.log('View payment details:', payment);
    // You can implement a modal or navigation to detailed view here
  };

  const handleRefund = (payment: PaymentData): void => {
    console.log('=== REFUND DEBUG ===');
    console.log('Full payment object:', payment);
    console.log('Payment ID:', payment.id);
    console.log('Payment ID type:', typeof payment.id);
    console.log('Payment ID starts with:', payment.id.substring(0, 3));
    console.log('====================');
    
    // Open refund modal
    setRefundModal({
      isOpen: true,
      payment: payment
    });
  };
   const handleRefundConfirm = (paymentId: string, amount: number, reason: string): void => {
    refundPayment({ 
      paymentId, 
      amount,
      reason
    });
    
    // Close modal
    setRefundModal({ isOpen: false, payment: null });
  };
  const handleRefundModalClose = (): void => {
    setRefundModal({ isOpen: false, payment: null });
  };


  const handleFilterChange = (key: keyof PaymentFilters, value: string | number): void => {
    setTempFilters(prev => ({ 
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
      status: '',
      startDate: '',
      endDate: '',
      search: '',
      currency: '',
      country: '',
      refunded: '',
      disputed: '',
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
    setFilters(prev => ({ ...prev, page: newPage }));
    
    // Prefetch next page
    if (newPage < pagination.totalPages) {
      prefetchPayments({ ...filters, page: newPage + 1 });
    }
  };

  // Quick search from table header
  const handleQuickSearch = (searchTerm: string): void => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    setTempFilters(prev => ({ ...prev, search: searchTerm }));
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'page' && key !== 'limit' && value !== ''
    ).length;
  }, [filters]);

  // Generate active filter chips
  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.search) chips.push({ key: 'search', label: `Search: ${filters.search}`, value: filters.search });
    if (filters.status) chips.push({ key: 'status', label: `Status: ${filters.status}`, value: filters.status });
    if (filters.currency) chips.push({ key: 'currency', label: `Currency: ${filters.currency.toUpperCase()}`, value: filters.currency });
    if (filters.country) chips.push({ key: 'country', label: `Country: ${filters.country}`, value: filters.country });
    if (filters.startDate) chips.push({ key: 'startDate', label: `From: ${filters.startDate}`, value: filters.startDate });
    if (filters.endDate) chips.push({ key: 'endDate', label: `To: ${filters.endDate}`, value: filters.endDate });
    return chips;
  }, [filters]);

  const removeFilter = (filterKey: string): void => {
    const newFilters = { ...filters, [filterKey]: '', page: 1 };
    setFilters(newFilters);
    setTempFilters(newFilters);
  };

  // Define table columns with proper typing
  const columns = useMemo(() => [
    {
      key: 'id',
      label: 'Transaction ID',
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
      key: 'email',
      label: 'Customer Email',
      sortable: true,
      priority: 2,
      render: (payment: PaymentData) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900 truncate">
            {payment.billing_details?.email || 'N/A'}
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
      key: 'amount',
      label: 'Amount',
      sortable: true,
      type: 'price' as const,
      priority: 3,
      render: (payment: PaymentData) => (
        <div >
          <div className="text-sm font-semibold text-gray-900">
            {formatAmount(payment.amount, payment.currency)}
          </div>
          {payment.amount_refunded > 0 && (
            <div className="text-xs text-red-600">
              -{formatAmount(payment.amount_refunded, payment.currency)} refunded
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      type: 'status' as const,
      hideOnMobile: false,
      priority: 4,
      render: (payment: PaymentData) => renderStatus(payment),
    },
    {
      key: 'created',
      label: 'Date',
      sortable: true,
      hideOnMobile: true,
      render: (payment: PaymentData) => (
        <div className="text-sm text-gray-600">
          {formatDate(payment.created)}
        </div>
      ),
    },


  ], []);

  // Loading state
  if (isLoading && payments.length === 0) {
    return (
  <Loader title='transactions'/>)
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
            className="ml-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Refund error notification
  if (refundError) {
    console.error('Refund error:', refundError);
  }

  return (
    <div className="space-y-6">
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
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {chip.label}
                <button
                  onClick={() => removeFilter(chip.key)}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
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
  showFilter={true}  // Changed to true to show your custom filter
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
    currentPage={pagination.page}
    totalPages={pagination.totalPages}
    onPageChange={handlePageChange}
    startIndex={(pagination.page - 1) * pagination.limit}
    endIndex={Math.min(pagination.page * pagination.limit, pagination.total)}
    totalItems={pagination.total}
  />
</div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <Modal show={showFilters} dismissible onClose={()=>setShowFilters((pre)=>!pre)}>
            {/* Modal Header */}
            <ModalHeader className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Transactions</h2>

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
                    onChange={(e) => handleFilterChange('search', e.target.value)}
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
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
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
                    onChange={(e) => handleFilterChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Currencies</option>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                    <option value="egp">EGP</option>
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Country
                  </label>
                  <select
                    value={tempFilters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Countries</option>
                    <option value="US">United States</option>
                    <option value="EG">Egypt</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
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
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
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
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </ModalBody>

            {/* Modal Footer */}
            <ModalFooter className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={cancelFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </ModalFooter>
          </Modal>
        </div>
      )}
       <RefundModal
        isOpen={refundModal.isOpen}
        payment={refundModal.payment}
        isRefunding={isRefunding}
        onClose={handleRefundModalClose}
        onConfirm={handleRefundConfirm}
      />

      {/* Loading overlay for refunding */}
      {isRefunding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            <span>Processing refund...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;