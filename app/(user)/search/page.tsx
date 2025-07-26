"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/common/loader";
import api from "@/lib/axios";

interface Item {
  _id: string;
  name: string;
  image: string;
  categoryId: string;
  categoryName: string;
  points: number;
  quantity: number;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const categoriesRes = await api.get("/categories");
        const categories = categoriesRes.data;

        let items: Item[] = [];

        for (const category of categories) {
          try {
            const itemRes = await api.get(
              `/categories/get-items/${category.name}`
            );
            // console.log(itemRes);
            const categoryItems = itemRes.data || [];

            // Inject categoryId (if not included)
            const enrichedItems = categoryItems.map((item: Item) => ({
              ...item,
              categoryId: category._id,
              categoryName: category.name,
            }));

            items = [...items, ...enrichedItems];
          } catch (err) {
            console.error(
              `Error fetching items for category ${category.name}:`,
              err
            );
          }
        }

        setAllItems(items);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const filtered = allItems.filter((item) =>
      item.name.toLowerCase().startsWith(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, allItems]);

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const validStartChars = new Set(
    allItems.map((item) => item.name[0].toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Search Items</h2>

      <input
        type="text"
        autoFocus
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
        placeholder="Start typing to search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Alphabet Index */}
      <div className="flex flex-wrap gap-1 mb-4">
        {alphabet.map((char) => (
          <span
            key={char}
            className={`w-6 h-6 flex items-center justify-center text-xs rounded font-semibold ${
              validStartChars.has(char)
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {char.toUpperCase()}
          </span>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <Loader />
      ) : results.length > 0 ? (
        <ul className="space-y-3">
          {results.map((item) => (
            <li
              key={item._id}
              className="flex items-center gap-4 p-2 hover:bg-gray-100 cursor-pointer rounded"
              onClick={() => router.push(`/category/${item.categoryName}`)}
            >
              <Image
                width={200}
                height={200}
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">{item.categoryName}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : query ? (
        <p className="text-gray-500">No items found for "{query}"</p>
      ) : (
        <p className="text-gray-400">Start typing to search items...</p>
      )}
    </div>
  );
}
