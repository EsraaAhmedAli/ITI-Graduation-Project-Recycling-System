import { FaRecycle, FaLeaf, FaTrashAlt, FaBoxOpen } from "react-icons/fa";

export const categoryIcons: Record<string, JSX.Element> = {
  "Plastic": <FaRecycle className="text-[var(--color-info)] text-2xl" />,
  "Paper": <FaLeaf className="text-[var(--color-success)] text-2xl" />,
  "E-Waste": <FaTrashAlt className="text-[var(--color-error)] text-2xl" />,
  "Glass": <FaBoxOpen className="text-[var(--color-accent)] text-2xl" />,
};
