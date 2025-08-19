"use client";
import { useState, useEffect, useRef } from "react";
import Loader from "./loader";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { X, Search } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { CartItem } from "@/models/cart";

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
}

export default function NavbarSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, locale } = useLanguage();
  console.log("BAKKKKKKKKKKKKKKKKKKKKKKKKKKKKKR");

  // Generate alphabet based on language
  const getAlphabet = () => {
    if (locale === "ar") {
      // Arabic alphabet
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
      // English alphabet
      return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    }
  };

  // Fetch items index with optional search query
  const fetchItems = async (query = "") => {
    try {
      setIsSearching(true);
      const endpoint = query
        ? `/items/search?q=${encodeURIComponent(query)}&lang=${locale}`
        : `/items/index?lang=${locale}`;

      const response = await api.get(endpoint);
      setSearchResults(response.data.data || []);

      if (query && response.data.data.length === 0) {
        toast.info(
          locale === "ar" ? "لم يتم العثور على نتائج" : "No results found"
        );
      }
    } catch (error) {
      toast.error(locale === "ar" ? "خطأ في البحث" : "Search error");
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Initial load - get items index
  useEffect(() => {
    if (isOpen) {
      fetchItems();
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search button click or Enter key
  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchItems(searchQuery.trim());
    } else {
      fetchItems(); // Fetch all items if no query
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
    fetchItems(letter);
  };

  // Get available starting letters from current results
  const availableLetters = new Set(
    searchResults
      .map((item) => {
        const firstChar = item.name[locale]?.charAt(0)?.toUpperCase();
        return locale === "ar" ? firstChar : firstChar;
      })
      .filter(Boolean)
  );

  const alphabet = getAlphabet();

  return (
    <div className="relative">
      {/* Small Search Trigger */}
      <button
        onClick={handleOpen}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        title={locale === "ar" ? "البحث" : "Search"}
      >
        <Search className="w-5 h-5 text-gray-500" />
      </button>

      {/* Full-screen Modal */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 bg-white p-4 overflow-y-auto ${
            locale === "ar" ? "rtl" : "ltr"
          }`}
          style={{ height: "100vh" }}
        >
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {locale === "ar" ? "البحث في المنتجات" : "Search Items"}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={locale === "ar" ? "إغلاق البحث" : "Close search"}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input with Button */}
          <div className="relative mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="search"
                  placeholder={
                    locale === "ar"
                      ? "ماذا تبحث عنه؟"
                      : "What are you looking for?"
                  }
                  className={`w-full p-4 text-lg border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none ${
                    locale === "ar" ? "pr-12 text-right" : "pl-12"
                  }`}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  value={searchQuery}
                  autoFocus
                  dir={locale === "ar" ? "rtl" : "ltr"}
                />
                <div
                  className={`absolute inset-y-0 flex items-center ${
                    locale === "ar" ? "right-0 pr-4" : "left-0 pl-4"
                  }`}
                >
                  <Search className="w-6 h-6 text-gray-500" />
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
              >
                {isSearching ? (
                  <Loader />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    {locale === "ar" ? "بحث" : "Search"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Alphabet Index */}
          <div className="mb-8">
            {/* Main instruction */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">💡</span>
                </div>
                <h3 className="text-blue-800 font-semibold text-lg">
                  {locale === "ar" ? "نصائح البحث السريع" : "Quick Search Tips"}
                </h3>
              </div>
              <p className="text-blue-700 text-base leading-relaxed">
                <strong>
                  {locale === "ar"
                    ? "انقر على أي حرف أخضر أدناه للعثور فوراً على جميع العناصر التي تبدأ بذلك الحرف!"
                    : "Click on any GREEN letter below to instantly find all items starting with that letter!"}
                </strong>
              </p>
              <p className="text-blue-600 text-sm mt-1">
                {locale === "ar"
                  ? "الأحرف الحمراء تشير إلى عدم وجود عناصر تبدأ بتلك الأحرف."
                  : "Red letters indicate no items available starting with those letters."}
              </p>
            </div>

            {/* Alphabet grid */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-center text-gray-700 font-medium mb-4 text-lg">
                {locale === "ar"
                  ? "تصفح حسب الحرف الأول"
                  : "Browse by First Letter"}
              </h4>
              <div
                className={`flex flex-wrap gap-2 justify-center mb-4 ${
                  locale === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                {alphabet.map((letter) => (
                  <button
                    key={letter}
                    className={`
                      w-12 h-12 rounded-lg text-xl font-bold transition-all duration-200 transform
                      ${
                        availableLetters.has(letter)
                          ? "bg-green-500 text-white hover:bg-green-600 hover:scale-110 shadow-md hover:shadow-lg cursor-pointer border-2 border-green-500 hover:border-green-600"
                          : "bg-red-100 text-red-400 cursor-not-allowed border-2 border-red-200"
                      }
                    `}
                    onClick={() =>
                      availableLetters.has(letter) && handleLetterClick(letter)
                    }
                    disabled={!availableLetters.has(letter)}
                    title={
                      availableLetters.has(letter)
                        ? locale === "ar"
                          ? `انقر لرؤية العناصر التي تبدأ بـ "${letter}"`
                          : `Click to see items starting with "${letter}"`
                        : locale === "ar"
                        ? `لا توجد عناصر تبدأ بـ "${letter}"`
                        : `No items start with "${letter}"`
                    }
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-700 font-medium">
                    {locale === "ar"
                      ? "متوفر (انقر للبحث)"
                      : "Available (Click to search)"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span className="text-gray-700">
                    {locale === "ar" ? "غير متوفر" : "Not available"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div>
            {searchQuery && (
              <>
                <h3 className="text-lg font-medium mb-6">
                  {locale === "ar"
                    ? `${searchResults.length} نتيجة لـ "${searchQuery}"`
                    : `${searchResults.length} results for "${searchQuery}"`}
                </h3>
                {isSearching ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.map((item) => (
                      <Link
                        href={`/category/${
                          item.categoryName?.en || item.categoryName
                        }`}
                        key={item._id}
                        className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={handleClose}
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 mr-4">
                          <Image
                            src={item.image}
                            alt={item.name?.[locale] || item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className={locale === "ar" ? "text-right" : ""}>
                          <p className="font-medium">
                            {item.name?.[locale] || item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.categoryName?.[locale] || item.categoryName}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-lg text-gray-500 mb-2">
                      {locale === "ar"
                        ? "لم يتم العثور على عناصر"
                        : "No items found"}
                    </p>
                    <p className="text-gray-400 mb-4">
                      {locale === "ar"
                        ? "جرب مصطلح بحث مختلف"
                        : "Try a different search term"}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        fetchItems();
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {locale === "ar"
                        ? "مسح البحث وتصفح الأحرف"
                        : "Clear search and browse letters"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
