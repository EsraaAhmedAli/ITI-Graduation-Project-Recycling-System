"use client";
import { useState, useEffect, useRef } from "react";
import Loader from "@/components/common/Loader";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { X, Search, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Button from "./Button";

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

export default function NavbarSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [alphabetStats, setAlphabetStats] = useState<{
    availableLetters: string[];
    alphabet: string[];
  }>({ availableLetters: [], alphabet: [] });
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has performed a search
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, locale, convertNumber } = useLanguage();

  // Generate alphabet based on language
  const getAlphabet = () => {
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
  };

  // Fetch items index to get alphabet statistics
  const fetchItemsIndex = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/search-index?lang=${locale}`);

      if (response.data.success) {
        const { data, meta } = response.data;
        // Only set results if no search has been performed yet
        if (!hasSearched) {
          setSearchResults(data || []);
        }

        // Set alphabet stats for highlighting letters
        if (meta?.alphabetStats) {
          setAlphabetStats({
            availableLetters: meta.alphabetStats.availableLetters || [],
            alphabet: meta.alphabetStats.alphabet || getAlphabet(),
          });
        } else {
          // Fallback: generate alphabet stats from data
          const availableLetters = new Set(
            data
              .map((item: SearchResult) =>
                item.displayName?.charAt(0)?.toUpperCase()
              )
              .filter(Boolean)
          );
          setAlphabetStats({
            availableLetters: Array.from(availableLetters),
            alphabet: getAlphabet(),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching items index:", error);
      toast.error(t("search.searchError"));
      // Set fallback alphabet
      setAlphabetStats({
        availableLetters: [],
        alphabet: getAlphabet(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Search items based on query
  const searchItems = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await api.get(
        `/search?q=${encodeURIComponent(query)}&lang=${locale}&limit=50`
      );

      if (response.data.success) {
        setSearchResults(response.data.data || []);
        setHasSearched(true); // Only set after successful response
      } else {
        throw new Error(response.data.message || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(t("search.searchError"));
      setSearchResults([]);
      setHasSearched(true); // Still mark as searched even on error
    } finally {
      setIsSearching(false);
    }
  };

  // Initial load - get items index when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchItemsIndex();
    }
  }, [isOpen, locale]);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setAlphabetStats({ availableLetters: [], alphabet: [] });
    setHasSearched(false); // Reset search state
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If user clears the input, reset to index view immediately
    if (!value.trim()) {
      setHasSearched(false);
      // Don't fetch index here, just reset the state
      // The index data should already be available from initial load
    }
  };

  // Handle search button click or Enter key
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      searchItems(trimmedQuery);
    } else {
      // If no query, just reset to browse mode without fetching
      setHasSearched(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle alphabet letter click
  const handleLetterClick = (letter: string) => {
    setSearchQuery(letter);
    searchItems(letter); // This will set hasSearched to true after API call
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setHasSearched(false);
    // Don't refetch, just show the already loaded index
  };

  const isRTL = locale === "ar";
  const availableLetters = new Set(alphabetStats.availableLetters);
  const alphabet =
    alphabetStats.alphabet.length > 0 ? alphabetStats.alphabet : getAlphabet();

  return (
    <div className="relative">
      {/* Small Search Trigger */}
      <button
        onClick={handleOpen}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        title={t("search.tooltipSearch")}
      >
        <Search className="w-5 h-5 text-gray-500" />
      </button>

      {/* Full-screen Modal */}
      {isOpen && (
        <div className={`fixed inset-0 z-50 bg-white ${isRTL ? "rtl" : "ltr"}`}>
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
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b bg-white shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800">
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
            <div className="flex-shrink-0 p-4 border-b bg-gray-50">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="search"
                    placeholder={t("search.placeholder")}
                    className={`w-full p-3 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      isRTL ? "pr-10 text-right" : "pl-10"
                    }`}
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
            <div className="flex-1 overflow-y-auto bg-gray-50 search-scroll">
              <div className="p-4">
                {/* Alphabet Index - Only show when no search has been performed and not loading */}
                {!hasSearched && !loading && !isSearching && (
                  <div className="mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                      <h4 className="text-center text-gray-700 font-medium mb-4 text-lg">
                        {t("search.browseByLetter")}
                      </h4>
                      <div
                        className={`flex flex-wrap gap-3 justify-center mb-4`}
                      >
                        {alphabet.map((letter) => (
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
                  {(loading && !hasSearched) || isSearching ? (
                    // Loader in results slot
                    <div className="flex justify-center">
                      <Loader />
                    </div>
                  ) : hasSearched ? (
                    // Results
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {convertNumber(searchResults.length)}{" "}
                          {t("search.resultsFor")} "{searchQuery}"
                        </h3>
                        <button
                          onClick={handleClearSearch}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {t("search.clearAndBrowse")}
                        </button>
                      </div>

                      {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {searchResults.map((item) => (
                            <Link
                              href={`/category/${item.categoryName?.en || ""}`}
                              key={item._id}
                              className="group flex items-center gap-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 p-2 min-h-[100px] max-w-[150px]"
                              onClick={handleClose}
                            >
                              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                                <Image
                                  src={item.image}
                                  alt={item.displayName || item.name?.[locale]}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 text-sm line-clamp-1">
                                  {item.displayName || item.name?.[locale]}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                  {item.categoryDisplayName ||
                                    item.categoryName?.[locale]}
                                </p>
                              </div>
                            </Link>
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
                    // Empty state (before searching)
                    <div className="text-center py-12">
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
      )}
    </div>
  );
}
