"use client";

import Link from "next/link";
import React, { useContext, useState, useMemo, useRef, useEffect } from "react";
import {
  HousePlus,
  KeyRound,
  X,
  Menu,
  UserRoundPen,
  GalleryVerticalEnd,
  Recycle,
  Store,

  Settings,
  LogOut,
  User,
  ChevronDown,
  Globe,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { FaRobot } from "react-icons/fa";
import { UserAuthContext } from "@/context/AuthFormContext";
import Button from "./Button";
import NavbarSearch from "./search";
import Image from "next/image";
import { NotificationBell } from "../notifications/notidication";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const authContext = useContext(UserAuthContext);
  const { user, logout, isLoading } = authContext ?? {};
  const { cart, removeFromCart } = useCart();
  const totalItems = useMemo(() => cart.length, [cart.length]);
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const cartRef = useRef(null);
  const profileRef = useRef(null);
  const toggleMenu = () => setIsOpen(!isOpen);
  const isBuyer = user?.role === "buyer";
  const { locale, setLocale } = useLanguage();


  const { t } = useLanguage();

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleRemoveFromCart = async (item) => {
    try {
      await removeFromCart(item); // Use the context's removeFromCart function
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleLogout = async () => {
    try {
       logout();
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (user) => {
    if (!user) return "U";
    const name =
      user.name || user.fullName || user.firstName || user.email || "User";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Loading skeletons
  const AuthButtonsSkeleton = () => (
    <div className="hidden lg:flex items-center space-x-2">
      <div className="w-16 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
      <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {" "}
          {/* Reduced height from h-16 to h-14 */}
          {/* Left side: Logo + Search */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {" "}
            {/* Reduced gap from 6 to 4 */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="text-lg lg:text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                {/* Reduced font size */}
                {t("navbar.title")}
              </div>
            </Link>
            <div className="hidden md:block flex-1 max-w-sm">
              {" "}
              {/* Reduced max width */}
              <NavbarSearch />
            </div>
          </div>
          {/* Center: Navigation Links - Desktop (More compact) */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
        
              prefetch={true}
              href={user?.role == "buyer" ? "/home" : "/"}
              className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200 text-sm" // Reduced padding and font size
            >
              <HousePlus className="w-4 h-4" />
              <span>{t("navbar.home")}</span>
            </Link>

            <Link
              prefetch={true}
              href={isBuyer ? "/marketplace" : "/category"}
              className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200 text-sm"
            >
              {isBuyer ? (
                <Store className="w-4 h-4" />
              ) : (
                <GalleryVerticalEnd className="w-4 h-4" />
              )}
              <span>
                {isBuyer ? t("navbar.marketplace") : t("navbar.categories")}
              </span>
            </Link>

            <Link
              prefetch={true}
              href="/ideas"
              className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200 text-sm"
            >
              <FaRobot className="w-4 h-4" />
              <span>{t("navbar.ecoAssist")}</span>
            </Link>
          </div>
          {/* Right side: Actions (More compact and better organized) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {" "}
            {/* Reduced spacing */}
            {/* Collection Cart - More compact */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative flex items-center gap-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium px-2 py-1.5 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200" // Reduced padding
                title={isBuyer ? t("navbar.myCart"):t("navbar.myCollection")}
              >
                <div className="relative">
                  <Recycle className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-sm ring-1 ring-white text-[10px]">
                      {" "}
                      {/* Smaller badge */}
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-medium text-sm">
                {isBuyer ? t("navbar.myCart"):t("navbar.myCollection")
}
                </span>{" "}
                {/* Smaller text */}
              </button>

              {/* Cart Dropdown - Same as before but can be optimized if needed */}
              {isCartOpen && (
                <div className="absolute right-[-70px] mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {" "}
                  {/* Slightly smaller width */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">
                     {isBuyer ? t("navbar.myCart"):t("navbar.myCollection")}

                    </h3>{" "}
                    {/* Smaller text */}
                    <span className="text-xs text-gray-500">
                      {" "}
                      {/* Smaller text */}
                      {t("navbar.totalItems")} {totalItems} {t("navbar.items")}
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {" "}
                    {/* Reduced max height */}
                    {cart && cart.length > 0 ? (
                      cart.slice(0, 4).map(
                        (
                          item,
                          index // Show fewer items
                        ) => (
                          <div
                            key={item._id || index}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors" // Reduced padding
                          >
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                              {" "}
                              {/* Smaller image */}
                              {item.image ? (
                                <Link
                                  href={`/category/${encodeURIComponent(
                                    item.categoryName
                                  )}`}
                                  onClick={() => setIsCartOpen(false)}
                                >
                                  <Image
                                    height={24}
                                    width={24}
                                    src={item.image}
                                    alt={item.name || "Item"}
                                    className="w-full h-full object-contain"
                                  />
                                </Link>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                                  <Recycle className="w-5 h-5 text-green-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-xs truncate">
                                {" "}
                                {/* Smaller text */}
                                {t(
                                  `categories.subcategories.${item.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`
                                )}
                              </p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                {" "}
                                {/* Smaller spacing */}
                                {t(`categories.${item?.categoryName}`)}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-gray-400 text-xs">
                                  Qty: {item.quantity}{" "}
                                  {item.measurement_unit === 1 ? "kg" : "pcs"}
                                </p>
                                <p className="text-green-600 text-xs font-medium">
                                  {item.points} pts
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromCart(item);
                              }}
                              className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" // Smaller button
                              title="Remove from collection"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      )
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        {" "}
                        {/* Reduced padding */}
                        <Recycle className="w-10 h-10 mx-auto mb-2 text-gray-300" />{" "}
                        {/* Smaller icon */}
                        <p className="text-xs font-medium mb-1">
                          {t("navbar.yourCollectionEmpty")}

                        </p>
                        <p className="text-xs">{t("navbar.addItemsToStart")}</p>
                        <Link onClick={()=>setIsCartOpen(false)} href={isBuyer ?'/marketplace' :'/category'} className="text-xs text-primary">{t('common.startAdding')}</Link>
                      </div>
                    )}
                    {cart &&
                      cart.length > 4 && ( // Updated for 4 items
                        <div className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-100">
                          +{cart.length - 4} more items
                        </div>
                      )}
                  </div>
                  {cart && cart.length > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <div className="px-4 py-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          {" "}
                          {/* Smaller text */}
                          <span className="text-gray-600">
                            {t("navbar.totalItems")}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {totalItems}
                          </span>
                        </div>
                        <Link
                          href="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="block w-full px-3 py-2 text-center text-xs bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors" // Smaller padding and text
                        >
                          {t("navbar.viewFullCollection")}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Desktop Language Switcher - Only show on desktop */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              {" "}
              {/* Contained design */}
              <span
                className={`text-xs font-medium ${
                  locale === "en" ? "text-blue-600" : "text-gray-400"
                }`}
              >
                EN
              </span>
              <button
                onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                className="relative w-8 h-4 bg-gray-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500" // Smaller toggle
                style={{
                  backgroundColor: locale === "ar" ? "#3B82F6" : "#D1D5DB",
                }}
                title="Toggle Language"
              >
                <div
                  className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200" // Smaller circle
                  style={{
                    transform:
                      locale === "ar" ? "translateX(16px)" : "translateX(0)",
                  }}
                />
              </button>
              <span
                className={`text-xs font-medium ${
                  locale === "ar" ? "text-blue-600" : "text-gray-400"
                }`}
              >
                AR
              </span>
            </div>
            {/* Notification - More compact */}
            {user && (
              <div className="px-1">
                <NotificationBell />
              </div>
            )}
            {/* Auth buttons - More compact */}
            {isLoading ? (
              <AuthButtonsSkeleton />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-50 transition-all duration-200" // Reduced padding
                >
                  <div className="relative">
                    {user.imgUrl ? (
                      <Image
                        width={28}
                        height={28}
                        src={user.imgUrl}
                        alt={user.name || "User"}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-200" // Smaller avatar
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-gray-200">
                        {" "}
                        {/* Smaller avatar */}
                        {getUserInitials(user)}
                      </div>
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400" />{" "}
                  {/* Smaller icon */}
                </button>

                {/* Profile Dropdown - Same structure but slightly more compact */}
                {isProfileOpen && (
                  <div className="absolute right-[-20px] mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {" "}
                    {/* Smaller width */}
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      {" "}
                      {/* Reduced padding */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.imgUrl ? (
                            <Image
                              width={32}
                              height={32}
                              src={user.imgUrl}
                              alt={user.name || "User"}
                              className="w-8 h-8 rounded-full object-cover" // Smaller avatar
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                              {" "}
                              {/* Smaller avatar */}
                              {getUserInitials(user)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-xs truncate">
                            {" "}
                            {/* Smaller text */}
                            {user.name || "User"}
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            {user.email || "user@example.com"}
                          </p>
                          {user.role && (
                            <span className="inline-block px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full mt-1 capitalize">
                              {" "}
                              {/* Smaller badge */}
                              {user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      {" "}
                      {/* Reduced padding */}
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {t("navbar.profile")}
                        </span>{" "}
                        {/* Smaller text */}
                      </Link>
                      <Link
                        href="/editprofile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {t("navbar.settings")}
                        </span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>{" "}
                      {/* Reduced margin */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {t("navbar.signOut")}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {" "}
                {/* Reduced spacing */}
                <Link
                  prefetch={true}
                  href="/newAuth"
                  className="flex items-center px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-200 text-sm" // Smaller padding and text
                >
                  <KeyRound className="w-4 h-4 mr-1" />
                  {t("navbar.login")}
                </Link>
              </div>
            )}
            {/* Mobile menu button */}
            <div className="lg:hidden ml-1">
              {" "}
              {/* Small margin */}
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200" // Smaller button
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}{" "}
                {/* Smaller icons */}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - More compact */}
        {!isOpen && (
          <div className="md:hidden px-4 pb-2">
            {" "}
            {/* Reduced padding */}
            <NavbarSearch />
          </div>
        )}

        {/* Mobile Menu - More compact */}
        {isOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200">
            <div className="px-4 py-3 space-y-1">
              {" "}
              {/* Reduced padding and spacing */}
              {/* Language Toggle for Mobile - More prominent at top */}
              <div className="flex items-center justify-between w-full px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                {" "}
                {/* More prominent styling */}
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm text-blue-800">
                    Language
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      locale === "en" ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    EN
                  </span>
                  <button
                    onClick={() => {
                      setLocale(locale === "en" ? "ar" : "en");
                      setIsOpen(false);
                    }}
                    className="relative w-8 h-4 bg-gray-200 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: locale === "ar" ? "#3B82F6" : "#D1D5DB",
                    }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200"
                      style={{
                        transform:
                          locale === "ar"
                            ? "translateX(16px)"
                            : "translateX(0)",
                      }}
                    />
                  </button>
                  <span
                    className={`text-xs font-medium ${
                      locale === "ar" ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    AR
                  </span>
                </div>
              </div>
              {/* Navigation Links - More compact */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm" // Reduced padding
              >
                <HousePlus className="w-4 h-4" />
                <span>{t("navbar.home")}</span>
              </Link>
              <Link
                href={isBuyer ? "/marketplace" : "/category"}
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm"
              >
                {isBuyer ? (
                  <Store className="w-4 h-4" />
                ) : (
                  <GalleryVerticalEnd className="w-4 h-4" />
                )}
                <span>
                  {isBuyer ? t("navbar.marketplace") : t("navbar.categories")}
                </span>
              </Link>
              <Link
                href="/ideas"
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm"
              >
                <FaRobot className="w-4 h-4" />
                <span>{t("navbar.ecoAssist")}</span>
              </Link>
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm"
                >
                  <UserRoundPen className="w-4 h-4" />
                  <span>{t("navbar.profile")}</span>
                </Link>
              )}
              {/* Auth buttons - More compact */}
              {!user ? (
                <div className="pt-2 space-y-1.5">
                  {" "}
                  {/* Reduced spacing */}
                  <Link
                    href="/newAuth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-200 border border-gray-200 text-sm" // Reduced padding
                  >
                    {t("navbar.login")}
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-200 text-sm"
                  >
                    {t("navbar.startRecycling")}
                  </Link>
                </div>
              ) : (
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 text-sm"
                  >
                    {t("navbar.logout")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
