import React, { useCallback } from "react";

export const useDebounce = (callback: () => void, delay: number) => {
  const debounceRef = React.useRef<NodeJS.Timeout>();

  return useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(callback, delay);
  }, [callback, delay]);
};