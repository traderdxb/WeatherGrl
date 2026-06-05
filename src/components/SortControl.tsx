import React from 'react';
import { ListFilter } from 'lucide-react';

export type SortOption = 'temp' | 'country' | 'city' | 'variance';

interface SortControlProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const SortControl: React.FC<SortControlProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <ListFilter className="w-4 h-4 text-dash-muted" />
      <span className="text-[10px] font-bold text-dash-muted uppercase tracking-wider">Sort by:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="bg-dash-card border border-dash-border text-dash-text text-[11px] font-bold rounded-md focus:ring-dash-accent focus:border-dash-accent block p-1.5 outline-none cursor-pointer uppercase tracking-tight"
      >
        <option value="temp">Temperature</option>
        <option value="city">City Name</option>
        <option value="country">Country</option>
        <option value="variance">Variance</option>
      </select>
    </div>
  );
};
