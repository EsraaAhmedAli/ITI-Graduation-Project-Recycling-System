export type FilterOption = {
  label: string; // Display text for the option
  value: string; // Actual value used in filtering
  color?: string; // Optional color value (for color-swatch type)
};

export type FilterType =
  | "checkbox" // Standard checkbox list
  | "range" // Range slider (requires min/max/step)
  | "color-swatch" // Color swatch selector (requires color in options)
  | "search" // Text search input
  | "multi-select"; // Multi-select dropdown

export interface FilterConfig {
  name: string; // Unique identifier/key for the filter
  title: string; // Display name shown in the UI
  type: FilterType; // Determines which input component to render
  options: FilterOption[]; // Available choices (except for "range" type)
  min?: number; // Required for "range" type - minimum value
  max?: number; // Required for "range" type - maximum value
  step?: number; // Optional for "range" type - step increment
}
