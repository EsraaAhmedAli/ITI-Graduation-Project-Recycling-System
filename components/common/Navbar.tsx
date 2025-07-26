"use client";

import Link from "next/link";
import React, { useContext, useState, useMemo, useRef, useEffect } from "react";
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
  Store,
  Bell,
  Check,
  Clock,
  Package,
  MessageCircle,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { FaRobot } from "react-icons/fa";
import { UserAuthContext } from "@/context/AuthFormContext";
import Button from "./Button";
import NavbarSearch from "./search";
import Image from "next/image";
import { NotificationBell } from "../notifications/notidication";

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

  // Sample notifications data - replace with your actual notifications
  const notifications = [
    {
      id: 1,
      type: "order",
      title: "Order Confirmed",
      message: "Your recycling collection has been scheduled",
      time: "2 minutes ago",
      read: false,
      icon: Package,
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message: "You have a message from EcoCollector Inc.",
      time: "1 hour ago",
      read: false,
      icon: MessageCircle,
    },
    {
      id: 3,
      type: "reminder",
      title: "Collection Reminder",
      message: "Your next collection is tomorrow at 10 AM",
      time: "3 hours ago",
      read: true,
      icon: Clock,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
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

  const handleNotificationClick = (notificationId) => {
    // Handle notification click - mark as read, navigate, etc.
    console.log("Notification clicked:", notificationId);
    setIsNotificationOpen(false);
  };

  const handleCartItemClick = (itemId) => {
    // Handle cart item click - navigate to item details, etc.
    console.log("Cart item clicked:", itemId);
    setIsCartOpen(false);
  };

  const handleRemoveFromCart = async (item) => {
    try {
      await removeFromCart(item); // Use the context's removeFromCart function
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (user) => {
    if (!user) return "U";
    const name = user.name || user.fullName || user.firstName || user.email || "User";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const markAllAsRead = () => {
    // Implement mark all as read functionality
    console.log("Mark all as read");
  };

  // Loading skeletons
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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo + Search */}
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                XChange
              </div>
            </Link>

            <div className="hidden md:block flex-1 max-w-md">
              <NavbarSearch />
            </div>
          </div>

          {/* Center: Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              prefetch={true}
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-2 px-3 py-2 rounded-lg transition-all duration-200"
            >
              <HousePlus className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              prefetch={true}
              href={isBuyer ? "/marketplace" : "/category"}
              className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-2 px-3 py-2 rounded-lg transition-all duration-200"
            >
              {isBuyer ? (
                <Store className="w-4 h-4" />
              ) : (
                <GalleryVerticalEnd className="w-4 h-4" />
              )}
              <span>{isBuyer ? "Marketplace" : "Categories"}</span>
            </Link>

            <Link
              prefetch={true}
              href="/ideas"
              className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-2 px-3 py-2 rounded-lg transition-all duration-200"
            >
              <FaRobot className="w-4 h-4" />
              <span>Eco-Assist</span>
            </Link>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
   

            {/* Collection Cart Dropdown */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium px-3 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                title="My Collection"
              >
                <div className="relative">
                  <Recycle className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg ring-2 ring-white">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-medium">Collection</span>

              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">My Collection</h3>
                    <span className="text-sm text-gray-500">{totalItems} items</span>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {cart && cart.length > 0 ? (
                      cart.slice(0, 5).map((item, index) => (
                        <div
                          key={item.categoryId || index}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            {item.image ? (
                              <Link href={`/category/${encodeURIComponent(item.categoryName)}`} onClick={()=>setIsCartOpen(false)}>
                                
                                 <Image 
                              height={30}
                              width={30}
                                src={item.image} 
                                alt={item.itemName || 'Item'} 
                                className="w-full h-full object-contain"
                              />
                              </Link>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                                <Recycle className="w-6 h-6 text-green-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {item.itemName || 'Recyclable Item'}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {item.categoryName || 'Recyclable Material'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-gray-400 text-xs">
                                Qty: {item.quantity} {item.measurement_unit === 1 ? 'kg' : 'pcs'}
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
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove from collection"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Recycle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium mb-1">Your collection is empty</p>
                        <p className="text-xs">Add recyclable items to get started</p>
                      </div>
                    )}
                    
                    {cart && cart.length > 5 && (
                      <div className="px-4 py-2 text-center text-sm text-gray-500 border-t border-gray-100">
                        +{cart.length - 5} more items
                      </div>
                    )}
                  </div>
                  
                  {cart && cart.length > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <div className="px-4 py-2 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Items:</span>
                          <span className="font-semibold text-gray-900">{totalItems}</span>
                        </div>
                        <Link
                          href="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="block w-full px-4 py-2 text-center text-sm bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                        >
                          View Full Collection
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
         {/* Notification Dropdown */}
         {
          user &&        <NotificationBell/>

         }
            {/* Auth buttons */}
            {isLoading ? (
              <AuthButtonsSkeleton />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                {/* User Avatar Button */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="relative">
                    { user.imgUrl ? (
                      <Image
                      width={30}
                      height={30}
                        src={ user.imgUrl}
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-gray-200">
                        {getUserInitials(user)}
                      </div>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          { user.imgUrl ? (
                            <Image
                            width={20}
                            height={20}
                              src={ user.imgUrl}
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
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            { user.name || "User"}
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            {user.email || "user@example.com"}
                          </p>
                          {user.role && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full mt-1 capitalize">
                              {user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>
                      
                      <Link
                        href="/editprofile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Settings</span>
                      </Link>

                      {isBuyer && (
                        <Link
                          href="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          <span className="text-sm font-medium">My Orders</span>
                        </Link>
                      )}

                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  prefetch={true}
                  href="/auth/login"
                  className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Login
                </Link>
                <Link
                  prefetch={true}
                  href="/auth/signup"
                  className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-all duration-200 shadow-sm"
                >
                  Start Recycling
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {!isOpen && (
          <div className="md:hidden px-4 pb-3">
            <NavbarSearch />
          </div>
        )}

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-3 px-3 py-3 rounded-lg transition-all duration-200"
              >
                <HousePlus className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                href={isBuyer ? "/marketplace" : "/category"}
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-3 px-3 py-3 rounded-lg transition-all duration-200"
              >
                {isBuyer ? (
                  <Store className="w-5 h-5" />
                ) : (
                  <GalleryVerticalEnd className="w-5 h-5" />
                )}
                <span>{isBuyer ? "Marketplace" : "Categories"}</span>
              </Link>

              <Link
                href="/ideas"
                onClick={() => setIsOpen(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-3 px-3 py-3 rounded-lg transition-all duration-200"
              >
                <FaRobot className="w-5 h-5" />
                <span>Eco-Assist</span>
              </Link>

              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium gap-3 px-3 py-3 rounded-lg transition-all duration-200"
                >
                  <UserRoundPen className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              )}

              {!user ? (
                <div className="pt-2 space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all duration-200 border border-gray-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-200"
                  >
                    Start Recycling
                  </Link>
                </div>
              ) : (
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200"
                  >
                    Logout
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