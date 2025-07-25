import api from "@/lib/axios";
import { useState } from "react";
import { toast } from "react-hot-toast"; // Optional for feedback
import Button from "@/components/common/Button";

export default function SubscriptionForm() {
  const [email, setEmail] = useState("");

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }

    try {
      await api.post("/subscribe", { email });
      toast.success("Subscribed successfully! 🎉");

      // Clear the input field after success
      setEmail("");
    } catch (err: any) {
        
      const message =
        err.response?.data?.error || err.message || "Something went wrong.";
      toast.error(message);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg sm:max-w-2xl mx-auto">
        <div className="relative flex-grow group">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 sm:py-5 pr-12 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md text-base sm:text-lg bg-white/80 backdrop-blur-sm placeholder-gray-500"
            required
          />
        </div>

     <Button onClick={handleSubscribe} className="px-8 py-4 sm:py-5 bg-gradient-to-r from-primary to-primary-focus hover:from-primary-focus hover:to-primary text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 text-base sm:text-lg whitespace-nowrap shadow-lg">
            <span className="flex items-center gap-2">
              Subscribe Now
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>
      </div>
    </div>
  );
}
