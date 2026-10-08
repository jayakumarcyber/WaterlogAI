'use client';

import { ShieldAlert, ExternalLink, Mail, Phone, MapPin, Database } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface GovFooterProps {
  isDemo?: boolean;
}

export default function GovFooter({ isDemo = false }: GovFooterProps) {
  const { t, language } = useLanguage();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      id="contact"
      aria-label="Government Portal Footer"
      className="w-full bg-[#0a1829] border-t border-[#18314e] text-slate-300 font-sans text-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: CIVICPULSE MONSOON • About */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-blue-900 border border-amber-500/60 flex items-center justify-center text-white shrink-0">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-wider">
                CIVICPULSE MONSOON
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('footer_about_desc')}
            </p>
            <div className="text-[10px] text-slate-500 font-medium">
              {language === 'ta'
                ? 'Cop-30 DEM, IMD மழைப்பொழிவு பதிவுகள் மற்றும் 1,325 சரிபார்க்கப்பட்ட வரலாற்று வெள்ள நிகழ்வுகளின் அடிப்படையில் அளவீடு செய்யப்பட்டது.'
                : 'Calibrated on Cop-30 DEM, IMD precipitation records, and 1,325 verified historical flood events.'}
            </div>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1.5">
              {t('footer_quick_links')}
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>
                <button
                  onClick={() => scrollTo(isDemo ? 'demo-map-workspace' : 'current-risk-map')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  {isDemo ? (language === 'ta' ? 'இடர் வரைபடம்' : 'Risk Map') : `${t('nav_risk_map')} (GCC 200 Wards)`}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo(isDemo ? 'demo-map-workspace' : 'current-risk-map')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  {isDemo ? (language === 'ta' ? 'வார்டு ஆய்வுகள்' : 'Ward Insights & Evidence') : `${t('nav_ward_insights')} & DEM`}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo(isDemo ? 'priority-actions' : 'priority-actions')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  {t('nav_priority_actions')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo(isDemo ? 'simulation-decision-support' : 'simulation-decision-support')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  {t('nav_simulation')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo(isDemo ? 'demo-data-sources' : 'data-sources')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  {t('nav_data_sources')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: RESOURCES & METHODOLOGY */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1.5">
              {t('footer_resources')}
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>
                <button
                  onClick={() => scrollTo(isDemo ? 'demo-data-sources' : 'data-sources')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  {t('nav_data_sources')}
                </button>
              </li>
              <li>
                <span className="text-slate-500">{language === 'ta' ? 'அல்காரிதம் வழிமுறை & தணிக்கை' : 'Algorithm Methodology & Audit'}</span>
              </li>
              <li>
                <span className="text-slate-500">{language === 'ta' ? 'அமைப்பு வரம்புகள் & மாதிரி ஏற்பு' : 'System Limitations & Assumptions'}</span>
              </li>
              <li>
                <span className="text-slate-500">{language === 'ta' ? 'தேசிய தரவு பகிர்வு கொள்கை (NDSAP)' : 'National Data Sharing Policy (NDSAP)'}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: SYSTEM & CONTACT */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1.5">
              {t('footer_system')}
            </h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-200 font-semibold">
                  {isDemo
                    ? (language === 'ta' ? 'நிலை: நடுவர் டெமோ சூழல்' : 'Status: Jury Demonstration Environment')
                    : (language === 'ta' ? 'நிலை: செயலில் உள்ள செயல்பாடுகள்' : 'Status: Active Operations')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                {language === 'ta'
                  ? 'ரிப்பன் மாளிகை, பெருநகர சென்னை மாநகராட்சி, சென்னை 600003, தமிழ்நாடு, இந்தியா.'
                  : 'Ripon Building, Greater Chennai Corporation, Chennai 600003, Tamil Nadu, India.'}
              </p>
              <div className="pt-2 text-[11px] text-slate-300 space-y-1">
                <p>{language === 'ta' ? 'GCC உதவி எண்' : 'GCC Helpline'}: <strong className="text-white">1913</strong></p>
                <p>{language === 'ta' ? 'TNSDMA அவசர எண்' : 'TNSDMA Emergency'}: <strong className="text-white">1070</strong></p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Institutional Disclaimer Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-slate-500">
          <div>
            {t('footer_copyright')}
          </div>
          <div className="flex items-center space-x-4">
            {isDemo ? (
              <span className="text-slate-400 font-medium">
                Jury Demo &bull; Controlled simulation environment &bull; Isolated from Chennai production data
              </span>
            ) : (
              <span>{t('footer_disclaimer')}</span>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
