"use client";

import { useParams } from "next/navigation";
import SubcategoryList from "@/components/shared/SubcategoryList";

export default function UserCategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);

  return <SubcategoryList categoryName={categoryName} />;
}
