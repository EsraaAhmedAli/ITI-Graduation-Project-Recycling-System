"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PromotionSlider from "@/components/buyer/PromotionSlider";
import TopMaterial from "@/components/buyer/TopMaterial";
import BannerMobile from "@/components/buyer/BannerMobile";
import { Search, Star, ChevronRight } from "lucide-react";
import RecycleSmartDoubt from "@/components/buyer/RecycleSmartDoubt";

interface Item {
  _id: string;
  name: string;
  points: number;
  price: number;
  measurement_unit: string;
  image: string;
  quantity: number;
  categoryName: string;
  categoryId: string;
}

export default function BuyerHomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch items from API
  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5000/api/categories/get-items")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setItems(data.items);
          setFilteredItems(data.items);
        } else {
          console.error("items not found in response");
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Filter based on search and category
  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const filtered = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        item.categoryName.toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === "all" || item.categoryName === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, items]);

  const uniqueCategories = Array.from(
    new Set(items.map((item) => item.categoryName))
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Slider */}
      <div className="relative">
        <PromotionSlider />
        <RecycleSmartDoubt/>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            ♻️ Sustainable Marketplace
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover recyclable items and earn rewards for your eco-friendly contributions
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-10 bg-white rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for items or categories..."
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white w-full"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category[0].toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Items Grid Section */}
        <section className="mb-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search filters"
                  : "Check back later for new recyclable items"}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {selectedCategory === "all" ? "All Items" : selectedCategory} 
                <span className="text-gray-500 ml-2">({filteredItems.length})</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <Link key={item._id} href={`/home/items/${item.name}`} passHref>
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer h-full flex flex-col border border-gray-100">
                      <div className="relative aspect-square w-full">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mb-3 self-start">
                          {item.categoryName}
                        </span>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between items-center mb-3">
                            <span className="flex items-center text-green-600 font-medium">
                              <Star className="w-4 h-4 mr-1 fill-current" />
                              {item.points} pts
                            </span>
                            <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
                          </div>
                          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                            View Details <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Impact CTA Section */}
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 md:p-12 text-white mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Your Recycling Makes a Difference</h2>
            <p className="text-lg text-green-100 mb-6 max-w-2xl mx-auto">
              Every item you recycle helps conserve resources and protect our planet
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/impact" passHref>
                <button className="px-6 py-3 bg-white text-green-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                  Learn About Our Impact <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
              <Link href="/how-it-works" passHref>
                <button className="px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors flex items-center">
                  How It Works <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Additional Components */}
        <TopMaterial />
     
      </div>
    </div>
  );
}