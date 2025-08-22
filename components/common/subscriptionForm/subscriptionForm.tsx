import api from "@/lib/axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Button from "@/components/common/Button";
import { useLanguage } from "@/context/LanguageContext";

export default function SubscriptionForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error(t("indexPage.subscribe.invalid_email"));
      return;
    }

    try {
      await api.post("/subscribe", { email });
      toast.success(t("indexPage.subscribe.success_message"));

      setEmail("");
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || t("indexPage.subscribe.error_message");
      toast.error(message);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg sm:max-w-2xl mx-auto" >
        <div className="relative flex-grow group">
          <input
            type="email"
            placeholder={t("indexPage.subscribe.enter_email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 sm:py-5 pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <Button
          onClick={handleSubscribe}
          className="px-8 py-4 sm:py-5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 dark:from-emerald-500 dark:to-blue-500 dark:hover:from-emerald-600 dark:hover:to-blue-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 text-base sm:text-lg whitespace-nowrap shadow-lg group"
        >
          <span className="flex items-center gap-2">
            {t("indexPage.subscribe.subscribe_now")}
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </Button>
      </div>
    </div>
  );
}