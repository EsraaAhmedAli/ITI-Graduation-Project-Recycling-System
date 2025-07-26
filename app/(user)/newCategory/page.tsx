'use client'
import { useState } from "react";
import Swal from "sweetalert2";

export default function EWalletModal({
  isOpen,
  onClose,
  points,
}: {
  isOpen: boolean;
  onClose: () => void;
  points: number;
}) {
  const [activeOption, setActiveOption] = useState<"voucher" | "money">("voucher");
  const [amount, setAmount] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState("");


  const vouchers = [
    { id: "amazon", name: "Amazon Gift Card", points: 500, value: "50 EGP" },
    { id: "carrefour", name: "Carrefour Voucher", points: 300, value: "30 EGP" },
    { id: "starbucks", name: "Starbucks Card", points: 200, value: "20 EGP" },
    { id: "noon", name: "Noon Gift Card", points: 1000, value: "100 EGP" },
  ];

  const handleRedeem = () => {
    if (activeOption === "voucher" && selectedVoucher) {
      const voucher = vouchers.find((v) => v.id === selectedVoucher);
      if (voucher && points >= voucher.points) {
        Swal.fire({
          title: "Redeem Voucher",
          text: `Are you sure you want to redeem ${voucher.points} points for ${voucher.name}?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Redeem",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire("Success!", "Voucher redeemed successfully!", "success");
            onClose();
          }
        });
      } else {
        Swal.fire("Insufficient Points", "You don't have enough points for this voucher.", "warning");
      }
    } else if (activeOption === "money" && amount) {
      const pointsNeeded = parseInt(amount) * 10;
      if (points >= pointsNeeded) {
        Swal.fire({
          title: "Transfer to Money",
          text: `Transfer ${pointsNeeded} points to ${amount} EGP in your account?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Transfer",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire("Success!", "Points transferred to your account!", "success");
            onClose();
          }
        });
      } else {
        Swal.fire("Insufficient Points", `You need ${pointsNeeded} points for ${amount} EGP.`, "warning");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-lime-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center">
                🌱
              </div>
              <div>
                <h2 className="text-xl font-bold">Eco Wallet</h2>
                <p className="text-sm text-emerald-100">Redeem your green points</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 w-8 h-8 rounded-full flex items-center justify-center transition"
            >
              ❌
            </button>
          </div>
          <div className="mt-4 bg-white/10 p-4 rounded-xl">
            <p className="text-sm text-lime-100">Available Points</p>
            {/* <p className="text-2xl font-semibold">{points.toLocaleString()}</p> */}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Toggle Tabs */}
          <div className="bg-gray-100 rounded-xl flex overflow-hidden mb-5">
            {["voucher", "money"].map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveOption(opt as "voucher" | "money")}
                className={`flex-1 py-2 font-medium transition ${
                  activeOption === opt
                    ? "bg-white text-emerald-700 shadow"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt === "voucher" ? "🎁 Vouchers" : "💸 Cash Out"}
              </button>
            ))}
          </div>

          {/* Vouchers List */}
          {activeOption === "voucher" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 mb-2">Select a voucher</h3>
              {vouchers.map((voucher) => {
                const disabled = points < voucher.points;
                return (
                  <div
                    key={voucher.id}
                    onClick={() => !disabled && setSelectedVoucher(voucher.id)}
                    className={`cursor-pointer p-4 border rounded-xl transition-all ${
                      selectedVoucher === voucher.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{voucher.name}</p>
                        <p className="text-sm text-gray-600">{voucher.value}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700">{voucher.points} pts</p>
                        {disabled && <p className="text-xs text-red-500">Not enough points</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cash Out */}
          {activeOption === "money" && (
            <div className="space-y-4">
              <label className="block font-medium text-gray-700">Amount to transfer (EGP)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
                  min="1"
                  max={Math.floor(points / 10)}
                />
                <span className="absolute right-4 top-3 text-gray-500 text-sm">EGP</span>
              </div>
              {amount && (
                <p className="text-sm text-gray-600">
                  Requires: <span className="font-medium">{parseInt(amount) * 10} points</span>
                </p>
              )}
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-sm text-emerald-800">
                <strong>Rate:</strong> 10 points = 1 EGP
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleRedeem}
            disabled={
              (activeOption === "voucher" && !selectedVoucher) ||
              (activeOption === "money" && !amount) ||
              (activeOption === "voucher" &&
                selectedVoucher &&
                points < vouchers.find((v) => v.id === selectedVoucher)?.points!) ||
              (activeOption === "money" && amount && points < parseInt(amount) * 10)
            }
            className="mt-6 w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700"
          >
            {activeOption === "voucher" ? "Redeem Voucher" : "Transfer to Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
