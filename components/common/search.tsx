"use client";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Button from "./Button";
import { Loader } from "@/components/common";
import { useUserAuth } from "@/context/AuthFormContext";

interface SearchResult {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  image: string;
  categoryName: {
    en: string;
    ar: string;
  };
  displayName: string;
  categoryDisplayName: string;
  points?: number;
  price?: number;
  quantity?: number;
}

interface AlphabetStats {
  availableLetters: string[];
  alphabet: string[];
}

interface SearchIndexResponse {
  success: boolean;
  data: SearchResult[];
  meta?: {
    alphabetStats?: AlphabetStats;
  };
}

interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  message?: string;
}

interface NavbarSearchProps {
  variant?: "desktop" | "mobile" | "icon-only";
  className?: string;
  onClose?: () => void;
}

export default function NavbarSearch({
  variant = "desktop",
  className = "",
  onClose,
}: NavbarSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useUserAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, locale, convertNumber } = useLanguage();
  const router = useRouter();

  // Add this skeleton component
  const ItemSkeleton = memo(() => (
    <div className="animate-pulse rounded-2xl  overflow-hidden bg-white dark:bg-gray-800">
      <div className="h-40 w-full bg-gray-300 dark:bg-gray-600" />
      <div className="p-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3" />
        <div className="flex justify-between items-center mb-3">
          <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-lg" />
          <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-xl w-full" />
      </div>
    </div>
  ));
  ItemSkeleton.displayName = "ItemSkeleton";
  // Handle item click with proper navigation
  const handleItemClick = useCallback(
    (item: SearchResult) => {
      setIsOpen(false);
      setSearchQuery("");
      setHasSearched(false);
      setSearchResults([]);
      setIsSearching(false);
      if (onClose) onClose();

      // Check user role and navigate accordingly
      // if (user?.role === "buyer") {
      //   console.log("oldWay")
      //   const itemSlug = item.displayName || item.name?.[locale];
      //   console.log("🚀 Navigating buyer to:", `/marketplace/${itemSlug}`);
      //   router.push(`/marketplace/${itemSlug}`);
      // } else {
      //   const categorySlug = item.categoryName?.en;
      //   console.log("🚀 Navigating to:", `/category/${categorySlug}`);
      //   router.push(`/category/${categorySlug}`);
      // }
    },
    [router, onClose, user?.role, locale] // Add user?.role and locale to dependencies
  );

  // Memoized alphabet generation
  const alphabet = useMemo(() => {
    if (locale === "ar") {
      return [
        "أ",
        "ب",
        "ت",
        "ث",
        "ج",
        "ح",
        "خ",
        "د",
        "ذ",
        "ر",
        "ز",
        "س",
        "ش",
        "ص",
        "ض",
        "ط",
        "ظ",
        "ع",
        "غ",
        "ف",
        "ق",
        "ك",
        "ل",
        "م",
        "ن",
        "ه",
        "و",
        "ي",
      ];
    } else {
      return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    }
  }, [locale]);

  // React Query for fetching search index
  const {
    data: indexData,
    isLoading: indexLoading,
    error: indexError,
  } = useQuery({
    queryKey: ["search-index", locale],
    queryFn: async (): Promise<{
      data: SearchResult[];
      alphabetStats: AlphabetStats;
    }> => {
      const response = await api.get<SearchIndexResponse>(
        `/search-index?lang=${locale}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch search index"
        );
      }

      const data = response.data.data || [];
      let alphabetStats: AlphabetStats;

      if (response.data.meta?.alphabetStats) {
        alphabetStats = {
          availableLetters:
            response.data.meta.alphabetStats.availableLetters || [],
          alphabet: response.data.meta.alphabetStats.alphabet || alphabet,
        };
      } else {
        const availableLetters = Array.from(
          new Set(
            data
              .map((item: SearchResult) =>
                item.displayName?.charAt(0)?.toUpperCase()
              )
              .filter(Boolean)
          )
        );
        alphabetStats = { availableLetters, alphabet };
      }

      return { data, alphabetStats };
    },
    enabled: true, // Change this from `enabled: isOpen`
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Handle index error
  useEffect(() => {
    if (indexError) {
      console.error("Error fetching items index:", indexError);
      toast.error(t("search.searchError"));
    }
  }, [indexError, t]);

  // Update search results when index data changes and no search is active
  useEffect(() => {
    if (indexData && !hasSearched) {
      setSearchResults(indexData.data);
    }
  }, [indexData, hasSearched]);

  // Search function
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setHasSearched(false);
        if (indexData) {
          setSearchResults(indexData.data);
        }
        return;
      }

      try {
        setIsSearching(true);
        const response = await api.get<SearchResponse>(
          `/search?q=${encodeURIComponent(query)}&lang=${locale}&limit=50`
        );

        if (response.data.success) {
          setSearchResults(response.data.data || []);
          setHasSearched(true);
        } else {
          throw new Error(response.data.message || "Search failed");
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error(t("search.searchError"));
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    },
    [locale, indexData, t]
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    setHasSearched(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (!value.trim() && hasSearched) {
        setHasSearched(false);
        if (indexData) {
          setSearchResults(indexData.data);
        }
      }
    },
    [hasSearched, indexData]
  );

  const handleSearch = useCallback(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleLetterClick = useCallback(
    (letter: string) => {
      setSearchQuery(letter);
      performSearch(letter);
    },
    [performSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setHasSearched(false);
    if (indexData) {
      setSearchResults(indexData.data);
    }
  }, [indexData]);

  // Memoized values
  const isRTL = locale === "ar";
  const alphabetStats = indexData?.alphabetStats || {
    availableLetters: [],
    alphabet,
  };
  const availableLetters = useMemo(
    () => new Set(alphabetStats.availableLetters),
    [alphabetStats.availableLetters]
  );

  const displayAlphabet = useMemo(
    () =>
      alphabetStats.alphabet.length > 0 ? alphabetStats.alphabet : alphabet,
    [alphabetStats.alphabet, alphabet]
  );

  // Render different variants
  const renderTrigger = () => {
    switch (variant) {
      case "desktop":
        return (
          <div className={`relative ${className}`}>
            <button
              onClick={handleOpen}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors group w-full max-w-sm bg-gray-100 hover:bg-gray-200 border border-gray-200"
            >
              <Search className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 truncate">
                {t("search.placeholder")}
              </span>
              <div className="ml-auto text-xs px-1.5 py-0.5 rounded text-gray-400 bg-gray-200">
                ⌘K
              </div>
            </button>
          </div>
        );

      case "mobile":
        return (
          <button
            onClick={handleOpen}
            className={`flex items-center gap-3 px-3 py-2 text-left w-full rounded-lg transition-colors hover:bg-gray-100 ${className}`}
          >
            <Search className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">
              {t("search.title")}
            </span>
          </button>
        );

      case "icon-only":
      default:
        return (
          <button
            onClick={handleOpen}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors bg-gray-100 hover:bg-gray-200 border border-gray-200 ${className}`}
            title={t("search.tooltipSearch")}
          >
            <Search className="w-5 h-5 text-gray-500" />
          </button>
        );
    }
  };

  // Modal content
  // Modal content
  const modalContent = (
    <div
      className={`fixed inset-0 z-50 bg-white ${isRTL ? "rtl" : "ltr"}`}
      style={{ background: "var(--background)" }}
    >
      <style jsx>{`
        .search-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .search-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .search-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .search-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .search-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>
      <div className="h-full flex flex-col max-h-screen overflow-hidden">
        {/* Header with close button */}
        <div
          style={{ background: "var(--background)" }}
          className="flex-shrink-0 flex justify-between items-center p-4  shadow-sm"
        >
          <h2
            className="text-2xl font-bold "
            style={{ color: "var(--color-base-800)" }}
          >
            {t("search.title")}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t("search.closeLabel")}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input with Button */}
        <div
          className="flex-shrink-0 p-4  bg-gray-50"
          style={{ background: "var(--background)" }}
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="search"
                placeholder={t("search.placeholder")}
                className={`w-full p-3 text-base
        border border-gray-300 rounded-lg 
        focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
        ps-10
        text-gray-900 dark:text-gray-100 
        placeholder-gray-400 dark:placeholder-gray-500 
        bg-white dark:bg-gray-800 
        dark:border-gray-600`}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                value={searchQuery}
                autoFocus
                dir={isRTL ? "rtl" : "ltr"}
              />

              {/* Search Icon */}
              <div className="absolute inset-y-0 start-3 flex items-center">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              loading={isSearching}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors 
               disabled:opacity-50 disabled:cursor-not-allowed 
               flex items-center gap-2 justify-center 
               sm:min-w-[100px] w-full sm:w-auto"
            >
              {isSearching ? t("search.searching") : t("search.buttonText")}
            </Button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div
          className="flex-1 overflow-y-auto bg-gray-50 search-scroll"
          style={{ background: "var(--background)" }}
        >
          <div className="p-4">
            {/* Alphabet Index */}
            {!hasSearched && !isSearching && (
              <div className="mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h4 className="text-center text-gray-700 font-medium mb-4 text-lg">
                    {t("search.browseByLetter")}
                  </h4>
                  <div className={`flex flex-wrap gap-3 justify-center mb-4`}>
                    {displayAlphabet.map((letter) => (
                      <button
                        key={letter}
                        className={`
                          w-12 h-12 rounded-xl text-lg font-bold transition-all duration-200 transform hover:scale-105
                          ${
                            availableLetters.has(letter)
                              ? "bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }
                        `}
                        onClick={() =>
                          availableLetters.has(letter) &&
                          handleLetterClick(letter)
                        }
                        disabled={!availableLetters.has(letter)}
                        title={
                          availableLetters.has(letter)
                            ? `${t("search.clickToSeeItems")} "${letter}"`
                            : `${t("search.noItemsStartWith")} "${letter}"`
                        }
                      >
                        {letter}
                      </button>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 rounded-md"></div>
                      <span className="text-gray-600 font-medium">
                        {t("search.legendAvailable")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-100 rounded-md"></div>
                      <span className="text-gray-600 font-medium">
                        {t("search.legendNotAvailable")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results or Loading States */}
            <div>
              {isSearching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <ItemSkeleton key={`search-skeleton-${i}`} />
                    ))}
                </div>
              ) : hasSearched ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">
                      {convertNumber(searchResults.length)}{" "}
                      {t("search.resultsFor")} "{searchQuery}"
                    </h3>

                    <button
                      onClick={handleClearSearch}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto"
                    >
                      {t("search.clearAndBrowse")}
                    </button>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {searchResults.map((item) => (
                        <button
                          key={item._id}
                          onClick={() => handleItemClick(item)}
                          className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-1 text-left w-full"
                        >
                          {/* Image Section - Fixed aspect ratio to prevent CLS */}
                          <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                            <Image
                              src={item.image}
                              alt={item.displayName || item.name?.[locale]}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              className="object-contain group-hover:scale-110 transition-all duration-700 ease-out p-3"
                              quality={75}
                              loading="lazy"
                              onLoad={(e) => {
                                // Smooth fade-in to prevent flash
                                const target = e.target as HTMLImageElement;
                                target.style.opacity = "1";
                              }}
                              style={{
                                transition:
                                  "opacity 0.3s ease-in-out, transform 0.7s ease-out",
                                opacity: 0,
                                backgroundColor: "transparent",
                              }}
                            />

                            {/* Overlay gradient on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Content Section */}
                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                                {item.displayName || item.name?.[locale]}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <p className="text-sm text-gray-600 font-medium">
                                {item.categoryDisplayName ||
                                  item.categoryName?.[locale]}
                              </p>
                            </div>
                          </div>

                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-2xl transition-all duration-300 pointer-events-none" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {t("search.noItemsFound")}
                      </h3>
                      <p className="text-gray-500 mb-6 text-base max-w-md mx-auto">
                        {t("search.tryDifferentTerm")}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="text-center py-12"
                  style={{ background: "var(--background)" }}
                >
                  <div className="text-6xl mb-4">🔤</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">
                    {t("search.readyToSearch")}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed max-w-lg mx-auto">
                    {t("search.readyToSearchDesc")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // Add keyboard shortcuts (Cmd+K / Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleOpen();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleOpen, handleClose]);

  return (
    <div className="relative">
      {renderTrigger()}

      {/* Portal Modal */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(modalContent, document.body)}
    </div>
  );
}
