"use client";

import FloatingRecorderButton from "@/components/Voice Processing/FloatingRecorderButton";
import CategoryList from "@/components/shared/CategoryList";
export default function UserCategoriesPage() {
  return (
    <>
      <CategoryList basePath="user" />;
      <FloatingRecorderButton />
    </>
  );
}
