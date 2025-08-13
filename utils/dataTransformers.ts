// utils/dataTransformers.ts
import { useLanguage } from "@/context/LanguageContext";
import { UserGrowthItem, ChartData, ApiResponse } from "../components/Types";

export const normalizeApiResponse = <T>(response: any): ApiResponse<T> => {
  // Handle different API response structures
  if (response && response.success !== undefined) {
    return response;
  }

  // If response has data property but no success flag
  if (response && response.data) {
    return {
      success: true,
      data: response.data,
    };
  }

  // If response is direct data
  return {
    success: true,
    data: response,
  };
};

export const transformUserGrowthData = (data: any): UserGrowthItem[] => {
  try {
    let processedData = data;

    // Handle wrapped responses
    if (data && data.success && data.data) {
      processedData = data.data;
    }

    if (!Array.isArray(processedData)) {
      console.warn("User growth data is not an array:", processedData);
      return [];
    }

    // Sort by date to ensure proper chronological order
    const sortedData = processedData.sort(
      (a: UserGrowthItem, b: UserGrowthItem) => {
        const dateA = new Date(a.label || a.month || a.name || "");
        const dateB = new Date(b.label || b.month || b.name || "");
        return dateA.getTime() - dateB.getTime();
      }
    );

    return sortedData;
  } catch (error) {
    console.error("Error transforming user growth data:", error);
    return [];
  }
};

export const transformCitiesData = (data: any): ChartData | null => {
  try {
    const processedData = data.data || data;

    if (!Array.isArray(processedData) || processedData.length === 0) {
      console.warn("Cities data is empty or invalid:", processedData);
      return null;
    }

    const cities = processedData.map((entry: any) => entry.city || entry._id);
    const orderCounts = processedData.map((entry: any) => entry.totalOrders);

    return {
      labels: cities,
      datasets: [
        {
          label: "Total Orders by City",
          data: orderCounts,
          fill: false,
          borderColor: "#22c55e",
          backgroundColor: "#16a34a",
          tension: 0,
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: "#15803d",
          pointHoverRadius: 7,
          pointHitRadius: 10,
          pointBorderWidth: 2,
          pointBorderColor: "#fff",
        },
      ],
    };
  } catch (error) {
    console.error("Error transforming cities data:", error);
    return null;
  }
};
export const useFormatMonthLabel = () => {
  const { locale, t } = useLanguage();

  return (monthString: string): string => {
    if (!monthString) return "Unknown";

    // Handle the format "Jan 2024", "Feb 2024", etc.
    const monthYearMatch = monthString.match(/^([A-Za-z]{3})\s+(\d{4})$/);
    if (monthYearMatch) {
      const monthAbbr = monthYearMatch[1];
      const year = monthYearMatch[2];

      // Get the translated month name from the translation files
      const translatedMonth = t(`monthNames.${monthAbbr}`) || monthAbbr;

      // For Arabic, we might want to format differently
      if (locale === "ar") {
        return `${translatedMonth} ${year}`;
      } else {
        return `${translatedMonth} ${year}`;
      }
    }

    // Handle other date formats
    if (!monthString.includes("-") && !monthString.includes("/")) {
      return monthString;
    }

    try {
      const date = new Date(monthString);
      return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return monthString;
    }
  };
};

export const formatMonthLabel = (
  monthString: string,
  locale: string = "en-US"
): string => {
  if (!monthString) return "Unknown";

  // Handle the format "Jan 2024", "Feb 2024", etc.
  const monthYearMatch = monthString.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthAbbr = monthYearMatch[1];
    const year = monthYearMatch[2];

    // For now, return the original format since this function doesn't have access to translations
    // In a real implementation, you might want to pass the translation function as a parameter
    return monthString;
  }

  // If already formatted or doesn't contain date separators
  if (!monthString.includes("-") && !monthString.includes("/")) {
    return monthString;
  }

  try {
    const date = new Date(monthString);
    return date.toLocaleDateString(locale, {
      month: "short", // or 'long' for full month names
      year: "numeric",
    });
  } catch {
    return monthString;
  }
};

export const getCurrentDayLabels = (): string[] => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Return days starting from Monday
  const reorderedDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (1 + i) % 7; // Start from Monday (index 1)
    reorderedDays.push(days[dayIndex]);
  }

  return reorderedDays;
};

export const calculateTrendPercentage = (
  current: number,
  previous: number
): string => {
  if (previous === 0) return "0%";

  const percentage = ((current - previous) / previous) * 100;
  return `${Math.abs(Math.round(percentage))}%`;
};

export const getTrendType = (
  current: number,
  previous: number
): "up" | "down" | "steady" => {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "steady";
};
