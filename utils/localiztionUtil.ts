// utils/localizationUtils.ts

import { useLanguage } from "@/context/LanguageContext";

// Type definitions
export interface BilingualText {
  en: string;
  ar: string;
}

export interface LocalizedItem {
  name: BilingualText | string;
  displayName?: string;
  [key: string]: any;
}

export interface LocalizedCategory {
  name: BilingualText | string;
  description?: BilingualText | string;
  displayName?: string;
  displayDescription?: string;
  [key: string]: any;
}

/**
 * Custom hook for localized display functions
 */
export const useLocalization = () => {
  const { locale, t } = useLanguage();

  /**
   * Get localized display name from an item/category
   * Prioritizes backend's displayName, then extracts from bilingual object
   */
  const getDisplayName = (item: LocalizedItem): string => {
    // First priority: Use backend's localized displayName
    if (item.displayName) {
      return item.displayName;
    }

    // Second priority: Extract from bilingual object based on current locale
    if (typeof item.name === 'object' && item.name !== null) {
      return item.name[locale as keyof BilingualText] || item.name.en;
    }

    // Fallback: Use string name or default
    return (item.name as string) || 'Unnamed Item';
  };

  /**
   * Get localized display description from a category
   */
  const getDisplayDescription = (category: LocalizedCategory): string => {
    // First priority: Use backend's localized displayDescription
    if (category.displayDescription) {
      return category.displayDescription;
    }

    // Second priority: Extract from bilingual object based on current locale
    if (typeof category.description === 'object' && category.description !== null) {
      return category.description[locale as keyof BilingualText] || category.description.en;
    }

    // Fallback: Use string description or empty string
    return (category.description as string) || '';
  };

  /**
   * Get English name for API calls and routing (always use English for backend)
   */
  const getEnglishName = (item: LocalizedItem): string => {
    if (typeof item.name === 'object' && item.name !== null) {
      return item.name.en;
    }
    return (item.name as string) || '';
  };

  /**
   * Get localized measurement unit
   */
  const getMeasurementUnit = (unit: string | number): string => {
    // Convert numeric units to strings
    let unitString = '';
    if (typeof unit === 'number') {
      unitString = unit === 1 ? 'kg' : unit === 2 ? 'pieces' : 'unknown';
    } else {
      unitString = unit.toLowerCase();
    }

    // Return localized unit
    switch (unitString) {
      case 'kg':
      case '1':
        return t('common.unitKg') || 'KG';
      case 'pieces':
      case '2':
        return t('common.unitPiece') || 'Pieces';
      default:
        return unitString;
    }
  };

  /**
   * Format currency with localized currency symbol
   */
  const formatCurrency = (amount: number): string => {
    const currency = t('itemsModal.currency') || 'EGP';
    return `${amount} ${currency}`;
  };

  return {
    getDisplayName,
    getDisplayDescription,
    getEnglishName,
    getMeasurementUnit,
    formatCurrency,
    locale,
    t
  };
};