import Button from "@/components/common/Button";
import { FormInputs } from "@/components/Types/address.type";
import Image from "next/image";
import { deliveryFees } from "@/constants/deliveryFees";
import { useLanguage } from "@/context/LanguageContext"; // Add this import
import { CartItem } from "@/models/cart";
interface ReviewProps {
  onBack: () => void;
  onConfirm: () => void;
  formData?: FormInputs | null;
  loading: boolean;
  cartItems: CartItem[];
  userRole?: string;
  paymentMethod?: string;
}

export default function Review({
  onBack,
  onConfirm,
  loading,
  cartItems,
  formData,
  userRole,
  paymentMethod,
}: ReviewProps) {
  const { locale } = useLanguage(); // Get current locale

  // Helper function to get display name
  const getDisplayName = (
    name: string | { en: string; ar: string }
  ): string => {
    if (typeof name === "string") return name;
    return name[locale] || name.en || ""; // Use current locale, fallback to English
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee =
    formData?.city && userRole === "buyer"
      ? deliveryFees[formData.city] || 0
      : 0;

  const total = userRole === "buyer" ? subtotal + deliveryFee : subtotal;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-green-700">Review Your Order</h2>

      <div className="bg-green-50 rounded-lg p-4 space-y-4">
        {cartItems.length === 0 ? (
          <p className="text-green-900">Your cart is empty.</p>
        ) : (
          <>
            {cartItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 border-b pb-4 border-green-200"
              >
                <Image
                  width={64}
                  height={64}
                  src={item.image}
                  alt={getDisplayName(item.name)} // Use display name for alt text
                  className="object-cover rounded-md border"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800">
                    {getDisplayName(item.name)} {/* Fixed: Use display name */}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Quantity:{" "}
                    <span className="text-green-700">{item.quantity}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Price per unit:{" "}
                    <span className="text-green-700">
                      {item.price.toFixed(2)} EGP
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Points:{" "}
                    <span className="text-green-700">{item.points}</span>
                  </p>
                </div>
              </div>
            ))}

            {/* Summary Section */}
            <div className="text-right mt-6 space-y-4">
              {/* Show full breakdown only for buyer */}
              {userRole === "buyer" && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm md:text-base">
                      Order Price:
                    </span>
                    <span className="font-medium text-gray-700">
                      {subtotal.toFixed(2)} EGP
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm md:text-base">
                      Delivery Fees:
                    </span>
                    <span className="font-medium text-gray-700">
                      {deliveryFee.toFixed(2)} EGP
                    </span>
                  </div>
                </>
              )}

              {/* Always show total */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2">
                <span className="text-lg font-semibold text-green-600">
                  Total:
                </span>
                <span className="text-lg font-bold text-green-600">
                  {total.toFixed(2)} EGP
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-4">
              <Button
                onClick={onBack}
                className="bg-red-600 px-6 py-2 rounded-lg"
              >
                Back
              </Button>

              <Button
                disabled={loading}
                onClick={onConfirm}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Processing..." : "Confirm Order"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
