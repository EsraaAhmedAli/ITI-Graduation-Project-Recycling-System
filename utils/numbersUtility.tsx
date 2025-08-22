// utils/numbers.ts
'use client';

import { useLanguage } from "@/context/LanguageContext";


/**
 * Converts a number or string to the appropriate numeral system based on locale
 * @param value The number or string to convert
 * @param locale The target locale ('en' or 'ar')
 * @returns The converted number string
 */
export const convertNumbers = (value: number | string, locale: 'en' | 'ar'): string => {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  if (locale === 'ar') {
    return stringValue.replace(/[0-9]/g, (digit) => {
      return String.fromCharCode(digit.charCodeAt(0) + 1584);
    });
  } else {
    return stringValue.replace(/[٠-٩]/g, (digit) => {
      return String.fromCharCode(digit.charCodeAt(0) - 1584);
    });
  }
};

/**
 * A hook version that uses the current locale from the LanguageContext
 * @returns A function that converts numbers based on current locale
 */
export const useNumberConversion = () => {
  const { locale } = useLanguage();
  
  const convertNumber = (value: number | string) => {
    return convertNumbers(value, locale);
  };

  return convertNumber;
};