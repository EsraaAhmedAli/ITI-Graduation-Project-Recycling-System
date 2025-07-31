import Button from "@/components/common/Button";
import { FormInputs } from "@/components/Types/address.type";
import Image from "next/image";
import { priceWithMarkup } from "@/utils/priceUtils";




type CartItem = {
  categoryId: string;
  image: string;
  itemName: string;
  measurement_unit: 1 | 2;
  points: number;
  price: number;
  quantity: number;
};

interface ReviewProps {
  onBack: () => void;
  onConfirm: () => void;
  formData?: FormInputs | null;
  loading: boolean;
  cartItems: CartItem[];
  userRole?: string;
}

export default function Review({
  onBack,
  onConfirm,
  loading,
  cartItems,
  userRole,
}: ReviewProps) {
  const total = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);



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
                  alt={item.itemName}
                  className=" object-cover rounded-md border"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800">
                    {item.itemName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Quantity:{" "}
                    <span className="text-green-700">{item.quantity}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Price per unit:{" "}
                    <span className="text-green-700">{item.price.toFixed(2)} EGP</span>
                  </p>

                  <p className="text-sm text-gray-600">
                    Points:{" "}
                    <span className="text-green-700">{item.points}</span>
                  </p>

                </div>
              </div>
            ))}

            <div className="text-right mt-2 font-semibold text-green-900">
              Total: {total.toFixed(2)} EGP
            </div>

          </>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <Button onClick={onBack} className="bg-red-600 px-6 py-2 rounded-lg">
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
    </div>
  );
}
