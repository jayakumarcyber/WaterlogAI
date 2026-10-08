'use client';

import { MapPin, ArrowRight, ShieldCheck, Layers } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface HeroSectionProps {
  onOpenRiskMap?: () => void;
  onViewPriorityAreas?: () => void;
}

export default function HeroSection({ onOpenRiskMap, onViewPriorityAreas }: HeroSectionProps) {
  const { t } = useLanguage();

  const handleScrollTo = (id: string, customHandler?: () => void) => {
    if (customHandler) {
      customHandler();
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-label="CivicPulse Monsoon Municipal Banner"
      className="relative w-full rounded-md overflow-hidden border border-slate-300 bg-slate-900 min-h-[340px] md:min-h-[400px] flex items-center shadow-xs"
    >
      {/* ─── 1. Background Aerial Image (60-70% Visual Presence) ─────────────── */}
      <img
        src="/images/chennai/hero-kathipara.jpg"
        alt="Aerial view of Kathipara Flyover interchange in Chennai, Tamil Nadu"
        className="absolute inset-0 w-full h-full object-cover object-center select-none"
        loading="eager"
      />

      {/* ─── 2. Subtle Dark Institutional Overlay for Text Readability ──────── */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-slate-950/10 pointer-events-none"
        aria-hidden="true"
      />

      {/* ─── 3. Institutional Content Container (Left-Aligned) ─────────────── */}
      <div className="relative z-10 w-full max-w-2xl px-6 sm:px-10 py-8 flex flex-col justify-center space-y-3.5 font-sans">
        
        {/* Government Authority Tag */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-900/80 text-blue-200 border border-blue-400/40 text-[10px] font-extrabold uppercase tracking-wider w-max">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('hero_authority')}</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {t('hero_title')}
        </h1>

        {/* Subtext */}
        <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl leading-relaxed">
          {t('hero_subtitle')}
        </p>

        {/* Public-Service Portal Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <button
            id="hero-btn-open-risk-map"
            onClick={() => handleScrollTo('current-risk-map', onOpenRiskMap)}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs sm:text-sm text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 border border-blue-600 transition cursor-pointer shadow-xs"
          >
            <MapPin className="w-4 h-4 fill-white/20" />
            <span>{t('hero_btn_open_map')}</span>
          </button>

          <button
            id="hero-btn-view-priority-areas"
            onClick={() => handleScrollTo('priority-actions', onViewPriorityAreas)}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs sm:text-sm text-slate-100 bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-600 transition cursor-pointer shadow-xs"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>{t('hero_btn_view_priority')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

      </div>

    </section>
  );
}
