import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const varianceVariants = cva(
  "mono px-1.5 py-0.5 rounded text-[11px] font-medium border transition-colors",
  {
    variants: {
      severity: {
        low: "text-dash-green bg-dash-green/10 border-dash-green/20",
        medium: "text-dash-amber bg-dash-amber/10 border-dash-amber/20",
        high: "text-dash-red bg-dash-red/10 border-dash-red/20",
      },
    },
    defaultVariants: {
      severity: "low",
    },
  }
);

interface VarianceBadgeProps extends VariantProps<typeof varianceVariants> {
  variance: number;
  className?: string;
}

export const VarianceBadge: React.FC<VarianceBadgeProps> = ({ variance, className }) => {
  const absVariance = Math.abs(variance);
  
  let severity: 'low' | 'medium' | 'high' = "low";
  if (absVariance > 2) {
    severity = "high";
  } else if (absVariance >= 1) {
    severity = "medium";
  }

  const sign = variance > 0 ? '+' : '';

  return (
    <div className={cn(varianceVariants({ severity }), className)}>
      {sign}{variance.toFixed(1)}°C
    </div>
  );
};
