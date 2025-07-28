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

  // Translation mapping for common path segments
  const getTranslatedSegment = (segment: string) => {
    const decodedSegment = decodeURIComponent(segment).toLowerCase();
    
 
  const pathTranslations: { [key: string]: string } = {
    'home': t('breadcrumbs.home'),
    'marketplace': t('breadcrumbs.marketplace'),
    'categories': t('breadcrumbs.categories'),
    'category': t('breadcrumbs.category'),
    'eco-assist': t('breadcrumbs.ecoAssist'),
    'ideas': t('breadcrumbs.ecoAssist'),
    'collection': t('breadcrumbs.collection'),
    'cart': t('breadcrumbs.cart'),
    'profile': t('breadcrumbs.profile'),
    'settings': t('breadcrumbs.settings'),
    'orders': t('breadcrumbs.orders'),
    'about': t('breadcrumbs.about'),
    'contact': t('breadcrumbs.contact'),
    'auth': t('breadcrumbs.auth'),
    'login': t('breadcrumbs.login'),
    'signup': t('breadcrumbs.signup'),
    'register': t('breadcrumbs.signup'),
    'dashboard': t('breadcrumbs.dashboard'),
    'editprofile': t('breadcrumbs.editProfile'),
    'edit-profile': t('breadcrumbs.editProfile'),
  };

    // Check if we have a direct translation
    if (pathTranslations[decodedSegment]) {
      return pathTranslations[decodedSegment];
    }
  const categoryTranslationKey = `categories.${decodedSegment}`;
  const categoryTranslation = t(categoryTranslationKey, { defaultValue: '' });
  if (categoryTranslation && categoryTranslation !== categoryTranslationKey) {
    return categoryTranslation;
  }
    const subcategoryTranslationKey = `categories.subcategories.${decodedSegment}`;
  const subcategoryTranslation = t(subcategoryTranslationKey, { defaultValue: '' });
  if (subcategoryTranslation && subcategoryTranslation !== subcategoryTranslationKey) {
    return subcategoryTranslation;
  }
    // Check for partial matches (useful for dynamic routes)
    for (const [key, translation] of Object.entries(pathTranslations)) {
      if (decodedSegment.includes(key)) {
        return translation;
      }
    }

    // Fallback: format the segment nicely if no translation found
    return decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const name = getTranslatedSegment(segment);

    return { name, href, isLast: index === segments.length - 1 };
  });

  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-4">
      <BreadcrumbItem href="/">
        <Home className="mr-2 h-4 w-4" />
        {t('breadcrumbs.home')}
      </BreadcrumbItem>

      {crumbs.map((crumb) => (
        <BreadcrumbItem key={crumb.href}>
          {crumb.isLast ? (
            <span className="text-green-600">{crumb.name}</span>
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