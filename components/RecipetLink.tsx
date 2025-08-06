import React from 'react';
import Link from 'next/link';
import { FileText, Download, ExternalLink, Receipt } from 'lucide-react';

interface ReceiptLinkProps {
  orderId: string;
  variant?: 'default' | 'compact' | 'badge';
  className?: string;
}

export const ReceiptLink: React.FC<ReceiptLinkProps> = ({ 
  orderId, 
  variant = 'default',
  className = '' 
}) => {
  const baseClasses = "inline-flex items-center gap-2 font-medium transition-all duration-300";
  
  if (variant === 'compact') {
    return (
      <Link
        href={`/receipt/${orderId}`}
        className={`${baseClasses} text-sm text-green-600 hover:text-green-800 hover:underline ${className}`}
      >
        <Receipt size={14} />
        View Receipt
      </Link>
    );
  }

  if (variant === 'badge') {
    return (
      <Link
        href={`/receipt/${orderId}`}
        className={`${baseClasses} text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-200 hover:scale-105 ${className}`}
      >
        <FileText size={12} />
        Receipt
        <ExternalLink size={10} />
      </Link>
    );
  }

  // Default professional button
  return (
    <Link
      href={`/receipt/${orderId}`}
      className={`${baseClasses} bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-200 hover:from-green-100 hover:to-green-200 hover:border-green-300 hover:shadow-md hover:scale-105 ${className}`}
    >
      <FileText size={16} />
      <span>View Tax Receipt</span>
      <ExternalLink size={12} className="ml-1" />
    </Link>
  );
};