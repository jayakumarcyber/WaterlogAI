'use client';

import { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Menu,
  X,
  AlertTriangle,
  FileSearch,
  Radio,
  Globe,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

import Link from 'next/link';

interface GovHeaderProps {
  onReportWaterlogging?: () => void;
  onTrackComplaint?: () => void;
  onOpenOpsQueue?: () => void;
  searchBarSlot?: React.ReactNode;
  activeSection?: string;
  isDemo?: boolean;
}

export default function GovHeader({
  onReportWaterlogging,
  onTrackComplaint,
  onOpenOpsQueue,
  searchBarSlot,
  activeSection = 'HOME',
  isDemo = false,
}: GovHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { label: t('nav_home'), targetId: 'top' },
    { label: t('nav_risk_map'), targetId: 'current-risk-map' },
    { label: t('nav_ward_insights'), targetId: 'current-risk-map' },
    { label: t('nav_historical_data'), targetId: 'historical-waterlogging' },
    { label: t('nav_priority_actions'), targetId: 'priority-actions' },
    { label: t('nav_simulation'), targetId: 'simulation-decision-support' },
    { label: t('nav_data_sources'), targetId: 'data-sources' },
    { label: t('nav_contact'), targetId: 'contact' },
  ];

  const handleNavClick = (targetId: string) => {
    setMobileMenuOpen(false);
    if (targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-xs font-sans">
      
      {/* ─── 1. Main Institutional Header (Emblem, Title, Search, Language Switcher) ──────────── */}
      <div className="max-w-[1600px] w-[95%] mx-auto px-3 sm:px-5 lg:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Government Identity Branding */}
        <div className="flex items-center space-x-3.5">
          {/* Official Municipal Shield Emblem */}
          <Link href={isDemo ? "/demo" : "/"} className="w-11 h-11 rounded-lg bg-blue-900 border-2 border-amber-500/70 flex items-center justify-center text-white shrink-0 shadow-sm hover:opacity-90 transition">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={isDemo ? "/demo" : "/"} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase hover:text-blue-900 transition">
                CIVICPULSE MONSOON
              </Link>
              {isDemo ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 tracking-wider shadow-xs">
                    JURY DEMO
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    DEMO DATA / SIMULATION
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-900 text-white font-mono tracking-wider shadow-xs">
                    ORIGINAL PROJECT
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    CHENNAI • GCC 200 WARDS
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium tracking-normal line-clamp-1">
              {isDemo
                ? (language === 'ta' ? 'நடுவர் செயல்முறை விளக்க தளம்' : 'Jury Presentation Workspace')
                : (language === 'ta' ? 'கிரேட்டர் சென்னை கார்ப்பரேஷன் (GCC) 200 வார்டுகளின் அதிகாரப்பூர்வ முடிவு ஆதரவு தளம்' : t('portal_subtitle'))}
            </p>
          </div>
        </div>

        {/* Right Section: Search Bar Slot + Switch to Demo / Original CTA + Language Switcher + Mobile Hamburger */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 w-full lg:w-auto">
          {searchBarSlot && (
            <div className="flex-1 lg:w-64 min-w-[180px]">
              {searchBarSlot}
            </div>
          )}

          {/* Switch Experience CTA: JURY DEMO <-> ORIGINAL PROJECT */}
          {isDemo ? (
            <Link
              href="/"
              id="cta-switch-to-original"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b365d] hover:bg-[#12243e] text-white text-xs font-bold rounded-md shadow-xs border border-blue-800 transition cursor-pointer"
            >
              <span>🏛️</span>
              <span className="whitespace-nowrap">{language === 'ta' ? 'அசல் திட்டம் (சென்னை)' : 'Original Project'}</span>
            </Link>
          ) : (
            <Link
              href="/demo"
              id="cta-open-jury-demo"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-md shadow-sm border border-amber-400 transition cursor-pointer"
            >
              <span>🎯</span>
              <span className="whitespace-nowrap">{language === 'ta' ? 'நடுவர் டெமோ' : 'JURY DEMO'}</span>
            </Link>
          )}

          {/* Bilingual Language Switcher: English | தமிழ் */}
          <div
            className="flex items-center bg-slate-100 border border-slate-300 rounded-md p-0.5 text-xs font-semibold shrink-0"
            role="group"
            aria-label="Switch language / மொழி தேர்வு"
          >
            <button
              id="lang-switch-en"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded transition text-xs cursor-pointer font-bold ${
                language === 'en'
                  ? 'bg-[#1b365d] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              aria-label="Switch to English"
              aria-pressed={language === 'en'}
            >
              English
            </button>
            <span className="text-slate-300 text-xs px-0.5 select-none">|</span>
            <button
              id="lang-switch-ta"
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 rounded transition text-xs cursor-pointer font-bold ${
                language === 'ta'
                  ? 'bg-[#1b365d] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              aria-label="தமிழுக்கு மாற்றவும்"
              aria-pressed={language === 'ta'}
            >
              தமிழ்
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* ─── 2. Horizontal Government Navigation Menu ───────────────────────── */}
      <nav
        aria-label="Primary Portal Navigation"
        className="w-full bg-[#0d233a] border-t border-b border-[#1b3a5c] text-white text-xs font-bold tracking-wider"
      >
        <div className="max-w-[1600px] w-[95%] mx-auto px-3 sm:px-5 lg:px-6 flex items-center justify-between">
          
          {/* Desktop Horizontal Menu */}
          <div className="hidden lg:flex items-center space-x-1 py-0 overflow-x-auto">
            {(isDemo
              ? [
                  { label: language === 'ta' ? 'முகப்பு' : 'HOME', targetId: 'top' },
                  { label: language === 'ta' ? 'இடர் வரைபடம்' : 'RISK MAP', targetId: 'demo-map-workspace' },
                  { label: language === 'ta' ? 'வார்டு ஆய்வுகள்' : 'WARD INSIGHTS', targetId: 'demo-map-workspace' },
                  { label: language === 'ta' ? 'வரலாற்று தரவு' : 'HISTORICAL DATA', targetId: 'demo-evidence-section' },
                  { label: language === 'ta' ? 'முன்னுரிமை நடவடிக்கைகள்' : 'PRIORITY ACTIONS', targetId: 'priority-actions' },
                  { label: language === 'ta' ? 'உருவகப்படுத்துதல்' : 'SIMULATION', targetId: 'simulation-decision-support' },
                  { label: language === 'ta' ? 'தரவு & ஆதாரங்கள்' : 'DATA & SOURCES', targetId: 'demo-data-sources' },
                ]
              : navLinks
            ).map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.targetId)}
                className="px-3 py-2.5 text-[11px] font-bold text-slate-200 hover:text-white hover:bg-white/10 transition border-b-2 border-transparent hover:border-amber-400 cursor-pointer whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Sub-nav Tag */}
          <div className="hidden lg:flex items-center space-x-2 py-1">
            {!isDemo && (
              <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                VERIFIED GCC SPATIAL SYSTEM
              </span>
            )}
          </div>

          {/* Mobile Collapsible Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-2 border-t border-slate-800 divide-y divide-slate-800">
              {(isDemo
                ? [
                    { label: language === 'ta' ? 'முகப்பு' : 'HOME', targetId: 'top' },
                    { label: language === 'ta' ? 'இடர் வரைபடம்' : 'RISK MAP', targetId: 'demo-map-workspace' },
                    { label: language === 'ta' ? 'வார்டு ஆய்வுகள்' : 'WARD INSIGHTS', targetId: 'demo-map-workspace' },
                    { label: language === 'ta' ? 'வரலாற்று தரவு' : 'HISTORICAL DATA', targetId: 'demo-evidence-section' },
                    { label: language === 'ta' ? 'முன்னுரிமை நடவடிக்கைகள்' : 'PRIORITY ACTIONS', targetId: 'priority-actions' },
                    { label: language === 'ta' ? 'உருவகப்படுத்துதல்' : 'SIMULATION', targetId: 'simulation-decision-support' },
                    { label: language === 'ta' ? 'தரவு & ஆதாரங்கள்' : 'DATA & SOURCES', targetId: 'demo-data-sources' },
                  ]
                : navLinks
              ).map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.targetId)}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition block cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

        </div>
      </nav>

      {/* ─── 3. Civic Services / Quick Actions Utility Strip (Original Project Only) ─── */}
      {!isDemo && (
        <div className="w-full bg-slate-50 border-b border-slate-200 py-1.5">
          <div className="max-w-[1600px] w-[95%] mx-auto px-3 sm:px-5 lg:px-6 flex flex-wrap items-center justify-between gap-2 text-xs">
            
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                {t('civic_actions_label')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="gov-btn-report-waterlogging"
                onClick={onReportWaterlogging}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white text-xs font-bold rounded-md shadow-xs transition cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('btn_report_waterlogging')}</span>
              </button>

              <button
                id="gov-btn-track-complaint"
                onClick={onTrackComplaint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white text-xs font-bold rounded-md shadow-xs transition cursor-pointer"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>{t('btn_track_complaint')}</span>
              </button>

              <button
                id="gov-btn-ops-queue"
                onClick={onOpenOpsQueue}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 active:bg-black text-white text-xs font-bold rounded-md shadow-xs transition border border-slate-700 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('btn_gcc_ops_queue')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
