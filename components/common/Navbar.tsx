"use client";

import Link from "next/link";
import React, { useContext, useState, useMemo } from "react";
import {
  ShoppingCart,
  HousePlus,
  BadgeInfo,
  KeyRound,
  X,
  Menu,
  UserRoundPen,
  GalleryVerticalEnd,
  Recycle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { FaRecycle, FaRobot } from "react-icons/fa";
import { UserAuthContext } from "@/context/AuthFormContext";
import Button from "./Button";

export default function Navbar() {
  const authContext = useContext(UserAuthContext);
  const { user, logout, isLoading } = authContext ?? {};

  const { cart } = useCart();
  const totalItems = useMemo(() => cart.length, [cart.length]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Loading skeleton for auth buttons
  const AuthButtonsSkeleton = () => (
    <div className="hidden md:flex items-center space-x-3">
      <div className="w-16 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
      <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
    </div>
  );

  const MobileAuthButtonsSkeleton = () => (
    <div className="space-y-2">
      <div className="w-full h-10 bg-gray-200 animate-pulse rounded"></div>
      <div className="w-full h-10 bg-gray-200 animate-pulse rounded"></div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center">
          <div className="text-2xl font-extrabold bg-gradient-to-r from-accent-content to-success bg-clip-text text-transparent">
            XChange
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            prefetch={true}
            href="/"
            className="flex items-center text-gray-700 hover:text-primary font-extrabold gap-1"
          >
            <HousePlus className="w-5 h-5" />
            <span>Home</span>
          </Link>

          <Link
            prefetch={true}
            href="/category"
            className="flex items-center text-gray-700 hover:text-success font-extrabold gap-1"
          >
            <GalleryVerticalEnd className="w-5 h-5" />
            <span>Categories</span>
          </Link>
          
          <Link
            prefetch={true}
            href="/ideas"
            className="flex items-center text-gray-700 hover:text-success font-extrabold gap-1"
          >
            <FaRobot className="w-5 h-5" />
            <span>Eco-Assist</span>
          </Link>
          
          <Link
            prefetch={true}
            href="/cart"
            className="relative flex items-center text-gray-700 hover:text-success font-extrabold gap-1"
          >
            <Recycle className="w-5 h-5" />
            <span>Your collection</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth Buttons */}
          {isLoading ? (
            <AuthButtonsSkeleton />
          ) : user ? (
            <>
              <Link
                prefetch={true}
                href="/profile"
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-success font-extrabold gap-1"
              >
                <UserRoundPen className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <Button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                prefetch={true}
                href="/auth/login"
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-success font-extrabold gap-1"
              >
                <KeyRound className="w-5 h-5" />
                <span>Login</span>
              </Link>
              <Link
                prefetch={true}
                href="/auth/signup"
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold flex items-center gap-1"
              >
                <span>Start Recycling</span>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-success"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md px-4 py-4 space-y-2">
          <Link
            prefetch={true}
            href="/"
            onClick={toggleMenu}
            className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded"
          >
            <HousePlus className="w-5 h-5" />
            <span>Home</span>
          </Link>
          
          <Link
            prefetch={true}
            href="/dashboard"
            onClick={toggleMenu}
            className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded"
          >
            <BadgeInfo className="w-5 h-5" />
            <span>About</span>
          </Link>
          
          <Link
            prefetch={true}
            href="/category"
            onClick={toggleMenu}
            className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded"
          >
            <FaRecycle className="w-5 h-5" />
            <span>Recycling</span>
          </Link>
          
          <Link
            prefetch={true}
            href="/cart"
            onClick={toggleMenu}
            className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Auth Buttons */}
          {isLoading ? (
            <MobileAuthButtonsSkeleton />
          ) : user ? (
            <>
              <Link
                prefetch={true}
                href="/profile"
                onClick={toggleMenu}
                className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded"
              >
                <UserRoundPen className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                prefetch={true}
                href="/auth"
                onClick={toggleMenu}
                className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded"
              >
                <KeyRound className="w-5 h-5" />
                <span>Login</span>
              </Link>
              <Link
                prefetch={true}
                href="/app/auth/register"
                onClick={toggleMenu}
                className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-2 rounded"
              >
                <span>Start Recycling</span>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}