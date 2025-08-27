"use client";
import Link from "next/link";
import React, {
  useContext,
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
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

// Memoized Cart Item Component
const CartItem = memo(
  ({ item, onRemove, locale, darkMode, t, convertNumber, setIsCartOpen }) => {
    const handleRemove = useCallback(
      (e) => {
        e.stopPropagation();
        onRemove(item);
      },
      [item, onRemove]
    );

    return (
      <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-md overflow-hidden">
          {item.image ? (
            <Link
              href={`/category/${encodeURIComponent(item.categoryName[locale])}`}
              onClick={() => setIsCartOpen(false)}
            >
              <Image
                height={32}
                width={32}
                src={item.image}
                alt={item.name[locale] || "Item"}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </Link>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 flex items-center justify-center">
              <Recycle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-xs truncate">
            {item.name[locale]}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {t("cart.qty")}: {convertNumber(item.quantity)}{" "}
            {item.measurement_unit === 1 ? t("cart.item.kg") : t("cart.item.pcs")}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Remove item"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }
);

CartItem.displayName = "CartItem";

// Navigation Link Component
const NavLink = memo(({ href, onClick, className, children, prefetch = true }) => (
  <Link prefetch={prefetch} href={href} onClick={onClick} className={className}>
    {children}
  </Link>
));

NavLink.displayName = "NavLink";

// Compact Toggle Components
const CompactToggle = memo(({ icon: Icon, onClick, isActive, ariaLabel }) => (
  <button
    onClick={onClick}
    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    aria-label={ariaLabel}
  >
    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
  </button>
));

CompactToggle.displayName = "CompactToggle";

const LanguageToggle = memo(({ locale, onToggle, className = "" }) => (
  <button
    onClick={onToggle}
    className={`px-2 py-1 text-xs font-medium rounded border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors ${className}`}
    title="Toggle Language"
  >
    <span className={locale === "en" ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}>
      EN
    </span>
    <span className="mx-1 text-gray-300">|</span>
    <span className={locale === "ar" ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}>
      AR
    </span>
  </button>
));

LanguageToggle.displayName = "LanguageToggle";

export default function Navbar() {
  const authContext = useContext(UserAuthContext);
  const { user, logout, isLoading } = authContext ?? {};
  const { cart, removeFromCart } = useCart();
  const totalItems = useMemo(() => cart.length, [cart.length]);
  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const cartRef = useRef(null);
  const profileRef = useRef(null);

  const { locale, setLocale, t, convertNumber } = useLanguage();

  // User role logic
  const isBuyer = user?.role === "buyer";
  const isCustomer = user?.role === "customer";
  const isLoggedIn = !!user;

  // Get navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      {
        href: isLoggedIn ? (isBuyer ? "/home" : "/") : "/",
        icon: HousePlus,
        label: t("navbar.home"),
        show: true
      },
      {
        href: "/ideas",
        icon: FaRobot,
        label: t("navbar.ecoAssist"),
        show: true
      }
    ];

    // Handle marketplace/categories logic
    if (!isLoggedIn) {
      // Show both when not logged in
      items.splice(1, 0, 
        {
          href: "/marketplace",
          icon: Store,
          label: t("navbar.marketplace"),
          show: true
        },
        {
          href: "/category",
          icon: GalleryVerticalEnd,
          label: t("navbar.categories"),
          show: true
        }
      );
    } else if (isBuyer) {
      // Show only marketplace for buyers
      items.splice(1, 0, {
        href: "/marketplace",
        icon: Store,
        label: t("navbar.marketplace"),
        show: true
      });
    } else if (isCustomer) {
      // Show only categories for customers
      items.splice(1, 0, {
        href: "/category",
        icon: GalleryVerticalEnd,
        label: t("navbar.categories"),
        show: true
      });
    }

    return items.filter(item => item.show);
  };

  // Dark mode initialization
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        setDarkMode(JSON.parse(savedMode));
      } else {
        setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Apply dark mode to DOM
  useEffect(() => {
    if (isInitialized) {
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode, isInitialized]);

  // Save dark mode preference
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("darkMode", JSON.stringify(darkMode));
    }
  }, [darkMode, isInitialized]);

  // Event handlers
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);
  const toggleLanguage = useCallback(() => setLocale(locale === "en" ? "ar" : "en"), [locale, setLocale]);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
  const toggleProfile = useCallback(() => setIsProfileOpen(prev => !prev), []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  const handleRemoveFromCart = useCallback(
    async (item) => {
      try {
        await removeFromCart(item);
      } catch (error) {
        console.error("Error removing item from cart:", error);
      }
    },
    [removeFromCart]
  );

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
    return words.length >= 2 
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }, []);

  const navigationItems = getNavigationItems();

  const cartItems = useMemo(
    () =>
      cart?.slice(0, 3).map((item, index) => (
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

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <NavLink href="/" className="flex-shrink-0">
            <div className="text-lg font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {t("navbar.title")}
            </div>
          </NavLink>

          {/* Desktop Navigation - Hidden on smaller screens */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Search - Desktop only */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <NavbarSearch variant="desktop" className="w-full" />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title={isBuyer ? t("navbar.myCart") : t("navbar.myCollection")}
              >
                <Recycle className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {totalItems > 99 ? "99+" : convertNumber(totalItems)}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div className="absolute end-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {isBuyer ? t("navbar.myCart") : t("navbar.myCollection")}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {convertNumber(totalItems)} {t("navbar.items")}
                    </span>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {cart && cart.length > 0 ? (
                      <>
                        {cartItems}
                        {cart.length > 3 && (
                          <div className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                            +{convertNumber(cart.length - 3)} {t("cart.item.more")}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        <Recycle className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-xs font-medium mb-1">
                          {t("navbar.yourCollectionEmpty")}
                        </p>
                        <NavLink
                          onClick={() => setIsCartOpen(false)}
                          href={isBuyer ? "/marketplace" : "/category"}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {t("common.startAdding")}
                        </NavLink>
                      </div>
                    )}
                  </div>
                  
                  {cart && cart.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2 px-3">
                      <NavLink
                        href="/cart"
                        onClick={() => setIsCartOpen(false)}
                        className="block w-full px-3 py-2 text-center text-xs bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors"
                      >
                        {t("navbar.viewFullCollection")}
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications - Only when logged in */}
            {user && <NotificationBell />}

            {/* Settings/Profile */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-1 p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {user.imgUrl ? (
                    <Image
                      width={24}
                      height={24}
                      src={user.imgUrl}
                      alt={user.name || "User"}
                      className="w-6 h-6 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                      {getUserInitials(user)}
                    </div>
                  )}
                  <ChevronDown className="w-3 h-3 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        {user.imgUrl ? (
                          <Image
                            width={32}
                            height={32}
                            src={user.imgUrl}
                            alt={user.name || "User"}
                            className="w-8 h-8 rounded-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                            {getUserInitials(user)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {user.name || "User"}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <NavLink
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        {t("navbar.profile")}
                      </NavLink>
                      
                      <NavLink
                        href="/editprofile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        {t("navbar.settings")}
                      </NavLink>

                      {!isBuyer && (
                        <NavLink
                          href="/profile/ewallet"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Wallet className="w-4 h-4" />
                          {t("navbar.ewallet")}
                        </NavLink>
                      )}

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      
                      {/* Theme & Language in Profile */}
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t("navbar.theme")}
                        </span>
                        <CompactToggle
                          icon={darkMode ? Sun : Moon}
                          onClick={toggleDarkMode}
                          ariaLabel={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t("navbar.language")}
                        </span>
                        <LanguageToggle locale={locale} onToggle={toggleLanguage} />
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("navbar.signOut")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in - show theme, language, and auth buttons
              <div className="flex items-center gap-1">
                <CompactToggle
                  icon={darkMode ? Sun : Moon}
                  onClick={toggleDarkMode}
                  ariaLabel={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                />
                <LanguageToggle locale={locale} onToggle={toggleLanguage} />
                <NavLink
                  href="/auth"
                  className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden md:inline">{t("navbar.login")}</span>
                </NavLink>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-4 py-3 space-y-2">
              {/* Mobile Search */}
              <NavbarSearch
                variant="mobile"
                className="w-full mb-3"
                onClose={() => setIsOpen(false)}
              />

              {/* Mobile Navigation Items */}
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}

              {user && (
                <NavLink
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <UserRoundPen className="w-5 h-5" />
                  <span className="font-medium">{t("navbar.profile")}</span>
                </NavLink>
              )}

              {/* Mobile Settings for non-logged in users */}
              {!user && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {t("navbar.theme")}
                      </span>
                      <CompactToggle
                        icon={darkMode ? Sun : Moon}
                        onClick={toggleDarkMode}
                        ariaLabel={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {t("navbar.language")}
                      </span>
                      <LanguageToggle locale={locale} onToggle={toggleLanguage} />
                    </div>
                  </div>
                </>
              )}

              {/* Mobile Auth Buttons */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                {!user ? (
                  <div className="space-y-2">
                    <NavLink
                      href="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-3 py-2.5 text-center text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {t("navbar.login")}
                    </NavLink>
                    <NavLink
                      href="/auth/signup"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-3 py-2.5 text-center bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors"
                    >
                      {t("navbar.startRecycling")}
                    </NavLink>
                  </div>
                ) : (
                  <Button
                    onClick={handleLogout}
                    className="w-full px-3 py-2.5 text-center bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
                  >
                    {t("navbar.logout")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}