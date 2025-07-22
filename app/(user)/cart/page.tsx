"use client";

import { useCart } from "@/context/CartContext";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, Leaf, Recycle, Truck, Scale, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "flowbite-react";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function CartPage() {
  const { cart, removeFromCart, clearCart, increaseQty, decreaseQty } = useCart();
  const router = useRouter();
  const [totalItems, setTotalItems] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const points = cart.reduce((sum, item) => sum + (item.points || 0) * item.quantity, 0);
    
    setTotalItems(total);
    setTotalPoints(points);
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
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Recycle className="w-8 h-8 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">Confrim items you wan to recycle </h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center mt-20 bg-green-50 rounded-xl p-8">
          <Leaf className="w-12 h-12 mx-auto text-green-400 mb-4" />
          <p className="text-gray-600 mb-6 text-lg">Your recycling bin is empty.</p>
          <Button
            onClick={() => router.push("/categories")}
            gradientDuoTone="greenToBlue"
            className="rounded-full px-6 py-3"
          >
            Browse Recyclable Items
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-green-50 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-sm">Total Items</div>
              <div className="text-2xl font-bold text-green-600">{totalItems}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-sm">Earned Points</div>
              <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-sm">Earned Money</div>
              <div className="text-2xl font-bold text-emerald-600">{'50'} EGP</div>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {cart.map((item, idx) => (
                <motion.div
                  key={`${item.categoryId}-${idx}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="bg-green-50 rounded-lg w-full sm:w-24 h-24 flex-shrink-0 flex items-center justify-center relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.itemName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-green-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-800">
                          {item.itemName}
                        </h3>
                        <button
                          onClick={() =>
                            confirmAction({
                              title: "Remove Item?",
                              text: `Remove ${item.itemName} from your recycling collection?`,
                              onConfirm: () => removeFromCart(item),
                            })
                          }
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Scale className="w-4 h-4 mr-1" />
                          {item.measurement_unit === 1 ? "By Kilo" : "By Piece"}
                        </div>
                        <div className="text-green-600 font-medium">
                          {item.points} points each
                        </div>
                        <div className="text-blue-600">
                          Saves {item.co2_saved || 0} kg CO₂
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-full">
                          <button
                            onClick={() => decreaseQty(item)}
                            className={`w-8 h-8 flex items-center justify-center rounded-l-full transition-all 
                              ${
                                item.quantity <= 1
                                  ? "text-gray-300 bg-gray-100 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-3 text-base font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQty(item)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-full transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

   <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
  <Button
    color="light"
    onClick={() =>
      confirmAction({
        title: "Clear All?",
        text: "Are you sure you want to remove all items from your recycling collection?",
        onConfirm: clearCart,
      })
    }
    className="border border-gray-300 text-gray-700 hover:bg-gray-50"
  >
    Clear Collection
  </Button>
  
  <Button
    onClick={() => router.push("/pickup")}
    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
  >
    <Truck className="w-5 h-5" />
    Schedule Pickup
  </Button>
</div>
        </>
      )}
    </div>
  );
}