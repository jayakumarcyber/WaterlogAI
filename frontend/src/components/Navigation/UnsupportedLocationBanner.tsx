'use client';

import { MapPinOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface UnsupportedLocationBannerProps {
  country: string;
  state: string;
  district: string;
  city: string;
  onSwitchToChennai: () => void;
}

export default function UnsupportedLocationBanner({
  country,
  state,
  district,
  city,
  onSwitchToChennai,
}: UnsupportedLocationBannerProps) {
  const { t, language } = useLanguage();
  const locationLabel = `${city ? city + ', ' : ''}${district ? district + ', ' : ''}${state}, ${country}`;

  return (
    <section
      aria-label="Location Data Status Notice"
      className="bg-white border-2 border-dashed border-amber-300 rounded-md p-6 sm:p-7 shadow-2xs font-sans space-y-5 text-slate-800"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-md border border-amber-300 shrink-0">
            <MapPinOff className="w-8 h-8 text-amber-700" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'ta' ? 'செயல்பாட்டு எல்லை வரம்பு' : 'Location Operational Scope Limit'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {t('loc_unsupported_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
              {language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட இடம்: ' : 'Selected Location: '}
              <strong className="text-slate-900">{locationLabel}</strong>
            </p>
          </div>
        </div>

        {/* Quick Return to Chennai Button */}
        <button
          id="btn-switch-to-chennai"
          onClick={onSwitchToChennai}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs sm:text-sm text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 border border-blue-600 shadow-2xs transition shrink-0 cursor-pointer self-start"
        >
          <span>{t('loc_switch_to_chennai')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

      {/* Official CivicPulse Scoping Notice */}
      <div className="p-4 rounded-md bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
        <p className="font-semibold text-slate-900">
          {t('loc_unsupported_desc')}
        </p>
        <p className="text-slate-600 text-xs">
          {language === 'ta'
            ? 'தரவு ஒருமைப்பாட்டைப் பாதுகாக்க, நிலப்பரப்பு உயர மாதிரிகள் (DEM), நகராட்சி வடிகால் வரைபடங்கள் மற்றும் வரலாற்று வெள்ள நிகழ்வு பதிவுகள் சரிபார்க்கப்பட்ட அதிகார வரம்புகளுக்கு மட்டுமே கட்டுப்படுத்தப்பட்டுள்ளன. ஆதரவற்ற பகுதிகளுக்கு CivicPulse தவறான தரவுகளை உருவாக்காது.'
            : 'To protect data integrity, digital elevation models (DEM), municipal drainage networks, sensor rainfall telemetry, and historical flood incident records are restricted strictly to verified jurisdictions. CivicPulse never fabricates risk scores for unsupported regions.'}
        </p>
      </div>

      {/* Municipal Telemetry Readiness Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-md bg-slate-50 border border-slate-300">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            {language === 'ta' ? 'உயர மாதிரி (DEM)' : 'Elevation Model (DEM)'}
          </span>
          <span className="font-bold text-slate-800 mt-1 block">
            {language === 'ta' ? 'சேர்க்கப்படவில்லை' : 'Not Ingested'}
          </span>
        </div>
        <div className="p-3 rounded-md bg-slate-50 border border-slate-300">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            {language === 'ta' ? 'நகராட்சி வடிகால் கட்டமைப்பு' : 'Municipal Drainage Network'}
          </span>
          <span className="font-bold text-slate-800 mt-1 block">
            {language === 'ta' ? 'இணைப்பு நிலுவையில் உள்ளது' : 'Pending Onboarding'}
          </span>
        </div>
        <div className="p-3 rounded-md bg-slate-50 border border-slate-300">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            {language === 'ta' ? 'வரலாற்று களத் தரவுகள்' : 'Historical Ground Truth'}
          </span>
          <span className="font-bold text-slate-800 mt-1 block">
            {language === 'ta' ? '0 நிகழ்வுப் பதிவுகள்' : '0 Event Logs'}
          </span>
        </div>
        <div className="p-3 rounded-md bg-slate-50 border border-slate-300">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            {language === 'ta' ? 'AI இடர் மாதிரி' : 'AI Risk Model'}
          </span>
          <span className="font-bold text-amber-800 mt-1 block">
            {language === 'ta' ? 'செயலற்றது' : 'Inactive'}
          </span>
        </div>
      </div>
    </section>
  );
}
