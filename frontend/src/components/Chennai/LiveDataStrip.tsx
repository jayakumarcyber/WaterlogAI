'use client';

import { Layers, ShieldAlert, History, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LiveDataStripProps {
  wardCount?: number;
  incidentCount?: number;
  highRiskCount?: number;
  citizenReportCount?: number;
}

export default function LiveDataStrip({
  wardCount = 200,
  incidentCount = 1325,
  highRiskCount = 3,
  citizenReportCount = 0,
}: LiveDataStripProps) {
  const { t, language } = useLanguage();

  return (
    <div
      aria-label="CivicPulse Official Operational Telemetry Strip"
      className="bg-slate-900 border border-slate-800 rounded-md p-3 sm:p-4 text-slate-100 font-sans shadow-2xs"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs">
        
        {/* Metric 1: 200 GCC Wards */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="p-2 rounded bg-slate-800 text-blue-400 shrink-0 border border-slate-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white">{wardCount}</span>
            </div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              {t('stat_wards_label')}
            </p>
            <p className="text-[10px] text-slate-400">
              {language === 'ta' ? '15 மண்டலங்கள்' : '15 Administrative Zones'}
            </p>
          </div>
        </div>

        {/* Metric 2: 1,325 Verified Historical Incidents */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="p-2 rounded bg-slate-800 text-amber-400 shrink-0 border border-slate-700">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white">{incidentCount.toLocaleString()}</span>
            </div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              {t('stat_incidents_label')}
            </p>
            <p className="text-[10px] text-slate-400">
              {language === 'ta' ? 'வரலாற்று நிகழ்வுகள் (2015–2023)' : 'Historical Disasters (2015–2023)'}
            </p>
          </div>
        </div>

        {/* Metric 3: 185 / 200 Wards with Historical Evidence */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="p-2 rounded bg-slate-800 text-emerald-400 shrink-0 border border-slate-700">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white">185 / 200</span>
            </div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              {t('stat_evidence_wards_label')}
            </p>
            <p className="text-[10px] text-slate-400">
              {language === 'ta' ? '92.5% கள ஆதாரங்கள்' : '92.5% Empirical Coverage'}
            </p>
          </div>
        </div>

        {/* Metric 4: 24 / 48 / 72h Risk Horizons */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="p-2 rounded bg-slate-800 text-indigo-400 shrink-0 border border-slate-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white">24 / 48 / 72h</span>
            </div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              {t('stat_horizons_label')}
            </p>
            <p className="text-[10px] text-slate-400">
              {language === 'ta' ? 'முன்னறிவிப்பு கால இடைவெளிகள்' : 'Predictive Monsoon Windows'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
