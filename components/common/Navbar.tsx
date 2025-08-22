"use client";

import Link from "next/link";
import React, { useContext, useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
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

// Memoized Cart Item Component for better performance
const CartItem = memo(({ item, onRemove, locale, darkMode, t, convertNumber, setIsCartOpen }) => {
  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    onRemove(item);
  }, [item, onRemove]);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
        {item.image ? (
          <Link
            href={`/category/${encodeURIComponent(item.categoryName[locale])}`}
            onClick={() => setIsCartOpen(false)}
          >
            <Image
              height={40}
              width={40}
              src={item.image}
              alt={item.name[locale] || "Item"}
              className="w-full h-full object-contain"
              loading="lazy"
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
          {item.name[locale]}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
          {item.categoryName[locale]}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            {t("cart.qty")}: {convertNumber(item.quantity)}{" "}
            {item.measurement_unit === 1 ? t("cart.item.kg") : t("cart.item.pcs")}
          </p>
          <p className="text-green-600 dark:text-green-400 text-xs font-medium">
            {convertNumber(item.points)} {t("cart.item.pts")}
          </p>
        </div>
      </div>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        aria-label="Remove item"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
});

CartItem.displayName = 'CartItem';

// Memoized Navigation Link Component
const NavLink = memo(({ href, onClick, className, children, prefetch = true }) => (
  <Link
    prefetch={prefetch}
    href={href}
    onClick={onClick}
    className={className}
  >
    {children}
  </Link>
));

NavLink.displayName = 'NavLink';

// Memoized Dark Mode Toggle Component
const DarkModeToggle = memo(({ darkMode, onToggle, className = "" }) => (
  <button
    onClick={onToggle}
    className={`nav-link ${darkMode ? "dark" : "light"} hover:bg-green-100 dark:hover:bg-black rounded-full transition-colors ${className}`}
    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    {darkMode ? (
      <Sun className="nav-icon w-5 h-5" />
    ) : (
      <Moon className="nav-icon w-5 h-5" />
    )}
  </button>
));

DarkModeToggle.displayName = 'DarkModeToggle';

// Memoized Language Toggle Component
const LanguageToggle = memo(({ locale, onToggle, darkMode, showLabels = true }) => (
  <div className={`language-toggle ${showLabels ? 'flex' : 'hidden lg:flex'} items-center gap-1.5 px-2 py-1 rounded-lg border-gray-200 border hover:border-gray-300 dark:hover:border-gray-600 transition-colors`}>
    {showLabels && (
      <span className={`text-xs font-medium ${locale === "en" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
        EN
      </span>
    )}
    <button
      onClick={onToggle}
      className="relative w-8 h-4 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
      style={{
        backgroundColor: locale === "ar" ? "#3B82F6" : darkMode ? "#4B5563" : "#D1D5DB",
      }}
      title="Toggle Language"
    >
      <div
        className="absolute top-0.5 left-0.5 w-3 h-3 bg-white dark:bg-gray-200 rounded-full shadow-sm transform transition-transform duration-200"
        style={{
          transform: locale === "ar" ? "translateX(16px)" : "translateX(0)",
        }}
      />
    </button>
    {showLabels && (
      <span className={`text-xs font-medium ${locale === "ar" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
        AR
      </span>
    )}
  </div>
));

LanguageToggle.displayName = 'LanguageToggle';

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
  const isBuyer = user?.role === "buyer";
  const { locale, setLocale } = useLanguage();
  
  // State for dark mode with system preference as default
  const [darkMode, setDarkMode] = useState(false);
<<<<<<< HEAD
  const [isSystemDark, setIsSystemDark] = useState(false);

  const { t, convertNumber } = useLanguage();

  // Check system preference on component mount
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsSystemDark(systemPrefersDark);
      
      // Set initial dark mode based on system preference
      setDarkMode(systemPrefersDark);
      
      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setIsSystemDark(e.matches);
        // Only update if user hasn't manually overridden
        const hasManualOverride = localStorage.getItem('darkMode') !== null;
        if (!hasManualOverride) {
          setDarkMode(e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      // Check for user preference in localStorage
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      }
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      // Save user preference
      localStorage.setItem('darkMode', darkMode.toString());
=======
  const { t, convertNumber } = useLanguage();

  // Memoized handlers for better performance
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);
  const toggleLanguage = useCallback(() => setLocale(locale === "en" ? "ar" : "en"), [locale, setLocale]);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
  const toggleProfile = useCallback(() => setIsProfileOpen(prev => !prev), []);

  // Apply dark mode to document
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
>>>>>>> 61da1fd15617936b636e764f2260c6d4e57050ad
    }
  }, [darkMode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemoveFromCart = useCallback(async (item) => {
    try {
      await removeFromCart(item);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  }, [removeFromCart]);

  const handleLogout = useCallback(async () => {
    try {
      logout();
      setIsProfileOpen(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [logout]);

  const getUserInitials = useCallback((user) => {
    if (!user) return "U";
    const name = user.name || user.fullName || user.firstName || user.email || "User";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, []);

  // Memoized cart items for performance
  const cartItems = useMemo(() => 
    cart?.slice(0, 4).map((item, index) => (
      <CartItem
        key={item._id || index}
        item={item}
        onRemove={handleRemoveFromCart}
        locale={locale}
        darkMode={darkMode}
        t={t}
        convertNumber={convertNumber}
        setIsCartOpen={setIsCartOpen}
      />
    )), 
    [cart, handleRemoveFromCart, locale, darkMode, t, convertNumber]
  );

  const AuthButtonsSkeleton = memo(() => (
    <div className="hidden lg:flex items-center space-x-2">
      <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
    </div>
  ));

  return (
    <nav className="navbar sticky top-0 z-50 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo + Search */}
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <NavLink href="/" className="flex items-center flex-shrink-0">
              <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {t("navbar.title")}
              </div>
            </NavLink>
          </div>

          {/* Center: Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <NavLink
              href={user?.role == "buyer" ? "/home" : "/"}
              className={`nav-link ${darkMode ? "dark" : "light"} hover:bg-green-100 dark:hover:bg-black`}
            >
              <HousePlus className="nav-icon" />
              <span>{t("navbar.home")}</span>
            </NavLink>

            <NavLink
              href={isBuyer ? "/marketplace" : "/category"}
              className={`nav-link ${darkMode ? "dark" : "light"}`}
            >
              {isBuyer ? (
                <Store className="nav-icon" />
              ) : (
                <GalleryVerticalEnd className="nav-icon" />
              )}
              <span>
                {isBuyer ? t("navbar.marketplace") : t("navbar.categories")}
              </span>
            </NavLink>

            <NavLink
              href="/ideas"
              className={`nav-link ${darkMode ? "dark" : "light"}`}
            >
              <FaRobot className="nav-icon" />
              <span>{t("navbar.ecoAssist")}</span>
            </NavLink>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
<<<<<<< HEAD
            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                // Toggle dark mode and set manual override
                setDarkMode(!darkMode);
                localStorage.setItem('darkMode', (!darkMode).toString());
              }}
              className={`nav-link ${darkMode ? "dark" : "light"} hover:bg-green-100 dark:hover:bg-black rounded-full transition-colors`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="nav-icon w-5 h-5" />
              ) : (
                <Moon className="nav-icon w-5 h-5" />
              )}
            </button>

=======
            {/* Dark Mode Toggle - Only show when not logged in */}
            {!user && (
              <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
            )}
>>>>>>> 61da1fd15617936b636e764f2260c6d4e57050ad

            {/* Collection Cart */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={toggleCart}
                className={`nav-link ${darkMode ? "dark" : "light"} hover:bg-green-100 dark:hover:bg-black`}
                title={isBuyer ? t("navbar.myCart") : t("navbar.myCollection")}
              >
                <div className="relative">
                  <Recycle className="nav-icon w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm ring-1 ring-white">
                      {totalItems > 99 ? convertNumber(99) + "+" : convertNumber(totalItems)}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">
                  {isBuyer ? t("navbar.myCart") : t("navbar.myCollection")}
                </span>
              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
<<<<<<< HEAD
                <div
                  className={`nav-dropdown absolute right-0 mt-2 w-80 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50`}
                >
=======
                <div className={`nav-dropdown absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg border py-2 z-50 ${darkMode ? "dark" : "light"}`}>
>>>>>>> 61da1fd15617936b636e764f2260c6d4e57050ad
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {isBuyer ? t("navbar.myCart") : t("navbar.myCollection")}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t("navbar.totalItems")} {convertNumber(totalItems)} {t("navbar.items")}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {cart && cart.length > 0 ? (
                      <>
                        {cartItems}
                        {cart.length > 4 && (
                          <div className="px-4 py-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                            +{convertNumber(cart.length - 4)} {t("cart.item.more")}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        <Recycle className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-xs font-medium mb-1">{t("navbar.yourCollectionEmpty")}</p>
                        <p className="text-xs">{t("navbar.addItemsToStart")}</p>
                        <NavLink
                          onClick={() => setIsCartOpen(false)}
                          href={isBuyer ? "/marketplace" : "/category"}
                          className="text-xs text-primary dark:text-primary-400"
                        >
                          {t("common.startAdding")}
                        </NavLink>
                      </div>
                    )}
                  </div>
                  {cart && cart.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                      <div className="px-4 py-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{t("navbar.totalItems")}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {convertNumber(totalItems)}
                          </span>
                        </div>
                        <NavLink
                          href="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="block w-full px-3 py-2 text-center text-xs bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                        >
                          {t("navbar.viewFullCollection")}
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

<<<<<<< HEAD
            {/* Language Switcher */}
            <div
              className={`language-toggle hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg border-gray-200 dark:border-gray-700 border hover:border-gray-300 dark:hover:border-gray-600 transition-colors`}
            >
              <span
                className={`text-xs font-medium ${locale === "en"
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
                className={`text-xs font-medium ${locale === "ar"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500"
                  }`}
              >
                AR
              </span>
            </div>
=======
            {/* Language Switcher - Only show when not logged in */}
            {!user && (
              <LanguageToggle 
                locale={locale} 
                onToggle={toggleLanguage} 
                darkMode={darkMode} 
              />
            )}
>>>>>>> 61da1fd15617936b636e764f2260c6d4e57050ad

            {/* Notification - Only show when logged in */}
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
                  onClick={toggleProfile}
                  className={`nav-link ${darkMode ? "dark" : "light"} p-1`}
                >
                  <div className="relative">
                    {user.imgUrl ? (
                      <Image
                        width={32}
                        height={32}
                        src={user.imgUrl}
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                        loading="lazy"
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
<<<<<<< HEAD
                  <div className="nav-dropdown bg-white dark:bg-gray-800 absolute right-0 mt-2 w-56 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
=======
                  <div className="nav-dropdown bg-white dark:bg-gray-800 absolute right-0 mt-2 w-56 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-50">
>>>>>>> 61da1fd15617936b636e764f2260c6d4e57050ad
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
                              loading="lazy"
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

                    {/* Settings Section */}
                    <div className="py-1">
                      <NavLink
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">{t("navbar.profile")}</span>
                      </NavLink>
                      <NavLink
                        href="/editprofile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">{t("navbar.settings")}</span>
                      </NavLink>

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                      {/* Dark Mode Toggle in Profile Dropdown */}
                      <div className="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-3">
                          {darkMode ? (
                            <Sun className="w-4 h-4" />
                          ) : (
                            <Moon className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {darkMode ? t("navbar.lightMode") : t("navbar.darkMode")}
                          </span>
                        </div>
                        <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} className="p-1" />
                      </div>

                      {/* Language Toggle in Profile Dropdown */}
                      <div className="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm font-medium">Language</span>
                        </div>
                        <LanguageToggle 
                          locale={locale} 
                          onToggle={toggleLanguage} 
                          darkMode={darkMode} 
                          showLabels={false}
                        />
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                      <NavLink
                        href="/profile/ewallet"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <Wallet className="w-4 h-4" />
<<<<<<< HEAD
                        <span className="text-xs font-medium">
                          {t("navbar.ewallet")}
                        </span>
                      </Link>
=======
                        <span className="text-sm font-medium">{t("navbar.ewallet")}</span>
                      </NavLink>

>>>>>>> 61da1fd15617936b636e764f2260c6d4e57050ad
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">{t("navbar.signOut")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  href="/auth"
                  className={`nav-link ${darkMode ? "dark" : "light"}`}
                >
                  <KeyRound className="nav-icon" />
                  {t("navbar.login")}
                </NavLink>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden ml-1">
              <button
                onClick={toggleMenu}
                style={{ color: darkMode ? "#9CA3AF" : "#4B5563" }}
                className={`nav-link ${darkMode ? "dark" : "light"} w-14 h-14 flex items-center justify-center`}
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="w-9 h-9" style={{ color: "var(--foreground)" }} />
                ) : (
                  <Menu className="w-9 h-9" style={{ color: "var(--foreground)" }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu lg:hidden backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 space-y-2">
              {/* Language Toggle for Mobile - Only show when not logged in */}
              {!user && (
                <div className="flex items-center justify-between w-full px-3 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-sm text-blue-800 dark:text-blue-200">Language</span>
                  </div>
                  <LanguageToggle 
                    locale={locale} 
                    onToggle={() => {
                      toggleLanguage();
                      setIsOpen(false);
                    }} 
                    darkMode={darkMode} 
                  />
                </div>
              )}

              {/* Navigation Links */}
              <NavLink
                href="/"
                onClick={() => setIsOpen(false)}
                className={`nav-link ${darkMode ? "dark" : "light"}`}
              >
                <HousePlus className="nav-icon" />
                <span>{t("navbar.home")}</span>
              </NavLink>
              <NavLink
                href={isBuyer ? "/marketplace" : "/category"}
                onClick={() => setIsOpen(false)}
                className={`nav-link ${darkMode ? "dark" : "light"}`}
              >
                {isBuyer ? (
                  <Store className="nav-icon" />
                ) : (
                  <GalleryVerticalEnd className="nav-icon" />
                )}
                <span>
                  {isBuyer ? t("navbar.marketplace") : t("navbar.categories")}
                </span>
              </NavLink>
              <NavLink
                href="/ideas"
                onClick={() => setIsOpen(false)}
                className={`nav-link ${darkMode ? "dark" : "light"}`}
              >
                <FaRobot className="nav-icon" />
                <span>{t("navbar.ecoAssist")}</span>
              </NavLink>
              {user && (
                <NavLink
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className={`nav-link ${darkMode ? "dark" : "light"}`}
                >
                  <UserRoundPen className="nav-icon" />
                  <span>{t("navbar.profile")}</span>
                </NavLink>
              )}

              {/* Auth buttons */}
              {!user ? (
                <div className="pt-2 space-y-2">
                  <NavLink
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className={`nav-link ${darkMode ? "dark" : "light"} w-full justify-center border border-gray-200 dark:border-gray-700`}
                  >
                    {t("navbar.login")}
                  </NavLink>
                  <NavLink
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-200 text-sm"
                  >
                    {t("navbar.startRecycling")}
                  </NavLink>
                </div>
              ) : (
                <div className="pt-2">
                  <Button
                    onClick={handleLogout}
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