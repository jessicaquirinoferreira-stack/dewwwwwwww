import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface StatCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: 'orange' | 'green' | 'blue' | 'yellow' | 'red' | 'stone';
  active?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'stone',
  active = false,
  onClick,
}) => {
  const { theme } = useTheme();

  const badgeStyles = {
    orange:
      theme === 'light'
        ? 'bg-orange-50 text-orange-700 border-orange-200'
        : 'bg-orange-950/80 text-orange-300 border-orange-700/80',
    green:
      theme === 'light'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
    blue:
      theme === 'light'
        ? 'bg-sky-50 text-sky-700 border-sky-200'
        : 'bg-sky-950/80 text-sky-300 border-sky-700',
    yellow:
      theme === 'light'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-amber-950/80 text-amber-300 border-amber-700',
    red:
      theme === 'light'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-rose-950/80 text-rose-300 border-rose-700',
    stone:
      theme === 'light'
        ? 'bg-slate-100 text-slate-700 border-slate-200'
        : 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`border rounded-2xl p-4 sm:p-5 shadow-xs transition-all relative overflow-hidden ${
        theme === 'light'
          ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-sm'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-white'
      } ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${
        active ? 'border-orange-500 ring-2 ring-orange-500/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
            theme === 'light' ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {label}
        </span>
        {Icon && (
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}
        >
          {value}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles[badgeColor]}`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p
          className={`text-[11px] mt-1 truncate ${
            theme === 'light' ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

