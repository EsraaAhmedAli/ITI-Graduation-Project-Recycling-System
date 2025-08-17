// components/charts/MaterialsChart.tsx
import React, { memo, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { TopMaterial } from "../../../../components/Types/dashboard.types";
import { BAR_CHART_OPTIONS, CHART_COLORS } from "../../../../constants/theme";
import { useLanguage } from "@/context/LanguageContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface MaterialsChartProps {
  topMaterials: TopMaterial[];
  loading: boolean;
}

const MaterialsChart = memo<MaterialsChartProps>(
  ({ topMaterials, loading }) => {
    const { t, convertNumber, locale } = useLanguage();
    const [sortBy, setSortBy] = useState<"quantity" | "category">("quantity");

    // Memoize chart data
    const chartData = useMemo(() => {
      if (!topMaterials || topMaterials.length === 0) return null;

      // Sort materials based on selected criteria
      const sortedMaterials = [...topMaterials].sort((a, b) => {
        if (sortBy === "quantity") {
          return b.totalQuantity - a.totalQuantity;
        }
        // Updated: Use itemName directly instead of _id.itemName
        return (a.name[locale] || "").localeCompare(b.name[locale] || "");
      });

      return {
        // Updated: Use itemName directly with multilingual support
        labels: sortedMaterials.map((m) => {
          // Handle multilingual names - prefer current locale, fallback to other languages
          if (
            typeof m.name[locale] === "object" &&
            m.name[locale]
          ) {
            const isArabic = locale.startsWith("ar");
            return isArabic
              ? m.itemNameMultilingual.ar ||
                  m.itemNameMultilingual.en ||
                  m.itemName ||
                  t("charts.unknown")
              : m.itemNameMultilingual.en ||
                  m.itemNameMultilingual.ar ||
                  m.name ||
                  t("charts.unknown");
          }
          return m.name || t("charts.unknown");
        }),
        datasets: [
          {
            label: t("charts.quantity"),
            data: sortedMaterials.map((m) => m.totalQuantity || 0),
            backgroundColor: [
              CHART_COLORS.primary,
              CHART_COLORS.secondary,
              CHART_COLORS.accent,
              CHART_COLORS.purple,
              CHART_COLORS.red,
              // Add more colors for more items
              CHART_COLORS.emerald,
              "#FF6B6B",
              "#4ECDC4",
              "#45B7D1",
              "#96CEB4",
            ],
            borderRadius: 8,
            hoverBackgroundColor: CHART_COLORS.emerald,
          },
        ],
      };
    }, [topMaterials, sortBy, t, locale]);

    // Memoize chart options with better tooltips
    const chartOptions = useMemo(
      () => ({
        ...BAR_CHART_OPTIONS,
        plugins: {
          ...BAR_CHART_OPTIONS.plugins,
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const material = topMaterials[context.dataIndex];
                const unit = material?.unit || t("materials.pieces");
                const quantity = convertNumber(context.parsed.y.toString());
                return `${quantity} ${unit}`;
              },
              afterLabel: function (context: any) {
                const material = topMaterials[context.dataIndex];
                if (material?.categoryName[locale]) {
                  return `${material.categoryName[locale]}`;
                }
                return "";
              },
            },
          },
        },
        scales: {
          ...BAR_CHART_OPTIONS.scales,
          y: {
            ...BAR_CHART_OPTIONS.scales?.y,
            title: { display: true, text: t("charts.quantity") },
            beginAtZero: true,
            ticks: {
              ...BAR_CHART_OPTIONS.scales?.y?.ticks,
              callback: function (value: any) {
                return convertNumber(value.toString());
              },
            },
          },
          x: {
            ...BAR_CHART_OPTIONS.scales?.x,
            title: { display: true, text: t("charts.material") },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
      }),
      [topMaterials, t, convertNumber]
    );

    // Updated debug effect
    React.useEffect(() => {
      if (topMaterials && topMaterials.length > 0) {
        console.log("MaterialsChart received data:", topMaterials);
        console.log("First material structure:", topMaterials[0]);

        // Look for cooking pan with new structure
        const cookingPan = topMaterials.find((m) => {
          const name = m.name.en || "";
          return (
            name.toLowerCase().includes("cooking") ||
            name.toLowerCase().includes("pan")
          );
        });

        if (cookingPan) {
          console.log("Cooking pan data (new structure):", cookingPan);
        }
      }
    }, [topMaterials]);

    const renderContent = () => {
      if (loading) {
        return (
          <div className="flex items-center justify-center h-full text-green-500">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-xs md:text-sm">
                {t("charts.loadingMaterials")}
              </p>
            </div>
          </div>
        );
      }

      if (!chartData || topMaterials.length === 0) {
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-2xl md:text-4xl mb-2">📦</div>
              <p className="text-xs md:text-sm">
                {t("charts.noMaterialsData")}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t("charts.materialsHint")}
              </p>
            </div>
          </div>
        );
      }

      return <Bar data={chartData} options={chartOptions} />;
    };

    return (
      <div
        className="bg-white rounded-xl p-4 md:p-6 shadow border border-green-100 flex-1 flex flex-col"
        style={{ background: "var(--background)" }}>
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <span className="text-sm md:text-base font-medium text-green-800">
            {t("charts.topRecycledMaterials")}
          </span>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "quantity" | "category")
            }
            className="text-xs border border-green-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            disabled={loading}
            style={{ background: "var(--background)" }}>
            <option value="quantity">{t("materials.sortByQuantity")}</option>
            <option value="category">{t("materials.sortByName")}</option>
          </select>
        </div>

        <div className="h-48 md:h-64 w-full mb-4">{renderContent()}</div>

        {/* Enhanced summary stats */}
        {!loading && topMaterials.length > 0 && (
          <div className="mt-2 text-xs text-gray-600 border-t border-green-100 pt-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span>
                {t("materials.totalMaterials")}:{" "}
                {convertNumber(topMaterials.length.toString())}
              </span>
              <span>
                {t("materials.totalQuantity")}:{" "}
                {convertNumber(
                  topMaterials
                    .reduce((sum, m) => sum + (m.totalQuantity || 0), 0)
                    .toLocaleString()
                )}
              </span>
            </div>
            {/* Show top material info */}
            {topMaterials[0] && (
              <div className="mt-1 text-center">
                <span className="text-green-600 font-medium">
                  {t("materials.topMaterial")}:{" "}
                  {(() => {
                    const material = topMaterials[0];
                    // Get material name based on locale
                    let materialName = material.name[locale];
                    if (
                      typeof material.itemNameMultilingual === "object" &&
                      material.itemNameMultilingual
                    ) {
                      const isArabic = locale.startsWith("ar");
                      materialName = isArabic
                        ? material.itemNameMultilingual.ar ||
                          material.itemNameMultilingual.en ||
                          material.itemName
                        : material.itemNameMultilingual.en ||
                          material.itemNameMultilingual.ar ||
                          material.itemName;
                    }
                    return materialName;
                  })()}{" "}
                  ({convertNumber(topMaterials[0].totalQuantity.toString())}{" "}
                  {topMaterials[0].unit || t("materials.pieces")})
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

MaterialsChart.displayName = "MaterialsChart";

export default MaterialsChart;
