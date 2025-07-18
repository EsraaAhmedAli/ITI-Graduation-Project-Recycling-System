"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "flowbite-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function CartPage() {
  const { cart, removeFromCart, clearCart, increaseQty, decreaseQty } =
    useCart();

  const router = useRouter();
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const price = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalItems(total);
    setTotalPrice(price);
  }, [cart]);

  const confirmAction = async ({
    title,
    text,
    onConfirm,
  }: {
    title: string;
    text: string;
    onConfirm: () => void;
  }) => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      onConfirm();
      Swal.fire({
        icon: "success",
        title: "Done!",
        text: "Action completed.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-gray-500 mb-6">Your cart is empty.</p>
          <Button
            onClick={() => router.push("/categories")}
            className="bg-primary"
          >
            Browse Items
          </Button>
        </div>
      ) : (
        <>
          <div className="text-right mb-4 text-sm text-gray-600">
            Total Items: {totalItems} | Total Price: {totalPrice.toFixed(2)} EGP
          </div>

          <div className="grid gap-4">
            <AnimatePresence>
              {cart.map((item, idx) => (
                <motion.div
                  key={`${item.categoryId}-${idx}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
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
                        onClick={() =>
                          Swal.fire({
                            title: "Are you sure?",
                            text: "Do you really want to remove this item from cart?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes, remove it",
                            cancelButtonText: "No, keep it",
                            confirmButtonColor: "#16a34a",
                            cancelButtonColor: "#d33",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              removeFromCart(item);
                              Swal.fire({
                                icon: "success",
                                title: "Removed!",
                                text: "Item removed from cart.",
                                timer: 1500,
                                showConfirmButton: false,
                              });
                            }
                          })
                        }
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
                          Measurement Unit:{" "}
                          {item.measurement_unit === 1 ? "Weight" : "Count"}
                        </p>
                        <p className="text-sm text-gray-800">
                          Price per item: {item.price?.toFixed(2) ?? "N/A"} EGP
                        </p>
                        <p className="text-sm text-gray-700">
                          Points: {item.points}
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
          </div>

          <div className="flex justify-between mt-8">
            <Button
              color="failure"
              onClick={() =>
                confirmAction({
                  title: "Clear Cart?",
                  text: "Are you sure you want to remove all items?",
                  onConfirm: clearCart,
                })
              }
            >
              Clear Cart
            </Button>
            <Button
              className="bg-primary"
              onClick={() => router.push("/pickup")}
            >
              Proceed to Pickup
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
