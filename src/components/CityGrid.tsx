import React from 'react';
import { CityCard } from './CityCard';
import { type CityWeather } from '../types/weather';

interface CityGridProps {
  cities: CityWeather[];
  primaryOnline: boolean;
  ecmwfOnline: boolean;
}

export const CityGrid: React.FC<CityGridProps> = ({ cities, primaryOnline, ecmwfOnline }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
      {cities.map((city) => (
        <CityCard 
          key={city.city} 
          weather={city} 
          primaryError={!primaryOnline} 
          ecmwfError={!ecmwfOnline}
        />
      ))}
    </div>
  );
};
