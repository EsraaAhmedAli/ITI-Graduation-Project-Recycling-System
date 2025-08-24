"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Recycle,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { useUserAuth } from "@/context/AuthFormContext";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

const EWallet = () => {
  const [balance, setBalance] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(0);
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [processedWithdrawAmount, setProcessedWithdrawAmount] = useState("");

  const { user } = useUserAuth();
  const [transactions, setTransactions] = useState([]);
  const { t, convertNumber, locale } = useLanguage();

  const paymentGateways = {
    en: [
      { id: "paypal", name: "PayPal", icon: Users },
      { id: "stripe", name: "Stripe", icon: CreditCard },
      { id: "bank", name: "Bank Transfer", icon: Building2 },
      { id: "venmo", name: "Venmo", icon: Smartphone },
      { id: "cashapp", name: "Cash App", icon: DollarSign },
      { id: "wise", name: "Wise", icon: ArrowUpRight },
    ],
    ar: [
      { id: "paypal", name: "باي بال", icon: Users },
      { id: "stripe", name: "سترايب", icon: CreditCard },
      { id: "bank", name: "تحويل بنكي", icon: Building2 },
      { id: "venmo", name: "فينمو", icon: Smartphone },
      { id: "cashapp", name: "كاش آب", icon: DollarSign },
      { id: "wise", name: "وايز", icon: ArrowUpRight },
    ],
  };

  const coin = locale === "ar" ? "جنيه" : "EGP";

  const chunkArray = (arr, size) => {
    // Sort newest → oldest (date + time respected)
    const sorted = [...arr].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Then chunk
    const result = [];
    for (let i = 0; i < sorted.length; i += size) {
      result.push(sorted.slice(i, i + size));
    }
    return result;
  };

  // Extract data fetching into a reusable function
  const fetchUserData = useCallback(async () => {
    try {
      if (!user || !user._id) {
        console.error("User not found");
        return;
      }

      // Fetch balance
      const balanceRes = await api.get(`/users/${user._id}`);
      const newBalance = balanceRes.data?.attachments?.balance ?? 0;
      setBalance(newBalance);

      // Fetch transactions
      const transactionsRes = await api.get(`/users/${user._id}/transactions`);
      console.log(transactionsRes, "resss");

      const raw =
        transactionsRes.data?.transactions || transactionsRes.data || [];

      // Ensure it's an array
      const transactionsArray = Array.isArray(raw) ? raw : [];

      // Split into pages (e.g., 5 per page)
      const paginated = chunkArray(transactionsArray, 5);

      setTransactions(paginated);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= balance) {
      setShowWithdrawModal(false);
      setShowPaymentGateway(true);
      setPaymentStep(1);
    }
  };
  // Updated processPayment function
  const processPayment = async () => {
    if (!selectedGateway || !withdrawAmount) return;

    setIsProcessing(true);
    setPaymentStep(2); // Processing state

    try {
      const transaction = {
        gateway: selectedGateway,
        amount: parseFloat(convertNumber(withdrawAmount, "en")),
        type: "withdrawal",
      };

      // Store the amount in state BEFORE processing
      setProcessedWithdrawAmount((prev) => withdrawAmount);

      console.log("Sending transaction:", transaction);

      await api.post(`users/${user._id}/transactions`, transaction);

      // Update local balance immediately for better UX
      setBalance((prev) => prev - transaction.amount);

      setPaymentStep((prev) => 3); // Show success step

      // Close modal after short delay and then show toast
      setTimeout(async () => {
        setShowPaymentGateway(false);
        setWithdrawAmount("");
        setProcessedWithdrawAmount(""); // Clear this too
        setSelectedGateway("");
        setPaymentStep(1);

        // Refetch transactions to get the updated list including the new withdrawal
        await fetchUserData();

        toast.success("Withdrawal processed successfully!");
      }, 1000); // 1 second delay before closing modal
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
      setPaymentStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      numberingSystem: locale === "ar" ? "arab" : "latn",
    });
  };

  const nextTransactionPage = () => {
    setCurrentTransactionPage((prev) => (prev + 1) % transactions.length);
  };

  const prevTransactionPage = () => {
    setCurrentTransactionPage(
      (prev) => (prev - 1 + transactions.length) % transactions.length
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Recycle className="w-8 h-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">
            {t("ewallet.title")}
          </h1>
        </div>
        <p className="text-gray-600">{t("ewallet.subtitle")}</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1 flex items-center">
              <Leaf className="w-4 h-4 mr-2" />
              {t("ewallet.balance.title")}
            </p>
            <h2 className="text-4xl font-bold">
              {convertNumber(balance.toFixed(2))} {coin}
            </h2>
            <p className="text-green-200 text-sm mt-2">
              {t("ewallet.balance.subtitle")}
            </p>
          </div>
          <Wallet className="w-12 h-12 text-green-200" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3 ">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-primary bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t("ewallet.balance.cashOut")}</span>
          </button>
          <button className="bg-primary bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all">
            <Recycle className="w-4 h-4" />
            <Link href="/category">{t("ewallet.balance.recycleMore")}</Link>
          </button>
        </div>
      </div>

      {/* Recent Transactions Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-green-100 mb-6">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            {t("ewallet.transactions.title")}
          </h3>
          <button
            onClick={() => setShowTransactionsModal(true)}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            {t("ewallet.transactions.viewAll")}
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {transactions
            .flat()
            .slice(0, 3)
            .map((transaction, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {t(
                      `ewallet.transactions.types.${transaction.type.toLowerCase()}`
                    )}
                  </span>
                  <span
                    className={`font-semibold text-sm ${
                      transaction.type.toString().toLowerCase() == "cashback"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {transaction.type.toString().toLowerCase() == "cashback"
                      ? "+"
                      : "-"}
                    {convertNumber(Math.abs(transaction.amount).toFixed(2))}{" "}
                    {coin}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              {t("ewallet.withdraw.title")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("ewallet.withdraw.availableBalance")}:{" "}
              <span className="font-semibold text-green-600">
                {convertNumber(balance.toFixed(2))}{" "}
                {t("ewallet.withdraw.currency")}
              </span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("ewallet.withdraw.withdrawalAmount")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={
                    withdrawAmount === "" ? "" : convertNumber(withdrawAmount)
                  } // show localized digits
                  onChange={(e) => {
                    const rawValue = e.target.value;

                    // allow empty string → user is typing/deleting
                    if (rawValue.trim() === "") {
                      setWithdrawAmount("");
                      return;
                    }

                    // always convert to English digits for internal logic
                    const englishValue = convertNumber(rawValue, "en");

                    if (!/^\d*\.?\d*$/.test(englishValue)) {
                      // prevent invalid chars
                      return;
                    }

                    let numValue = parseFloat(englishValue); // keep let because we reassign

                    if (isNaN(numValue)) {
                      setWithdrawAmount("");
                      return;
                    }

                    // enforce range
                    if (numValue < 0) numValue = 0;
                    if (numValue > balance) numValue = balance;

                    setWithdrawAmount(numValue.toString()); // keep state in English
                  }}
                  placeholder={convertNumber("0.00")}
                  onBlur={() => {
                    if (withdrawAmount === "") return;

                    let numValue = parseFloat(withdrawAmount); // let is correct here too
                    if (numValue < 0) numValue = 0;
                    if (numValue > balance) numValue = balance;

                    setWithdrawAmount(numValue.toString());
                  }}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Validation messages */}
              {withdrawAmount && parseFloat(withdrawAmount) < 10 && (
                <p className="text-xs text-red-500 mt-1">
                  {t("ewallet.withdraw.validation.min")}
                </p>
              )}
              {withdrawAmount && parseFloat(withdrawAmount) > balance && (
                <p className="text-xs text-red-500 mt-1">
                  {t("ewallet.withdraw.validation.max")}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t("ewallet.withdraw.buttons.cancel")}
              </button>
              <button
                onClick={handleWithdraw}
                disabled={
                  !withdrawAmount ||
                  parseFloat(withdrawAmount) < 10 ||
                  parseFloat(withdrawAmount) > balance
                }
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {t("ewallet.withdraw.buttons.continue")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Selection Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            {paymentStep === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-4">
                  {t("ewallet.payment.step1.title")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("ewallet.payment.step1.withdrawing")}{" "}
                  <span className="font-semibold text-green-600">
                    {convertNumber(withdrawAmount)}{" "}
                    {t("ewallet.withdraw.currency")}
                  </span>
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {paymentGateways[locale].map((gateway) => {
                    const IconComponent = gateway.icon;
                    return (
                      <label
                        key={gateway.id}
                        className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-green-300 ${
                          selectedGateway === gateway.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentGateway"
                          value={gateway.id}
                          onChange={(e) => setSelectedGateway(e.target.value)}
                          className="sr-only"
                        />
                        <IconComponent className="w-8 h-8 mb-2 text-gray-600" />
                        <span className="font-medium text-sm">
                          {gateway.name}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPaymentGateway(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {t("ewallet.payment.step1.buttons.cancel")}
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={!selectedGateway}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {t("ewallet.payment.step1.buttons.process")}
                  </button>
                </div>
              </>
            )}

            {paymentStep === 2 && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("ewallet.payment.step2.title")}
                </h3>
                <p className="text-gray-600">
                  {t("ewallet.payment.step2.subtitle")}{" "}
                  {
                    paymentGateways[locale].find(
                      (g) => g.id === selectedGateway
                    )?.name
                  }
                </p>
              </div>
            )}

            {paymentStep === 3 && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-green-600">
                  {t("ewallet.payment.step3.title")}
                </h3>
                <p className="text-gray-600">
                  {t("ewallet.payment.step3.subtitle", {
                    amount: convertNumber(processedWithdrawAmount || "0"),
                    currency: t("ewallet.withdraw.currency"),
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Carousel Modal */}
      {showTransactionsModal && (
        <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {t("ewallet.transactions.history")}
              </h3>
              <button
                onClick={() => setShowTransactionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Transactions List */}
            <div className="relative">
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="divide-y divide-gray-200">
                  {transactions[currentTransactionPage]?.map(
                    (transaction, idx) => (
                      <div key={idx} className="py-4 first:pt-0">
                        <div className="flex items-center justify-between">
                          {/* Transaction type */}
                          <span
                            className={`text-sm font-medium ${
                              transaction.type === "cashback"
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          >
                            {t(
                              `ewallet.transactions.types.${transaction.type
                                .toString()
                                .toLowerCase()}`
                            )}
                          </span>

                          {/* Amount */}
                          <span
                            className={`font-semibold ${
                              transaction.type === "cashback"
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          >
                            {transaction.type === "cashback" ? "+" : "-"}
                            {Math.abs(transaction.amount).toFixed(2)}{" "}
                            {t("ewallet.transactions.currency")}
                          </span>

                          {/* Date */}
                          <span className="text-sm text-gray-500">
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Carousel Navigation */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <button
                  onClick={prevTransactionPage}
                  disabled={currentTransactionPage === 0}
                  className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t("ewallet.transactions.previous")}</span>
                </button>

                <div className="flex items-center space-x-2">
                  {transactions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTransactionPage(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTransactionPage
                          ? "bg-green-600"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTransactionPage}
                  disabled={currentTransactionPage === transactions.length - 1}
                  className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>{t("ewallet.transactions.next")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EWallet;
