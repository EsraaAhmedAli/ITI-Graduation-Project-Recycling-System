import { FaRecycle, FaLeaf, FaTrashAlt, FaBoxOpen } from "react-icons/fa";

export const categoryIcons: Record<string, JSX.Element> = {
  "Plastic": <FaRecycle className="text-[var(--color-accent-content)] text-2xl" />,
  "paper": <FaLeaf className="text-[var(--color-success)] text-2xl" />,
  "Carton Packs": <FaRecycle className="text-[var(--color-error)] text-2xl" />,
  "Glass": <FaBoxOpen className="text-[var(--color-accent)] text-2xl" />,
  "Home Maintenance": <FaRecycle className="text-[var(--color-accent-content)] text-2xl" />
};
