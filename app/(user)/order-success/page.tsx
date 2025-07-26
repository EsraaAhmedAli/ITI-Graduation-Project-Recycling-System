"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Package, 
  ArrowLeft,
  Share2,
  Copy
} from 'lucide-react';
import OrderTracker from '@/components/order/OrderTracker';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const orderId = searchParams.get('orderId');
  const orderNumber = orderId ? orderId.slice(-8) : '';

  useEffect(() => {
    if (!orderId) {
      toast.error('No order ID found');
      router.push('/pickup');
    }
  }, [orderId, router]);

  const handleCopyOrderId = async () => {
    if (orderId) {
      try {
        await navigator.clipboard.writeText(orderId);
        setCopied(true);
        toast.success('Order ID copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy order ID');
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && orderId) {
      try {
        await navigator.share({
          title: 'My Recycling Order',
          text: `Check out my recycling order #${orderNumber}!`,
          url: `${window.location.origin}/orders?orderId=${orderId}`
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopyOrderId();
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ Invalid Order</div>
          <p className="text-gray-600 mb-6">No order ID found</p>
          <Link
            href="/pickup"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Create New Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/orders"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Orders</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handleCopyOrderId}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {copied ? 'Copied!' : 'Copy ID'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Confirmed! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your recycling pickup order has been successfully created and is now being reviewed by our team.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Package className="w-4 h-4" />
                <span>Order #{orderNumber}</span>
                <span>•</span>
                <span>Created just now</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                <Package className="w-4 h-4" />
                View All Orders
              </Link>
              <Link
                href="/pickup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                <MapPin className="w-4 h-4" />
                Create Another Order
              </Link>
            </div>
          </div>
        </div>

        {/* Order Tracking */}
        <div className="mb-8">
          <OrderTracker 
            orderId={orderId}
            showDetails={true}
            onStatusChange={(oldStatus, newStatus) => {
              console.log(`Order status changed from ${oldStatus} to ${newStatus}`);
              if (newStatus === 'confirmed') {
                toast.success('🎉 Your order has been approved!');
              } else if (newStatus === 'assigntocourier') {
                toast.success('🚚 A driver has been assigned to your order!');
              } else if (newStatus === 'completed') {
                toast.success('✅ Your order has been completed successfully!');
              }
            }}
          />
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What happens next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">1. Review & Approval</h3>
              <p className="text-sm text-gray-600">
                Our team will review your order within 1-2 hours and confirm the pickup details.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">2. Driver Assignment</h3>
              <p className="text-sm text-gray-600">
                Once approved, we'll assign a driver to collect your recyclables.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">3. Pickup & Points</h3>
              <p className="text-sm text-gray-600">
                The driver will collect your items and you'll receive points for recycling!
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 mb-4">
            If you have any questions about your order or need to make changes, our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              Contact Support
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 