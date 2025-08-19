"use client";

import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCategories } from "@/hooks/useGetCategories";

export default function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const categoriesQuery = useCategories(); // Get categories query
  const categories = categoriesQuery.data?.data; // Extract categories data
  const segments = pathname.split("/").filter(Boolean);

  // Narrow order ID detection to *only* hex or numeric patterns
  const isOrderId = (segment: string) => {
    return /^[a-f\d]{24}$/i.test(segment) || /^\d+$/.test(segment);
  };

  const getTranslatedSegment = (segment: string, segmentIndex: number) => {
    const decodedSegment = decodeURIComponent(segment).toLowerCase();
    
    

    if (isOrderId(segment)) {
      return `Order #${segment.slice(-8).toUpperCase()}`;
    }

    // Check if this is a category page (previous segment is "categories" OR "category")
    const previousSegment = segmentIndex > 0 ? segments[segmentIndex - 1]?.toLowerCase() : null;
    
    if (previousSegment === "categories" || previousSegment === "category") {

      
      // Find the category by English name and return localized name
      const category = categories?.find(cat => 
        cat.name.en.toLowerCase() === decodedSegment
      );
      
      console.log('✅ Found category:', category);
      
      if (category) {
        const localizedName = category.name[locale as 'en' | 'ar'] || category.name.en;
        console.log('🌐 Returning localized name:', localizedName);
        return localizedName;
      }
      
      console.log('❌ Category not found, returning formatted segment');
      // If category not found in backend data, return formatted segment
      return decodeURIComponent(segment)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    const pathTranslations: Record<string, string> = {
      home: t("breadcrumbs.home"),
      marketplace: t("breadcrumbs.marketplace"),
      categories: t("breadcrumbs.categories"),
      category: t("breadcrumbs.category"),
      "eco-assist": t("breadcrumbs.ecoAssist"),
      ideas: t("breadcrumbs.ecoAssist"),
      collection: t("breadcrumbs.collection"),
      cart: t("breadcrumbs.cart"),
      profile: t("breadcrumbs.profile"),
      settings: t("breadcrumbs.settings"),
      orders: t("breadcrumbs.orders"),
      about: t("breadcrumbs.about"),
      contact: t("breadcrumbs.contact"),
      auth: t("breadcrumbs.auth"),
      login: t("breadcrumbs.login"),
      signup: t("breadcrumbs.signup"),
      register: t("breadcrumbs.signup"),
      dashboard: t("breadcrumbs.dashboard"),
      editprofile: t("breadcrumbs.editProfile"),
      "edit-profile": t("breadcrumbs.editProfile"),
      pickup: t("breadcrumbs.pickup") || "Pickup",
      rewarding: t("breadcrumbs.rewarding") || "Rewards Program",
      "rewarding-program": t("breadcrumbs.rewarding") || "Rewards Program",
      history: t("breadcrumbs.history") || "History",
      ewallet: t("navbar.ewallet"),
    };

    if (pathTranslations[decodedSegment]) {
      return pathTranslations[decodedSegment];
    }

    // Skip translation file lookups for categories since we handle them above
    for (const [key, translation] of Object.entries(pathTranslations)) {
      if (decodedSegment.includes(key)) {
        return translation;
      }
    }

    return decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const crumbs = segments
    .filter((segment) => segment.toLowerCase() !== "tracking")
    .flatMap((segment, index, filteredSegments) => {
      let href = "/";
      let name = getTranslatedSegment(segment, index);

      // Special handling for "pickup"
      if (segment.toLowerCase() === "pickup") {
        // First: disabled pickup breadcrumb
        const pickupCrumb = {
          name: t("breadcrumbs.pickup") || "Pickup",
          href: "#",
          isLast: false,
          isClickable: false,
          isOrderId: false,
        };

        // Second: profile breadcrumb after pickup
        const profileCrumb = {
          name: t("breadcrumbs.profile") || "Profile",
          href: "/profile",
          isLast: index === filteredSegments.length - 1,
          isClickable: true,
          isOrderId: false,
        };

        return [pickupCrumb, profileCrumb];
      }

      if (isOrderId(segment)) {
        href = "#";
      } else {
        href = "/" + segments.slice(0, index + 1).join("/");
      }

      const isClickable = !isOrderId(segment);
      const isLast = index === filteredSegments.length - 1;

      return [
        {
          name,
          href,
          isLast,
          isClickable,
          isOrderId: isOrderId(segment),
        },
      ];
    });

  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-4">
      <BreadcrumbItem href="/">
        <div className="flex items-center text-secondary hover:text-primary transition-colors">
          <Home className="mr-2 h-4 w-4" />
          {t("breadcrumbs.home")}
        </div>
      </BreadcrumbItem>

      {crumbs.map((crumb, index) => (
        <BreadcrumbItem key={crumb.href + index}>
          {crumb.isClickable && (crumb.name === t("breadcrumbs.profile") || !crumb.isLast) ? (
            <Link
              href={crumb.href}
              className="text-secondary hover:text-primary hover:underline transition-colors"
            >
              {crumb.name}
            </Link>
          ) : (
            <span
              className={`transition-colors ${
                crumb.isLast 
                  ? "text-primary font-medium" 
                  : "text-muted"
              } ${crumb.isOrderId ? "font-mono text-sm" : ""}`}
            >
              {crumb.name}
            </span>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}