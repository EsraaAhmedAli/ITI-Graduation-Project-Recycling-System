// hoc/withAdminGuard.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/AuthFormContext";

export default function withAdminGuard(Component: React.ComponentType) {
  return function AdminProtectedComponent(props: any) {
    const router = useRouter();
    const { user } = useUserAuth();

    useEffect(() => {
      if (!user || user.role !== "admin") {
        router.replace("/unauthorized");
      }
    }, [user, router]);

    if (!user || user.role !== "admin") {
      return null; // or a loading spinner
    }

    return <Component {...props} />;
  };
}
