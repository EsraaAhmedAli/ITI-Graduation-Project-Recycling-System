"use client";

import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Download, Printer } from "lucide-react";

type ReceiptProps = {
  orderId: string;
  date: string;
  address: string;
  deliveryFee: number;
  points: number;
  items: { name: string; quantity: number }[];
  userName: string;
};

const ReceiptCard = ({
  orderId,
  date,
  address,
  deliveryFee,
  points,
  items,
  userName,
}: ReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!receiptRef.current) return;

    html2pdf()
      .set({
        margin: 15,
        filename: `Karakeeb_Receipt_${orderId.slice(-8)}.pdf`,
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait"
        },
      })
      .from(receiptRef.current)
      .save();
  };

  const currentDate = new Date().toLocaleDateString('en-GB');
  const currentTime = new Date().toLocaleTimeString('en-GB', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  const receiptNumber = `XCH-${Date.now().toString().slice(-8)}`;

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Receipt Container */}
        <div ref={receiptRef} className="bg-white shadow-lg px-5">
          {/* Header */}
          <div className="text-center py-6 border-b-2 border-black">
        
            <h2 className="text-lg font-bold mt-4">Tax Receipt</h2>
            <h2 className="text-lg font-bold text-right" dir="rtl">إيصال ضريبي</h2>
            <p className="text-sm font-medium mt-2">{userName}</p>
          </div>

          {/* Address */}
          <div className="p-4 border-b text-xs">
            <p><strong>Pickup Address:</strong> {address}</p>
          </div>

          {/* Items */}
          <div className="p-4 border-b">
            {items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Recycled ✓</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 border-b space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Collection Service Fee</span>
              <span>{deliveryFee} EGP</span>
            </div>
            <div className="flex justify-between">
              <span>Environmental Points</span>
              <span className="text-green-600 font-medium">+{points} pts</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Service Fee Total</span>
              <span>{deliveryFee} EGP</span>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="p-4 border-b text-xs space-y-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Receipt No:</strong></p>
                <p>{receiptNumber}</p>
                <p><strong>Issue Date:</strong></p>
                <p>{currentDate} {currentTime}</p>
              </div>
              <div className="text-right">
                <p><strong>Order ID:</strong></p>
                <p>{orderId.slice(-10)}</p>
                <p><strong>Service Date:</strong></p>
                <p>{date}</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Registered Address:</strong></p>
                <p>Karakeeb Services</p>
                <p>Cairo, Egypt</p>
                <p><strong>Company Name:</strong> Karakeeb Egypt</p>
              </div>
              <div className="text-right">
                <p><strong>VAT Reg. No:</strong></p>
                <p>XCH123456789</p>
                <p><strong>Contact:</strong></p>
                <p>recyclecrew7@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black p-4 text-center">
            <p className="text-sm font-medium">Thank You for Recycling!</p>
            <p className="text-xs text-right mt-1" dir="rtl">شكراً لك على إعادة التدوير!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-800 transition-colors duration-200 font-medium"
          >
            <Download size={18} />
            Download PDF
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-700 hover:text-white transition-colors duration-200 font-medium"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptCard;