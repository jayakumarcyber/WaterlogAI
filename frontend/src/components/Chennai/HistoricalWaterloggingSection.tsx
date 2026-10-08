'use client';

import { Database, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HistoricalWaterloggingSection() {
  const { t, language } = useLanguage();

  return (
    <section
      id="historical-waterlogging"
      aria-label="Historical Waterlogging and Ground Truth Incident Calibration"
      className="bg-white border border-slate-300 rounded-md p-5 sm:p-6 shadow-2xs font-sans text-slate-800 space-y-5"
    >
      {/* ─── Section Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 uppercase px-2 py-0.5 rounded inline-block mb-1">
            {t('historical_badge')}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {t('historical_section_title')}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            {t('historical_section_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-md font-semibold shrink-0">
          <Database className="w-3.5 h-3.5 text-blue-800" />
          <span>{language === 'ta' ? 'நகராட்சி நிகழ்வு சான்றுகள்' : 'Municipal Event Evidence'}</span>
        </div>
      </div>

      {/* ─── Two-Column Layout: Left = Editorial Image, Right = Stats & Provenance ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Editorial Image Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-md overflow-hidden border border-slate-300 bg-slate-900 shadow-2xs">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto flex-1 w-full overflow-hidden bg-slate-950">
            <img
              src="/images/chennai/chennai-flood-impact.jpg"
              alt="Ground-level view of flooded residential street in Chennai with residents wading through monsoon inundation"
              className="w-full h-full object-cover object-center select-none"
              loading="lazy"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none"
              aria-hidden="true"
            />
            <div className="absolute bottom-2.5 left-3 right-3 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                {language === 'ta' ? 'கள யதார்த்தம் • சென்னை பருவமழை வெள்ள அளவீடு' : 'Ground Reality • Chennai Monsoon Flood Benchmark'}
              </span>
              <p className="text-xs font-semibold text-slate-100 mt-1 leading-snug">
                {language === 'ta'
                  ? 'தீவிர புயல் மழைப்பொழிவின் போது குடியிருப்புகளில் ஏற்பட்ட கடுமையான நீர்தேக்கக் காட்சி.'
                  : 'Submerged residential alleyway in dense urban settlement during severe cyclonic cloudburst.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Key Verified Metrics & Evidence Breakdown (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* Top 3 Verified Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1,325 Verified Incidents */}
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-300 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {language === 'ta' ? 'மொத்த நிகழ்வுகள்' : 'Total Incidents'}
              </span>
              <div className="my-1.5">
                <span className="text-2xl font-black text-slate-900">1,325</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800">
                {t('historical_metric_incidents')}
              </span>
            </div>

            {/* 185 / 200 Wards with Evidence */}
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-300 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {language === 'ta' ? 'வார்டு எல்லை' : 'Ward Coverage'}
              </span>
              <div className="my-1.5">
                <span className="text-2xl font-black text-slate-900">185 / 200</span>
              </div>
              <span className="text-[11px] font-semibold text-blue-800">
                {t('historical_metric_wards')}
              </span>
            </div>

            {/* 2015 & 2020 Verified Event Records */}
            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-300 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {language === 'ta' ? 'அளவீடு காலங்கள்' : 'Benchmark Epochs'}
              </span>
              <div className="my-1.5">
                <span className="text-xl font-black text-slate-900">2015 &amp; 2020</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-800">
                {t('historical_metric_events')}
              </span>
            </div>

          </div>

          {/* Evidence Provenance Narrative Box */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-300 text-xs text-slate-700 leading-relaxed space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-800" />
              <span>{language === 'ta' ? 'ஆதாரங்கள் மற்றும் தரவு ஒருமைப்பாடு' : 'Evidence & Provenance Protocol'}</span>
            </h4>
            <p>
              {t('historical_desc')}
            </p>
          </div>

          {/* Provenance Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>GCC 1913 Records</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>CMWSSB Hotspots</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Copernicus 30m Micro-DEM</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
