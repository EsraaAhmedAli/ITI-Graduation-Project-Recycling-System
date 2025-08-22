// components/profile/TabNavigation.tsx
import React, { memo } from "react";

interface TabNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  t: (key: string) => string;
}

const TabNavigation = memo(function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  t
}: TabNavigationProps) {
  return (
    <div className="flex border-b gap-6 overflow-x-auto">
      {tabs.map((tab: string) => (
        <button
          key={tab}
          className={`pb-2 px-1 capitalize font-semibold text-sm border-b-2 transition-colors duration-200 whitespace-nowrap ${
            activeTab === tab
              ? "border-green-600 text-green-800"
              : "border-transparent text-gray-500 hover:text-green-700"
          }`}
          onClick={() => onTabChange(tab)}
        >
          {t(`profile.tabs.${tab}`) || tab}
        </button>
      ))}
    </div>
  );
});

export default TabNavigation;