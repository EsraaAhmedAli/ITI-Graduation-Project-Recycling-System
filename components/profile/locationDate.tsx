import React, { memo, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const LocationDate = memo(function LocationDate() {
  const [city, setCity] = useState("Cairo");
  const [dateStr, setDateStr] = useState("");
  const { locale, convertNumber } = useLanguage();

  useEffect(() => {
    const abortController = new AbortController();
    
    const timeoutId = setTimeout(() => {
      if (navigator.geolocation && !abortController.signal.aborted) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (abortController.signal.aborted) return;
            
            const { latitude, longitude } = position.coords;

            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=${locale}`,
                { signal: abortController.signal }
              );
              
              if (!res.ok) throw new Error('Failed to fetch location');
              
              const data = await res.json();
              const cityName =
                data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                data.address?.state;

              if (cityName && !abortController.signal.aborted) {
                setCity(cityName);
              }
            } catch (err) {
              if (err.name !== 'AbortError') {
                console.error("Failed to fetch city:", err);
              }
            }
          },
          (err) => console.error("Geolocation error:", err),
          { timeout: 10000 }
        );
      }
    }, 500);

    const now = new Date();
    const monthName = now.toLocaleString(locale || "en-US", { month: "long" });
    const yearNumber = convertNumber(now.getFullYear());
    setDateStr(`${monthName} ${yearNumber}`);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [locale, convertNumber]);

  return (
    <p className="text-xs text-gray-400">
      {city}, {dateStr}
    </p>
  );
});

export default LocationDate;