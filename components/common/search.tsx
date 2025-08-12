"use client";
import { useState, useEffect, useRef } from "react";
import Loader from "./Loader";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { X } from "lucide-react";
import Link from "next/link";

interface Item {
  _id: string;
  name: string;
  image: string;
  categoryName: string;
}

export default function NavbarSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        setLoading(true);
        const itemsRes = await api.get("/categories/get-items");
        const items: Item[] = itemsRes.data.data;
        setAllItems(items);
      } catch {
        // toast.error("Can't get items");
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredItems = allItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate A-Z index
  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  // Check available starting letters
  const availableLetters = new Set(
    allItems.map((item) => item.name.charAt(0).toUpperCase())
  );

  return (
    <div className="relative">
      {/* Small Search Trigger */}
      <button
        onClick={handleOpen}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 20 20">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </button>

      {/* Full-screen Modal */}
      {isOpen && (
        <div
          className="fixed inset-0  z-50 bg-white p-4 overflow-y-auto"
          style={{ height: "100vh" }}>
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Search Items</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close search">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <input
              ref={inputRef}
              type="search"
              placeholder="What are you looking for?"
              className="w-full p-4 pl-12 text-lg border-b border-gray-300 focus:border-blue-500 focus:outline-none"
              onChange={handleChange}
              value={searchQuery}
              autoFocus
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                viewBox="0 0 20 20">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
          </div>

          {/* Enhanced A-Z Index with Better Visibility */}
          <div className="mb-8">
            {/* Main instruction with better styling */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <h3 className="text-blue-800 font-semibold text-lg">
                  Quick Search Tips
                </h3>
              </div>
              <p className="text-blue-700 text-base leading-relaxed">
                💡 <strong>Click on any GREEN letter</strong> below to instantly
                find all items starting with that letter!
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Red letters indicate no items available starting with those
                letters.
              </p>
            </div>

            {/* Alphabet grid with enhanced styling */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-center text-gray-700 font-medium mb-4 text-lg">
                Browse by First Letter
              </h4>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
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
                      availableLetters.has(letter) && setSearchQuery(letter)
                    }
                    disabled={!availableLetters.has(letter)}
                    title={
                      availableLetters.has(letter)
                        ? `Click to see items starting with "${letter}"`
                        : `No items start with "${letter}"`
                    }>
                    {letter}
                  </button>
                ))}
              </div>

              {/* Legend with icons */}
              <div className="flex justify-center items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-700 font-medium">
                    Available (Click to search)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span className="text-gray-700">Not available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div>
            {searchQuery ? (
              <>
                <h3 className="text-lg font-medium mb-6">
                  {filteredItems.length} results for "{searchQuery}"
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                      <Link
                        href={`/category/${item.categoryName}`}
                        key={item._id}
                        className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          // Handle item selection
                          handleClose();
                        }}>
                        <div className="relative w-16 h-16 flex-shrink-0 mr-4">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.categoryName}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-lg text-gray-500 mb-2">No items found</p>
                    <p className="text-gray-400 mb-4">
                      Try a different search term
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Clear search and browse letters
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔤</div>
                <p className="text-lg text-gray-500 mb-2 font-medium">
                  Ready to search!
                </p>
                <p className="text-gray-600 text-base leading-relaxed max-w-md mx-auto">
                  Type in the search box above, or click on any{" "}
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                    GREEN letter
                  </span>{" "}
                  to browse items alphabetically
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
