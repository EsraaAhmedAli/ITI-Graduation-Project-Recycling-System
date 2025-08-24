"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { X, Search } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Button from "./Button";
import { Loader } from "@/components/common";

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

export default function NavbarSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { t, locale, convertNumber } = useLanguage();
  const router = useRouter();

  // Handle item click with proper navigation - SIMPLE VERSION
  const handleItemClick = useCallback(
    (item: SearchResult) => {
      // Close modal and clear search state completely
      setIsOpen(false);
      setSearchQuery("");
      setHasSearched(false);
      setSearchResults([]);
      setIsSearching(false);

      // Clear any global search state that might affect other pages
      // If you have global state, clear it here too

      // Simple navigation without search params that might interfere
      const categorySlug =
        item.categoryName?.en?.toLowerCase().replace(/\s+/g, "-") || "";

      console.log("🚀 Navigating to:", `/category/${categorySlug}`);

      // Navigate WITHOUT search parameters to avoid interference
      router.push(`/category/${categorySlug}`);

      // Alternative: Force page refresh to ensure clean state
      // window.location.href = `/category/${categorySlug}`;
    },
    [router]
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
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
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

  // Search function (no debounce)
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setHasSearched(false);
        // Restore index data if available
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

      // If search query is cleared, restore index data
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
    // Restore index data
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

  // Modal content
  const modalContent = (
    <div className={`fixed inset-0 z-50 bg-white ${isRTL ? "rtl" : "ltr"}`} style={{background:"var(--background)"}}>
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
      <div className="h-full flex flex-col max-h-screen overflow-hidden" >
        {/* Header with close button */}
        <div style={{background:"var(--background)"}} className="flex-shrink-0 flex justify-between items-center p-4 border-b shadow-sm">
          <h2 className="text-2xl font-bold " style={{color:"var(--color-base-800)"}}>
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
        <div className="flex-shrink-0 p-4 border-b bg-gray-50"  style={{background:"var(--background)"}}>
          <div className="flex gap-3">
            <div className="relative flex-1">
            <input
  ref={inputRef}
  type="search"
  placeholder={t("search.placeholder")}
  className={`w-full p-3 text-base 
    border border-gray-300 rounded-lg 
    focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
    ${isRTL ? "pr-10 text-right" : "pl-10"} 
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

              <div
             
                className={`absolute inset-y-0 flex items-center ${
                  isRTL ? "right-0 pr-3" : "left-0 pl-3"
                }`}
              >
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              loading={isSearching}
              className="flex-shrink-0 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
            >
              {isSearching ? t("search.searching") : t("search.buttonText")}
            </Button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 search-scroll" style={{background:"var(--background)"}}>
          <div className="p-4">
            {/* Alphabet Index */}
            {!hasSearched && !indexLoading && !isSearching && (
              <div className="mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border" >
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
              {indexLoading || isSearching ? (
                <div className="flex justify-center">
                  <Loader />
                </div>
              ) : hasSearched ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {convertNumber(searchResults.length)}{" "}
                      {t("search.resultsFor")} {searchQuery}
                    </h3>
                    <button
                      onClick={handleClearSearch}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
                          <div className="p-4 space-y-2" >
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
                <div className="text-center py-12" style={{background:"var(--background)"}}>
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

  return (
    <div className="relative" >
      {/* Small Search Trigger */}
      <button
        onClick={handleOpen}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        title={t("search.tooltipSearch")}
      >
        <Search className="w-5 h-5 text-gray-500" />
      </button>

      {/* Portal Modal */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(modalContent, document.body)}
    </div>
  );
}
