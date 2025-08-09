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

  // Helper function to check if a segment looks like an order ID
  const isOrderId = (segment: string) => {
    // Check if it's a MongoDB ObjectId format (24 hex characters) or other ID patterns
    return /^[a-f\d]{24}$/i.test(segment) || 
           /^[a-f\d]{8,}$/i.test(segment) || 
           segment.length > 8;
  };

  // Translation mapping for common path segments
  const getTranslatedSegment = (segment: string, index: number) => {
    const decodedSegment = decodeURIComponent(segment).toLowerCase();
    
    // Handle order IDs specifically
    if (isOrderId(segment)) {
      // If this is an order ID, show a formatted version
      return `Order #${segment.slice(-8).toUpperCase()}`;
    }
    
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
      // Add pickup translation
      'pickup': t('breadcrumbs.pickup') || 'Pickup',
    };

    // Check if we have a direct translation
    if (pathTranslations[decodedSegment]) {
      return pathTranslations[decodedSegment];
    }

    // Check category translations
    const categoryTranslationKey = `categories.${decodedSegment}`;
    const categoryTranslation = t(categoryTranslationKey, { defaultValue: '' });
    if (categoryTranslation && categoryTranslation !== categoryTranslationKey) {
      return categoryTranslation;
    }

    // Check subcategory translations
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

  const crumbs = segments
    .filter((segment) => {
      // Exclude "tracking" segment since it doesn't have a valid standalone page
      return segment.toLowerCase() !== 'tracking';
    })
    .map((segment, index, filteredSegments) => {
      // Build href based on original position but only for valid segments
      let href = "/";
      let name = getTranslatedSegment(segment, index);
      
      if (segment.toLowerCase() === 'pickup') {
        // Replace pickup with profile in breadcrumbs
        name = t('breadcrumbs.profile') || 'Profile';
        href = "/profile";
      } else if (isOrderId(segment)) {
        // For order IDs, don't create a clickable link
        href = "#";
      } else {
        // For other segments, build the path normally
        const segmentIndex = segments.indexOf(segment);
        href = "/" + segments.slice(0, segmentIndex + 1).join("/");
      }

      const isClickable = !isOrderId(segment);
      const isLast = index === filteredSegments.length - 1;

      return { 
        name, 
        href, 
        isLast, 
        isClickable,
        isOrderId: isOrderId(segment)
      };
    });

  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-4">
      <BreadcrumbItem href="/">
        <Home className="mr-2 h-4 w-4" />
        {t('breadcrumbs.home')}
      </BreadcrumbItem>

      {crumbs.map((crumb, index) => (
        <BreadcrumbItem key={crumb.href + index}>
          {crumb.isLast || !crumb.isClickable ? (
            <span className={`${crumb.isLast ? 'text-green-600' : 'text-gray-600'} ${crumb.isOrderId ? 'font-mono text-sm' : ''}`}>
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