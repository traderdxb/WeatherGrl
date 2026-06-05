import React from 'react';

interface FooterProps {
  lastUpdated: string;
}

export const Footer: React.FC<FooterProps> = ({ lastUpdated }) => {
  return (
    <footer className="mt-auto border-t border-dash-border py-6 px-6 bg-dash-bg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[10px] text-dash-muted font-bold tracking-widest uppercase">
          © 2025 TempVeritas Weather Intelligence | Last Updated: {lastUpdated}
        </div>
        
        <div className="flex gap-6">
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[9px] font-bold text-dash-muted uppercase tracking-tighter">Data Sources</span>
            <span className="text-[10px] font-mono text-dash-text">WC API v4.2, ECMWF HRES</span>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[9px] font-bold text-dash-muted uppercase tracking-tighter">System Status</span>
            <span className="text-[10px] font-mono text-dash-green uppercase">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
