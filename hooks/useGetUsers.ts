import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

type User = {
  id: string;
  name: string;
  role: string;
  // add more user fields if needed
};

// 
export function useUsers(role?: string) {
  return useQuery<User[]>({
    queryKey: ["users", role],
    queryFn: async () => {
      const url = role 
        ? `/users?role=${role}` 
        : "/users?limit=1000"; 
              const res = await api.get(url);
      return res.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // optional: cache for 5 mins
    onError: (error: unknown) => {
      console.error("Failed to fetch users:", error);
    },
  });
}
