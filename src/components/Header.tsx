import React from 'react';
import { StatusBadge } from './StatusBadge';
import { Globe } from 'lucide-react';

interface HeaderProps {
  wcOnline: boolean;
  ecmwfOnline: boolean;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = ({ wcOnline, ecmwfOnline, lastUpdated }) => {
  return (
    <header className="border-b border-dash-border bg-dash-bg/80 backdrop-blur-md sticky top-0 z-50 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-dash-accent/20 p-2 rounded-lg border border-dash-accent/30">
            <Globe className="w-6 h-6 text-dash-accent" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-dash-text leading-none">
              GLOBAL TEMPERATURE MONITOR
            </h1>
            <p className="text-[10px] text-dash-muted font-bold tracking-widest uppercase mt-1">
              Real-Time Weather Intelligence Dashboard
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end gap-2">
          <div className="flex items-center gap-2">
            <StatusBadge label="WC" online={wcOnline} />
            <StatusBadge label="ECMWF" online={ecmwfOnline} />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-dash-muted">
            <span className="w-2 h-2 rounded-full bg-dash-accent animate-pulse" />
            LAST UPDATED: {lastUpdated ? new Date(lastUpdated).toISOString().replace('T', ' ').split('.')[0] + ' UTC' : '---'}
          </div>
        </div>
      </div>
    </header>
  );
};
