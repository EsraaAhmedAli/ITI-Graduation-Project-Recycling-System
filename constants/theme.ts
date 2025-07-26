// constants/theme.ts
export const CHART_COLORS = {
  primary: '#10b981',
  secondary: '#34d399',
  accent: '#f59e0b',
  purple: '#6366f1',
  red: '#f43f5e',
  green: '#22c55e',
  emerald: '#16a34a',
  darkGreen: '#15803d',
} as const;

export const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'] as const; // gold, silver, bronze

export const STATUS_COLOR_MAP = {
  pending: '#f59e0b',
  accepted: '#34d399',
  completed: '#10b981',
  cancelled: '#ef4444',
} as const;

export const TREND_COLORS = {
  up: 'text-emerald-500',
  down: 'text-red-500',
  steady: 'text-amber-500',
} as const;

export const TREND_BG_COLORS = {
  up: 'bg-emerald-50 border-emerald-200',
  down: 'bg-red-50 border-red-200',
  steady: 'bg-amber-50 border-amber-200',
} as const;

// Chart configurations
export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    }
  },
} as const;

export const BAR_CHART_OPTIONS = {
  ...DEFAULT_CHART_OPTIONS,
  scales: {
    y: { 
      beginAtZero: true, 
      grid: { color: '#d1fae5' },
      ticks: { stepSize: 1 },
      title: { display: true, text: 'Count' }
    },
    x: {
      grid: { color: '#d1fae5' },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        autoSkip: false,
        font: { size: 12, weight: 'bold' as const },
      },
    },
  },
  barThickness: 50,
} as const;

export const DOUGHNUT_OPTIONS = {
  cutout: '75%',
  plugins: { legend: { display: false } },
  animation: {
    easing: 'easeInOutQuad' as const,
    duration: 700,
  },
} as const;

// components/LoadingSpinner.tsx

export const LoadingSpinner = () => (
 {}
);

// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Export everything for easy imports
export * from '../constants/theme';