'use client';

import { Map, Layers, History, CheckSquare, Sliders, Database, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CivicPulseServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      id: 'risk-map',
      title: t('service_tile_risk_map'),
      description: t('service_tile_risk_desc'),
      icon: Map,
      targetId: 'current-risk-map',
    },
    {
      id: 'ward-insights',
      title: t('service_tile_ward_insights'),
      description: t('service_tile_ward_desc'),
      icon: Layers,
      targetId: 'current-risk-map',
    },
    {
      id: 'historical-waterlogging',
      title: t('service_tile_historical'),
      description: t('service_tile_historical_desc'),
      icon: History,
      targetId: 'historical-waterlogging',
    },
    {
      id: 'priority-actions',
      title: t('service_tile_priority'),
      description: t('service_tile_priority_desc'),
      icon: CheckSquare,
      targetId: 'priority-actions',
    },
    {
      id: 'simulation',
      title: t('service_tile_simulation'),
      description: t('service_tile_simulation_desc'),
      icon: Sliders,
      targetId: 'simulation-decision-support',
    },
    {
      id: 'data-sources',
      title: t('service_tile_data_sources'),
      description: t('service_tile_data_desc'),
      icon: Database,
      targetId: 'data-sources',
    },
  ];

  const handleTileClick = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-label="CivicPulse Services and Information Desk"
      className="bg-white border border-slate-300 rounded-md p-5 sm:p-6 shadow-2xs font-sans text-slate-800 space-y-4"
    >
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
          <span>{t('services_section_title')}</span>
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          {t('services_section_subtitle')}
        </p>
      </div>

      {/* 6 Clean Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              onClick={() => handleTileClick(s.targetId)}
              className="group p-4 rounded-md border border-slate-200 hover:border-blue-600 hover:bg-slate-50 transition cursor-pointer flex flex-col justify-between space-y-3 bg-white"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-md bg-blue-50 group-hover:bg-[#1b365d] text-blue-900 group-hover:text-white border border-blue-200 transition shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-2">
                    {s.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-[11px] font-semibold text-blue-700 group-hover:text-blue-900 pt-1 border-t border-slate-100">
                <span>{t('nav_contact') === 'தொடர்பு' ? 'பிரிவுக்குச் செல்லவும்' : 'Access Service'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
