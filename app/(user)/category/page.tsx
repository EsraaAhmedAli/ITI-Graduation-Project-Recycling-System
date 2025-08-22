"use client";

const FloatingRecorderButton = dynamic(
  () => import('@/components/Voice Processing/FloatingRecorderButton'),
  { ssr: false }
);import CategoryList from "@/components/shared/CategoryList";
import dynamic from "next/dynamic";


export default function UserCategoriesPage() {
  return (
    <>
      <CategoryList basePath="user" horizontal={false} />;
      <FloatingRecorderButton />
    </>
  );
}
