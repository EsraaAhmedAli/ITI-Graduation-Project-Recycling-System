// RefundModal.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, Select, Textarea, ModalHeader, ModalBody } from 'flowbite-react';
import { CreditCard, AlertTriangle } from 'lucide-react';

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
  onConfirm: (paymentId: string, amount: number, reason: string) => void;
}

const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  payment,
  isRefunding,
  onClose,
  onConfirm
}) => {
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [customReason, setCustomReason] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRefundReason('requested_by_customer');
      setCustomReason('');
    }
  }, [isOpen]);

  // Helper function to format amount (Stripe amounts are in cents)
  const formatAmount = (amount: number, currency: string = 'usd'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleConfirm = (): void => {
    if (!payment) return;

    const finalReason = refundReason === 'custom' ? customReason : refundReason;
    
    if (refundReason === 'custom' && !customReason.trim()) {
      alert('Please provide a custom reason for the refund.');
      return;
    }

    const refundableAmount = payment.amount - payment.amount_refunded;
    onConfirm(payment.id, refundableAmount, finalReason);
  };

  if (!payment) return null;

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
            Refund Payment
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
                <span className="font-medium">Refundable Amount:</span>
                <span className="font-bold text-green-600">
                  {formatAmount(payment.amount - payment.amount_refunded, payment.currency)}
                </span>
              </div>
              
              {payment.billing_details?.email && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium">
                    {payment.billing_details.email}
                  </span>
                </div>
              )}
            </div>
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

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              color="failure"
              onClick={handleConfirm}
              disabled={isRefunding || (refundReason === 'custom' && !customReason.trim())}
            >
              {isRefunding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Confirm Refund'
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
            This action cannot be undone. The refund will be processed immediately.
          </p>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default RefundModal;