'use client';

import { AlertTriangle, Info, ShieldAlert, CloudRain, BellRing, Sparkles } from 'lucide-react';
import RainfallAnalyticsPanel from '@/components/Dashboard/RainfallAnalyticsPanel';
import { useLanguage } from '@/context/LanguageContext';

interface RainfallAlertContextProps {
  selectedDistrict: string;
  apiBaseUrl: string;
}

export default function RainfallAlertContextSection({
  selectedDistrict,
  apiBaseUrl,
}: RainfallAlertContextProps) {
  const { t, language } = useLanguage();

  return (
    <section
      id="rainfall-warning-context"
      aria-label="Rainfall Warning & Contextual Meteorological Analytics"
      className="bg-white border border-slate-300 rounded-xl p-5 md:p-6 shadow-2xs font-sans space-y-5 text-slate-800"
    >
      {/* ─── Section Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 uppercase px-2 py-0.5 rounded inline-block mb-1">
            {language === 'ta' ? 'வானிலை எச்சரிக்கை சூழல் • பிராந்திய போக்குகள்' : 'METEOROLOGICAL WARNING CONTEXT • REGIONAL PATTERNS'}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {t('rainfall_section_title')}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            {t('rainfall_section_subtitle')}
          </p>
        </div>

        {/* Prominent Contextual Disclaimer Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shrink-0 self-start sm:self-auto">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{language === 'ta' ? 'சூழல் விளக்கப் படம் • வரலாற்று குறிப்பு மட்டுமே' : 'CONTEXTUAL IMAGERY • ARCHIVAL REFERENCE ONLY'}</span>
        </div>
      </div>

      {/* ─── Balanced Two-Column Top Layout: Flood Imagery + Warning Thresholds ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Relevant Chennai Flood/Alert Imagery (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'ta' ? 'வரலாற்று எச்சரிக்கை அறிவிப்பு மாதிரி' : 'Archival Alert Bulletin Reference'}</span>
              </span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                {language === 'ta' ? 'வரலாற்று சூழல்' : 'Historical Context'}
              </span>
            </div>

            {/* Urban Flood Image with object-fit: cover and fixed aspect ratio */}
            <div className="relative h-[220px] w-full rounded-lg overflow-hidden border border-slate-300 shadow-2xs bg-slate-900">
              <img
                src="/images/chennai/chennai-rainfall-alert.jpg"
                alt="Meteorological warning bulletin and urban inundation in Chennai"
                className="w-full h-full object-cover object-center select-none"
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"
                aria-hidden="true"
              />
              <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-medium leading-tight">
                <span className="bg-rose-900/90 px-1.5 py-0.5 rounded font-bold uppercase text-[9px] mr-1.5">Archival IMD Bulletin</span>
                Historic Heavy Rainfall Warning Event • Chennai Corporation Area
              </div>
            </div>
          </div>

          {/* Warning Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{language === 'ta' ? 'நிகழ்நேர வானிலை தரவு அல்ல' : 'Contextual Imagery Warning'}</span>
            </div>
            <p className="text-[10.5px] text-amber-900/90 leading-relaxed font-medium">
              This visual is an archival reference. Active scenario simulation parameters and telemetry are displayed in the workspace above.
            </p>
          </div>
        </div>

        {/* Right: Meteorological Warning Thresholds & Northeast Monsoon Overview (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <BellRing className="w-4 h-4 text-blue-600" />
                <span>IMD Rainfall Warning Thresholds &amp; Operational Categories</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 uppercase">
                Official Standards
              </span>
            </div>

            {/* Threshold Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-lg border-l-4 border-l-amber-400 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase block">🟡 Moderate / Heavy</span>
                <span className="text-base font-black text-slate-900 block">64.5 – 115.5 mm</span>
                <span className="text-[9.5px] text-slate-500 block leading-tight">Yellow Watch: Catchment desilting &amp; pump standby</span>
              </div>

              <div className="bg-white p-3 rounded-lg border-l-4 border-l-orange-500 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-orange-800 uppercase block">🟠 Very Heavy</span>
                <span className="text-base font-black text-slate-900 block">115.6 – 204.4 mm</span>
                <span className="text-[9.5px] text-slate-500 block leading-tight">Orange Alert: Crew dispatch &amp; culvert clearing</span>
              </div>

              <div className="bg-white p-3 rounded-lg border-l-4 border-l-rose-600 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-rose-800 uppercase block">🔴 Extremely Heavy</span>
                <span className="text-base font-black text-slate-900 block">&gt; 204.4 mm</span>
                <span className="text-[9.5px] text-slate-500 block leading-tight">Red Alert: High-volume dewatering &amp; flood evacuation</span>
              </div>
            </div>

            {/* Northeast Monsoon Seasonal Facts */}
            <div className="text-[11px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <span className="font-bold text-slate-900 block">Northeast Monsoon Cloudburst Dynamics:</span>
                <span>
                  Chennai receives over <strong>60% of its annual precipitation (approx. 850–1,100 mm)</strong> between October and December. Short-duration localized cloudbursts frequently produce 50–100 mm in under 3 hours, requiring preemptive knapsack optimization of municipal crews.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
            <span>Calibrated against Copernicus GLO-30 DEM and GCC 2023 SWD topology</span>
            <span className="font-bold text-blue-800">Tamil Nadu State Disaster Management</span>
          </div>

        </div>

      </div>

      {/* ─── Historical Rainfall Analytics Component (Full Width / Balanced) ── */}
      <div className="pt-2">
        <RainfallAnalyticsPanel
          selectedDistrict={selectedDistrict}
          apiBaseUrl={apiBaseUrl}
        />
      </div>

    </section>
  );
}
