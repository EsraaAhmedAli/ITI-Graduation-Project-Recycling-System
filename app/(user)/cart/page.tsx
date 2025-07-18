"use client";

import { useCart } from "@/context/CartContext";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { useUserAuth } from "@/context/AuthFormContext";

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeFromCart, clearCart } =
    useCart();

  const totalPoints = cart
    .reduce((sum, item) => sum + item.points * item.quantity, 0)
    .toFixed(2);
  const totalPrice = cart
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);
  const { user } = useUserAuth();
  console.log("user in cart page", user);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8 md:py-12" dir="ltr">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-light tracking-tight text-green-500 flex items-center"
          >
            <ShoppingBag className="w-8 h-8 mr-3 text-green-500" />
            Your Shopping Cart
          </motion.h1>

          {cart.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="hidden md:block bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full"
            >
              {cart.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              {cart.reduce((sum, item) => sum + item.quantity, 0) > 1
                ? "Items"
                : "Item"}
            </motion.span>
          )}
        </div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xs border border-[#eee] p-12 text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-[#ddd]" />
            </div>
            <h3 className="text-2xl font-light text-gray-700 mb-3">
              Your cart feels light
            </h3>
            <p className="text-gray-500 mb-8">
              Let's find something you'll love
            </p>
            <Link
              href="/category"
              className="inline-block bg-black hover:bg-gray-800 text-white font-normal px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8"
          >
            <div className="space-y-6">
              <AnimatePresence>
                {cart.map((item, idx) => (
                  <motion.div
                    key={`${item.id}-${idx}`}
                    variants={itemVariants}
                    layout
                    className="bg-white rounded-xl shadow-xs border border-[#eee] overflow-hidden group"
                  >
                    <div className="p-6 flex flex-col sm:flex-row">
                      <div className="bg-[#f9f9f9] rounded-lg w-full sm:w-32 h-32 flex-shrink-0 flex items-center justify-center mb-4 sm:mb-0 mr-6 relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.itemName}
                            className="w-full sm:w-32 h-32 object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-[#ccc]" />
                        )}

                        <button
                          onClick={() => {
                            Swal.fire({
                              title: "Are you sure?",
                              text: "Do you really want to remove your item cart?",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Yes, clear it",
                              cancelButtonText: "No, keep it",
                              confirmButtonColor: "#16a34a",
                              cancelButtonColor: "#d33",
                            }).then((result) => {
                              if (result.isConfirmed) {
                                removeFromCart(item);
                                Swal.fire({
                                  icon: "success",
                                  title: "Cleared!",
                                  text: "Your cart has been cleared.",
                                  timer: 1500,
                                  showConfirmButton: false,
                                });
                              }
                            });
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#999] hover:text-red-500"
                          title="Remove"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 flex flex-col sm:flex-row">
                        <div className="flex-1">
                          <h3 className="text-xl font-light text-gray-800 mb-1">
                            {item.itemName}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Price per item: {item.price.toFixed(2)} EGP
                          </p>
                          <p className="text-sm text-gray-800">
                            Total: {(item.price * item.quantity).toFixed(2)} EGP
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0">
                          <div className="flex items-center border border-[#eee] rounded-full">
                            <button
                              onClick={() => decreaseQty(item)}
                              className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-black hover:bg-[#f5f5f5] rounded-l-full transition-all"
                              disabled={item.quantity <= 1}
                            >
                              <ChevronDown className="w-5 h-5" />
                            </button>
                            <span className="px-3 text-base font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQty(item)}
                              className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-black hover:bg-[#f5f5f5] rounded-r-full transition-all"
                            >
                              <ChevronUp className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-xs border border-[#eee] p-6"
              >
                <button
                  onClick={() => {
                    Swal.fire({
                      title: "Are you sure?",
                      text: "Do you really want to clear your entire cart?",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Yes, clear it",
                      cancelButtonText: "No, keep it",
                      confirmButtonColor: "#16a34a", // green
                      cancelButtonColor: "#d33", // red
                    }).then((result) => {
                      if (result.isConfirmed) {
                        clearCart();
                        Swal.fire({
                          icon: "success",
                          title: "Cleared!",
                          text: "Your cart has been cleared.",
                          timer: 1500,
                          showConfirmButton: false,
                        });
                      }
                    });
                  }}
                  className="flex items-center text-[#999] hover:text-red-500 transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span>Clear Entire Cart</span>
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div className="bg-white rounded-xl shadow-xs border border-[#eee] p-8">
                <h3 className="text-2xl font-light text-gray-800 mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[#555]">
                    <span>Total Point</span>
                    <span className="font-medium">{totalPoints} pts</span>
                  </div>
                  {/* <div className="flex justify-between text-[#555]">
                    <span>Conversion</span>
                    <span className="font-medium">1 pt = 1 EGP</span>
                  </div> */}
                  <div className="border-t border-[#eee] my-4"></div>
                  <div className="flex justify-between text-xl">
                    <span className="font-medium">Total</span>
                    <span className="font-medium text-gray-900">
                      {totalPrice} EGP
                    </span>
                  </div>
                </div>

                <Link
                  href={user?.email ? "/pickup" : "/auth"}
                  className="w-full bg-green-500 hover:bg-gray-800 text-white font-normal py-4 px-6 rounded-full transition-all duration-300 hover:shadow-lg flex items-center justify-center"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-xs text-[#aaa] mt-6 text-center">
                  Free shipping and returns available
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-xs border border-[#eee] p-6 mt-4">
                <h4 className="font-medium text-green-500 mb-3">Need help?</h4>
                <p className="text-sm text-[#666] mb-4">
                  Our customer service is available 24/7
                </p>
                <button className="text-sm text-[#555] hover:text-black underline transition-colors">
                  Contact Support
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
