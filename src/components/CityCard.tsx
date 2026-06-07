import React from 'react';
import { type CityWeather } from '../types/weather';
import { VarianceBadge } from './VarianceBadge';
import { TrendIndicator } from './TrendIndicator';
import { Clock, MapPin, Thermometer } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CityCardProps {
  weather: CityWeather;
  primaryError?: boolean;
  ecmwfError?: boolean;
}

export const CityCard: React.FC<CityCardProps> = ({ weather, primaryError, ecmwfError }) => {
  const displayTemp = Number.isFinite(weather.currentTemperature) ? weather.currentTemperature : NaN;
  const tempDisplay = Number.isFinite(displayTemp) ? displayTemp.toFixed(1) : '--';
  const hiDisplay = Number.isFinite(weather.highTemperature) ? weather.highTemperature.toFixed(1) : '--';
  const loDisplay = Number.isFinite(weather.lowTemperature) ? weather.lowTemperature.toFixed(1) : '--';

  return (
    <div className="bg-dash-card border border-dash-border hover:border-dash-accent/50 hover:bg-dash-card-hover transition-all duration-300 rounded-xl overflow-hidden group">
      {/* Header — Location & Time */}
      <div className="p-4 border-b border-dash-border flex justify-between items-start">
        <div className="flex gap-2.5">
          <div className="mt-1 bg-dash-bg p-1.5 rounded-md border border-dash-border group-hover:border-dash-accent/30">
            <MapPin className="w-4 h-4 text-dash-muted group-hover:text-dash-accent transition-colors" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dash-text leading-tight">{weather.city}</h3>
            <p className="text-[9px] text-dash-muted font-bold tracking-wider uppercase">{weather.country}</p>
            <p className="text-[8px] text-dash-accent/70 font-mono mt-0.5">{weather.resolutionSource}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end text-[10px] font-mono text-dash-muted">
            <Clock className="w-3 h-3" />
            <span>UTC {weather.utcTime}</span>
          </div>
          <div className="text-[9px] font-mono text-dash-muted/60 mt-0.5">
            {weather.gmtTime} local
          </div>
        </div>
      </div>

      {/* Current Temp + High/Low + Trend */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black mono tracking-tighter text-dash-text">
            {tempDisplay}°
          </span>
          <span className="text-lg font-bold text-dash-muted">C</span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <TrendIndicator trend={weather.trend} />
          <VarianceBadge variance={weather.variance} />
        </div>
      </div>

      {/* High / Low row */}
      <div className="px-4 py-2 bg-dash-bg/30 border-t border-dash-border flex justify-between items-center text-[11px]">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-dash-red">H {hiDisplay}°</span>
          <span className="font-mono font-bold text-dash-accent">L {loDisplay}°</span>
        </div>
        <Thermometer className="w-3 h-3 text-dash-muted" />
      </div>

      {/* Source Comparison */}
      <div className="px-4 py-3 bg-dash-bg/50 border-t border-dash-border grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-dash-muted tracking-widest uppercase">Primary</p>
          <div className="flex items-center gap-2">
            <span className={cn(
              "mono text-sm font-bold",
              primaryError ? "text-dash-error line-through opacity-50" : "text-dash-text"
            )}>
              {Number.isFinite(weather.currentTemperature) ? weather.currentTemperature.toFixed(1) : '--'}°C
            </span>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[9px] font-bold text-dash-muted tracking-widest uppercase">ECMWF Ref</p>
          <span className={cn(
            "mono text-sm font-bold",
            ecmwfError ? "text-dash-error line-through opacity-50" : "text-dash-text"
          )}>
            {Number.isFinite(weather.ecmwfTemperature) ? weather.ecmwfTemperature.toFixed(1) : '--'}°C
          </span>
        </div>
      </div>

      {/* Fallback warning */}
      {(primaryError || ecmwfError) && (
        <div className="bg-dash-amber/10 border-t border-dash-amber/20 px-4 py-1.5 flex items-center gap-2">
          <span className="text-[9px] font-bold text-dash-amber uppercase tracking-wider">
            {primaryError ? 'Using backup data' : 'ECMWF validation unavailable'}
          </span>
        </div>
      )}
    </div>
  );
};