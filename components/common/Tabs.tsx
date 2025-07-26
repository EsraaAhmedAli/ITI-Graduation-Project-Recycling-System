"use client";

import React from "react";

export interface TabItem {
  label: string;
  value: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
}: TabsProps): React.JSX.Element {
  return (
    <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
      <ul className="flex flex-wrap -mb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          const baseClasses = "inline-block p-4 border-b-2 rounded-t-lg";
          const activeClasses =
            "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500";
          const inactiveClasses =
            "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300";
          const disabledClasses =
            "text-gray-400 cursor-not-allowed dark:text-gray-500";

          return (
            <li key={tab.value} className="me-2">
              <button
                disabled={tab.disabled}
                onClick={() => !tab.disabled && onTabChange(tab.value)}
                className={`${baseClasses} ${
                  tab.disabled
                    ? disabledClasses
                    : isActive
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
