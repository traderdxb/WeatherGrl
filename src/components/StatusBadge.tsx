import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-colors",
  {
    variants: {
      status: {
        online: "bg-dash-green/10 text-dash-green border-dash-green/20",
        error: "bg-dash-red/10 text-dash-red border-dash-red/20",
      },
    },
    defaultVariants: {
      status: "online",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  label: string;
  online: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, online, className }) => {
  const status = online ? 'online' : 'error';
  
  return (
    <div className={cn(badgeVariants({ status }), className)}>
      {online ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      <span>{label}: {online ? 'ONLINE' : 'ERROR'}</span>
    </div>
  );
};
