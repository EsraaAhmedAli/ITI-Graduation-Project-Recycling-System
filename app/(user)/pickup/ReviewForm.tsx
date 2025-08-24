import Button from "@/components/common/Button";
import { FormInputs } from "@/components/Types/address.type";
import Image from "next/image";
import { deliveryFees } from "@/constants/deliveryFees";
import { useLanguage } from "@/context/LanguageContext";
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
}: ReviewProps) {
  const { locale, t } = useLanguage();

  // Helper function to get display name
  const getDisplayName = (
    name: string | { en: string; ar: string }
  ): string => {
    if (typeof name === "string") return name;
    return name[locale] || name.en || "";
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
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-bold text-green-500">
        {t("review.reviewYourOrder")}
      </h2>

      <div
        className="rounded-lg p-4 sm:p-6 space-y-4"
        style={{ background: "var(--color-green-50)" }}
      >
        {cartItems.length === 0 ? (
          <p className="text-green-900">{t("review.cartEmpty")}</p>
        ) : (
          <>
            {/* Cart Items */}
            {cartItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b pb-4 border-green-200"
              >
                <Image
                  width={64}
                  height={64}
                  src={item.image}
                  alt={getDisplayName(item.name)}
                  className="object-cover rounded-md border w-14 h-14 sm:w-16 sm:h-16"
                />
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-green-800 text-sm sm:text-base">
                    {getDisplayName(item.name)}
                  </h3>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: "var(--text-gray-700)" }}
                  >
                    {t("review.quantity")}:{" "}
                    <span className="text-green-500">{item.quantity}</span>
                  </p>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: "var(--text-gray-700)" }}
                  >
                    {t("review.pricePerUnit")}:{" "}
                    <span className="text-green-500">
                      {item.price.toFixed(2)} {t("common.currency")}
                    </span>
                  </p>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: "var(--text-gray-700)" }}
                  >
                    {t("review.points")}:{" "}
                    <span className="text-green-500">{item.points}</span>
                  </p>
                </div>
              </div>
            ))}

            {/* Summary Section */}
            <div className="mt-6 space-y-4 text-sm sm:text-base">
              {userRole === "buyer" && (
                <>
                  <div className="flex justify-between items-center">
                    <span style={{ color: "var(--text-gray-400)" }}>
                      {t("review.orderPrice")}:
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: "var(--text-gray-400)" }}
                    >
                      {subtotal.toFixed(2)} {t("common.currency")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span style={{ color: "var(--text-gray-400)" }}>
                      {t("review.deliveryFees")}:
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: "var(--text-gray-400)" }}
                    >
                      {deliveryFee.toFixed(2)} {t("common.currency")}
                    </span>
                  </div>
                </>
              )}

              {/* Total */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2">
                <span className="text-base sm:text-lg font-semibold text-green-500">
                  {t("review.total")}:
                </span>
                <span className="text-base sm:text-lg font-bold text-green-500">
                  {total.toFixed(2)} {t("common.currency")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
              <Button
                onClick={onBack}
                className="w-full sm:w-auto bg-red-600 px-5 sm:px-6 py-2.5 rounded-lg text-sm sm:text-base"
              >
                {t("common.back")}
              </Button>

              <Button
                disabled={loading}
                onClick={onConfirm}
                className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-lg text-sm sm:text-base
                  ${
                    loading
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
              >
                {loading ? t("review.processing") : t("review.confirmOrder")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
