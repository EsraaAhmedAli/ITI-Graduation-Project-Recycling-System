"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { UserAuthContext } from "@/context/AuthFormContext";
import { useUserPoints } from "@/context/UserPointsContext";
import { useLanguage } from "@/context/LanguageContext";

const vouchers = [
  { id: "1", name: "Talabat Mart", value: "50 EGP", points: 500 },
  { id: "2", name: "Breadfast", value: "30 EGP", points: 300 },
  { id: "3", name: "Seoudi", value: "20 EGP", points: 250 },
];

export default function RecyclingModal({
  onPointsUpdated,
  modalOpen,
  closeModal,
}: {
  modalOpen: boolean;
  closeModal: () => void;
  onPointsUpdated: () => void;
}) {
  const { t } = useLanguage();
  const [activeOption, setActiveOption] = useState<"money" | "voucher" | null>(
    null
  );
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [redeemedVouchers, setRedeemedVouchers] = useState<string[]>([]);
  const qrRef = useRef(null);
  const { user } = useContext(UserAuthContext);
  const userId = user?._id;

  const { userPoints, pointsLoading, refreshUserPoints } = useUserPoints();

  const totalPoints = userPoints?.totalPoints || 0;
  const requiredPoints = amount ? parseInt(amount) * 19 : 0;
  const remainingPoints = totalPoints - requiredPoints;

  const handleRedeem = async () => {
    if (!activeOption) return;

    if (activeOption === "money") {
      if (!amount || requiredPoints > totalPoints) {
        Swal.fire(t("invalidAmount"), t("notEnoughPoints"), "error");
        return;
      }
      try {
        await api.post(`/users/${userId}/points/deduct`, {
          points: requiredPoints,
          reason: `Cashback for ${amount} EGP`,
        });
        await refreshUserPoints();
        onPointsUpdated?.();

        Swal.fire(t("success"), t("cashbackRedeemed"), "success");
        setQrVisible(false);
      } catch (error) {
        Swal.fire(
          t("error"),
          error.response?.data?.message || t("couldNotDeductPoints"),
          "error"
        );
      }
    }

    if (activeOption === "voucher") {
      const voucher = vouchers.find((v) => v.id === selectedVoucher);
      if (!voucher) return Swal.fire(t("selectVoucher"), "", "warning");

      try {
        await api.post(`/users/${userId}/points/deduct`, {
          points: voucher.points,
          reason: `Voucher redeemed: ${voucher.name}`,
        });
        await refreshUserPoints();
        onPointsUpdated?.();

        const qrText = `${t("voucher")}: ${voucher.name} - ${t("value")}: ${
          voucher.value
        }`;
        setQrValue(qrText);
        setQrVisible(true);
        setRedeemedVouchers([...redeemedVouchers, voucher.id]);
        setSelectedVoucher(null);
        Swal.fire(t("success"), t("voucherReady"), "success");
      } catch (error) {
        Swal.fire(
          t("error"),
          error.response?.data?.message || t("couldNotDeductPoints"),
          "error"
        );
      }
    }
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "voucher-qr.png";
    link.click();
  };

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
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
              {pointsLoading
                ? t("loading")
                : `${totalPoints?.toLocaleString()} ${t("points")}`}
            </div>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="bg-white p-6">
        {/* Tabs */}
        <div className="flex mb-6 bg-gray-50 rounded-xl p-1">
          <button
            onClick={() => {
              setActiveOption("voucher");
              setQrVisible(false);
            }}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeOption === "voucher"
                ? "bg-white shadow-sm text-green-600 border border-green-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
            onClick={() => {
              setActiveOption("money");
              setQrVisible(false);
            }}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeOption === "money"
                ? "bg-white shadow-sm text-green-600 border border-green-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
            {vouchers.map((voucher) => {
              const canRedeem =
                totalPoints >= voucher.points &&
                !redeemedVouchers.includes(voucher.id);
              const isRedeemed = redeemedVouchers.includes(voucher.id);
              return (
                <button
                  key={voucher.id}
                  onClick={() => canRedeem && setSelectedVoucher(voucher.id)}
                  disabled={!canRedeem}
                  className={`w-full text-left rounded-xl p-4 transition-all ${
                    selectedVoucher === voucher.id
                      ? "border-2 border-green-500 bg-green-50"
                      : "border border-gray-200 hover:border-gray-300"
                  } ${
                    !canRedeem
                      ? isRedeemed
                        ? "bg-gray-100 cursor-default"
                        : "opacity-70 cursor-not-allowed bg-gray-50"
                      : "hover:shadow-sm"
                  }`}
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
                          canRedeem ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {voucher.points} {t("pts")}
                      </span>
                      {isRedeemed ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {t("redeemed")}
                        </span>
                      ) : selectedVoucher === voucher.id ? (
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        !canRedeem && (
                          <svg
                            className="w-5 h-5 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
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
                  {!canRedeem && !isRedeemed && (
                    <p className="text-xs text-red-500 mt-2 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("needMorePoints", {
                        points: voucher.points - totalPoints,
                      })}
                    </p>
                  )}
                  {isRedeemed && (
                    <p className="text-xs text-green-600 mt-2 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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
              );
            })}
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
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t("enterAmount")}
                  min="1"
                  max={Math.floor(totalPoints / 19)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-20"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  {t("currency")}
                </div>
              </div>

              {amount && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {t("requiredPoints")}:
                    </span>
                    <span
                      className={`font-medium ${
                        requiredPoints > totalPoints
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {requiredPoints} {t("pts")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {t("remainingPoints")}:
                    </span>
                    <span
                      className={`font-medium ${
                        remainingPoints < 0 ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {remainingPoints} {t("pts")}
                    </span>
                  </div>
                  {requiredPoints > totalPoints && (
                    <div className="text-xs text-red-500 bg-red-50 p-2 rounded flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium">{t("exchangeRate")}</p>
                  <p className="mt-1 text-blue-700">
                    {t("maxAvailable", {
                      amount: Math.floor(totalPoints / 19),
                    })}
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
              <QRCode value={qrValue} size={160} />
              <p className="mt-2 text-sm text-gray-600 text-center">
                {qrValue}
              </p>
            </div>
            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

        {/* Final Button */}
        <button
          onClick={handleRedeem}
          disabled={
            pointsLoading ||
            (activeOption === "voucher" &&
              (!selectedVoucher ||
                totalPoints <
                  vouchers.find((v) => v.id === selectedVoucher)?.points! ||
                redeemedVouchers.includes(selectedVoucher))) ||
            (activeOption === "money" &&
              (!amount || totalPoints < parseInt(amount) * 19))
          }
          className="mt-6 w-full py-3.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
        >
          {pointsLoading ? (
            t("loading")
          ) : activeOption === "voucher" ? (
            redeemedVouchers.includes(selectedVoucher || "") ? (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
