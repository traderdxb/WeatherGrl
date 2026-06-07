import React from 'react';
import { type CityWeather } from '../types/weather';
import { VarianceBadge } from './VarianceBadge';
import { TrendIndicator } from './TrendIndicator';
import { Clock, MapPin, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CityCardProps {
  weather: CityWeather;
  wcError?: boolean;
  ecmwfError?: boolean;
}

export const CityCard: React.FC<CityCardProps> = ({ weather, wcError, ecmwfError }) => {
  const displayTemp = wcError ? weather.ecmwfTemperature : weather.wcTemperature;
  const tempDisplay = Number.isFinite(displayTemp) ? displayTemp.toFixed(1) : '--';
  
  return (
    <div className="bg-dash-card border border-dash-border hover:border-dash-accent/50 hover:bg-dash-card-hover transition-all duration-300 rounded-xl overflow-hidden group">
      {/* Header section with Location & Time */}
      <div className="p-4 border-b border-dash-border flex justify-between items-start">
        <div className="flex gap-2.5">
          <div className="mt-1 bg-dash-bg p-1.5 rounded-md border border-dash-border group-hover:border-dash-accent/30">
            <MapPin className="w-4 h-4 text-dash-muted group-hover:text-dash-accent transition-colors" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dash-text leading-tight">{weather.city}</h3>
            <p className="text-[10px] text-dash-muted font-bold tracking-wider uppercase">{weather.country}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end text-[10px] font-mono text-dash-muted">
            <Clock className="w-3 h-3" />
            <span>UTC {weather.utcTime}</span>
          </div>
          <div className="text-[9px] font-mono text-dash-muted/60 mt-0.5">
            GMT {weather.gmtTime}
          </div>
        </div>
      </div>

      {/* Main Temp Display */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black mono tracking-tighter text-dash-text">
            {tempDisplay}°
          </span>
          <span className="text-lg font-bold text-dash-muted">C</span>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <TrendIndicator trend={weather.trend} />
          <VarianceBadge variance={weather.variance} />
        </div>
      </div>

      {/* Source Comparison */}
      <div className="px-4 py-3 bg-dash-bg/50 border-t border-dash-border grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-dash-muted tracking-widest uppercase">Weather Co</p>
          <div className="flex items-center gap-2">
            <span className={cn(
              "mono text-sm font-bold",
              wcError ? "text-dash-error line-through opacity-50" : "text-dash-text"
            )}>
              {Number.isFinite(weather.wcTemperature) ? weather.wcTemperature.toFixed(1) : '--'}°C
            </span>
            {wcError && <AlertTriangle className="w-3 h-3 text-dash-error" />}
          </div>
        </div>
        
        <div className="space-y-1 text-right">
          <p className="text-[9px] font-bold text-dash-muted tracking-widest uppercase">ECMWF</p>
          <div className="flex items-center gap-2 justify-end">
            {ecmwfError && <AlertTriangle className="w-3 h-3 text-dash-error" />}
            <span className={cn(
              "mono text-sm font-bold",
              ecmwfError ? "text-dash-error line-through opacity-50" : "text-dash-text"
            )}>
              {Number.isFinite(weather.ecmwfTemperature) ? weather.ecmwfTemperature.toFixed(1) : '--'}°C
            </span>
          </div>
        </div>
      </div>

      {/* Fallback Badge */}
      {(wcError || ecmwfError) && (
        <div className="bg-dash-amber/10 border-t border-dash-amber/20 px-4 py-1.5 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-dash-amber" />
          <span className="text-[9px] font-bold text-dash-amber uppercase tracking-wider">
            {wcError ? 'Using ECMWF Backup Data' : 'Validation Unstable'}
          </span>
        </div>
      )}
    </div>
  );
};