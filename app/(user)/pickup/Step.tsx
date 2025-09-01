"use client";
import {
  Recycle,
  Package,
  Truck,
  CheckCircle,
  User,
  CreditCard,
  ShoppingCart,
  Home,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Settings,
  Upload,
  Download,
  FileText,
  Image,
  Video,
  Music,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Step({
  label,
  active,
  direction,
  isCurrent,
  stepNumber,
  isCompleted,
}: {
  label: string;
  active: boolean;
  direction: "forward" | "backward";
  isCurrent?: boolean;
  stepNumber?: number;
  isCompleted?: boolean;
}) {
  const [rotation, setRotation] = useState(0);

  // Dynamic icon selection based on label text
  const getIconByLabel = (label: string) => {
    if (!label || typeof label !== "string") return CheckCircle;
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes("recycle") || lowerLabel.includes("refresh"))
      return Recycle;
    if (
      lowerLabel.includes("package") ||
      lowerLabel.includes("box") ||
      lowerLabel.includes("product")
    )
      return Package;
    if (
      lowerLabel.includes("delivery") ||
      lowerLabel.includes("shipping") ||
      lowerLabel.includes("transport")
    )
      return Truck;
    if (
      lowerLabel.includes("complete") ||
      lowerLabel.includes("done") ||
      lowerLabel.includes("finish")
    )
      return CheckCircle;
    if (
      lowerLabel.includes("user") ||
      lowerLabel.includes("profile") ||
      lowerLabel.includes("account")
    )
      return User;
    if (
      lowerLabel.includes("payment") ||
      lowerLabel.includes("card") ||
      lowerLabel.includes("billing")
    )
      return CreditCard;
    if (
      lowerLabel.includes("cart") ||
      lowerLabel.includes("shop") ||
      lowerLabel.includes("order")
    )
      return ShoppingCart;
    if (lowerLabel.includes("home") || lowerLabel.includes("house"))
      return Home;
    if (
      lowerLabel.includes("building") ||
      lowerLabel.includes("office") ||
      lowerLabel.includes("company")
    )
      return Building;
    if (
      lowerLabel.includes("location") ||
      lowerLabel.includes("address") ||
      lowerLabel.includes("map")
    )
      return MapPin;
    if (
      lowerLabel.includes("phone") ||
      lowerLabel.includes("call") ||
      lowerLabel.includes("contact")
    )
      return Phone;
    if (
      lowerLabel.includes("email") ||
      lowerLabel.includes("mail") ||
      lowerLabel.includes("message")
    )
      return Mail;
    if (
      lowerLabel.includes("calendar") ||
      lowerLabel.includes("date") ||
      lowerLabel.includes("schedule")
    )
      return Calendar;
    if (
      lowerLabel.includes("time") ||
      lowerLabel.includes("clock") ||
      lowerLabel.includes("hour")
    )
      return Clock;
    if (
      lowerLabel.includes("settings") ||
      lowerLabel.includes("config") ||
      lowerLabel.includes("setup")
    )
      return Settings;
    if (
      lowerLabel.includes("upload") ||
      lowerLabel.includes("add") ||
      lowerLabel.includes("import")
    )
      return Upload;
    if (
      lowerLabel.includes("download") ||
      lowerLabel.includes("export") ||
      lowerLabel.includes("save")
    )
      return Download;
    if (
      lowerLabel.includes("document") ||
      lowerLabel.includes("file") ||
      lowerLabel.includes("text")
    )
      return FileText;
    if (
      lowerLabel.includes("image") ||
      lowerLabel.includes("photo") ||
      lowerLabel.includes("picture")
    )
      return Image;
    if (
      lowerLabel.includes("video") ||
      lowerLabel.includes("movie") ||
      lowerLabel.includes("film")
    )
      return Video;
    if (
      lowerLabel.includes("music") ||
      lowerLabel.includes("audio") ||
      lowerLabel.includes("sound")
    )
      return Music;

    // Default icon
    return CheckCircle;
  };

  const IconComponent = getIconByLabel(label);

  useEffect(() => {
    // Keep rotation at 0 to prevent icon flipping
    setRotation(0);
  }, [isCurrent, direction, isCompleted]);

  return (
    <div className="flex flex-row items-center text-center md:flex-col">
      <div
        className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 ${
          active
            ? "border-green-700 bg-green-50"
            : "border-gray-300 bg-gray-100"
        }`}
      >
        <IconComponent
          className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ${
            active ? "text-green-700" : "text-gray-400"
          }`}
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        />
        {stepNumber && (
          <span className="absolute text-[10px] sm:text-[11px] font-bold text-green-800"></span>
        )}
      </div>
      <span
        className={`ml-3 md:ml-0 md:mt-2 text-xs sm:text-sm transition-colors duration-300 ${
          active ? "text-green-700 font-semibold" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
