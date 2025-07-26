"use client";
import Image from "next/image";
import Link from "next/link";
import { CircleDollarSign, Mic, CalendarCheck } from "lucide-react";
import Button from "@/components/common/Button";
import { motion } from "framer-motion";
import CategoryList from "@/components/shared/CategoryList";

export default function Home() {
  return (
    <>
    <motion.section className="relative w-full h-[90vh] min-h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/beautiful-tree.jpg"
            alt="Recycling"
            fill
            className="object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Recycle Today for a
              <span className="block bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Better Tomorrow
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Join our community-driven platform and make recycling simple, rewarding, and impactful
            </p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/category"
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10">Drop Your Waste!</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
            <Link
              href="/about"
              className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000" />
      </motion.section>
      <section className="flex flex-col md:flex-row justify-between items-stretch gap-6 px-4 py-10 text-2xl bg-base-100 text-center rounded-2xl mx-15">
        <div className="flex-1 flex flex-col items-center">
          <Mic className="w-10 h-10 text-green-600 mx-auto md:mx-0 mb-2" />
          <h2 className="font-bold text-primary mb-2">Voice Input</h2>
          <p>Record Your Items</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <CalendarCheck className="w-10 h-10 text-blue-600 mx-auto md:mx-0 mb-2" />
          <h2 className="font-bold text-info mb-2">Pickup Scheduling</h2>
          <p>Choose a Date and Time</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <CircleDollarSign className="w-10 h-10 text-yellow-600 mx-auto md:mx-0 mb-2" />
          <h2 className="font-bold text-yellow-600 mb-2">Earn or Share</h2>
          <p>Get Paid or Donate</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-accent-content">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8">
          <div className="flex-1 max-w-md flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-md opacity-75"></div>
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold shadow-lg">
                1
              </div>
            </div>
            <div className="bg-base-200 rounded-2xl p-8 w-full text-center shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <h3 className="text-2xl font-semibold mb-4">Sign Up</h3>
              <p className="text-lg opacity-90">
                Create your account in just 30 seconds
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center py-16">
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary"></div>
          </div>
          <div className="flex-1 max-w-md flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-secondary/10 rounded-full blur-md opacity-75"></div>
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-white text-2xl font-bold shadow-lg">
                2
              </div>
            </div>
            <div className="bg-base-200 rounded-2xl p-8 w-full text-center shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <h3 className="text-2xl font-semibold mb-4">
                Select Type of Waste
              </h3>
              <p className="text-lg opacity-90">choose from categories</p>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center py-16">
            <div className="w-16 h-1 bg-gradient-to-r from-secondary to-accent"></div>
          </div>
          <div className="flex-1 max-w-md flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-accent/10 rounded-full blur-md opacity-75"></div>
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-accent text-white text-2xl font-bold shadow-lg">
                3
              </div>
            </div>
            <div className="bg-base-200 rounded-2xl p-8 w-full text-center shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <h3 className="text-2xl font-semibold mb-4">Connect & Recycle</h3>
              <p className="text-lg opacity-90">
                Find nearby centers or schedule pickup
              </p>
            </div>
          </div>
        </div>
      </section>
      <CategoryList basePath="/category" maxToShow={6} />
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16 px-4 sm:px-6 lg:px-8 rounded-2xl mx-4 sm:mx-8 lg:mx-16 my-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-accent-content">
            Join Our <span className="text-primary">Community</span>
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-gray-700 max-w-2xl mx-auto">
            Get exclusive recycling tips, updates, and special offers straight
            to your inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md sm:max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-5 py-3 sm:py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm text-base"
            />
            <Button className="px-6 py-3 sm:py-4 bg-primary hover:bg-primary-focus text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-md">
              Subscribe Now
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </>
  );
}
