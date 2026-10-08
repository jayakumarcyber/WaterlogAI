'use client';

import { Shield, HelpCircle, Activity, Database } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface GovUtilityBarProps {
  onOpenHelp?: () => void;
  systemOperational?: boolean;
}

export default function GovUtilityBar({ onOpenHelp, systemOperational = true }: GovUtilityBarProps) {
  const { t } = useLanguage();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <aside
      aria-label="Government Utility Bar"
      className="w-full bg-slate-900 border-b border-slate-800 text-slate-300 text-[11px] font-sans antialiased"
    >
      <div className="max-w-[1600px] w-[95%] mx-auto px-3 sm:px-5 lg:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        
        {/* Left: Official Authority Context */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1 font-bold text-slate-100 tracking-wide">
            <span className="text-[12px]">🇮🇳</span>
            <span>{t('util_title')}</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">&bull;</span>
          <span className="text-slate-400 font-medium hidden sm:inline">
            Greater Chennai Corporation • Monsoon Decision Support Portal
          </span>
        </div>

        {/* Right: Quick Links / Accessibility / System Status */}
        <div className="flex items-center space-x-4 text-[11px] font-medium">
          <button
            onClick={() => scrollTo('data-sources')}
            className="text-slate-400 hover:text-white transition flex items-center space-x-1 cursor-pointer"
          >
            <Database className="w-3 h-3 text-slate-400" />
            <span>{t('util_data_sources')}</span>
          </button>

          <button
            onClick={() => scrollTo('emergency-civic-info')}
            className="text-slate-400 hover:text-white transition flex items-center space-x-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>{t('emergency_section_title')}</span>
          </button>

          <div className="hidden md:flex items-center space-x-1 text-slate-400">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>{t('util_system_status')}:</span>
            <span className={`font-semibold ${systemOperational ? 'text-emerald-400' : 'text-amber-400'}`}>
              {systemOperational ? t('util_operational') : 'Restricted'}
            </span>
          </div>

        </div>

      </div>
    </aside>
  );
}
