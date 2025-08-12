"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PromotionSlider from "@/components/buyer/PromotionSlider";
import {   ChevronRight,  Frown, Leaf, Zap, Recycle, AlertTriangle  } from "lucide-react";
import api from "@/lib/axios";
import { useUserAuth } from "@/context/AuthFormContext";


interface Item {
  _id: string;
  name: string;
  price: number;
  measurement_unit: number;
  image: string;
  categoryName: string;
  quantity: number; // Added quantity property
}

interface Material {
  name: string;
  image: string;
  totalRecycled: number;
  totalPoints: number;
  unit:string
}

export default function BuyerHomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("buyer"); // default fallback


  

  const getMeasurementText = (unit: number) => {
    return unit === 1 ? "kg" : "pc";
  };

  // Format quantity display
  const formatQuantity = (quantity: number, unit: number) => {
    if (quantity === 0) return "Out of stock";
    
    const unitText = getMeasurementText(unit);
    if (quantity < 10) {
      return `Only ${quantity} ${unitText} left`;
    }
    return `${quantity} ${unitText} in stock`;
  };

  // Get stock status color
  const getStockColor = (quantity: number) => {
    if (quantity === 0) return "text-red-600";
    if (quantity < 10) return "text-orange-600";
    return "text-emerald-600";
  };
const {user} = useUserAuth()
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      // const response = await fetch(`http://localhost:5000/api/categories/get-items?page=1&limit=8&role=buyer`);
      // const data = await response.json();
      const response = await api.get(`/categories/get-items?page=1&limit=8&role=buyer`)
      const data = response.data
      setItems(data.data);
      setFilteredItems(data.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterials = async () => {
    setMaterialsLoading(true);
    try {
      // const response = await fetch("http://localhost:5000/api/top-materials-recycled");
      // const data = await response.json();
      const response = await api.get('/top-materials-recycled')
      const data = response.data
      console.log(data);
      

      const formattedMaterials = data.data.map((item: any) => ({
        name: item._id.itemName,
        image: item.image,
        totalRecycled: item.totalQuantity,
        totalPoints: item.totalPoints,
        unit:item.unit
      }));

      setMaterials(formattedMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setMaterialsLoading(false);
    }
  };



  useEffect(() => {
    // Try to get user role from session storage
    try {
      const storedData = sessionStorage.getItem("checkoutData");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const role = parsed?.user?.role;
        setUserRole(role || "buyer");
      } else {
        setUserRole("buyer");
      }
    } catch (error) {
      console.error("Failed to parse session data:", error);
      setUserRole("buyer");
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchMaterials();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(term) || item.categoryName.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === "all" || item.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort items: in-stock items first, then out-of-stock
    const sortedFiltered = filtered.sort((a, b) => {
      // If both have stock or both are out of stock, maintain original order
      if ((a.quantity > 0 && b.quantity > 0) || (a.quantity === 0 && b.quantity === 0)) {
        return 0;
      }
      // If a has stock but b doesn't, a comes first
      if (a.quantity > 0 && b.quantity === 0) {
        return -1;
      }
      // If b has stock but a doesn't, b comes first
      return 1;
    });

    setFilteredItems(sortedFiltered);
  }, [searchTerm, selectedCategory, items]);

  const uniqueCategories = Array.from(new Set(items.map((item) => item.categoryName))).sort();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Slider */}
      <PromotionSlider />

      <div className="container mx-auto px-4 py-8">
        {/* ... header, search bar, banner, top materials ... */}

        {/* Items Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedCategory === "all" ? "Featured Items" : selectedCategory}
            </h2>
            <Link href="/marketplace" passHref>
              <button   aria-label="view all items"
 className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center text-sm transition-colors">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-44 animate-pulse"></div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 bg-white rounded-lg shadow-sm max-w-2xl mx-auto border border-gray-100"
            >
              <Frown className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 mb-4 text-sm">Try adjusting your search or filter</p>
              <button
                aria-label="reset filters"

                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm transition-colors"
              >
                Reset filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {filteredItems.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  <Link href={`/marketplace/${encodeURIComponent(item.name)}`} passHref>
                    <div className={`bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-sm h-full relative ${
                      item.quantity === 0 ? 'opacity-75' : ''
                    }`}>
                      
                      {/* Out of Stock Badge */}
                      {item.quantity === 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <AlertTriangle className="w-3 h-3" />
                            Out of Stock
                          </div>
                        </div>
                      )}

                      {/* Low Stock Badge */}
                      {item.quantity > 0 && item.quantity < 10 && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </div>
                        </div>
                      )}

                      <div className="relative aspect-square w-full mb-3 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={200}
                            height={200}
                            className={`w-full h-full object-contain p-3 ${
                              item.quantity === 0 ? 'grayscale' : ''
                            }`}
                          />
                        ) : (
                          <div className={`text-gray-300 ${item.quantity === 0 ? 'opacity-50' : ''}`}>
                            <Recycle className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-base font-medium text-gray-800 truncate mb-2">{item.name}</h3>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-emerald-600">
                            {item.price} EGP
                          </span>
                          <span className="text-xs text-emerald-600">
                            /{getMeasurementText(item.measurement_unit)}
                          </span>
                        </div>
                        
                        <div className={`text-xs font-medium ${getStockColor(item.quantity)}`}>
                          {formatQuantity(item.quantity, item.measurement_unit)}
                        </div>  
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

   
              {/* Recycling Banner */}
        <section className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl overflow-hidden mb-12">
         <div className="absolute inset-0 overflow-hidden opacity-10">
           {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 12 + 4}px`,
                }}
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: Math.random() * 6 + 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Recycle />
              </motion.div>
            ))}
          </div>

          <div className="container mx-auto px-4 py-8 relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left lg:w-1/2">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                  <span className="inline-block bg-white/20 px-2 py-1 rounded-full text-emerald-100 text-xs mb-2">
                    X Change
                  </span>
                  <br />
                  Recycle Today for a <span className="text-yellow-300">Better</span> Tomorrow
                </h2>
                <p className="text-sm text-emerald-100 mb-4 max-w-md mx-auto lg:mx-0">
                  Join our community making a difference. Every recycled item counts.
                </p>
           
              </div>

              <div className="grid grid-cols-2 gap-2 lg:w-1/2 max-w-xs">
                {[
                  { icon: <Zap className="w-5 h-5 text-yellow-300" />, value: "1,250+", label: "Daily Recyclers" },
                  { icon: <Recycle className="w-5 h-5 text-emerald-300" />, value: "5.2K", label: "Items Recycled" },
                  { icon: <Leaf className="w-5 h-5 text-green-300" />, value: "28K+", label: "CO₂ Reduced" },
                  { icon: <span className="text-base">♻️</span>, value: "100%", label: "Eco-Friendly" }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -2 }}
                    className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20"
                  >
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <h3 className="text-lg font-bold text-white text-center">{stat.value}</h3>
                    <p className="text-emerald-100 text-xs text-center">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

              <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Top Recycled Materials</h2>
                
          </div>

          {materialsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-44 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {materials.map((material, index) => (
                <Link key={index} href={`/home/items/${encodeURIComponent(material.name)}`} passHref>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-sm">
                      <div className="relative aspect-square w-full mb-3 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                        {material.image ? (
                          <Image
                            src={material.image}
                            alt={material.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-contain p-3"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/fallback-recycle-icon.png';
                            }}
                          />
                        ) : (
                          <div className="text-gray-300">
                            <Recycle className="h-10 w-10" />
                            
                          </div>
                        )}
                      </div>
                      <h3 className="text-base font-medium text-gray-800 truncate mb-1">
                        {material.name}
                    
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600 font-bold">  {material.totalRecycled} </span>
                        
                        {material.unit}  sold
                        </span>
                  
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
      
    </div>
  );
}