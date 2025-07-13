import Button from "@/components/common/Button";
import { FormInputs } from "@/components/Types/address.type";
import { useState } from "react";

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price?: number;
};

interface ReviewProps {
  onBack: () => void;
  onConfirm: () => void;
  formData?: FormInputs | null;
}

export default function Review({ onBack,onConfirm }: ReviewProps) {
  const [internalCart] = useState<CartItem[]>( [
    { id: '1', name: 'Paper', quantity: 5, price: 0 },
    { id: '2', name: 'Cans', quantity: 10, price: 0 },
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-green-700">Review Your Order</h2>

      <div className="bg-green-50 rounded-lg p-4 space-y-3">
        {internalCart.length === 0 ? (
          <p className="text-green-900">Your cart is empty.</p>
        ) : (
          internalCart.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b border-green-200 pb-2">
              <span className="font-medium text-green-800">{item.name}</span>
              <span className="text-green-700">x{item.quantity}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between mt-4">
        <Button
          onClick={onBack}
          className="border border-green-500 text-green-600 px-6 py-2 rounded-lg"
        >
          Back
        </Button>
        <Button
        onClick={onConfirm}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          Confirm Order
        </Button>
      </div>
    </div>
  );
}
