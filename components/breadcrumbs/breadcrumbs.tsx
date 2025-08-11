"use client";

import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const segments = pathname.split("/").filter(Boolean);

  // Narrow order ID detection to *only* hex or numeric patterns
  const isOrderId = (segment: string) => {
    return /^[a-f\d]{24}$/i.test(segment) || /^\d+$/.test(segment);
  };

  const getTranslatedSegment = (segment: string) => {
    const decodedSegment = decodeURIComponent(segment).toLowerCase();

    if (isOrderId(segment)) {
      return `Order #${segment.slice(-8).toUpperCase()}`;
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
    };

    if (pathTranslations[decodedSegment]) {
      return pathTranslations[decodedSegment];
    }

    const categoryKey = `categories.${decodedSegment}`;
    const categoryTranslation = t(categoryKey, { defaultValue: "" });
    if (categoryTranslation && categoryTranslation !== categoryKey) {
      return categoryTranslation;
    }

    const subCategoryKey = `categories.subcategories.${decodedSegment}`;
    const subCategoryTranslation = t(subCategoryKey, { defaultValue: "" });
    if (subCategoryTranslation && subCategoryTranslation !== subCategoryKey) {
      return subCategoryTranslation;
    }

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
    .map((segment, index, filteredSegments) => {
      let href = "/";
      let name = getTranslatedSegment(segment);

      if (segment.toLowerCase() === "pickup") {
        name = t("breadcrumbs.profile") || "Profile";
        href = "/profile";
      } else if (isOrderId(segment)) {
        href = "#";
      } else {
        href = "/" + segments.slice(0, index + 1).join("/");
      }

      const isClickable = !isOrderId(segment);
      const isLast = index === filteredSegments.length - 1;

      return {
        name,
        href,
        isLast,
        isClickable,
        isOrderId: isOrderId(segment),
      };
    });

  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-4">
      <BreadcrumbItem href="/">
        <Home className="mr-2 h-4 w-4" />
        {t("breadcrumbs.home")}
      </BreadcrumbItem>

      {crumbs.map((crumb, index) => (
        <BreadcrumbItem key={crumb.href + index}>
          {crumb.isLast || !crumb.isClickable ? (
            <span
              className={`${
                crumb.isLast ? "text-green-600" : "text-gray-600"
              } ${crumb.isOrderId ? "font-mono text-sm" : ""}`}
            >
              {crumb.name}
            </span>
          ) : (
            <Link href={crumb.href} className="hover:underline">
              {crumb.name}
            </Link>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
