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
import NavbarSearch from "./search";

export default function Navbar() {
  const authContext = useContext(UserAuthContext);
  const { user, logout, isLoading } = authContext ?? {};
  console.log(user);
  
  const { cart } = useCart();
  const totalItems = useMemo(() => cart.length, [cart.length]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Loading skeleton for auth buttons
  const AuthButtonsSkeleton = () => (
    <div className="hidden lg:flex items-center space-x-2">
      <div className="w-16 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
      <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Search Container */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 flex-1">
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-accent-content to-success bg-clip-text text-transparent">
                XChange
              </div>
            </Link>
            
            {/* Search - Hidden on small screens, visible on medium+ */}
            <div className="hidden md:block flex-1 max-w-md">
              <NavbarSearch />
            </div>
          </div>

          {/* Desktop Nav - Hidden until large screens */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
            <Link
              prefetch={true}
              href="/"
              className="flex items-center text-gray-700 hover:text-primary font-extrabold gap-1 px-2 py-1 rounded transition-colors"
            >
              <HousePlus className="w-4 h-4" />
              <span className="hidden xl:inline">Home</span>
            </Link>

            <Link
              prefetch={true}
              href="/category"
              className="flex items-center text-gray-700 hover:text-success font-extrabold gap-1 px-2 py-1 rounded transition-colors"
            >
              <GalleryVerticalEnd className="w-4 h-4" />
              <span className="hidden xl:inline">Categories</span>
            </Link>

            <Link
              prefetch={true}
              href="/ideas"
              className="flex items-center text-gray-700 hover:text-success font-extrabold gap-1 px-2 py-1 rounded transition-colors"
            >
              <FaRobot className="w-4 h-4" />
              <span className="hidden xl:inline">Eco-Assist</span>
            </Link>

            <Link
              prefetch={true}
              href="/cart"
              className="relative flex items-center text-gray-700 hover:text-success font-extrabold gap-1 px-2 py-1 rounded transition-colors"
            >
              <Recycle className="w-4 h-4" />
              <span className="hidden xl:inline">Collection</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
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
                  className="flex items-center px-2 py-1 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-success font-extrabold gap-1 transition-colors"
                >
                  <UserRoundPen className="w-4 h-4" />
                  <span className="hidden xl:inline">Profile</span>
                </Link>
                <Button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  prefetch={true}
                  href="/auth/login"
                  className="flex items-center px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-success font-extrabold gap-1 transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden xl:inline">Login</span>
                </Link>
                <Link
                  prefetch={true}
                  href="/auth/signup"
                  className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold flex items-center gap-1 text-sm transition-colors whitespace-nowrap"
                >
                  <span className="hidden xl:inline">Start Recycling</span>
                  <span className="xl:hidden">Join</span>
                </Link>
              </>
            )}
          </div>

          {/* Medium Screen Navigation (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-2 flex-shrink-0">
            <Link
              prefetch={true}
              href="/cart"
              className="relative flex items-center text-gray-700 hover:text-success p-2 rounded transition-colors"
            >
              <Recycle className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : user ? (
              <>
                <Link
                  prefetch={true}
                  href="/profile"
                  className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-success transition-colors"
                >
                  <UserRoundPen className="w-5 h-5" />
                </Link>
                <Button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  prefetch={true}
                  href="/auth/login"
                  className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-success transition-colors"
                >
                  <KeyRound className="w-5 h-5" />
                </Link>
                <Link
                  prefetch={true}
                  href="/auth/signup"
                  className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Icon - Show on small and medium screens */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-success p-2 rounded transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Show when menu is closed on small screens */}
        {!isOpen && (
          <div className="md:hidden px-2 pb-3">
            <NavbarSearch />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100">
          <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <Link
              prefetch={true}
              href="/"
              onClick={toggleMenu}
              className="flex items-center gap-3 font-extrabold text-gray-700 hover:bg-gray-100 hover:text-primary px-3 py-3 rounded transition-colors"
            >
              <HousePlus className="w-5 h-5 flex-shrink-0" />
              <span>Home</span>
            </Link>

            <Link
              prefetch={true}
              href="/category"
              onClick={toggleMenu}
              className="flex items-center gap-3 font-extrabold text-gray-700 hover:bg-gray-100 hover:text-success px-3 py-3 rounded transition-colors"
            >
              <GalleryVerticalEnd className="w-5 h-5 flex-shrink-0" />
              <span>Categories</span>
            </Link>

            <Link
              prefetch={true}
              href="/ideas"
              onClick={toggleMenu}
              className="flex items-center gap-3 font-extrabold text-gray-700 hover:bg-gray-100 hover:text-success px-3 py-3 rounded transition-colors"
            >
              <FaRobot className="w-5 h-5 flex-shrink-0" />
              <span>Eco-Assist</span>
            </Link>

            <Link
              prefetch={true}
              href="/dashboard"
              onClick={toggleMenu}
              className="flex items-center gap-3 font-extrabold text-gray-700 hover:bg-gray-100 hover:text-success px-3 py-3 rounded transition-colors"
            >
              <BadgeInfo className="w-5 h-5 flex-shrink-0" />
              <span>About</span>
            </Link>

            <Link
              prefetch={true}
              href="/cart"
              onClick={toggleMenu}
              className="flex items-center gap-3 font-extrabold text-gray-700 hover:bg-gray-100 hover:text-success px-3 py-3 rounded transition-colors"
            >
              <Recycle className="w-5 h-5 flex-shrink-0" />
              <span>Your Collection</span>
              {totalItems > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Auth Section */}
            <div className="pt-2 mt-2 border-t border-gray-200">
              {isLoading ? (
                <MobileAuthButtonsSkeleton />
              ) : user ? (
                <>
                  <Link
                    prefetch={true}
                    href="/profile"
                    onClick={toggleMenu}
                    className="flex items-center gap-3 font-extrabold text-gray-700 hover:bg-gray-100 hover:text-success px-3 py-3 rounded transition-colors"
                  >
                    <UserRoundPen className="w-5 h-5 flex-shrink-0" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded mt-2 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    prefetch={true}
                    href="/auth/login"
                    onClick={toggleMenu}
                    className="flex items-center gap-3 font-extrabold text-gray-700 hover:bg-gray-100 hover:text-success px-3 py-3 rounded transition-colors"
                  >
                    <KeyRound className="w-5 h-5 flex-shrink-0" />
                    <span>Login</span>
                  </Link>
                  <Link
                    prefetch={true}
                    href="/auth/signup"
                    onClick={toggleMenu}
                    className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-3 rounded mt-2 transition-colors"
                  >
                    <span>Start Recycling</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}