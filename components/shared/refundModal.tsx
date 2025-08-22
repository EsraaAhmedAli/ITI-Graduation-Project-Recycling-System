// RefundModal.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, Select, Textarea, ModalHeader, ModalBody } from 'flowbite-react';
import { CreditCard, AlertTriangle, DollarSign } from 'lucide-react';

interface PaymentData {
  id: string;
  amount: number;
  amount_refunded: number;
  currency: string;
  billing_details?: {
    email?: string;
    name?: string;
  };
}

interface RefundModalProps {
  isOpen: boolean;
  payment: PaymentData | null;
  isRefunding: boolean;
  onClose: () => void;
  onConfirm: (paymentId: string, amount: number, reason: string, customerEmail?: string) => void;
}

const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  payment,
  isRefunding,
  onClose,
  onConfirm
}) => {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [customReason, setCustomReason] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRefundType('full');
      setPartialAmount('');
      setRefundReason('requested_by_customer');
      setCustomReason('');
      setCustomerEmail('');
    } else if (payment) {
      // Pre-fill customer email if available
      setCustomerEmail(payment.billing_details?.email || '');
    }
  }, [isOpen, payment]);

  // Helper function to format amount (Stripe amounts are in cents)
  const formatAmount = (amount: number, currency: string = 'egp'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handlePartialAmountChange = (value: string): void => {
    // Allow only numbers and decimal point
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      setPartialAmount(value);
    }
  };

  const getRefundAmount = (): number => {
    if (!payment) return 0;
    
    const refundableAmount = payment.amount - payment.amount_refunded;
    
    if (refundType === 'partial') {
      const partialAmountInCents = Math.round(parseFloat(partialAmount || '0') * 100);
      return Math.min(partialAmountInCents, refundableAmount);
    }
    
    return refundableAmount;
  };

  const validatePartialAmount = (): string | null => {
    if (refundType === 'partial') {
      const amount = parseFloat(partialAmount);
      const maxRefundable = (payment!.amount - payment!.amount_refunded) / 100;
      
      if (!partialAmount || amount <= 0) {
        return 'Please enter a valid amount greater than 0';
      }
      
      if (amount > maxRefundable) {
        return `Amount cannot exceed ${formatAmount(payment!.amount - payment!.amount_refunded, payment!.currency)}`;
      }
      
      if (amount < 0.50) {
        return 'Minimum refund amount is $0.50';
      }
    }
    return null;
  };

  const handleConfirm = (): void => {
    if (!payment) return;

    const finalReason = refundReason === 'custom' ? customReason : refundReason;
    
    if (refundReason === 'custom' && !customReason.trim()) {
      alert('Please provide a custom reason for the refund.');
      return;
    }

    const validationError = validatePartialAmount();
    if (validationError) {
      alert(validationError);
      return;
    }

    const refundAmount = getRefundAmount();
    onConfirm(payment.id, refundAmount, finalReason, customerEmail.trim() || undefined);
  };

  if (!payment) return null;

  const refundableAmount = payment.amount - payment.amount_refunded;
  const partialAmountError = validatePartialAmount();

  return (
    <Modal
      show={isOpen}
      size="md"
      onClose={onClose}
      popup
    >
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          {/* Warning Icon */}
          <AlertTriangle className="mx-auto mb-4 h-14 w-14 text-orange-400" />
          
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Process Refund
          </h3>

          {/* Payment Information Card */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                Transaction: {payment.id.slice(-8)}
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">
                  {formatAmount(payment.amount, payment.currency)}
                </span>
              </div>
              
              {payment.amount_refunded > 0 && (
                <div className="flex justify-between">
                  <span>Already Refunded:</span>
                  <span className="font-medium text-red-600">
                    -{formatAmount(payment.amount_refunded, payment.currency)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-1 mt-2">
                <span className="font-medium">Available to Refund:</span>
                <span className="font-bold text-green-600">
                  {formatAmount(refundableAmount, payment.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Refund Type Selection */}
          <div className="text-left mb-4">
            <div className="mb-2 block">
              <Label value="Refund Type" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full"
                  checked={refundType === 'full'}
                  onChange={(e) => setRefundType(e.target.value as 'full' | 'partial')}
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm">Full Refund</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="partial"
                  checked={refundType === 'partial'}
                  onChange={(e) => setRefundType(e.target.value as 'full' | 'partial')}
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm">Partial Refund</span>
              </label>
            </div>
          </div>

          {/* Partial Amount Input */}
          {refundType === 'partial' && (
            <div className="text-left mb-4">
              <div className="mb-2 block">
                <Label value="Refund Amount" />
              </div>
              <div className="relative">
             
                <input
                  type="text"
                  placeholder="0.00"
                  value={partialAmount}
                  onChange={(e) => handlePartialAmountChange(e.target.value)}
                  className={`block w-full ps-3 pr-3 py-2 border rounded-md text-sm ${
                    partialAmountError 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                />
              </div>
              {partialAmountError && (
                <p className="text-red-500 text-xs mt-1">{partialAmountError}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Maximum: {formatAmount(refundableAmount, payment.currency)}
              </p>
            </div>
          )}

          {/* Customer Email */}
          <div className="text-left mb-4">
            <div className="mb-2 block">
              <Label value="Customer Email (Optional)" />
            </div>
            <input
              type="email"
              placeholder="customer@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-gray-500 text-xs mt-1">
              Email for refund notification. Will attempt to use transaction email if not provided.
            </p>
          </div>

          {/* Refund Reason Selection */}
          <div className="text-left mb-6">
            <div className="mb-2 block">
              <Label htmlFor="refund-reason" value="Refund Reason" />
            </div>
            <Select
              id="refund-reason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              required
            >
              <option value="requested_by_customer">Customer Request</option>
              <option value="duplicate">Duplicate Charge</option>
              <option value="fraudulent">Fraudulent Transaction</option>
              <option value="custom">Custom Reason</option>
            </Select>
          </div>

          {/* Custom Reason Input */}
          {refundReason === 'custom' && (
            <div className="text-left mb-6">
              <div className="mb-2 block">
                <Label htmlFor="custom-reason" value="Custom Reason" />
              </div>
              <Textarea
                id="custom-reason"
                placeholder="Enter the reason for this refund..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          )}

          {/* Refund Summary */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3 mb-6 text-left">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">
              Refund Summary
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">
                  {refundType === 'full' ? 'Full Refund' : 'Partial Refund'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold">
                  {formatAmount(getRefundAmount(), payment.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reason:</span>
                <span className="font-medium">
                  {refundReason === 'custom' ? customReason || 'Custom' : refundReason.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleConfirm}
              disabled={isRefunding || !!partialAmountError || (refundReason === 'custom' && !customReason.trim())}
            >
              {isRefunding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                `Confirm ${refundType === 'full' ? 'Full' : 'Partial'} Refund`
              )}
            </Button>
            
            <Button 
              color="gray" 
              onClick={onClose}
              disabled={isRefunding}
            >
              Cancel
            </Button>
          </div>

          {/* Warning Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            This action cannot be undone. The refund will be processed immediately and email notifications will be sent.
          </p>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default RefundModal;