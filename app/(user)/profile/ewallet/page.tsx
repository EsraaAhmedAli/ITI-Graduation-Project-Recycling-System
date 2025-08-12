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

const EWallet = () => {
  const [balance, setBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(0);
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedGateway, setSelectedGateway] = useState("");
  const { user } = useUserAuth();
  const [transactions, setTransactions] = useState([]);

  const paymentGateways = [
    { id: "paypal", name: "PayPal", icon: Users, fee: "2.9%" },
    { id: "stripe", name: "Stripe", icon: CreditCard, fee: "2.9%" },
    { id: "bank", name: "Bank Transfer", icon: Building2, fee: "Free" },
    { id: "venmo", name: "Venmo", icon: Smartphone, fee: "1.75%" },
    { id: "cashapp", name: "Cash App", icon: DollarSign, fee: "1.5%" },
    { id: "wise", name: "Wise", icon: ArrowUpRight, fee: "0.5%" },
  ];

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
      const transactionsRes = await api.get(
        `/users/${user._id}/transactions`
      );
      console.log(transactionsRes, 'resss');
      
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

  const processPayment = async () => {
    if (!selectedGateway || !withdrawAmount) return;

    setIsProcessing(true);
    setPaymentStep(2); // Processing state

    try {
      const transaction = {
        gateway: selectedGateway,
        amount: parseFloat(withdrawAmount),
        type: "withdrawal",
      };

      console.log("Sending transaction:", transaction);

      await api.post(`users/${user._id}/transactions`, transaction);

      // Update local balance immediately for better UX
      setBalance((prev) => prev - transaction.amount);

      setPaymentStep(3); // Show success step

      // Close modal after short delay and then show toast
      setTimeout(async () => {
        setShowPaymentGateway(false);
        setWithdrawAmount("");
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
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <h1 className="text-3xl font-bold text-gray-900">EcoWallet</h1>
        </div>
        <p className="text-gray-600">Earn rewards for your recycling efforts</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1 flex items-center">
              <Leaf className="w-4 h-4 mr-2" />
              Eco Rewards Balance
            </p>
            <h2 className="text-4xl font-bold">{balance.toFixed(2)} EGP</h2>
            <p className="text-green-200 text-sm mt-2">
              Earned through sustainable recycling
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
            <span>Cash Out</span>
          </button>
          <button className="bg-primary bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all">
            <Recycle className="w-4 h-4" />
            <Link href="/category">Recycle More</Link>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <Recycle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="font-semibold text-gray-900">127.85 EGP</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-2 rounded-lg mr-3">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Items Recycled</p>
              <p className="font-semibold text-gray-900">342</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
          <div className="flex items-center">
            <div className="bg-teal-100 p-2 rounded-lg mr-3">
              <CheckCircle className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">CO₂ Saved</p>
              <p className="font-semibold text-gray-900">45.2 kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-green-100 mb-6">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Recent Activity
          </h3>
          <button
            onClick={() => setShowTransactionsModal(true)}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View All
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
                    {transaction.type}
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
                    {Math.abs(transaction.amount).toFixed(2)} EGP
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
              Cash Out Rewards
            </h3>
            <p className="text-gray-600 mb-4">
              Available balance:{" "}
              <span className="font-semibold text-green-600">
                {balance.toFixed(2)} EGP
              </span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Prevent non-numbers
                    if (isNaN(value)) return;

                    let numValue = parseFloat(value);

                    // Prevent negative
                    if (numValue < 0) numValue = 0;

                    // Prevent exceeding balance
                    if (numValue > balance) numValue = balance;

                    setWithdrawAmount(numValue.toString());
                  }}
                  onBlur={() => {
                    // If empty, reset to ""
                    if (withdrawAmount === "") return;

                    let numValue = parseFloat(withdrawAmount);

                    // Clamp value between 0 and balance
                    if (numValue < 0) numValue = 0;
                    if (numValue > balance) numValue = balance;

                    setWithdrawAmount(numValue.toString());
                  }}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  max={balance}
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-3 top-3 text-gray-500">
                  EGP
                </span>
              </div>

              {/* Validation messages */}
              {withdrawAmount && parseFloat(withdrawAmount) < 10 && (
                <p className="text-xs text-red-500 mt-1">
                  Minimum withdrawal is 10.00 EGP
                </p>
              )}
              {withdrawAmount && parseFloat(withdrawAmount) > balance && (
                <p className="text-xs text-red-500 mt-1">
                  You cannot withdraw more than your balance
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
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
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Selection Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Overlay with blur & grey tint */}

          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            {paymentStep === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-4">
                  Choose Payment Method
                </h3>
                <p className="text-gray-600 mb-6">
                  Withdrawing{" "}
                  <span className="font-semibold text-green-600">
                    {withdrawAmount} EGP
                  </span>
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {paymentGateways.map((gateway) => {
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
                        <span className="text-xs text-gray-500">
                          Fee: {gateway.fee}
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
                    Cancel
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={!selectedGateway}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Process Payment
                  </button>
                </div>
              </>
            )}

            {paymentStep === 2 && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">
                  Processing Payment...
                </h3>
                <p className="text-gray-600">
                  Transferring your eco-rewards via{" "}
                  {paymentGateways.find((g) => g.id === selectedGateway)?.name}
                </p>
              </div>
            )}

            {paymentStep === 3 && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-green-600">
                  Payment Successful!
                </h3>
                <p className="text-gray-600">
                  Your {withdrawAmount} EGP withdrawal has been processed
                  successfully
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
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Transaction History
              </h3>
              <button
                onClick={() => setShowTransactionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

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
                            {transaction.type}
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
                            {Math.abs(transaction.amount).toFixed(2)} EGP
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
                  <span>Previous</span>
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
                  <span>Next</span>
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