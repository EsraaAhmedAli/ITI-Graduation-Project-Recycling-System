"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingCart,
  HousePlus,
  BadgeInfo,
  KeyRound,
  X,
  Menu,
  UserRoundPen,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { FaRecycle } from "react-icons/fa";

const isLoggedIn = false;

export default function Navbar() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

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
          <Link href="/" className="flex items-center text-gray-700 hover:text-primary font-extrabold gap-1">
            <HousePlus className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/app/user/dashboard" className="flex items-center text-gray-700 hover:text-success font-extrabold gap-1">
            <BadgeInfo className="w-5 h-5" />
            <span>About</span>
          </Link>
          <Link href="/category" className="flex items-center text-gray-700 hover:text-success font-extrabold gap-1">
            <FaRecycle className="w-5 h-5" />
            <span>Recycling</span>
          </Link>

          <Link href="/cart" className="relative flex items-center text-gray-700 hover:text-success font-extrabold gap-1">
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/profile" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-success font-extrabold gap-1">
                <UserRoundPen className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold">Logout</button>
            </>
          ) : (
            <>
              <Link href="/app/auth/login" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-success font-extrabold gap-1">
                <KeyRound className="w-5 h-5" />
                <span>Login</span>
              </Link>
              <Link href="/app/auth/register" className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold flex items-center gap-1">
                <span>Start Recycling</span>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-700 hover:text-success">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md px-4 py-4 space-y-2">
          <Link href="/" onClick={toggleMenu} className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded">
            <HousePlus className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/app/user/dashboard" onClick={toggleMenu} className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded">
            <BadgeInfo className="w-5 h-5" />
            <span>About</span>
          </Link>
          <Link href="/category" onClick={toggleMenu} className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded">
            <FaRecycle className="w-5 h-5" />
            <span>recycling</span>
          </Link>

          <Link href="/cart" onClick={toggleMenu} className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded relative">
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/profile" onClick={toggleMenu} className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded">
                <UserRoundPen className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button onClick={() => { }} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/app/auth/login" onClick={toggleMenu} className="flex items-center gap-2 font-extrabold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded">
                <KeyRound className="w-5 h-5" />
                <span>Login</span>
              </Link>
              <Link href="/app/auth/register" onClick={toggleMenu} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-2 rounded">
                <span>Start Recycling</span>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
