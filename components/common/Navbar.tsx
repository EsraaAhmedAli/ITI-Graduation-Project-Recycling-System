"use client";

import Link from "next/link";
import React, { useContext, useState, useMemo } from "react";
import {
  ShoppingCart,
  Home,
  KeyRound,
  X,
  Menu,
  User,
  Package,
  Leaf,
  Sparkles,
  Bell,
  Settings,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { UserAuthContext } from "@/context/AuthFormContext";

import NavbarSearch from "./search";

export default function Navbar() {
  const authContext = useContext(UserAuthContext);
  const { user, logout, isLoading } = authContext ?? {};
  
  const { cart } = useCart();
  const totalItems = useMemo(() => cart.length, [cart.length]);

  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Loading skeleton for auth buttons
  const AuthButtonsSkeleton = () => (
    <div className="hidden lg:flex items-center space-x-4">
      <div className="w-20 h-9 bg-gray-200 animate-pulse rounded-xl"></div>
      <div className="w-32 h-9 bg-gray-200 animate-pulse rounded-xl"></div>
    </div>
  );

  const MobileAuthButtonsSkeleton = () => (
    <div className="space-y-3">
      <div className="w-full h-12 bg-gray-200 animate-pulse rounded-xl"></div>
      <div className="w-full h-12 bg-gray-200 animate-pulse rounded-xl"></div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-gray-900/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo and Search */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:via-green-700 group-hover:to-teal-700 transition-all duration-300">
                  XChange
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </Link>
            <div className="hidden md:block">
              <NavbarSearch />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className="flex items-center px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium gap-2 transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              href="/category"
              className="flex items-center px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium gap-2 transition-all duration-200"
            >
              <Leaf className="w-4 h-4" />
              <span>Categories</span>
            </Link>

            <Link
              href="/ideas"
              className="flex items-center px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium gap-2 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>Eco-Assist</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium gap-2 transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Collection</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <AuthButtonsSkeleton />
            ) : user ? (
              <>
                {/* Notifications */}
                <button className="hidden md:flex items-center justify-center w-10 h-10 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200">
                  <Bell className="w-5 h-5" />
                </button>

                {/* User Menu */}
                <div className="relative user-menu">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.email || 'user@example.com'}
                      </div>
                    </div>
                    <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">
                          {user.name || 'User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email || 'user@example.com'}
                        </div>
                      </div>
                      
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      
                      <Link
                        href="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                                                 <button
                           onClick={() => {
                             logout?.();
                             setShowUserMenu(false);
                           }}
                           className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full transition-colors"
                         >
                          <KeyRound className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden md:flex items-center px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium gap-2 transition-all duration-200"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="hidden md:flex items-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold gap-2 transition-all duration-200 shadow-lg shadow-emerald-500/25"
                >
                  <Leaf className="w-4 h-4" />
                  <span>Start Recycling</span>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-xl border-t border-gray-200/50 shadow-xl">
          <div className="px-4 py-6 space-y-3">
            {/* Search in mobile */}
            <div className="mb-4">
              <NavbarSearch />
            </div>

            {/* Navigation Links */}
            <Link
              href="/"
              onClick={toggleMenu}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/category"
              onClick={toggleMenu}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all duration-200"
            >
              <Leaf className="w-5 h-5" />
              <span>Categories</span>
            </Link>

            <Link
              href="/ideas"
              onClick={toggleMenu}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              <span>Eco-Assist</span>
            </Link>

            <Link
              href="/cart"
              onClick={toggleMenu}
              className="relative flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Collection</span>
              {totalItems > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Auth Buttons */}
            {isLoading ? (
              <MobileAuthButtonsSkeleton />
            ) : user ? (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Link
                  href="/profile"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                
                <Link
                  href="/orders"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all duration-200"
                >
                  <Package className="w-5 h-5" />
                  <span>My Orders</span>
                </Link>
                
                                 <button
                   onClick={() => {
                     logout?.();
                     setIsOpen(false);
                   }}
                   className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-200"
                 >
                  <KeyRound className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Link
                  href="/auth/login"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all duration-200"
                >
                  <KeyRound className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                
                <Link
                  href="/auth/signup"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/25"
                >
                  <Leaf className="w-5 h-5" />
                  <span>Start Recycling</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for mobile menu */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={toggleMenu}
        />
      )}
    </nav>
  );
}
