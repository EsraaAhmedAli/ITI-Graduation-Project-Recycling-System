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
  Sun,
  Moon,
  Wallet,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { FaRobot } from "react-icons/fa";
import { UserAuthContext } from "@/context/AuthFormContext";
import Button from "./Button";
import NavbarSearch from "./search";
import Image from "next/image";
import { NotificationBell } from "../notifications/notidication";
import { useLanguage } from "@/context/LanguageContext";
import { hover } from "framer-motion";

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
  const [darkMode, setDarkMode] = useState(false);

  const { t } = useLanguage();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Close dropdowns when clicking outside
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
      await removeFromCart(item);
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

  const AuthButtonsSkeleton = () => (
    <div className="hidden lg:flex items-center space-x-2">
      <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
    </div>
  );

  return (
    <nav
      className="sticky top-0 z-50  bg--color-base-100-: #1a1a1a; border-gray-200 shadow-sm"
      style={{ background: "var(--backeground)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo + Search */}
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {t("navbar.title")}
              </div>
            </Link>
            {/* <div className="hidden md:block flex-1 max-w-md">
              <NavbarSearch />
            </div> */}
          </div>

          {/* Center: Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link
              prefetch={true}
              href={user?.role == "buyer" ? "/home" : "/"}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm"
            >
              <HousePlus className="w-4 h-4" />
              <span>{t("navbar.home")}</span>
            </Link>

            <Link
              prefetch={true}
              href={isBuyer ? "/marketplace" : "/category"}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm"
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
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm"
            >
              <FaRobot className="w-4 h-4" />
              <span>{t("navbar.ecoAssist")}</span>
            </Link>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Collection Cart */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-black-800 font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                title={isBuyer ? t("navbar.myCart") : t("navbar.myCollection")}
              >
                <div className="relative">
                  <Recycle className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm ring-1 ring-white">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-medium text-sm">
                  {isBuyer ? t("navbar.myCart") : t("navbar.myCollection")}
                </span>
              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {isBuyer ? t("navbar.myCart") : t("navbar.myCollection")}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t("navbar.totalItems")} {totalItems} {t("navbar.items")}
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {cart && cart.length > 0 ? (
                      cart.slice(0, 4).map((item, index) => (
                        <div
                          key={item._id || index}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
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
                              <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 flex items-center justify-center">
                                <Recycle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-xs truncate">
                              {"itemName"}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                              {"caregname"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-gray-400 dark:text-gray-500 text-xs">
                                Qty: {item.quantity}{" "}
                                {item.measurement_unit === 1 ? "kg" : "pcs"}
                              </p>
                              <p className="text-green-600 dark:text-green-400 text-xs font-medium">
                                {item.points} pts
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCart(item);
                            }}
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        <Recycle className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-xs font-medium mb-1">
                          {t("navbar.yourCollectionEmpty")}
                        </p>
                        <p className="text-xs">{t("navbar.addItemsToStart")}</p>
                        <Link
                          onClick={() => setIsCartOpen(false)}
                          href={isBuyer ? "/marketplace" : "/category"}
                          className="text-xs text-primary dark:text-primary-400"
                        >
                          {t("common.startAdding")}
                        </Link>
                      </div>
                    )}
                    {cart && cart.length > 4 && (
                      <div className="px-4 py-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                        +{cart.length - 4} more items
                      </div>
                    )}
                  </div>
                  {cart && cart.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                      <div className="px-4 py-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("navbar.totalItems")}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {totalItems}
                          </span>
                        </div>
                        <Link
                          href="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="block w-full px-3 py-2 text-center text-xs bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                        >
                          {t("navbar.viewFullCollection")}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <span
                className={`text-xs font-medium ${
                  locale === "en"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                EN
              </span>
              <button
                onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                className="relative w-8 h-4 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{
                  backgroundColor:
                    locale === "ar"
                      ? "#3B82F6"
                      : darkMode
                      ? "#4B5563"
                      : "#D1D5DB",
                }}
                title="Toggle Language"
              >
                <div
                  className="absolute top-0.5 left-0.5 w-3 h-3 bg-white dark:bg-gray-200 rounded-full shadow-sm transform transition-transform duration-200"
                  style={{
                    transform:
                      locale === "ar" ? "translateX(16px)" : "translateX(0)",
                  }}
                />
              </button>
              <span
                className={`text-xs font-medium ${
                  locale === "ar"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                AR
              </span>
            </div>

            {/* Notification */}
            {user && (
              <div className="px-1">
                <NotificationBell />
              </div>
            )}

            {/* Auth buttons */}
            {isLoading ? (
              <AuthButtonsSkeleton />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <div className="relative">
                    {user.imgUrl ? (
                      <Image
                        width={32}
                        height={32}
                        src={user.imgUrl}
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold ring-2 ring-gray-200 dark:ring-gray-600">
                        {getUserInitials(user)}
                      </div>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.imgUrl ? (
                            <Image
                              width={40}
                              height={40}
                              src={user.imgUrl}
                              alt={user.name || "User"}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                              {getUserInitials(user)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {user.name || "User"}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                            {user.email || "user@example.com"}
                          </p>
                          {user.role && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full mt-1 capitalize">
                              {user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {t("navbar.profile")}
                        </span>
                      </Link>
                      <Link
                        href="/editprofile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {t("navbar.settings")}
                        </span>
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      <Link
                        href="/profile/ewallet"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {t("navbar.ewallet")}
                        </span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>{" "}
                      {/* Reduced margin */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {t("navbar.signOut")}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  prefetch={true}
                  href="/newAuth"
                  className="flex items-center px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all duration-200 text-sm"
                >
                  <KeyRound className="w-4 h-4 rtl:ml-1 ltr:mr-1" />
                  {t("navbar.login")}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden ml-1">
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-9 h-9 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {/* {!isOpen && (
          <div className="md:hidden px-4 pb-3">
            <NavbarSearch />
          </div>
        )} */}

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 space-y-2">
              {/* Language Toggle for Mobile */}
              <div className="flex items-center justify-between w-full px-3 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-sm text-blue-800 dark:text-blue-200">
                    Language
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      locale === "en"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    EN
                  </span>
                  <button
                    onClick={() => {
                      setLocale(locale === "en" ? "ar" : "en");
                      setIsOpen(false);
                    }}
                    className="relative w-8 h-4 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor:
                        locale === "ar"
                          ? "#3B82F6"
                          : darkMode
                          ? "#4B5563"
                          : "#D1D5DB",
                    }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-3 h-3 bg-white dark:bg-gray-200 rounded-full shadow-sm transform transition-transform duration-200"
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
                      locale === "ar"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    AR
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm"
              >
                <HousePlus className="w-4 h-4" />
                <span>{t("navbar.home")}</span>
              </Link>
              <Link
                href={isBuyer ? "/marketplace" : "/category"}
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm"
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
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm"
              >
                <FaRobot className="w-4 h-4" />
                <span>{t("navbar.ecoAssist")}</span>
              </Link>
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm"
                >
                  <UserRoundPen className="w-4 h-4" />
                  <span>{t("navbar.profile")}</span>
                </Link>
              )}

              {/* Auth buttons */}
              {!user ? (
                <div className="pt-2 space-y-2">
                  <Link
                    href="/newAuth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all duration-200 border border-gray-200 dark:border-gray-700 text-sm"
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
