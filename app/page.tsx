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
      <motion.section className="relative w-full h-[700px]">
        <Image
          src="/beautiful-tree.jpg"
          alt="Recycling"
          fill
          className="object-cover object-center"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50"
        >
          <h1 className="text-4xl font-bold mb-4">
            Recycle Today for a Better Tomorrow
          </h1>
          <p className="text-xl mb-6">
            Simple, community-driven recycling platform
          </p>
          <div className="flex gap-4">
            <Link
              href="/category"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded"
            >
              Drop your waste !
            </Link>
            <Link
              href="/about"
              className="bg-white text-green-700 hover:bg-gray-100 font-semibold py-4 px-8 rounded"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
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
