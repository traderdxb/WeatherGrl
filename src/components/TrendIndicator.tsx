import React from 'react';
import { ArrowUp, ArrowDown, MoveRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  className?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend, className }) => {
  if (trend === 'up') {
    return (
      <div className={cn("flex items-center text-dash-red", className)}>
        <ArrowUp className="w-4 h-4" />
      </div>
    );
  }
  if (trend === 'down') {
    return (
      <div className={cn("flex items-center text-dash-accent", className)}>
        <ArrowDown className="w-4 h-4" />
      </div>
    );
  }
  return (
    <div className={cn("flex items-center text-dash-muted", className)}>
      <MoveRight className="w-4 h-4" />
    </div>
  );
};
