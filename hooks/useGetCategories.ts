import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Category } from "@/components/Types/categories.type";

export function useCategories() {
  const query = useQuery<Category[]>({
    queryKey: ["categories list"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const getCategoryIdByItemName = (itemName: string): string => {
    const categories = query.data?.data;
    console.log("CATGEORIES");
    console.log(categories);
    if (!Array.isArray(categories)) return "";

    for (const category of categories) {
      const foundItem = category.items?.find((item) => {
        console.log("in comparison");
        console.log(`${item.name} Vs ${itemName} == ${item.name === itemName}`);
        console.log("-------------------------");
        return item.name === itemName;
      });

      if (foundItem) {
        console.log("We Fouund SomeThing");
        console.log(foundItem);
        return category._id;
      }
    }

    return "";
  };
  const geItemQuantityInStock = (itemId: string, categoryId: string) => {
    const categories = query.data?.data;
    console.log("CATGEORIES");
    console.log(categories);
    if (!Array.isArray(categories)) return -1;
    const category = categories.find((cat) => cat._id == categoryId);
    if (!category) return -1;
    const targetItem = category.items.find((item) => item._id === itemId);
    if (!targetItem) return -1;
    return targetItem.quantity;
  };

  return { ...query, getCategoryIdByItemName, geItemQuantityInStock };
}
