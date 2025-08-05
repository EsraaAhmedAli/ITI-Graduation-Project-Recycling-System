"use client";

import { useNetworkState } from "react-use";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface NetworkState {
  online?: boolean;
  type?: string;
  effectiveType?: string;
  downlink?: number;
}

interface OfflineContextType {
  isOnline: boolean;
  isOffline: boolean;
  network: NetworkState;
  wasOffline: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within OfflineProvider");
  }
  return context;
}

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const network = useNetworkState();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!network.online && !wasOffline) {
      // Just went offline
      setWasOffline(true);
      setShowBanner(true);
      console.log("🔴 App went offline");
    } else if (network.online && wasOffline) {
      // Just came back online
      setWasOffline(false);
      console.log("🟢 App came back online");

      // Show "back online" message briefly
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    }
  }, [network.online, wasOffline]);

  const contextValue: OfflineContextType = {
    isOnline: network.online ?? true,
    isOffline: !network.online,
    network,
    wasOffline,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {/* Global offline/online banner */}
      {showBanner && (
        <div
          className={`fixed top-0 left-0 right-0 z-[9999] px-4 py-3 text-sm font-medium text-white text-center transition-all duration-300 ${
            network.online ? "bg-green-600" : "bg-red-600"
          }`}
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex-1">
              {network.online ? (
                <>✅ Back online! Your data is syncing...</>
              ) : (
                <>⚠️ You are offline. Some features may not work properly.</>
              )}
            </div>

            {/* Close button for online banner */}
            {network.online && (
              <button
                onClick={() => setShowBanner(false)}
                className="ml-4 text-white hover:text-gray-200 text-lg leading-none"
                aria-label="Close banner"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add top padding when banner is showing */}
      <div className={showBanner ? "pt-12" : ""}>{children}</div>
    </OfflineContext.Provider>
  );
}
