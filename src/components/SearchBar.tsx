import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative group max-w-md w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-dash-muted group-focus-within:text-dash-accent transition-colors" />
      </div>
      <input
        type="text"
        className="block w-full bg-dash-card border border-dash-border text-dash-text text-sm rounded-lg focus:ring-1 focus:ring-dash-accent focus:border-dash-accent pl-10 pr-10 py-2 transition-all outline-none"
        placeholder="Filter by city or country..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-dash-muted hover:text-dash-text"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
