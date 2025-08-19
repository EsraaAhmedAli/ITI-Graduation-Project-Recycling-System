"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Import your translation files
import enTranslations from "@/messages/en.json";
import arTranslations from "@/messages/ar.json";
import { convertNumbers } from "@/utils/numbersUtility";

type Locale = "en" | "ar";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, any>) => string;
  tAr: (key: string, params?: Record<string, any>) => string;
  dir: "ltr" | "rtl";
  isLoaded: boolean;
  convertNumber: (value: number | string, locale?: Locale) => string;
}

const translations = {
  en: enTranslations,
  ar: arTranslations,
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: (locale: Locale) => {},
  t: () => "",
  tAr: () => "",
  dir: "ltr",
  isLoaded: false,
  convertNumber: (value: number | string, locale: Locale) => value.toString(),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // First useEffect: Handle mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Second useEffect: Handle localStorage only after mounting
  useEffect(() => {
    if (!isMounted) return;

    try {
      // Only access localStorage after component is mounted
      const savedLocale = localStorage.getItem("locale") as Locale;
      const initialLocale =
        savedLocale && (savedLocale === "en" || savedLocale === "ar")
          ? savedLocale
          : "en";

      setLocaleState(initialLocale);
      
      // Safely update document properties
      if (typeof document !== 'undefined') {
        document.documentElement.dir = initialLocale === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = initialLocale;
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // Fallback to default locale
      setLocaleState("en");
      setIsLoaded(true);
    }
  }, [isMounted]);

  const setLocale = (newLocale: Locale) => {
    if (!isMounted) return;
    
    try {
      localStorage.setItem("locale", newLocale);
      setLocaleState(newLocale);
      
      if (typeof document !== 'undefined') {
        document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = newLocale;
      }
    } catch (error) {
      console.error('Error setting locale:', error);
      // Still update state even if localStorage fails
      setLocaleState(newLocale);
    }
  };

  const t = (key: string, params?: Record<string, any>): string => {
    try {
      const keys = key.split(".");
      let value: any = translations[locale];

      for (const k of keys) {
        value = value?.[k];
      }

      if (typeof value !== "string") return key;

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const regex = new RegExp(`{{\\s*${paramKey}\\s*}}`, "g");
          value = value.replace(regex, String(paramValue));
        });
      }

      return (value as string) || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  const tAr = (key: string, params?: Record<string, any>): string => {
    try {
      const keys = key.split(".");
      let value: any = translations.ar;

      for (const k of keys) {
        value = value?.[k];
      }

      if (typeof value !== "string") return key;

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const regex = new RegExp(`{{\\s*${paramKey}\\s*}}`, "g");
          value = value.replace(regex, String(paramValue));
        });
      }

      return (value as string) || key;
    } catch (error) {
      console.error('Arabic translation error:', error);
      return key;
    }
  };

  const dir = locale === "ar" ? "rtl" : "ltr";
  const convertNumber = (value: number | string, loc?: Locale) => {
    try {
      return convertNumbers(value, loc ?? locale);
    } catch (error) {
      console.error('Number conversion error:', error);
      return value.toString();
    }
  };

  // Don't render children until context is properly initialized
  if (!isMounted || !isLoaded) {
    return (
      <LanguageContext.Provider
        value={{ 
          locale: "en", 
          setLocale: () => {}, 
          t: (key) => key, 
          tAr: (key) => key, 
          dir: "ltr", 
          isLoaded: false,
          convertNumber: (value) => value.toString()
        }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t, tAr, dir, isLoaded, convertNumber }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};