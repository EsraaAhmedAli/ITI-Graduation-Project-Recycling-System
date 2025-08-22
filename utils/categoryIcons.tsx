import { FaRecycle, FaLeaf, FaTrashAlt, FaBoxOpen } from "react-icons/fa";

export const categoryIcons: Record<string, JSX.Element> = {
  "plastic": <FaRecycle className="text-[var(--color-accent-content)] text-2xl" />,
  "paper": <FaLeaf className="text-[var(--color-success)] text-2xl" />,
  "Kids toys": <FaRecycle className="text-[var(--color-error)] text-2xl" />,
  "e-waste": <FaBoxOpen className="text-[var(--color-accent)] text-2xl" />,
  "Home Appliances": <FaRecycle className="text-[var(--color-accent-content)] text-2xl" />,
  "Sports Equipments": <FaLeaf className="text-[var(--color-accent)] text-2xl" />,
  "metals": <FaRecycle className="text-[var(--color-info)] text-2xl" />,
  "cooking-oil": <FaRecycle className="text-[var(--color-error)] text-2xl" />,

};
