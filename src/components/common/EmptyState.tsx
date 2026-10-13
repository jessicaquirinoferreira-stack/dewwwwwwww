import React from 'react';
import { LucideIcon, Plus, Building2 } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Building2,
  title = 'Nenhum registro',
  description = 'Não há itens cadastrados neste módulo até o momento.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-xs transition-all">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.4]" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2 font-serif-luxury tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6 font-sans">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1D38] hover:bg-slate-900 text-amber-300 border border-slate-700 text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{actionLabel}</span>
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all border border-slate-200"
          >
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
