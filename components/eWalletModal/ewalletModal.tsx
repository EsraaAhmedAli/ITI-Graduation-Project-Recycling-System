"use client";

import React, { useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { UserAuthContext } from "@/context/AuthFormContext";
import { useUserPoints } from "@/context/UserPointsContext";
import { useLanguage } from "@/context/LanguageContext";

// Move vouchers outside component to prevent recreation on every render
const VOUCHERS = [
  { id: "1", name: "Talabat Mart", value: "50 EGP", points: 500 },
  { id: "2", name: "Breadfast", value: "30 EGP", points: 300 },
  { id: "3", name: "Seoudi", value: "20 EGP", points: 250 },
] as const;

// Constants
const POINTS_TO_CURRENCY_RATIO = 19;

interface RecyclingModalProps {
  modalOpen: boolean;
  closeModal: () => void;
  onPointsUpdated: () => void;
}

export default function RecyclingModal({
  onPointsUpdated,
  modalOpen,
  closeModal,
}: RecyclingModalProps) {
  const { t } = useLanguage();
  const [activeOption, setActiveOption] = useState<"money" | "voucher" | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [redeemedVouchers, setRedeemedVouchers] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const { user } = useContext(UserAuthContext);
  const { userPoints, pointsLoading, refreshUserPoints } = useUserPoints();

  const userId = user?._id;
  const totalPoints = userPoints?.totalPoints || 0;

  // Memoize expensive calculations
  const calculations = useMemo(() => {
    const numAmount = amount ? parseInt(amount, 10) : 0;
    const requiredPoints = numAmount * POINTS_TO_CURRENCY_RATIO;
    const remainingPoints = totalPoints - requiredPoints;
    const maxAvailable = Math.floor(totalPoints / POINTS_TO_CURRENCY_RATIO);
    
    return {
      requiredPoints,
      remainingPoints,
      maxAvailable,
      isValidAmount: numAmount > 0 && requiredPoints <= totalPoints,
    };
  }, [amount, totalPoints]);

  // Memoize voucher calculations
  const voucherStates = useMemo(() => {
    return VOUCHERS.map(voucher => {
      const isRedeemed = redeemedVouchers.has(voucher.id);
      const canRedeem = totalPoints >= voucher.points && !isRedeemed;
      const isSelected = selectedVoucher === voucher.id;
      
      return {
        ...voucher,
        isRedeemed,
        canRedeem,
        isSelected,
        needsMorePoints: voucher.points - totalPoints,
      };
    });
  }, [totalPoints, redeemedVouchers, selectedVoucher]);

  // Reset state when modal closes
  useEffect(() => {
    if (!modalOpen) {
      setActiveOption(null);
      setSelectedVoucher(null);
      setQrVisible(false);
      setAmount("");
      setIsProcessing(false);
    }
  }, [modalOpen]);

  // Memoized handlers
  const handleTabChange = useCallback((option: "money" | "voucher") => {
    setActiveOption(option);
    setQrVisible(false);
    setSelectedVoucher(null);
  }, []);

  const handleVoucherSelect = useCallback((voucherId: string, canRedeem: boolean) => {
    if (canRedeem && !isProcessing) {
      setSelectedVoucher(prev => prev === voucherId ? null : voucherId);
    }
  }, [isProcessing]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate input
    if (value === "" || (/^\d+$/.test(value) && parseInt(value, 10) <= calculations.maxAvailable)) {
      setAmount(value);
    }
  }, [calculations.maxAvailable]);

  const handleDownloadQR = useCallback(async () => {
    if (!qrRef.current) return;
    
    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "voucher-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download QR code:", error);
      Swal.fire(t("error"), "Failed to download QR code", "error");
    }
  }, [t]);

  const handleRedeem = useCallback(async () => {
    if (!activeOption || isProcessing) return;

    setIsProcessing(true);

    try {
      if (activeOption === "money") {
        if (!calculations.isValidAmount) {
          Swal.fire(t("invalidAmount"), t("notEnoughPoints"), "error");
          return;
        }

        await api.post(`/users/${userId}/points/deduct`, {
          points: calculations.requiredPoints,
          reason: `Cashback for ${amount} EGP`,
        });

        await refreshUserPoints();
        onPointsUpdated?.();
        Swal.fire(t("success"), t("cashbackRedeemed"), "success");
        setQrVisible(false);
        setAmount("");
      } else if (activeOption === "voucher") {
        const voucher = VOUCHERS.find((v) => v.id === selectedVoucher);
        if (!voucher) {
          Swal.fire(t("selectVoucher"), "", "warning");
          return;
        }

        if (redeemedVouchers.has(voucher.id) || totalPoints < voucher.points) {
          return;
        }

        await api.post(`/users/${userId}/points/deduct`, {
          points: voucher.points,
          reason: `Voucher redeemed: ${voucher.name}`,
        });

        await refreshUserPoints();
        onPointsUpdated?.();

        const qrText = `${t("voucher")}: ${voucher.name} - ${t("value")}: ${voucher.value}`;
        setQrValue(qrText);
        setQrVisible(true);
        setRedeemedVouchers(prev => new Set([...prev, voucher.id]));
        setSelectedVoucher(null);
        Swal.fire(t("success"), t("voucherReady"), "success");
      }
    } catch (error: any) {
      console.error("Redemption failed:", error);
      Swal.fire(
        t("error"),
        error.response?.data?.message || t("couldNotDeductPoints"),
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    activeOption,
    isProcessing,
    calculations.isValidAmount,
    calculations.requiredPoints,
    amount,
    selectedVoucher,
    redeemedVouchers,
    totalPoints,
    userId,
    t,
    refreshUserPoints,
    onPointsUpdated,
  ]);

  // Memoize button disabled state
  const isRedeemDisabled = useMemo(() => {
    if (pointsLoading || isProcessing) return true;
    
    if (activeOption === "voucher") {
      if (!selectedVoucher) return true;
      const voucher = voucherStates.find(v => v.id === selectedVoucher);
      return !voucher?.canRedeem;
    }
    
    if (activeOption === "money") {
      return !calculations.isValidAmount;
    }
    
    return true;
  }, [pointsLoading, isProcessing, activeOption, selectedVoucher, voucherStates, calculations.isValidAmount]);

  // Early return if not open to avoid unnecessary rendering
  if (!modalOpen) {
    return null;
  }

  return (
    <Modal dismissible show={modalOpen} size="md" onClose={closeModal}>
      <ModalHeader className="bg-white border-b p-6">
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-2xl font-bold text-gray-900">
              {t("redeemEcoPoints")}
            </h3>
          </div>
          <div className="flex items-center mt-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
              {pointsLoading ? t("loading") : `${totalPoints.toLocaleString()} ${t("points")}`}
            </div>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="bg-white p-6">
        {/* Tabs */}
        <div className="flex mb-6 bg-gray-50 rounded-xl p-1">
          <button
            onClick={() => handleTabChange("voucher")}
            disabled={isProcessing}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeOption === "voucher"
                ? "bg-white shadow-sm text-green-600 border border-green-100"
                : "text-gray-500 hover:text-gray-700"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z"
                />
              </svg>
              {t("vouchers")}
            </div>
          </button>
          <button
            onClick={() => handleTabChange("money")}
            disabled={isProcessing}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeOption === "money"
                ? "bg-white shadow-sm text-green-600 border border-green-100"
                : "text-gray-500 hover:text-gray-700"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {t("cashOut")}
            </div>
          </button>
        </div>

        {/* Voucher Section */}
        {activeOption === "voucher" && (
          <div className="space-y-3">
            {voucherStates.map((voucher) => (
              <button
                key={voucher.id}
                onClick={() => handleVoucherSelect(voucher.id, voucher.canRedeem)}
                disabled={!voucher.canRedeem || isProcessing}
                className={`w-full text-left rounded-xl p-4 transition-all ${
                  voucher.isSelected
                    ? "border-2 border-green-500 bg-green-50"
                    : "border border-gray-200 hover:border-gray-300"
                } ${
                  !voucher.canRedeem
                    ? voucher.isRedeemed
                      ? "bg-gray-100 cursor-default"
                      : "opacity-70 cursor-not-allowed bg-gray-50"
                    : "hover:shadow-sm"
                } ${isProcessing ? "pointer-events-none" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      {voucher.name}
                    </h4>
                    <p className="text-sm text-gray-600">{voucher.value}</p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`font-medium mr-2 ${
                        voucher.canRedeem ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {voucher.points} {t("pts")}
                    </span>
                    {voucher.isRedeemed ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {t("redeemed")}
                      </span>
                    ) : voucher.isSelected ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      !voucher.canRedeem && (
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )
                    )}
                  </div>
                </div>
                {!voucher.canRedeem && !voucher.isRedeemed && (
                  <p className="text-xs text-red-500 mt-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("needMorePoints", { points: voucher.needsMorePoints })}
                  </p>
                )}
                {voucher.isRedeemed && (
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("voucherSuccessfullyRedeemed")}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Money Section */}
        {activeOption === "money" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("amountToRedeem")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder={t("enterAmount")}
                  min="1"
                  max={calculations.maxAvailable}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-20 disabled:opacity-50"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  {t("currency")}
                </div>
              </div>

              {amount && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("requiredPoints")}:</span>
                    <span
                      className={`font-medium ${
                        calculations.requiredPoints > totalPoints ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {calculations.requiredPoints.toLocaleString()} {t("pts")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("remainingPoints")}:</span>
                    <span
                      className={`font-medium ${
                        calculations.remainingPoints < 0 ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {calculations.remainingPoints.toLocaleString()} {t("pts")}
                    </span>
                  </div>
                  {!calculations.isValidAmount && (
                    <div className="text-xs text-red-500 bg-red-50 p-2 rounded flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("notEnoughPointsForAmount")}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium">{t("exchangeRate")}</p>
                  <p className="mt-1 text-blue-700">
                    {t("maxAvailable", { amount: calculations.maxAvailable })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Section */}
        {qrVisible && (
          <div className="mt-6 flex flex-col items-center space-y-4">
            <p className="font-medium text-gray-900">{t("yourVoucherQR")}</p>
            <div
              ref={qrRef}
              className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col items-center"
            >
              <QRCode value={qrValue} size={160} level="M" />
              <p className="mt-2 text-sm text-gray-600 text-center">{qrValue}</p>
            </div>
            <button
              onClick={handleDownloadQR}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t("downloadQR")}
            </button>
          </div>
        )}

        {/* Redeem Button */}
        <button
          onClick={handleRedeem}
          disabled={isRedeemDisabled}
          className="mt-6 w-full py-3.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t("processing")}
            </>
          ) : activeOption === "voucher" ? (
            redeemedVouchers.has(selectedVoucher || "") ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("alreadyRedeemed")}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z"
                  />
                </svg>
                {t("redeemVoucher")}
              </>
            )
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {t("transferToAccount")}
            </>
          )}
        </button>
      </ModalBody>
    </Modal>
  );
}